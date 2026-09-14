/**
 * @fileoverview RAG pipeline tests — validates retrieval, grounding, and security.
 *
 * Usage:
 *   node tests/test-rag.js
 *
 * Requires .env with API keys and an ingested knowledge base.
 * Tests are non-destructive (read-only operations against the vector store).
 */

const fs = require('fs');
const path = require('path');

// Load .env
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

const { classifyQuery } = require('../lib/query-router');
const { parseDocument, chunkDocument } = require('../lib/chunker');
const { validateMessage } = require('../lib/rate-limiter');

let passed = 0;
let failed = 0;
let skipped = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ ${testName}`);
    failed++;
  }
}

function skip(testName, reason) {
  console.log(`  ⏭️  ${testName} — ${reason}`);
  skipped++;
}

// ═══════════════════════════════════════════
// Test Suite 1: Query Router
// ═══════════════════════════════════════════
function testQueryRouter() {
  console.log('\n📋 Query Router Tests');
  console.log('─'.repeat(40));

  const tests = [
    { query: 'Who is Sujit?', expected: 'PROFILE' },
    { query: 'Tell me about BullLens', expected: 'PROJECT' },
    { query: 'What are Sujit\'s skills?', expected: 'SKILLS' },
    { query: 'Where does Sujit study?', expected: 'EDUCATION' },
    { query: 'Where has Sujit worked?', expected: 'EXPERIENCE' },
    { query: 'What certifications does Sujit have?', expected: 'ACHIEVEMENT' },
    { query: 'How can I contact Sujit?', expected: 'CONTACT' },
    { query: 'What AI projects has Sujit built?', expected: 'PROJECT' },
    { query: 'Tell me about Finn-Track-Pro', expected: 'PROJECT' },
    { query: 'What is Sujit\'s development philosophy?', expected: 'PROFILE' },
  ];

  for (const { query, expected } of tests) {
    const result = classifyQuery(query);
    assert(result.category === expected, `"${query}" → ${expected} (got: ${result.category})`);
  }
}

// ═══════════════════════════════════════════
// Test Suite 2: Document Chunker
// ═══════════════════════════════════════════
function testChunker() {
  console.log('\n📋 Document Chunker Tests');
  console.log('─'.repeat(40));

  const testDoc = `---
title: Test Document
category: project
technologies:
  - Python
  - FastAPI
visibility: public
---

# Test Project

This is a test project description.

## Features

- Feature one
- Feature two
- Feature three

## Architecture

The system uses a microservices architecture with FastAPI backend.

## Technologies

Python, FastAPI, PostgreSQL, Docker
`;

  const { metadata, content } = parseDocument(testDoc, 'test/test.md');
  assert(metadata.title === 'Test Document', 'Parses frontmatter title');
  assert(metadata.category === 'project', 'Parses frontmatter category');
  assert(metadata.technologies.includes('Python'), 'Parses frontmatter technologies');
  assert(metadata.visibility === 'public', 'Parses visibility');
  assert(!content.includes('---'), 'Removes frontmatter from content');

  const chunks = chunkDocument(content, metadata);
  assert(chunks.length > 0, `Creates chunks (got ${chunks.length})`);
  assert(chunks[0].metadata.title === 'Test Document', 'Chunks inherit metadata');
  assert(chunks.every(c => c.id.startsWith('chunk_')), 'Chunks have valid IDs');
  assert(chunks.every(c => c.content.length > 0), 'All chunks have content');
}

// ═══════════════════════════════════════════
// Test Suite 3: Input Validation
// ═══════════════════════════════════════════
function testValidation() {
  console.log('\n📋 Input Validation Tests');
  console.log('─'.repeat(40));

  assert(validateMessage('').valid === false, 'Rejects empty string');
  assert(validateMessage(null).valid === false, 'Rejects null');
  assert(validateMessage(undefined).valid === false, 'Rejects undefined');
  assert(validateMessage('   ').valid === false, 'Rejects whitespace-only');
  assert(validateMessage('Hello').valid === true, 'Accepts valid message');
  assert(validateMessage('a'.repeat(501)).valid === false, 'Rejects over-length message');
  assert(validateMessage('a'.repeat(500)).valid === true, 'Accepts max-length message');
}

// ═══════════════════════════════════════════
// Test Suite 4: Knowledge Base Integrity
// ═══════════════════════════════════════════
function testKnowledgeBase() {
  console.log('\n📋 Knowledge Base Integrity Tests');
  console.log('─'.repeat(40));

  const knowledgeDir = path.join(__dirname, '..', 'knowledge');
  assert(fs.existsSync(knowledgeDir), 'Knowledge directory exists');

  const categories = ['about', 'education', 'skills', 'projects', 'experience', 'achievements', 'resume', 'faq'];
  for (const cat of categories) {
    const catPath = path.join(knowledgeDir, cat);
    assert(fs.existsSync(catPath), `Category directory exists: ${cat}`);
  }

  // Check that all documents have valid frontmatter
  function findMarkdownFiles(dir) {
    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...findMarkdownFiles(fullPath));
      else if (entry.name.endsWith('.md')) files.push(fullPath);
    }
    return files;
  }

  const files = findMarkdownFiles(knowledgeDir);
  assert(files.length >= 15, `Has sufficient knowledge documents (got ${files.length})`);

  let allValid = true;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const { metadata } = parseDocument(content, file);
    if (!metadata.title || !metadata.category || !metadata.visibility) {
      console.log(`    ⚠️ Missing metadata in: ${path.relative(knowledgeDir, file)}`);
      allValid = false;
    }
    if (metadata.visibility !== 'public') {
      console.log(`    ⚠️ Non-public document: ${path.relative(knowledgeDir, file)}`);
      allValid = false;
    }
  }
  assert(allValid, 'All documents have valid frontmatter');
}

// ═══════════════════════════════════════════
// Test Suite 5: Security Checks
// ═══════════════════════════════════════════
function testSecurity() {
  console.log('\n📋 Security Tests');
  console.log('─'.repeat(40));

  // Check .env.example exists but .env doesn't (or is gitignored)
  const envExample = path.join(__dirname, '..', '.env.example');
  assert(fs.existsSync(envExample), '.env.example exists');

  const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf-8');
  assert(gitignore.includes('.env'), '.env is in .gitignore');
  assert(gitignore.includes('node_modules'), 'node_modules is in .gitignore');

  // Check no API keys in source code
  const sourceFiles = [
    'api/chat.js', 'api/health.js',
    'lib/embeddings.js', 'lib/llm.js', 'lib/vectorstore.js',
    'sujit-ai.js', 'script.js',
  ];

  let noLeakedSecrets = true;
  for (const file of sourceFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('sk-') || content.includes('api_key=')) {
        console.log(`    ⚠️ Possible API key leak in: ${file}`);
        noLeakedSecrets = false;
      }
    }
  }
  assert(noLeakedSecrets, 'No API keys in source files');
}

// ═══════════════════════════════════════════
// Run All Tests
// ═══════════════════════════════════════════
console.log('\n🤖 Sujit AI — Test Suite');
console.log('═'.repeat(50));

testQueryRouter();
testChunker();
testValidation();
testKnowledgeBase();
testSecurity();

console.log('\n' + '═'.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
console.log(`   Total: ${passed + failed + skipped} tests\n`);

if (failed > 0) {
  process.exit(1);
}
