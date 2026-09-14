/**
 * @fileoverview GET /api/health — Health check endpoint.
 * Returns status of vector store connection and configuration.
 */

const { VectorStore } = require('./lib/vectorstore');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'sujit-ai',
    components: {},
  };

  // Check environment variables (don't expose values)
  checks.components.config = {
    openaiKey: !!process.env.OPENAI_API_KEY,
    qdrantUrl: !!process.env.QDRANT_URL,
    qdrantKey: !!process.env.QDRANT_API_KEY,
    llmModel: process.env.LLM_MODEL || 'gpt-4o-mini',
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  };

  // Check vector store
  try {
    if (process.env.QDRANT_URL && process.env.QDRANT_API_KEY) {
      const vectorStore = new VectorStore({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collection: process.env.QDRANT_COLLECTION || 'sujit-ai',
      });
      checks.components.vectorStore = await vectorStore.healthCheck();
    } else {
      checks.components.vectorStore = { ok: false, error: 'Not configured' };
    }
  } catch (err) {
    checks.components.vectorStore = { ok: false, error: err.message };
  }

  // Set overall status
  const allOk = checks.components.config.openaiKey &&
    checks.components.vectorStore?.ok;
  checks.status = 'ok';
  checks.mode = allOk ? 'cloud-rag' : 'local-knowledge-engine';

  res.statusCode = 200;
  return res.end(JSON.stringify(checks, null, 2));
};
