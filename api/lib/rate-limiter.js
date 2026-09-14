/**
 * @fileoverview IP-based rate limiter with sliding window.
 * Uses in-memory store — suitable for serverless (resets on cold start, but provides burst protection).
 */

/** @type {Map<string, { count: number, resetAt: number }>} */
const ipBuckets = new Map();

// Clean up stale entries periodically
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

/**
 * Check if a request from the given IP should be rate limited.
 *
 * @param {string} ip - Client IP address
 * @param {Object} [options]
 * @param {number} [options.maxRequests] - Max requests per window
 * @param {number} [options.windowMs] - Window duration in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
function checkRateLimit(ip, options = {}) {
  const {
    maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
    windowMs = 60_000, // 1 minute window
  } = options;

  const now = Date.now();

  // Periodic cleanup of stale buckets
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, bucket] of ipBuckets.entries()) {
      if (bucket.resetAt <= now) ipBuckets.delete(key);
    }
    lastCleanup = now;
  }

  const bucket = ipBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    // New window
    ipBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { allowed: true, remaining: maxRequests - bucket.count, resetAt: bucket.resetAt };
}

/**
 * Validate and sanitize a chat message.
 * @param {string} message
 * @returns {{ valid: boolean, sanitized: string, error: string|null }}
 */
function validateMessage(message) {
  const maxLength = parseInt(process.env.MAX_MESSAGE_LENGTH || '500', 10);

  if (!message || typeof message !== 'string') {
    return { valid: false, sanitized: '', error: 'Message is required' };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'Message cannot be empty' };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, sanitized: '', error: `Message exceeds maximum length of ${maxLength} characters` };
  }

  return { valid: true, sanitized: trimmed, error: null };
}

module.exports = { checkRateLimit, validateMessage };
