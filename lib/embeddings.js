/**
 * @fileoverview Embedding provider abstraction with OpenAI implementation.
 * Designed for easy provider replacement.
 */

const OpenAI = require('openai');

class EmbeddingProvider {
  /**
   * @param {Object} config
   * @param {string} config.apiKey
   * @param {string} [config.model]
   */
  constructor(config) {
    this.model = config.model || 'text-embedding-3-small';
    this.dimensions = 1536;
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  /**
   * Embed a single text string.
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embed(text) {
    const cleaned = text.replace(/\n+/g, ' ').trim();
    if (!cleaned) throw new Error('Empty text cannot be embedded');

    const response = await this.client.embeddings.create({
      model: this.model,
      input: cleaned,
    });

    return response.data[0].embedding;
  }

  /**
   * Embed multiple texts in a single batch request.
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async embedBatch(texts) {
    const cleaned = texts.map(t => t.replace(/\n+/g, ' ').trim());
    const nonEmpty = cleaned.filter(Boolean);
    if (nonEmpty.length === 0) throw new Error('No valid texts to embed');

    // OpenAI supports up to 2048 inputs per request; batch in groups of 100
    const batchSize = 100;
    const allEmbeddings = [];

    for (let i = 0; i < nonEmpty.length; i += batchSize) {
      const batch = nonEmpty.slice(i, i + batchSize);
      const response = await this.client.embeddings.create({
        model: this.model,
        input: batch,
      });
      allEmbeddings.push(...response.data.map(d => d.embedding));
    }

    return allEmbeddings;
  }

  /** @returns {number} */
  getDimensions() {
    return this.dimensions;
  }
}

module.exports = { EmbeddingProvider };
