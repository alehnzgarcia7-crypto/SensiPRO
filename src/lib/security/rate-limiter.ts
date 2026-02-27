
import { FREE_SEARCH_LIMIT } from '@ares/config';
import { RateLimitError } from '@ares/errors';
import { logger } from '@ares/logger';
import type { UserTier } from '@prisma/client';
import { createClient, type RedisClientType } from 'redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

// Tier-based limits (per 24 hours)
const TIER_LIMITS: Record<UserTier, number> = {
  FREE: FREE_SEARCH_LIMIT,
  PREMIUM: 9999,
  VIP: 9999,
};

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

let redisClient: RedisClientType | null = null;
let redisConnected = false;

async function getRedis(): Promise<RedisClientType | null> {
  if (redisClient && redisConnected) return redisClient;

  try {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    redisClient = createClient({ url }) as RedisClientType;

    redisClient.on('error', () => {
      redisConnected = false;
    });

    await redisClient.connect();
    redisConnected = true;
    return redisClient;
  } catch {
    logger.warn('Redis unavailable, using in-memory rate limiter');
    redisConnected = false;
    return null;
  }
}

function getMemoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(now + windowMs),
      limit,
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      limit,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: new Date(entry.resetAt),
    limit,
  };
}

export async function checkRateLimit(
  userId: string,
  tier: UserTier,
): Promise<RateLimitResult> {
  const limit = TIER_LIMITS[tier];
  const windowSeconds = 86400; // 24 hours
  const windowMs = windowSeconds * 1000;
  const key = `ares:ratelimit:${userId}`;

  const redis = await getRedis();

  if (!redis) {
    return getMemoryLimit(key, limit, windowMs);
  }

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const resetAt = new Date(Date.now() + ttl * 1000);

    if (current > limit) {
      return { allowed: false, remaining: 0, resetAt, limit };
    }

    return {
      allowed: true,
      remaining: limit - current,
      resetAt,
      limit,
    };
  } catch {
    logger.warn('Redis rate limit check failed, falling back to memory');
    return getMemoryLimit(key, limit, windowMs);
  }
}

export async function enforceRateLimit(
  userId: string,
  tier: UserTier,
): Promise<RateLimitResult> {
  // Bypass rate limit en desarrollo para no bloquear testing local
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, remaining: 9999, resetAt: new Date(Date.now() + 86400000), limit: 9999 };
  }

  const result = await checkRateLimit(userId, tier);

  if (!result.allowed) {
    throw new RateLimitError(
      'SEARCH_LIMIT_EXCEEDED',
      tier === 'FREE'
        ? `Has alcanzado tu límite de ${result.limit} búsquedas diarias. Mejora a Premium para búsquedas ilimitadas.`
        : 'Límite de búsquedas excedido. Intenta de nuevo mañana.',
    );
  }

  return result;
}

// Cleanup stale entries (for in-memory store)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 60000); // every minute
