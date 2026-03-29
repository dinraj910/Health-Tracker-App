import { redis } from '../config/redis.js';

/**
 * Cache middleware to cache expensive query results (Cache-Aside Pattern)
 * @param {Function} keyFn - Function that takes `req` and returns the cache key
 * @param {Number} ttlSeconds - Time-to-live in seconds
 */
export const cacheMiddleware = (keyFn, ttlSeconds = 300) => async (req, res, next) => {
  try {
    const key = keyFn(req);
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }
    
    // Intercept res.json to cache the actual result
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful API responses with data
      if (body?.success && body?.data) {
        redis.setex(key, ttlSeconds, JSON.stringify(body.data)).catch(err => {
            console.error('Redis cache setex error:', err);
        });
      }
      return originalJson(body);
    };
    next();
  } catch (err) {
    console.error('Cache middleware error:', err);
    next(); // bypass cache gracefully if Redis fails
  }
};

/**
 * Utility to clear specific cache patterns for a user across all day ranges
 * @param {String} userId - User's ID
 * @param {Array<String>} patterns - Array of metric types (e.g., ['vitals', 'wellness', 'dashboard'])
 */
export const clearUserCache = async (userId, patterns) => {
  try {
    const keysToDelete = [];
    
    for (const pattern of patterns) {
      // Matches things like vitals:USER_ID:7 or dashboard:USER_ID
      const keys = await redis.keys(`${pattern}:${userId}*`);
      if (keys.length > 0) {
        keysToDelete.push(...keys);
      }
    }
    
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
    }
  } catch (err) {
    console.error('Cache invalidation error (clearUserCache):', err);
  }
};
