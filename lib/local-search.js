/**
 * @fileoverview Retrieval for Sujit AI's local knowledge engine.
 *
 * A small, dependency-free search engine over the question bank (lib/qa-bank.js):
 *   - normalisation: aliases (bull lens, finn-track-pro, ...), stop words, light stemming,
 *     and a synonym table so "college", "uni" and "university" are the same word
 *   - ranking: BM25 over the question phrasings and over the answers, plus how completely the
 *     query covers the single best-matching phrasing
 *   - an entity guard: a question that names a project only searches that project's entries
 *   - a confidence score, so a question that matches nothing is told "not on file"
 *     instead of getting the nearest unrelated answer
 */

const { buildBank, getProjectNames } = require('./qa-bank');

const STOP = new Set((
  'a an the of to in on at for with and or but if then than so as by from into about over under ' +
  'is are was were be been being am done have has had having can could would should will shall may might must ' +
  'i me my you your we our they them their it its this that these those there here ' +
  'he him his she her sujit sahu kumar sujits ' +
  'tell give show explain describe list please kindly want need like know also just really very ' +
  'what whats which any some all more most much ' +
  'ok okay hey hi hello yo hola quick question questions wondering curious ask asking say said wanna gonna thing things something anything bit little detail details info information regarding related guy person'
).split(' '));

// Words that must survive even though they look like stop words elsewhere.
const KEEP = new Set(['who', 'where', 'when', 'why', 'how', 'many', 'old', 'not', 'no']);
const FUNCTION_TOKENS = new Set(['who', 'where', 'when', 'why', 'how', 'many', 'not', 'no', 'do', 'doe', 'now']);

const ALIASES = [
  [/finn[\s-]*track(?:[\s-]*pro)?/g, ' finntrack '],
  [/bull[\s-]*lens/g, ' bulllens '],
  [/civic[\s-]*setu/g, ' civicsetu '],
  [/nivara[\s-]*nova/g, ' nivaranova '],
  [/vote[\s-]*wise/g, ' votewise '],
  [/super[\s-]*power[\s-]*hands?/g, ' superpowerhands '],
  [/node[\s.]*js/g, ' nodejs '],
  [/express[\s.]*js/g, ' express '],
  [/react[\s.]*js/g, ' react '],
  [/next[\s.]*js/g, ' nextjs '],
  [/scikit[\s-]*learn|sklearn/g, ' scikitlearn '],
  [/c\+\+/g, ' cpp '],
  [/c#/g, ' csharp '],
  [/ci\s*\/\s*cd/g, ' cicd '],
  [/b\.?\s?tech/g, ' btech '],
  [/open[\s-]*source/g, ' opensource '],
  [/full[\s-]*stack/g, ' fullstack '],
  [/front[\s-]*end/g, ' frontend '],
  [/back[\s-]*end/g, ' backend '],
  [/pen[\s-]*test(?:ing)?|penetration test(?:ing)?/g, ' pentesting '],
  [/machine[\s-]*learning|\bml\b/g, ' machinelearning '],
  [/prompt[\s-]*engineer(?:ing)?/g, ' promptengineering '],
  [/\bweb[\s-]*dev(?:elopment|eloper)?\b/g, ' webdev '],
  [/cyber[\s-]*security/g, ' cybersecurity '],
  [/vs[\s-]*code/g, ' vscode '],
  [/ten years?|10[\s-]*years?|\b10 yrs\b/g, ' decade '],
  [/twenty years?|20[\s-]*years?/g, ' decade '],
  [/five years?|5[\s-]*years?/g, ' decade '],
  [/\bin the (next|coming) (few )?years\b/g, ' decade '],
  [/\b(2030|2035|2040|2045)\b/g, ' decade '],
];

// Canonical words: both the question bank and the user's query are mapped through this table.
const SYN = {
  college: 'university', uni: 'university', institute: 'university', campus: 'university', giet: 'university', school: 'school',
  course: 'degree', branch: 'degree', major: 'degree', stream: 'degree', qualification: 'degree', btech: 'degree', engineering: 'degree', studying: 'study', student: 'study', studies: 'study', educational: 'education', academic: 'education',
  graduate: 'graduation', graduating: 'graduation', graduates: 'graduation', batch: 'graduation',
  employer: 'company', organisation: 'company', organization: 'company', firm: 'company',
  job: 'work', jobs: 'work', worked: 'work', working: 'work', employed: 'work', employment: 'work', career: 'work', professional: 'work',
  intern: 'internship', interns: 'internship', internships: 'internship', interned: 'internship', training: 'internship',
  cv: 'resume', résumé: 'resume', mail: 'email', emailed: 'email', gmail: 'email', email: 'email', message: 'contact', reach: 'contact', touch: 'contact', connect: 'contact', contact: 'contact',
  repo: 'repository', repos: 'repository', repositories: 'repository', repository: 'repository', source: 'repository',
  certificate: 'certificate', certificates: 'certificate', certification: 'certificate', certifications: 'certificate', certified: 'certificate', credential: 'certificate', credentials: 'certificate', cert: 'certificate', certs: 'certificate', 
  hobby: 'hobby', hobbies: 'hobby', interest: 'hobby', interests: 'hobby', passion: 'hobby', passions: 'hobby', pastime: 'hobby', leisure: 'hobby', fun: 'hobby',
  old: 'age', age: 'age', birthday: 'age', dob: 'age', born: 'age', birth: 'age',
  wife: 'relationship', girlfriend: 'relationship', boyfriend: 'relationship', married: 'relationship', marry: 'relationship', single: 'relationship', relationship: 'relationship', dating: 'relationship', marriage: 'relationship',
  parents: 'family', father: 'family', mother: 'family', sibling: 'family', siblings: 'family', brother: 'family', sister: 'family', family: 'family', dad: 'family', mom: 'family',
  salary: 'salary', ctc: 'salary', pay: 'salary', stipend: 'salary', earn: 'salary', earns: 'salary', rate: 'salary', rates: 'salary', charge: 'salary', charges: 'salary', cost: 'salary', package: 'salary', income: 'salary', money: 'salary', paid: 'salary',
  cgpa: 'grade', gpa: 'grade', marks: 'grade', mark: 'grade', grades: 'grade', percentage: 'grade', score: 'grade', scored: 'grade', rank: 'grade', result: 'grade', results: 'grade', topper: 'grade',
  phone: 'phone', mobile: 'phone', call: 'phone', whatsapp: 'phone', telegram: 'phone', number: 'phone',
  address: 'address', street: 'address', locality: 'address', home: 'address', house: 'address',
  live: 'location', lives: 'location', located: 'location', location: 'location', based: 'location', city: 'location', state: 'location', stay: 'location', town: 'location', country: 'location', odisha: 'location', sambalpur: 'location', india: 'location', indian: 'location',
  future: 'decade', vision: 'decade', ambition: 'decade', aspiration: 'decade', aspirations: 'decade', dream: 'decade', decade: 'decade', longterm: 'decade',
  goals: 'goal', goal: 'goal', plans: 'plan', plan: 'plan', roadmap: 'plan',
  startup: 'founder', startups: 'founder', entrepreneur: 'founder', ceo: 'founder', founder: 'founder', founded: 'founder', founding: 'founder', nivaranova: 'founder', cofounder: 'founder',
  skills: 'skill', skill: 'skill', technologies: 'skill', technology: 'skill', tech: 'skill', stack: 'skill', expertise: 'skill', proficient: 'skill', proficiency: 'skill', capable: 'skill', familiar: 'skill', good: 'skill', strong: 'skill', strongest: 'strength', strengths: 'strength', strength: 'strength', best: 'strength', superpower: 'strength',
  hire: 'hire', hiring: 'hire', hired: 'hire', recruit: 'hire', recruiter: 'hire', recruiters: 'hire', recruitment: 'hire', employ: 'hire', available: 'hire', availability: 'hire', opportunity: 'hire', opportunities: 'hire', freelance: 'hire', freelancing: 'hire', vacancy: 'hire',
  projects: 'project', project: 'project', app: 'project', apps: 'project', application: 'project', applications: 'project', product: 'project',
  built: 'build', build: 'build', builds: 'build', develop: 'build', developed: 'build', developing: 'build', made: 'build', make: 'build', created: 'build', create: 'build', designed: 'build',
  languages: 'language', language: 'language', programming: 'language', coding: 'language',
  weaknesses: 'weakness', weakness: 'weakness', drawbacks: 'weakness', limitations: 'weakness', lacks: 'weakness', improve: 'weakness',
  hacker: 'pentesting', hacking: 'pentesting', hack: 'pentesting', ethical: 'pentesting', pentesting: 'pentesting',
  remote: 'remote', onsite: 'remote', hybrid: 'remote', office: 'remote', wfh: 'remote',
  currently: 'now', moment: 'now', present: 'now', chatbot: 'assistant', bot: 'assistant', assistant: 'assistant', outside: 'hobby', leisure: 'hobby', current: 'now', presently: 'now', today: 'now', nowadays: 'now', latest: 'recent', newest: 'recent', recent: 'recent', recently: 'recent', lately: 'recent',
  hello: 'greeting', hiya: 'greeting', namaste: 'greeting', hii: 'greeting', thanks: 'thanks', thank: 'thanks', thx: 'thanks', bye: 'bye', goodbye: 'bye', cya: 'bye',
  recruited: 'hire', experience: 'experience', experienced: 'experience', years: 'years', cybersecurity: 'cybersecurity', security: 'cybersecurity',
};

function stem(w) {
  if (w.length > 5 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('es') && !w.endsWith('ses')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us')) return w.slice(0, -1);
  return w;
}

function tokenize(text) {
  let t = String(text).toLowerCase();
  for (const [re, to] of ALIASES) t = t.replace(re, to);
  t = t.replace(/['’]s\b/g, '').replace(/[^a-z0-9+\s]/g, ' ');
  const out = [];
  for (const raw of t.split(/\s+/)) {
    if (!raw) continue;
    if (STOP.has(raw) && !KEEP.has(raw)) continue;
    const canon = SYN[raw] || SYN[stem(raw)] || stem(raw);
    out.push(canon);
  }
  return out;
}

class Index {
  constructor(docs, k1, b) {
    this.k1 = k1; this.b = b; this.docs = docs;
    this.df = new Map();
    this.tf = docs.map((tokens) => {
      const m = new Map();
      for (const w of tokens) m.set(w, (m.get(w) || 0) + 1);
      for (const w of m.keys()) this.df.set(w, (this.df.get(w) || 0) + 1);
      return m;
    });
    this.avg = docs.reduce((n, d) => n + d.length, 0) / Math.max(1, docs.length);
    this.N = docs.length;
  }
  idf(w) { const n = this.df.get(w) || 0; return Math.log(1 + (this.N - n + 0.5) / (n + 0.5)); }
  score(qTokens, i) {
    const tf = this.tf[i], len = this.docs[i].length;
    let s = 0;
    for (const w of new Set(qTokens)) {
      const f = tf.get(w);
      if (!f) continue;
      s += this.idf(w) * (f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + this.b * len / this.avg));
    }
    return s;
  }
}

let engine = null;

function build() {
  if (engine) return engine;
  const bank = buildBank();
  const qDocs = bank.map((x) => x.q.flatMap((p) => tokenize(p)));
  const aDocs = bank.map((x) => tokenize(x.a + ' ' + x.topic));
  const phrasings = bank.map((x) => x.q.map((p) => ({ text: p, tokens: new Set(tokenize(p)) })));
  const qIndex = new Index(qDocs, 1.2, 0.4);
  const aIndex = new Index(aDocs, 1.2, 0.75);

  // project entity map: which distinctive words identify each project (from its names, not its phrasings)
  const GENERIC = new Set(['project', 'system', 'app', 'build', 'platform', 'management', 'learning', 'predictor', 'market', 'stock', 'tracker', 'finance', 'expense', 'voting', 'vote', 'hand', 'gesture', 'tracking', 'offline', 'low', 'bandwidth', 'progressive', 'web', 'civic', 'engagement', 'grievance', 'smart', 'personal', 'recognition', 'booking', 'banking', 'crunch', 'analytic', 'agnostic', 'skill']);
  const distinctive = new Map();
  for (const [base, names] of Object.entries(getProjectNames())) {
    const keep = new Set();
    for (const n of names) for (const t of tokenize(n)) if (!GENERIC.has(t) || ['ipl', 'weather', 'lms', 'pwa', 'bank', 'hotel', 'dashboard', 'analytic'].includes(t)) keep.add(t);
    distinctive.set(base, keep);
  }
  engine = { bank, qIndex, aIndex, phrasings, distinctive };
  return engine;
}

/** Which project does the text name, if any? Returns the project base name or null. */
function detectProject(text) {
  const { distinctive } = build();
  const toks = new Set(tokenize(text));
  let best = null, bestHits = 0;
  for (const [base, d] of distinctive) {
    let hits = 0;
    for (const t of d) if (toks.has(t)) hits++;
    if (hits > bestHits) { best = base; bestHits = hits; }
  }
  if (best === 'weather-dashboard' && !toks.has('dashboard') && !toks.has('project') && !toks.has('build') && !toks.has('problem') && !toks.has('feature')) return null;
  return bestHits > 0 ? best : null;
}

/**
 * Find the best answers for a question.
 * @returns {{ best: object|null, confidence: number, alternatives: object[] }}
 */
function search(query, opts = {}) {
  const { bank, qIndex, aIndex, phrasings } = build();
  const qTokens = tokenize(query);
  if (!qTokens.length) {
    const who = bank.find((x) => x.id === 'who');
    return { best: who || null, confidence: who ? 0.6 : 0, alternatives: [] };
  }

  const project = opts.project !== undefined ? opts.project : detectProject(query);
  const qSet = new Set(qTokens);
  const known = qTokens.filter((w) => qIndex.df.has(w));          // words that appear in some question phrasing
  const content = known.filter((w) => !FUNCTION_TOKENS.has(w));
  const allFunction = qTokens.every((w) => FUNCTION_TOKENS.has(w));
  if (!known.length || (!content.length && !allFunction)) return { best: null, confidence: 0, alternatives: [] };
  const knownRatio = known.length / qTokens.length;
  const idfSum = [...new Set(known)].reduce((s, w) => s + qIndex.idf(w), 0) || 1;
  const exact = qTokens.join(' ');

  const scored = [];
  for (let i = 0; i < bank.length; i++) {
    const entry = bank[i];
    if (project && entry.id.startsWith('project-') && !entry.id.startsWith(`project-${project}-`)) continue;
    if (project && !entry.id.startsWith(`project-${project}-`) && entry.topic === 'projects') continue;

    const bq = qIndex.score(qTokens, i);
    const ba = aIndex.score(qTokens, i);

    // how completely does the query cover the best single phrasing, and how much of that phrasing is used?
    let bestCover = 0, bestPrec = 0, isExact = false;
    for (const p of phrasings[i]) {
      if (p.tokens.size === 0) continue;
      let common = 0;
      for (const w of qSet) if (p.tokens.has(w)) common += qIndex.idf(w);   // unknown words have no entry in any phrasing
      const cover = common / idfSum;
      let pw = 0; for (const w of p.tokens) pw += qIndex.idf(w);
      const prec = pw ? common / pw : 0;
      const f = cover * 0.7 + prec * 0.3;
      if (f > bestCover * 0.7 + bestPrec * 0.3) { bestCover = cover; bestPrec = prec; }
      if (!isExact && [...p.tokens].sort().join(' ') === [...qSet].sort().join(' ')) isExact = true;
    }
    let s = bq * 0.55 + ba * 0.12 + (bestCover * 0.7 + bestPrec * 0.3) * 12;
    if (isExact) s += 20;
    if (project && entry.id.startsWith(`project-${project}-`)) s += 4;
    scored.push({ entry, score: s, cover: bestCover, prec: bestPrec });
  }
  scored.sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top) return { best: null, confidence: 0, alternatives: [] };
  const second = scored[1] ? scored[1].score : 0;
  // confidence: how much of the question the best phrasing explains, nudged by the lead over the runner-up
  const lead = top.score > 0 ? Math.min(1, (top.score - second) / top.score) : 0;
  const confidence = Math.max(0, Math.min(1, (top.cover * 0.8 + lead * 0.2) * (0.55 + 0.45 * knownRatio)));
  return { best: top.entry, confidence, score: top.score, cover: top.cover, alternatives: scored.slice(1, 4).map((x) => x.entry) };
}

module.exports = { search, tokenize, detectProject, build };
