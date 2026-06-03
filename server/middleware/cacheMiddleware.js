const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

/**
 * Cache middleware generator
 * @param {string} prefix - Key prefix (e.g. 'dashboard')
 * @param {number} [ttlSeconds=300] - Expiration duration in seconds
 */
const cacheResponse = (prefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Resolve key unique to user context
    const userId = req.user ? req.user._id.toString() : 'guest';
    const cacheKey = `${prefix}:${userId}:${req.originalUrl}`;

    try {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.debug(`Serving from cache for key: ${cacheKey}`);
        // Return cached payload directly
        return res.status(200).json({
          success: true,
          message: 'Retrieved from cache',
          data: cachedData,
          _cached: true, // Tag to inform developers/frontend of cache hit status
        });
      }

      // Intercept res.send to save database queries dynamically on miss
      const originalSend = res.send;
      res.send = function (body) {
        // Restore original send method
        res.send = originalSend;

        // Only cache successful JSON payloads
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedBody = JSON.parse(body);
            // Save payload content (excluding wrapper fields if necessary)
            if (parsedBody && parsedBody.success && parsedBody.data) {
              cacheService.set(cacheKey, parsedBody.data, ttlSeconds);
            }
          } catch (e) {
            // Body was not JSON, ignore cache save
            logger.debug(`Response body for key ${cacheKey} is not JSON. Skipping cache write.`);
          }
        }

        return originalSend.call(this, body);
      };

      next();
    } catch (err) {
      logger.error(`Error in cache middleware for key ${cacheKey}:`, err);
      next(); // Fail gracefully and proceed to database if cache service fails
    }
  };
};

module.exports = {
  cacheResponse,
};
