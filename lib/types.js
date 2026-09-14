/**
 * @fileoverview Type definitions for Sujit AI RAG system.
 * Uses JSDoc for type safety without TypeScript compilation.
 */

/**
 * @typedef {Object} ChatMessage
 * @property {'user'|'assistant'|'system'} role
 * @property {string} content
 * @property {Source[]} [sources]
 * @property {number} [timestamp]
 */

/**
 * @typedef {Object} ChatRequest
 * @property {string} message
 * @property {string} [conversationId]
 * @property {ChatMessage[]} [history]
 */

/**
 * @typedef {Object} ChatResponse
 * @property {string} content
 * @property {Source[]} sources
 * @property {string} conversationId
 * @property {Object} [meta]
 */

/**
 * @typedef {Object} Document
 * @property {string} id
 * @property {string} content
 * @property {DocumentMetadata} metadata
 */

/**
 * @typedef {Object} DocumentMetadata
 * @property {string} title
 * @property {string} category
 * @property {string[]} [technologies]
 * @property {string} [source]
 * @property {'public'|'private'|'internal'} visibility
 * @property {string} [importance]
 * @property {string} [github]
 * @property {string} [url]
 * @property {string} [date]
 * @property {string} filePath
 */

/**
 * @typedef {Object} DocumentChunk
 * @property {string} id
 * @property {string} content
 * @property {DocumentMetadata} metadata
 * @property {number} chunkIndex
 * @property {string} heading
 */

/**
 * @typedef {Object} RetrievedChunk
 * @property {string} id
 * @property {string} content
 * @property {DocumentMetadata} metadata
 * @property {number} score
 * @property {string} heading
 */

/**
 * @typedef {Object} Source
 * @property {string} title
 * @property {string} [category]
 * @property {string} [url]
 * @property {number} [relevance]
 */

/**
 * @typedef {Object} RetrievalResult
 * @property {RetrievedChunk[]} chunks
 * @property {Source[]} sources
 * @property {number} latencyMs
 * @property {string} queryCategory
 */

/**
 * @typedef {'PROFILE'|'PROJECT'|'SKILLS'|'EDUCATION'|'ACHIEVEMENT'|'EXPERIENCE'|'CONTACT'|'GENERAL'} QueryCategory
 */

module.exports = {};
