/**
 * @fileoverview POST /api/chat — Main RAG chat endpoint.
 * Handles: validation → rate limiting → retrieval → LLM streaming → SSE response.
 */

const { EmbeddingProvider } = require('../lib/embeddings');
const { VectorStore } = require('../lib/vectorstore');
const { RetrievalPipeline } = require('../lib/retrieval');
const { LLMProvider } = require('../lib/llm');
const { checkRateLimit, validateMessage } = require('../lib/rate-limiter');
const { answerQuery, streamAnswer } = require('../lib/local-responder');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        const val = trimmed.slice(eqIndex + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

// Lazy-initialized singletons (reused across warm invocations)
let embeddingProvider = null;
let vectorStore = null;
let retrievalPipeline = null;
let llmProvider = null;

function initProviders() {
  if (!embeddingProvider) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

    embeddingProvider = new EmbeddingProvider({
      apiKey,
      model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    });

    vectorStore = new VectorStore({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collection: process.env.QDRANT_COLLECTION || 'sujit-ai',
    });

    retrievalPipeline = new RetrievalPipeline({
      embeddings: embeddingProvider,
      vectorStore,
    });

    llmProvider = new LLMProvider({
      apiKey,
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
    });
  }
}

/**
 * Vercel Serverless Function handler.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    // Parse body
    const body = await parseBody(req);

    // Validate message
    const { valid, sanitized, error } = validateMessage(body.message);
    if (!valid) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error }));
    }

    // Rate limiting
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      res.statusCode = 429;
      res.setHeader('Retry-After', Math.ceil((rateCheck.resetAt - Date.now()) / 1000));
      return res.end(JSON.stringify({
        error: 'Too many requests. Please wait a moment before trying again.',
        retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000),
      }));
    }

    // Parse conversation history
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const conversationId = body.conversationId || crypto.randomUUID();

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Conversation-Id', conversationId);

    const hasLiveKeys = Boolean(process.env.OPENAI_API_KEY && process.env.QDRANT_URL);

    if (hasLiveKeys) {
      try {
        initProviders();

        // Retrieval
        const retrievalStart = Date.now();
        const retrieval = await retrievalPipeline.retrieve(sanitized);
        const retrievalLatency = Date.now() - retrievalStart;

        // Send sources first
        const sourcesEvent = JSON.stringify({
          type: 'sources',
          sources: retrieval.sources,
          queryCategory: retrieval.queryCategory,
        });
        res.write(`data: ${sourcesEvent}\n\n`);

        // Stream LLM response
        const llmStart = Date.now();
        for await (const delta of llmProvider.generateStream({
          query: sanitized,
          chunks: retrieval.chunks,
          history,
        })) {
          const event = JSON.stringify({ type: 'delta', content: delta });
          res.write(`data: ${event}\n\n`);
        }
        const llmLatency = Date.now() - llmStart;

        // Send done event
        const doneEvent = JSON.stringify({
          type: 'done',
          conversationId,
          meta: {
            retrievalLatencyMs: retrievalLatency,
            llmLatencyMs: llmLatency,
            chunksUsed: retrieval.chunks.length,
            mode: 'cloud-rag',
          },
        });
        res.write(`data: ${doneEvent}\n\n`);
        return res.end();
      } catch (cloudErr) {
        console.warn('[Sujit AI] Cloud RAG unavailable, falling back to local knowledge engine:', cloudErr.message);
        // Fall through to local responder
      }
    }

    // ── Local Knowledge Engine Fallback ──
    const localStart = Date.now();
    const localResult = answerQuery(sanitized);

    // Send sources event
    const sourcesEvent = JSON.stringify({
      type: 'sources',
      sources: localResult.sources,
      queryCategory: localResult.queryCategory,
    });
    res.write(`data: ${sourcesEvent}\n\n`);

    // Stream text chunks
    for await (const chunk of streamAnswer(localResult.content)) {
      const event = JSON.stringify({ type: 'delta', content: chunk });
      res.write(`data: ${event}\n\n`);
    }

    const localLatency = Date.now() - localStart;

    // Send done event
    const doneEvent = JSON.stringify({
      type: 'done',
      conversationId,
      meta: {
        retrievalLatencyMs: 2,
        llmLatencyMs: localLatency,
        mode: 'local-knowledge-engine',
      },
    });
    res.write(`data: ${doneEvent}\n\n`);
    return res.end();
  } catch (err) {
    console.error('[Sujit AI] Chat error:', err.message);

    // Don't expose internal errors
    if (!res.headersSent) {
      res.statusCode = 500;
      return res.end(JSON.stringify({
        error: "I couldn't reach Sujit AI right now. Please try again.",
      }));
    }

    // If streaming already started, send error event
    try {
      const errEvent = JSON.stringify({
        type: 'error',
        error: "I couldn't complete the response. Please try again.",
      });
      res.write(`data: ${errEvent}\n\n`);
    } catch (_) {}

    return res.end();
  }
};

/**
 * Parse request body from stream.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Object>}
 */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Limit body size to 10KB
      if (body.length > 10240) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}
