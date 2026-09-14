/**
 * @fileoverview Query router — classifies incoming questions to improve retrieval.
 * Uses keyword matching + pattern detection (no LLM call needed).
 */

/** @typedef {import('./types').QueryCategory} QueryCategory */

/**
 * Category patterns: keywords and phrases that indicate each category.
 * Ordered by specificity — more specific patterns first.
 */
const CATEGORY_PATTERNS = {
  CONTACT: {
    keywords: ['contact', 'email', 'reach', 'hire', 'connect', 'linkedin', 'github', 'instagram', 'social', 'message', 'phone', 'call'],
    phrases: ['how can i contact', 'how to reach', 'get in touch', 'send.*message', 'hiring'],
  },
  PROJECT: {
    keywords: ['project', 'finn-track', 'bulllens', 'bull lens', 'superpower', 'weather dashboard', 'bank management', 'pwa', 'hotel management', 'lms', 'ipl', 'votewise', 'civicsetu', 'built', 'developed', 'created', 'application', 'app'],
    phrases: ['show me.*project', 'tell me about.*project', 'what.*built', 'what.*develop', 'featured work', 'tell me about finn', 'tell me about bull', 'tell me about super', 'tell me about weather', 'tell me about bank', 'tell me about hotel', 'tell me about ipl', 'tell me about vote', 'tell me about civic'],
  },
  SKILLS: {
    keywords: ['skill', 'technology', 'technologies', 'tech stack', 'programming', 'language', 'framework', 'tool', 'proficiency', 'expertise', 'capable', 'know', 'work with'],
    phrases: ['what.*skills', 'strongest.*skill', 'technical.*skill', 'what.*work with', 'what.*know', 'tech.*stack'],
  },
  EDUCATION: {
    keywords: ['education', 'university', 'college', 'degree', 'giet', 'school', 'study', 'student', 'academic', 'b.tech', 'btech'],
    phrases: ['where.*study', 'what.*degree', 'where.*learn'],
  },
  EXPERIENCE: {
    keywords: ['experience', 'internship', 'intern', 'work history', 'job', 'role', 'company', 'mcl', 'eduskills', 'preppright', 'cttc', 'mahanadi'],
    phrases: ['where.*work', 'work.*experience', 'what.*done'],
  },
  ACHIEVEMENT: {
    keywords: ['achievement', 'certification', 'certificate', 'award', 'hackathon', 'competition', 'badge', 'credential', 'cisco', 'hp life'],
    phrases: ['what.*certif', 'what.*achieve', 'what.*award'],
  },
  PROFILE: {
    keywords: ['who', 'introduce', 'background', 'summary', 'overview', 'philosophy', 'approach', 'kind of developer'],
    phrases: ['who is sujit', 'tell me about sujit', 'about sujit', 'what kind of', 'why.*hire', 'what type', 'development philosophy'],
  },
};

/**
 * Classify a user query into a category.
 * Returns the best-matching category and an optional subcategory filter value.
 *
 * @param {string} query
 * @returns {{ category: QueryCategory, filterCategory: string|null, confidence: number }}
 */
function classifyQuery(query) {
  const normalized = query.toLowerCase().trim();
  let bestCategory = 'GENERAL';
  let bestScore = 0;

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    let score = 0;

    // Check keywords
    for (const keyword of patterns.keywords) {
      if (normalized.includes(keyword)) {
        score += 1;
      }
    }

    // Check phrase patterns (higher weight)
    for (const phrase of patterns.phrases) {
      if (new RegExp(phrase, 'i').test(normalized)) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Map query categories to knowledge base categories for metadata filtering
  const categoryMap = {
    PROFILE: 'about',
    PROJECT: 'project',
    SKILLS: 'skills',
    EDUCATION: 'education',
    EXPERIENCE: 'experience',
    ACHIEVEMENT: 'achievement',
    CONTACT: 'about', // Contact info is in the profile document
    GENERAL: null,
  };

  return {
    category: bestCategory,
    filterCategory: bestScore >= 3 ? categoryMap[bestCategory] : null,
    confidence: Math.min(bestScore / 6, 1),
  };
}

module.exports = { classifyQuery };
