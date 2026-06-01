import { logger } from '@ares/logger';
import { Redis } from 'ioredis';


let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      logger.warn('REDIS_URL not set, caching disabled');
      return null;
    }
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });
    redis.on('error', (err: Error) => logger.error('Redis error', { error: String(err) }));
  }
  return redis;
}

/**
 * Expose the shared ioredis client for modules that need raw commands
 * (e.g. the ARES v6 rate limiter). Returns null when REDIS_URL is unset so
 * callers can decide their own degraded behaviour. Never opens a new pool.
 */
export function getRedisClient(): Redis | null {
  return getRedis();
}

/**
 * Cache-aside pattern: get from cache, compute if miss, store
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const client = getRedis();
  if (!client) return compute();

  try {
    const hit = await client.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    // Cache read failed, compute directly
  }

  const value = await compute();

  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Cache write failed, non-critical
  }

  return value;
}

/**
 * Invalidate a specific cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    // Non-critical
  }
}

/**
 * Invalidate all keys matching a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Non-critical
  }
}
