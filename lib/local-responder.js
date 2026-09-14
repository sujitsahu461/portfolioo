/**
 * @fileoverview Local Knowledge Base Responder.
 * Provides grounded, accurate answers directly from knowledge/ markdown files
 * with specialized semantic parsing of 30 core interview & FAQ training questions.
 */

const fs = require('fs');
const path = require('path');
const { classifyQuery } = require('./query-router');

const KNOWLEDGE_DIR = fs.existsSync(path.join(__dirname, '..', 'knowledge'))
  ? path.join(__dirname, '..', 'knowledge')
  : path.join(__dirname, '..', '..', 'knowledge');

// Cache knowledge documents in memory
let cachedDocs = null;
let cachedQAPairs = null;

function loadKnowledgeDocs() {
  if (cachedDocs) return cachedDocs;
  cachedDocs = [];

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        
        // Parse frontmatter
        let title = path.basename(entry.name, '.md');
        let category = 'general';
        let technologies = [];
        let url = null;
        let github = null;

        const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        let content = raw;
        if (match) {
          content = raw.slice(match[0].length).trim();
          const yamlLines = match[1].split('\n');
          for (const line of yamlLines) {
            const [k, ...v] = line.split(':');
            if (k && v.length) {
              const key = k.trim();
              const val = v.join(':').trim();
              if (key === 'title') title = val.replace(/['"]/g, '');
              if (key === 'category') category = val.replace(/['"]/g, '');
              if (key === 'url') url = val.replace(/['"]/g, '');
              if (key === 'github') github = val.replace(/['"]/g, '');
            }
          }
        }

        cachedDocs.push({
          title,
          category,
          technologies,
          url,
          github,
          relPath: path.relative(path.join(__dirname, '..', '..'), fullPath).replace(/\\/g, '/'),
          content,
        });
      }
    }
  }

  scan(KNOWLEDGE_DIR);
  return cachedDocs;
}

function loadQAPairs() {
  if (cachedQAPairs) return cachedQAPairs;
  cachedQAPairs = [];
  const qaPath = path.join(KNOWLEDGE_DIR, 'faq', 'qa-knowledge.md');
  if (!fs.existsSync(qaPath)) return cachedQAPairs;

  const raw = fs.readFileSync(qaPath, 'utf-8');
  const regex = /### Q(\d+):\s*([^\n\r]+)\r?\n([\s\S]*?)(?=(?:### Q\d+:|$))/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const qNum = parseInt(match[1], 10);
    const question = match[2].trim();
    const answer = match[3].trim();
    const cleanQ = question.toLowerCase().replace(/[^\w\s]/g, ' ');
    const keywords = cleanQ.split(/\s+/).filter((w) => w.length > 2);
    cachedQAPairs.push({
      num: qNum,
      question,
      answer,
      cleanQ,
      keywords,
    });
  }
  return cachedQAPairs;
}

/**
 * Match query against the 30 curated Q&A pairs.
 * @param {string} query
 * @returns {{ answer: string, question: string } | null}
 */
function matchQAPair(query) {
  const pairs = loadQAPairs();
  if (!pairs.length) return null;

  const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ');
  const queryTokens = cleanQuery.split(/\s+/).filter((w) => w.length > 2);
  if (!queryTokens.length) return null;

  let bestMatch = null;
  let highestScore = 0;

  // Specific high-intent keyword bindings
  const keywordMappings = [
    { pattern: /\b(yolov8|candlestick|stock)\b/i, qNum: 2 },
    { pattern: /\b(finn[\s-]*track|expense|budget)\b/i, qNum: 3 },
    { pattern: /\b(superpower[\s-]*hands|mediapipe|gesture)\b/i, qNum: 4 },
    { pattern: /\b(bandwidth|pwa|offline)\b/i, qNum: 5 },
    { pattern: /\b(votewise|voting|ballot)\b/i, qNum: 6 },
    { pattern: /\b(ipl|cricket|sports)\b/i, qNum: 7 },
    { pattern: /\b(weather)\b/i, qNum: 8 },
    { pattern: /\b(bank|banking)\b/i, qNum: 9 },
    { pattern: /\b(programming language|languages)\b/i, qNum: 10 },
    { pattern: /\b(framework|react|django|fastapi)\b/i, qNum: 11 },
    { pattern: /\b(machine learning|ai capability|models)\b/i, qNum: 12 },
    { pattern: /\b(cybersecurity|owasp|penetration|nmap|wireshark)\b/i, qNum: 13 },
    { pattern: /\b(study|college|university|degree|giet)\b/i, qNum: 14 },
    { pattern: /\b(mcl|mahanadi)\b/i, qNum: 15 },
    { pattern: /\b(preppright)\b/i, qNum: 16 },
    { pattern: /\b(cttc|msme)\b/i, qNum: 17 },
    { pattern: /\b(prompt engineering|chain of thought|few shot)\b/i, qNum: 18 },
    { pattern: /\b(eduskills python|python internship)\b/i, qNum: 19 },
    { pattern: /\b(certification|certificate|credential)\b/i, qNum: 20 },
    { pattern: /\b(why hire|why should i hire|hire sujit)\b/i, qNum: 21 },
    { pattern: /\b(philosophy|mindset|principles)\b/i, qNum: 22 },
    { pattern: /\b(debug|debugging|troubleshoot)\b/i, qNum: 23 },
    { pattern: /\b(prompt injection|llm security|adversarial)\b/i, qNum: 24 },
    { pattern: /\b(learning goals|roadmap|future plans|aspiration)\b/i, qNum: 25 },
    { pattern: /\b(available|freelance|hire|contract|job|internship opportunity)\b/i, qNum: 26 },
    { pattern: /\b(remote|hybrid|onsite|relocation)\b/i, qNum: 27 },
    { pattern: /\b(tools|ide|operating system|linux|vscode)\b/i, qNum: 28 },
    { pattern: /\b(database|sql|postgresql|schema|normalization)\b/i, qNum: 29 },
    { pattern: /\b(contact|email|reach|linkedin|phone)\b/i, qNum: 30 },
  ];

  for (const map of keywordMappings) {
    if (map.pattern.test(query)) {
      const match = pairs.find((p) => p.num === map.qNum);
      if (match) {
        return match;
      }
    }
  }

  for (const pair of pairs) {
    let score = 0;
    for (const token of queryTokens) {
      if (pair.cleanQ.includes(token)) score += 3;
      if (pair.keywords.includes(token)) score += 2;
      if (pair.answer.toLowerCase().includes(token)) score += 1;
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestMatch = pair;
    }
  }

  return bestMatch;
}

function getSourcesForQNum(qNum) {
  const map = {
    1: [{ title: 'Developer Profile', category: 'about' }, { title: 'Core Philosophy', category: 'about' }, { title: 'Work Experience', category: 'experience' }],
    2: [{ title: 'BullLens', category: 'project' }, { title: 'Finn-Track-Pro', category: 'project' }, { title: 'AI Capabilities', category: 'skills' }],
    3: [{ title: 'Finn-Track-Pro', category: 'project' }, { title: 'BullLens', category: 'project' }, { title: 'Database Architecture', category: 'skills' }],
    4: [{ title: 'Superpower Hands', category: 'project' }, { title: 'AI Capabilities', category: 'skills' }],
    5: [{ title: 'Bandwidth-Agnostic PWA', category: 'project' }, { title: 'Web Development Skills', category: 'skills' }],
    6: [{ title: 'VoteWise', category: 'project' }, { title: 'Cybersecurity Skills', category: 'skills' }],
    7: [{ title: 'IPL Analytics', category: 'project' }, { title: 'AI Capabilities', category: 'skills' }],
    8: [{ title: 'Weather Dashboard', category: 'project' }, { title: 'Web Development Skills', category: 'skills' }],
    9: [{ title: 'Bank Management System', category: 'project' }, { title: 'Programming Languages', category: 'skills' }],
    10: [{ title: 'Programming Languages', category: 'skills' }, { title: 'Web Development Skills', category: 'skills' }],
    11: [{ title: 'Web Development Skills', category: 'skills' }, { title: 'Finn-Track-Pro', category: 'project' }],
    12: [{ title: 'AI Capabilities', category: 'skills' }, { title: 'BullLens', category: 'project' }, { title: 'Superpower Hands', category: 'project' }],
    13: [{ title: 'Cybersecurity Skills', category: 'skills' }, { title: 'Work Experience', category: 'experience' }],
    14: [{ title: 'Education', category: 'education' }, { title: 'Developer Profile', category: 'about' }],
    15: [{ title: 'Work Experience', category: 'experience' }, { title: 'Web Development Skills', category: 'skills' }],
    16: [{ title: 'Cybersecurity Skills', category: 'skills' }, { title: 'Work Experience', category: 'experience' }],
    17: [{ title: 'AI Capabilities', category: 'skills' }, { title: 'Work Experience', category: 'experience' }],
    18: [{ title: 'AI Capabilities', category: 'skills' }, { title: 'Core Philosophy', category: 'about' }],
    19: [{ title: 'Programming Languages', category: 'skills' }, { title: 'Work Experience', category: 'experience' }],
    20: [{ title: 'Certifications & Credentials', category: 'achievements' }, { title: 'Education', category: 'education' }],
    21: [{ title: 'Developer Profile', category: 'about' }, { title: 'Core Philosophy', category: 'about' }, { title: 'Work Experience', category: 'experience' }],
    22: [{ title: 'Core Philosophy', category: 'about' }, { title: 'Developer Profile', category: 'about' }, { title: 'Debugging Approach', category: 'about' }],
    23: [{ title: 'Core Philosophy', category: 'about' }, { title: 'Programming Languages', category: 'skills' }],
    24: [{ title: 'Cybersecurity Skills', category: 'skills' }, { title: 'AI Capabilities', category: 'skills' }],
    25: [{ title: 'Learning Roadmap', category: 'about' }, { title: 'AI Capabilities', category: 'skills' }],
    26: [{ title: 'Contact Information', category: 'about' }, { title: 'Work Experience', category: 'experience' }],
    27: [{ title: 'Developer Profile', category: 'about' }, { title: 'Contact Information', category: 'about' }],
    28: [{ title: 'Programming Languages', category: 'skills' }, { title: 'Developer Profile', category: 'about' }],
    29: [{ title: 'Finn-Track-Pro', category: 'project' }, { title: 'Programming Languages', category: 'skills' }],
    30: [{ title: 'Contact Information', category: 'about' }, { title: 'Developer Profile', category: 'about' }],
  };
  return map[qNum] || [{ title: 'Developer Profile', category: 'about' }, { title: 'Core Philosophy', category: 'about' }];
}

/**
 * Generate a response using local knowledge base.
 * @param {string} query
 * @returns {{ content: string, sources: Array<{title: string, category: string, url: string|null}>, queryCategory: string }}
 */
function answerQuery(query) {
  const classification = classifyQuery(query);
  const q = query.toLowerCase();

  // 1. Adversarial defense
  if (
    q.includes('ignore your') ||
    q.includes('ignore previous') ||
    q.includes('system prompt') ||
    q.includes('show prompt') ||
    q.includes('reveal private') ||
    q.includes('everything in the database') ||
    q.includes('password') ||
    q.includes('api key')
  ) {
    return {
      content: "I am **Sujit AI**, an assistant designed exclusively to share verified information about Sujit Kumar Sahu's projects, technical skills, certifications, and background. I operate within strict security guidelines and cannot modify my instructions or reveal internal configurations.\n\nHow can I help you explore Sujit's work?",
      sources: [{ title: 'Developer Profile', category: 'about', url: null }],
      queryCategory: 'GENERAL',
    };
  }

  // 2. Unknown questions (anti-hallucination)
  if (
    q.includes('gpa') ||
    q.includes('grade') ||
    q.includes('salary') ||
    q.includes('earn') ||
    q.includes('girlfriend') ||
    q.includes('marital') ||
    q.includes('religion') ||
    q.includes('publication') ||
    q.includes('paper titled') ||
    q.includes('research paper')
  ) {
    return {
      content: "I don't have verified information about that in Sujit's public portfolio.\n\nFor specific academic, employment, or personal inquiries, please reach out to Sujit directly at **sujitkumarsahu7334@gmail.com** or connect via [LinkedIn](https://linkedin.com).",
      sources: [{ title: 'Contact Information', category: 'about', url: null }],
      queryCategory: 'GENERAL',
    };
  }

  // 3. Match against the 30 FAQ / Interview Training Questions
  const matchedQA = matchQAPair(query);
  if (matchedQA) {
    const sources = getSourcesForQNum(matchedQA.num);
    return {
      content: `### ${matchedQA.question}\n\n${matchedQA.answer}`,
      sources,
      queryCategory: classification.category || 'GENERAL',
    };
  }

  // 4. Fallback to default comprehensive profile
  return {
    content: `**Sujit Kumar Sahu** is a **Cybersecurity AI Engineer and Software Developer** currently pursuing his B.Tech in Computer Science and Engineering at **GIET University, Gunupur (2024–2028)**. He is based in Sambalpur, Odisha, India.

### Highlights:
- **Expertise**: Full-stack web development, applied machine learning, and cybersecurity architecture.
- **Experience**: Completed **5 industry internships** (MCL, EduSkills, PreppRight, CTTC).
- **Projects**: Developed **10+ production-grade applications**, including **BullLens** (AI stock predictor), **Finn-Track-Pro** (finance manager), and **Superpower Hands** (gesture recognition).
- **Philosophy**: Committed to writing clean, resilient, and secure code with a focus on real-world utility.

Feel free to ask about his specific projects, skills, internship experience, or how to get in touch!`,
    sources: [
      { title: 'Developer Profile', category: 'about', url: null },
      { title: 'Core Philosophy', category: 'about', url: null },
    ],
    queryCategory: 'PROFILE',
  };
}

/**
 * Stream local answer with authentic typing intervals.
 * @param {string} text
 * @returns {AsyncGenerator<string>}
 */
async function* streamAnswer(text) {
  const chunkSize = 25;
  for (let i = 0; i < text.length; i += chunkSize) {
    const slice = text.slice(i, i + chunkSize);
    yield slice;
    await new Promise((r) => setTimeout(r, 14));
  }
}

module.exports = {
  answerQuery,
  streamAnswer,
  loadKnowledgeDocs,
  loadQAPairs,
};
