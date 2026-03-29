import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Create a Redis client
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('[Redis] Connection failed. Caching will be disabled.');
      return null; // Stop retrying
    }
    return Math.min(times * 200, 1000);
  }
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  // Suppress verbose ECONNREFUSED logs by default to keep the console clean
  if (err.code !== 'ECONNREFUSED') {
    console.error('Redis connection error:', err);
  }
});
