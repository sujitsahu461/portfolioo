/**
 * @fileoverview Retrieval pipeline — orchestrates embedding, vector search,
 * filtering, deduplication, and context assembly.
 */

const { EmbeddingProvider } = require('./embeddings');
const { VectorStore } = require('./vectorstore');
const { classifyQuery } = require('./query-router');

class RetrievalPipeline {
  /**
   * @param {Object} config
   * @param {EmbeddingProvider} config.embeddings
   * @param {VectorStore} config.vectorStore
   */
  constructor(config) {
    this.embeddings = config.embeddings;
    this.vectorStore = config.vectorStore;
  }

  /**
   * Full retrieval pipeline: query → classify → embed → search → deduplicate → assemble.
   *
   * @param {string} query
   * @param {Object} [options]
   * @param {number} [options.topK]
   * @param {number} [options.scoreThreshold]
   * @returns {Promise<import('./types').RetrievalResult>}
   */
  async retrieve(query, options = {}) {
    const startTime = Date.now();
    const { topK = 8, scoreThreshold = 0.35 } = options;

    // 1. Classify query
    const classification = classifyQuery(query);

    // 2. Normalize query
    const normalizedQuery = this.normalizeQuery(query);

    // 3. Embed query
    const queryVector = await this.embeddings.embed(normalizedQuery);

    // 4. Build search filter
    const filter = {};
    if (classification.filterCategory && classification.confidence >= 0.5) {
      filter.category = classification.filterCategory;
    }

    // 5. Vector search — two-pass if category-filtered
    let results = await this.vectorStore.search(queryVector, {
      topK,
      scoreThreshold,
      filter: Object.keys(filter).length > 0 ? filter : null,
    });

    // If category filter returned too few results, do a broader search
    if (results.length < 3 && Object.keys(filter).length > 0) {
      const broadResults = await this.vectorStore.search(queryVector, {
        topK,
        scoreThreshold,
        filter: null, // No category filter
      });

      // Merge and deduplicate
      const seen = new Set(results.map(r => r.id));
      for (const r of broadResults) {
        if (!seen.has(r.id)) {
          results.push(r);
          seen.add(r.id);
        }
      }
    }

    // 6. Deduplicate by content similarity (remove near-duplicate chunks)
    results = this.deduplicateResults(results);

    // 7. Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // 8. Trim to context window budget (~4000 chars)
    const trimmedResults = this.trimToContextBudget(results, 4000);

    // 9. Extract sources
    const sources = this.extractSources(trimmedResults);

    const latencyMs = Date.now() - startTime;

    return {
      chunks: trimmedResults.map(r => ({
        id: r.id,
        content: r.payload.content,
        metadata: {
          title: r.payload.title,
          category: r.payload.category,
          technologies: r.payload.technologies || [],
          visibility: r.payload.visibility,
          github: r.payload.github || null,
          filePath: r.payload.filePath || '',
        },
        score: r.score,
        heading: r.payload.heading || r.payload.title,
      })),
      sources,
      latencyMs,
      queryCategory: classification.category,
    };
  }

  /**
   * Normalize a query for better embedding quality.
   * @param {string} query
   * @returns {string}
   */
  normalizeQuery(query) {
    return query
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[?!.]+$/, '') // Remove trailing punctuation for embedding
      .slice(0, 500); // Limit query length
  }

  /**
   * Remove near-duplicate results based on content overlap.
   * @param {Array} results
   * @returns {Array}
   */
  deduplicateResults(results) {
    const seen = [];
    return results.filter(r => {
      const content = (r.payload.content || '').slice(0, 200);
      for (const s of seen) {
        if (this.textSimilarity(content, s) > 0.8) return false;
      }
      seen.push(content);
      return true;
    });
  }

  /**
   * Simple Jaccard-like text similarity.
   * @param {string} a
   * @param {string} b
   * @returns {number}
   */
  textSimilarity(a, b) {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
    const union = new Set([...wordsA, ...wordsB]).size;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * Trim results to fit within a character budget.
   * @param {Array} results
   * @param {number} budget
   * @returns {Array}
   */
  trimToContextBudget(results, budget) {
    const trimmed = [];
    let totalLength = 0;

    for (const r of results) {
      const content = r.payload.content || '';
      if (totalLength + content.length > budget && trimmed.length > 0) break;
      trimmed.push(r);
      totalLength += content.length;
    }

    return trimmed;
  }

  /**
   * Extract clean source references from results.
   * @param {Array} results
   * @returns {import('./types').Source[]}
   */
  extractSources(results) {
    const sourceMap = new Map();

    for (const r of results) {
      const title = r.payload.title;
      if (!sourceMap.has(title)) {
        sourceMap.set(title, {
          title,
          category: r.payload.category,
          url: r.payload.github || r.payload.url || null,
          relevance: r.score,
        });
      }
    }

    return Array.from(sourceMap.values());
  }
}

module.exports = { RetrievalPipeline };
