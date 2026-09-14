/**
 * @fileoverview Semantic document chunker for markdown documents.
 * Splits by headings, preserves context, and attaches metadata.
 */

const matter = require('gray-matter');
const crypto = require('crypto');

/**
 * Parse a markdown document with YAML frontmatter.
 * @param {string} rawContent
 * @param {string} filePath
 * @returns {{ metadata: Object, content: string }}
 */
function parseDocument(rawContent, filePath) {
  const { data, content } = matter(rawContent);
  return {
    metadata: {
      title: data.title || 'Untitled',
      category: data.category || 'general',
      technologies: data.technologies || [],
      visibility: data.visibility || 'public',
      importance: data.importance || 'medium',
      source: data.source || 'knowledge-base',
      github: data.github || null,
      url: data.url || null,
      date: data.date || null,
      filePath,
    },
    content: content.trim(),
  };
}

/**
 * Chunk a document semantically by markdown headings.
 * Preserves heading context and avoids splitting mid-section.
 *
 * @param {string} content - Markdown content (without frontmatter)
 * @param {Object} metadata - Document metadata
 * @param {Object} [options]
 * @param {number} [options.maxChunkSize] - Max characters per chunk
 * @param {number} [options.minChunkSize] - Min characters (avoid tiny chunks)
 * @param {number} [options.overlapSize] - Overlap between chunks
 * @returns {import('./types').DocumentChunk[]}
 */
function chunkDocument(content, metadata, options = {}) {
  const {
    maxChunkSize = 1200,
    minChunkSize = 100,
    overlapSize = 100,
  } = options;

  // Split by headings (##, ###, etc.) while keeping heading text
  const sections = splitByHeadings(content);
  const chunks = [];

  for (const section of sections) {
    const sectionText = section.content.trim();
    if (sectionText.length < minChunkSize && chunks.length > 0) {
      // Merge tiny sections with the previous chunk
      const last = chunks[chunks.length - 1];
      last.content += '\n\n' + (section.heading ? `${section.heading}\n` : '') + sectionText;
      continue;
    }

    if (sectionText.length <= maxChunkSize) {
      // Section fits in one chunk
      const chunkContent = section.heading
        ? `${section.heading}\n${sectionText}`
        : sectionText;

      chunks.push({
        id: generateChunkId(metadata.filePath, chunks.length),
        content: chunkContent,
        metadata: { ...metadata },
        chunkIndex: chunks.length,
        heading: section.heading || metadata.title,
      });
    } else {
      // Large section — split by paragraphs with overlap
      const paragraphs = sectionText.split(/\n\n+/);
      let currentChunk = section.heading ? section.heading + '\n' : '';

      for (const para of paragraphs) {
        if ((currentChunk + '\n\n' + para).length > maxChunkSize && currentChunk.length > minChunkSize) {
          chunks.push({
            id: generateChunkId(metadata.filePath, chunks.length),
            content: currentChunk.trim(),
            metadata: { ...metadata },
            chunkIndex: chunks.length,
            heading: section.heading || metadata.title,
          });

          // Start new chunk with overlap from end of previous
          const overlapText = currentChunk.slice(-overlapSize);
          currentChunk = overlapText + '\n\n' + para;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + para;
        }
      }

      // Flush remaining
      if (currentChunk.trim().length >= minChunkSize) {
        chunks.push({
          id: generateChunkId(metadata.filePath, chunks.length),
          content: currentChunk.trim(),
          metadata: { ...metadata },
          chunkIndex: chunks.length,
          heading: section.heading || metadata.title,
        });
      } else if (chunks.length > 0) {
        chunks[chunks.length - 1].content += '\n\n' + currentChunk.trim();
      }
    }
  }

  return chunks;
}

/**
 * Split markdown content by heading boundaries.
 * @param {string} content
 * @returns {Array<{heading: string, content: string}>}
 */
function splitByHeadings(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentHeading = '';
  let currentContent = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      // Save previous section
      if (currentContent.length > 0 || currentHeading) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join('\n'),
        });
      }
      currentHeading = line;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Push final section
  if (currentContent.length > 0 || currentHeading) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join('\n'),
    });
  }

  return sections;
}

/**
 * Generate a deterministic chunk ID from file path and index.
 * @param {string} filePath
 * @param {number} index
 * @returns {string}
 */
function generateChunkId(filePath, index) {
  const hash = crypto
    .createHash('md5')
    .update(`${filePath}::${index}`)
    .digest('hex')
    .slice(0, 12);
  return `chunk_${hash}`;
}

module.exports = { parseDocument, chunkDocument, generateChunkId };
