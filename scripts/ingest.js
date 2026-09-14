/**
 * @fileoverview Knowledge base ingestion script.
 *
 * Usage:
 *   node scripts/ingest.js [--reindex]
 *
 * Reads all markdown files from knowledge/, chunks them semantically,
 * generates embeddings, and upserts to Qdrant vector store.
 *
 * Options:
 *   --reindex   Clear existing collection before ingesting
 *
 * Requires .env file with: OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY
 */

const fs = require('fs');
const path = require('path');

// Load .env from project root
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

const { EmbeddingProvider } = require('../lib/embeddings');
const { VectorStore } = require('../lib/vectorstore');
const { parseDocument, chunkDocument } = require('../lib/chunker');

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge');

/**
 * Recursively find all .md files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function findMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldReindex = args.includes('--reindex');

  console.log('\n🤖 Sujit AI — Knowledge Base Ingestion');
  console.log('═'.repeat(50));

  // Validate environment
  const requiredEnv = ['OPENAI_API_KEY', 'QDRANT_URL', 'QDRANT_API_KEY'];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.error(`❌ Missing environment variable: ${key}`);
      console.error('   Create a .env file from .env.example and fill in your values.');
      process.exit(1);
    }
  }

  // Initialize providers
  const embeddings = new EmbeddingProvider({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  });

  const vectorStore = new VectorStore({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collection: process.env.QDRANT_COLLECTION || 'sujit-ai',
  });

  // Reindex if requested
  if (shouldReindex) {
    console.log('\n🗑️  Clearing existing collection...');
    await vectorStore.deleteAll();
    console.log('   ✅ Collection cleared');
  } else {
    await vectorStore.ensureCollection();
  }

  // Find all knowledge documents
  const files = findMarkdownFiles(KNOWLEDGE_DIR);
  console.log(`\n📁 Found ${files.length} knowledge documents`);

  if (files.length === 0) {
    console.error('❌ No markdown files found in knowledge/ directory');
    process.exit(1);
  }

  // Parse and chunk all documents
  const allChunks = [];
  for (const filePath of files) {
    const relativePath = path.relative(KNOWLEDGE_DIR, filePath);
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { metadata, content } = parseDocument(rawContent, relativePath);

    console.log(`   📄 ${relativePath} → ${metadata.title} [${metadata.category}]`);

    const chunks = chunkDocument(content, metadata);
    allChunks.push(...chunks);
  }

  console.log(`\n✂️  Created ${allChunks.length} chunks from ${files.length} documents`);

  // Generate embeddings in batches
  console.log('\n🧠 Generating embeddings...');
  const chunkTexts = allChunks.map(c => c.content);
  const embeddingVectors = await embeddings.embedBatch(chunkTexts);
  console.log(`   ✅ Generated ${embeddingVectors.length} embeddings (${embeddings.getDimensions()} dimensions)`);

  // Prepare points for upsert
  const points = allChunks.map((chunk, i) => ({
    id: chunk.id,
    vector: embeddingVectors[i],
    payload: {
      content: chunk.content,
      title: chunk.metadata.title,
      category: chunk.metadata.category,
      technologies: chunk.metadata.technologies || [],
      visibility: chunk.metadata.visibility,
      importance: chunk.metadata.importance,
      github: chunk.metadata.github || null,
      url: chunk.metadata.url || null,
      filePath: chunk.metadata.filePath,
      heading: chunk.heading,
      chunkIndex: chunk.chunkIndex,
    },
  }));

  // Upsert to vector store
  console.log('\n📤 Upserting to vector store...');
  await vectorStore.upsert(points);
  console.log(`   ✅ Upserted ${points.length} vectors to Qdrant`);

  // Health check
  const health = await vectorStore.healthCheck();
  console.log(`\n✅ Ingestion complete!`);
  console.log(`   Collection: ${health.collection}`);
  console.log(`   Total points: ${health.pointsCount}`);
  console.log('\n' + '═'.repeat(50));
}

main().catch(err => {
  console.error('\n❌ Ingestion failed:', err.message);
  process.exit(1);
});
