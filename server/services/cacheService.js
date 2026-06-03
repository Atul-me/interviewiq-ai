const logger = require('../utils/logger');

// Local in-memory cache store mimicking Redis operations
const memoryCache = new Map();
const expiryTrackers = new Map();

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null if miss/expired
 */
const get = async (key) => {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  // Check expiration
  if (cached.expiresAt && Date.now() > cached.expiresAt) {
    logger.debug(`Cache key expired: ${key}`);
    del(key);
    return null;
  }

  logger.debug(`Cache HIT: ${key}`);
  return JSON.parse(cached.value);
};

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} [ttlSeconds=300] - Time to live in seconds
 * @returns {Promise<boolean>}
 */
const set = async (key, value, ttlSeconds = 300) => {
  try {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    memoryCache.set(key, {
      value: JSON.stringify(value),
      expiresAt,
    });

    // Clear previous timeout if any
    if (expiryTrackers.has(key)) {
      clearTimeout(expiryTrackers.get(key));
    }

    // Schedule automatic deletion to free up heap space
    if (ttlSeconds) {
      const timeout = setTimeout(() => {
        del(key);
      }, ttlSeconds * 1000);
      
      // Unref the timer so it doesn't block node process exit
      if (timeout.unref) timeout.unref();
      expiryTrackers.set(key, timeout);
    }

    logger.debug(`Cache SET: ${key} (ttl: ${ttlSeconds}s)`);
    return true;
  } catch (err) {
    logger.error(`Error setting cache for key ${key}:`, err);
    return false;
  }
};

/**
 * Delete a key from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
const del = async (key) => {
  memoryCache.delete(key);
  if (expiryTrackers.has(key)) {
    clearTimeout(expiryTrackers.get(key));
    expiryTrackers.delete(key);
  }
  logger.debug(`Cache DEL: ${key}`);
  return true;
};

/**
 * Flush all cache keys matching a pattern (e.g. "dashboard:user-123*")
 * @param {string} pattern - Search pattern
 * @returns {Promise<number>} Number of keys deleted
 */
const flushPattern = async (pattern) => {
  let count = 0;
  // Convert standard redis pattern (e.g., "dashboard:user-123*") to Regex
  const regexString = '^' + pattern.replace(/\*/g, '.*') + '$';
  const regex = new RegExp(regexString);

  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      await del(key);
      count++;
    }
  }
  logger.info(`Flushed ${count} cache keys matching pattern: ${pattern}`);
  return count;
};

module.exports = {
  get,
  set,
  del,
  flushPattern,
};
