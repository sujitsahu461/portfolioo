/**
 * @fileoverview Vector store abstraction with Qdrant implementation.
 * Provides upsert, search, delete, and health check operations.
 */

const { QdrantClient } = require('@qdrant/js-client-rest');

class VectorStore {
  /**
   * @param {Object} config
   * @param {string} config.url
   * @param {string} config.apiKey
   * @param {string} [config.collection]
   * @param {number} [config.dimensions]
   */
  constructor(config) {
    this.collection = config.collection || 'sujit-ai';
    this.dimensions = config.dimensions || 1536;
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
    });
  }

  /**
   * Ensure the collection exists with proper configuration.
   */
  async ensureCollection() {
    try {
      await this.client.getCollection(this.collection);
    } catch (err) {
      // Collection doesn't exist — create it
      await this.client.createCollection(this.collection, {
        vectors: {
          size: this.dimensions,
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
      });

      // Create payload indexes for metadata filtering
      await this.client.createPayloadIndex(this.collection, {
        field_name: 'category',
        field_schema: 'keyword',
      });
      await this.client.createPayloadIndex(this.collection, {
        field_name: 'visibility',
        field_schema: 'keyword',
      });
    }
  }

  /**
   * Upsert document chunks with embeddings into the vector store.
   * @param {Array<{id: string, vector: number[], payload: Object}>} points
   */
  async upsert(points) {
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      await this.client.upsert(this.collection, {
        wait: true,
        points: batch,
      });
    }
  }

  /**
   * Perform similarity search with optional metadata filtering.
   * @param {number[]} queryVector
   * @param {Object} [options]
   * @param {number} [options.topK]
   * @param {number} [options.scoreThreshold]
   * @param {Object} [options.filter]
   * @returns {Promise<Array<{id: string, score: number, payload: Object}>>}
   */
  async search(queryVector, options = {}) {
    const { topK = 8, scoreThreshold = 0.35, filter = null } = options;

    // Always filter for public documents only
    const mustConditions = [
      { key: 'visibility', match: { value: 'public' } },
    ];

    // Add optional category filter
    if (filter && filter.category) {
      mustConditions.push({
        key: 'category',
        match: { value: filter.category },
      });
    }

    const results = await this.client.search(this.collection, {
      vector: queryVector,
      limit: topK,
      score_threshold: scoreThreshold,
      with_payload: true,
      filter: {
        must: mustConditions,
      },
    });

    return results.map(r => ({
      id: r.id,
      score: r.score,
      payload: r.payload,
    }));
  }

  /**
   * Delete points by IDs.
   * @param {string[]} ids
   */
  async delete(ids) {
    await this.client.delete(this.collection, {
      wait: true,
      points: ids,
    });
  }

  /**
   * Delete all points in the collection (for reindexing).
   */
  async deleteAll() {
    try {
      await this.client.deleteCollection(this.collection);
    } catch (err) {
      // Collection might not exist
    }
    await this.ensureCollection();
  }

  /**
   * Health check — verify connection and collection status.
   * @returns {Promise<{ok: boolean, collection: string, pointsCount: number}>}
   */
  async healthCheck() {
    try {
      const info = await this.client.getCollection(this.collection);
      return {
        ok: true,
        collection: this.collection,
        pointsCount: info.points_count || 0,
      };
    } catch (err) {
      return {
        ok: false,
        collection: this.collection,
        pointsCount: 0,
        error: err.message,
      };
    }
  }
}

module.exports = { VectorStore };
