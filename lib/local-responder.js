/**
 * @fileoverview Sujit AI's local knowledge engine.
 *
 * Used when no cloud keys are configured or the cloud call fails. It answers from three
 * verified sources and never invents anything:
 *   1. the question bank (lib/qa-bank.js): hand-written answers plus entries generated from
 *      knowledge/*.md, so adding a project file teaches the assistant a new project
 *   2. live GitHub data (lib/github-live.js): recent commits, repositories, contributions
 *   3. an explicit "not on file" answer when nothing matches well enough
 */

const { classifyQuery } = require('./query-router');
const { search, detectProject } = require('./local-search');
const { buildBank, ASK_HIM, EMAIL, L } = require('./qa-bank');

const CONFIDENCE_FLOOR = 0.3;

/* ───────────── Safety: prompt injection and secrets ───────────── */
const ADVERSARIAL = [
  /ignore (all |your |the |any )?(previous|prior|above|earlier)?\s*(instructions|rules|prompt)/i,
  /\b(system|developer|hidden|secret) (prompt|message|instructions?)\b/i,
  /\b(reveal|show|print|dump|leak|expose)\b.*\b(prompt|instructions|api[\s-]?key|token|secret|password|env|database|credentials?)\b/i,
  /\b(api[\s-]?key|password|passwd|access token|\.env|private key|secret key)\b/i,
  /\b(jailbreak|developer mode|dan mode|do anything now)\b/i,
  /you are now|act as (?!a recruiter)|pretend (to be|you are)|roleplay as/i,
  /everything in the database|all (the )?(users|emails) in/i,
];

function adversarial() {
  return {
    content: "I am **Sujit AI**, an assistant for sharing verified information about Sujit Kumar Sahu's projects, skills, certifications and background. I can't change my instructions or reveal internal configuration.\n\nHow can I help you explore Sujit's work?",
    sources: [{ title: 'Developer Profile', category: 'about', url: null }],
    queryCategory: 'GENERAL',
  };
}

/* ───────────── Live GitHub ───────────── */
function ago(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const u = [[31536000, 'year'], [2592000, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
  for (const [sec, name] of u) if (s >= sec) { const n = Math.floor(s / sec); return `${n} ${name}${n > 1 ? 's' : ''} ago`; }
  return 'just now';
}

async function liveGithub() {
  try {
    return await require('./github-live').getGithubData();
  } catch (_) {
    return null;
  }
}

const GH_SOURCES = [{ title: 'Live GitHub activity', category: 'github', url: L.github }];

function githubUnavailable() {
  return {
    content: `I couldn't reach GitHub just now. You can see Sujit's latest activity directly at ${L.github}.`,
    sources: GH_SOURCES, queryCategory: 'PROJECT',
  };
}

const GH_INTENTS = [
  {
    id: 'newest-repo',
    test: (q) => /\b(newest|latest|most recent|last)\b.*\b(project|repo|repository)\b/i.test(q) || /\bwhat('s| is) new\b/i.test(q),
    render: (d) => {
      const r = d.repos[0];
      return r ? `His most recently pushed repository is **${r.name}** (${r.language || 'language not detected'}), last pushed ${ago(r.pushedAt)}: ${r.url}` : 'No repositories found.';
    },
  },
  {
    id: 'commits',
    test: (q) => /\b(commit|commits|pushed|push)\b/i.test(q) || /\b(latest|recent|newest|last|lately|this week|today)\b.*\b(work|activity|code|update|build|built|repo|repository|project)\b/i.test(q) || /\bwhat (is|has|did) (he|sujit)\b.*\b(working on|building|coding|doing now|been (working|building))\b/i.test(q) || /\b(working on|building) (now|currently|right now|these days)\b/i.test(q),
    render: (d) => {
      if (!d.commits.length) return 'No recent public commits were found.';
      return '**Sujit\'s latest public commits**\n\n' + d.commits.slice(0, 6).map((c) => `- ${c.message} (in **${c.repo}**, ${ago(c.at)})`).join('\n');
    },
  },
  {
    id: 'repos-count',
    test: (q) => /\bhow many\b.*\b(repo|repos|repositories|projects)\b.*\b(github|public|online|total|has|have)\b/i.test(q) || /\bhow many (github )?(repo|repos|repositories)\b/i.test(q) || /\b(number of|count of) (repos|repositories)\b/i.test(q),
    render: (d) => `Sujit has **${d.profile.publicRepos} public repositories** on GitHub (${d.repos.length} are his own, not forks). The most recently pushed is **${d.repos[0] && d.repos[0].name}**.`,
  },
  {
    id: 'contributions',
    test: (q) => /\b(contribution|contributions|how active|activity|streak)\b/i.test(q) && /\b(github|year|total|how many|count|last|past)\b/i.test(q),
    render: (d) => d.calendar
      ? `Sujit made **${d.calendar.total} contributions on GitHub in the last year** (his contribution calendar is in the GitHub Activity section of this portfolio).`
      : 'His contribution count is not available right now; see the GitHub Activity section.',
  },
  {
    id: 'languages',
    test: (q) => /\b(languages?|tech|stack)\b/i.test(q) && /\bgithub\b/i.test(q) || /\bgithub\b.*\b(languages?|mix)\b/i.test(q),
    render: (d) => {
      const total = d.languages.reduce((s, l) => s + l.count, 0) || 1;
      return '**Languages across his GitHub repositories** (by repository count):\n\n' + d.languages.map((l) => `- ${l.name}: ${Math.round(l.count / total * 100)}%`).join('\n');
    },
  },
  {
    id: 'profile',
    test: (q) => /\bgithub\b.*\b(stats?|profile|summary|overview|followers?|stars?|account|since)\b/i.test(q) || /\b(followers?|following|stars?)\b.*\bgithub\b/i.test(q) || /\bwhen did (he|sujit) (join|start)\b.*github/i.test(q),
    render: (d) => `**GitHub (${d.user})**: ${d.profile.publicRepos} public repositories, ${d.profile.followers} followers, ${d.profile.following} following, on GitHub since ${new Date(d.profile.since).getUTCFullYear()}${d.calendar ? `, ${d.calendar.total} contributions in the last year` : ''}. Profile: ${d.profile.url}`,
  },
];

/* ───────────── Skills he does not list ───────────── */
const UNLISTED_TECH = [
  'rust', 'golang', 'go lang', 'php', 'kubernetes', 'k8s', 'flutter', 'dart', 'swift', 'kotlin', 'ruby', 'rails', 'scala', 'perl', 'c++', 'c#', 'cpp', 'csharp', 'dotnet', '.net', 'angular', 'vue', 'svelte', 'nextjs', 'next.js', 'nuxt',
  'tensorflow', 'pytorch', 'keras', 'spark', 'hadoop', 'kafka', 'redis', 'graphql', 'terraform', 'ansible', 'jenkins', 'azure', 'gcp', 'google cloud', 'firebase', 'supabase', 'tailwind', 'bootstrap', 'sass', 'redux', 'flask', 'spring', 'laravel',
  'unity', 'unreal', 'blender', 'figma', 'photoshop', 'solidity', 'blockchain', 'web3', 'nlp', 'devops engineer', 'sap', 'salesforce', 'tableau', 'power bi', 'excel', 'matlab', 'r language', 'assembly', 'haskell', 'elixir', 'cobol', 'react native', 'android', 'ios', 'selenium', 'cypress', 'jest', 'langchain', 'hugging face', 'openai api',
];

function unlistedSkillAnswer(q, bankIds) {
  if (!/\b(know|use|used|using|work with|worked with|experienc[a-z]*|familiar|proficient|skill|skills|learn|learned|expert|good at|comfortable|built with|can he|does he|has he|is he)\b/i.test(q)) return null;
  const lower = ' ' + q.toLowerCase().replace(/[?!.,]/g, ' ') + ' ';
  for (const t of UNLISTED_TECH) {
    const re = new RegExp(`(^|[^a-z0-9+#])${t.replace(/[.+*?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9+#])`, 'i');
    if (!re.test(lower)) continue;
    const key = 'skill-' + t.toLowerCase().replace(/[^a-z0-9+#]/g, '');
    if (bankIds.has(key)) return null;     // it IS a listed skill; let the normal search answer
    const name = t.length <= 3 ? t.toUpperCase() : t.replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      content: `**${name}** isn't listed on Sujit's résumé or portfolio, so I can't say he has experience with it. His listed skills are HTML5, CSS3, JavaScript, React, Python, Node.js, Express, FastAPI, Java, Django, PostgreSQL, MongoDB, MySQL, NumPy, Pandas, Scikit-learn, Matplotlib, MediaPipe, cybersecurity (OWASP, pen testing, cryptography, network security), Git, GitHub, Docker, Linux and AWS.\n\nFor anything beyond that, ask him at **${EMAIL}**.`,
      sources: [{ title: 'Resume Summary', category: 'resume', url: null }],
      queryCategory: 'SKILLS',
    };
  }
  return null;
}

/* ───────────── Follow-up memory ───────────── */
function projectFromHistory(history) {
  if (!Array.isArray(history)) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (!m || typeof m.content !== 'string') continue;
    const p = detectProject(m.content);
    if (p) return p;
  }
  return null;
}

/* ───────────── Main entry ───────────── */
function sourcesFor(entry) {
  const cat = { profile: 'about', contact: 'about', education: 'education', experience: 'experience', achievements: 'achievement', goals: 'about', skills: 'skills', projects: 'project', faq: 'faq', private: 'about', meta: 'about' };
  return (entry.src || ['Developer Profile']).map((title) => ({ title, category: cat[entry.topic] || 'about', url: null }));
}

function notOnFile(q, alternatives) {
  const suggest = (alternatives || []).slice(0, 3).map((a) => `- ${a.q[0]}`).join('\n');
  return {
    content: `I don't have verified information about that in Sujit's portfolio, so I won't guess.${suggest ? `\n\nI can help with questions like:\n${suggest}` : '\n\nI can help with his projects, skills, internships, certifications, startup, education and GitHub activity.'}\n\nFor anything else, ${ASK_HIM.charAt(0).toLowerCase()}${ASK_HIM.slice(1)}`,
    sources: [{ title: 'Contact Information', category: 'about', url: null }],
    queryCategory: 'GENERAL',
  };
}

/**
 * Answer one question.
 * @param {string} query
 * @param {Array<{role:string, content:string}>} [history] recent conversation, used to resolve "it" / "that project"
 * @returns {Promise<{ content: string, sources: Array, queryCategory: string, matchedId?: string, confidence?: number }>}
 */
async function answerQuery(query, history) {
  const q = String(query || '').trim();
  const classification = classifyQuery(q);

  if (ADVERSARIAL.some((re) => re.test(q))) return adversarial();

  // Greetings and "what are you" never need retrieval
  const bank0 = buildBank();
  const byId = (id) => bank0.find((x) => x.id === id);
  const direct = (id) => { const en = byId(id); return en && { content: en.a, sources: sourcesFor(en), queryCategory: 'GENERAL', matchedId: id, confidence: 1 }; };
  if (/^\s*(hi+|hello+|hey+|hey there|hiya|yo|namaste|hola|good (morning|afternoon|evening))\b[\s!.,]*(sujit ai|there|bot)?[\s!.,]*$/i.test(q)) return direct('greeting');
  if (/\b(who|what)('s| is| are| r) (you|u|your)\b|\bwho (made|built|created|developed|trained) you\b|\bare you (a |an |the )?(bot|ai|chatgpt|gpt|human|real|robot|assistant)\b|\bwhat can (you|i ask)\b|\bhow do you work\b|\byour (name|purpose|job|role)\b|^\s*help\s*[?!.]*\s*$/i.test(q)) return direct('sujit-ai');

  // Live GitHub questions
  for (const intent of GH_INTENTS) {
    if (intent.test(q)) {
      const data = await liveGithub();
      if (!data) return githubUnavailable();
      return {
        content: `${intent.render(data)}\n\n_Live from GitHub, refreshed ${ago(data.fetchedAt)}._`,
        sources: GH_SOURCES, queryCategory: 'PROJECT', matchedId: 'github-' + intent.id, confidence: 1,
      };
    }
  }

  const bankIds = new Set(buildBank().map((x) => x.id));
  const unlisted = unlistedSkillAnswer(q, bankIds);
  if (unlisted) return unlisted;

  // "what are its features?" after talking about a project
  let project = detectProject(q);
  if (!project && /\b(it|its|that|this|the project|that project)\b/i.test(q)) project = projectFromHistory(history);

  const result = search(q, { project: project || null });
  if (result.best && result.confidence >= CONFIDENCE_FLOOR) {
    const entry = result.best;
    const body = entry.topic === 'faq' ? `### ${entry.q[0]}\n\n${entry.a}` : entry.a;
    return {
      content: body, sources: sourcesFor(entry),
      queryCategory: classification.category || 'GENERAL', matchedId: entry.id, confidence: result.confidence,
    };
  }
  return Object.assign(notOnFile(q, result.alternatives), { matchedId: null, confidence: result.confidence });
}

async function* streamAnswer(text) {
  const chunkSize = 25;
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    await new Promise((r) => setTimeout(r, 14));
  }
}

module.exports = { answerQuery, streamAnswer };
