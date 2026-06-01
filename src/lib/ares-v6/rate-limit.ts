import { logger } from '@ares/logger';

import { getRedisClient } from '@/lib/cache/redis';

import { extractClientIp, hashAresV6Ip } from './observability';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Abuse guard / rate limiter
//
// The existing src/lib/security/rate-limiter.ts is keyed by userId+tier over a
// 24h window — useless for this anonymous lab endpoint. This limiter keys by
// (hashed IP + deviceId) over a 60s window.
//
// PRODUCTION STORE = Redis (reusing the shared ioredis client from
// src/lib/cache/redis.ts — no third connection). If Redis is unavailable the
// limiter FAILS OPEN with a warning: the in-process path is not a real
// multi-instance guard, so we never pretend a Map protects production.
// Tests inject a deterministic in-memory store via `options.store`.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_RATE_WINDOW_SECONDS = 60;
/** Per (IP + deviceId) budget when a trustworthy client IP is present. */
export const ARES_V6_RATE_LIMIT_PER_IP_DEVICE = 20;
/** Stricter budget when no trustworthy IP can be determined. */
export const ARES_V6_RATE_LIMIT_UNKNOWN_IP = 8;

const KEY_PREFIX = 'ares:v6:rl';

/** Minimal counter store. Returns the post-increment count and the key's TTL. */
export interface AresV6RateLimitStore {
  hit(key: string, windowSeconds: number, now: number): Promise<{ count: number; ttlSeconds: number }>;
}

/** Only the field the limiter reads from a validated body. */
export interface AresV6RateLimitBody {
  deviceId?: string;
}

export interface AresV6RateLimitDescriptor {
  key: string;
  scope: 'IP_DEVICE' | 'UNKNOWN_IP';
  limit: number;
  windowSeconds: number;
  ipHash: string;
  hasTrustedIp: boolean;
  deviceId: string | null;
}

export interface AresV6RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds?: number;
  scope: AresV6RateLimitDescriptor['scope'];
  /** Redis key — contains the hashed IP, never the raw address. Safe to log. */
  key: string;
  ipHash: string;
  /** True when the limiter failed open (store unavailable/errored). */
  degraded: boolean;
}

export interface AresV6RateLimitOptions {
  /** Inject a store (tests). `null` forces the fail-open path deterministically. */
  store?: AresV6RateLimitStore | null;
  now?: number;
}

/**
 * Compute the rate-limit bucket for a request. The key embeds the hashed IP and
 * the deviceId, so different devices from the same IP get independent buckets,
 * and a missing/untrusted IP gets a stricter shared budget.
 */
export function getAresV6RateLimitKey(
  request: Request,
  parsedBody?: AresV6RateLimitBody,
): AresV6RateLimitDescriptor {
  const ip = extractClientIp(request);
  const hasTrustedIp = ip !== null;
  const ipHash = ip ? hashAresV6Ip(ip) : 'unknown';
  const deviceId = parsedBody?.deviceId ?? null;
  const limit = hasTrustedIp ? ARES_V6_RATE_LIMIT_PER_IP_DEVICE : ARES_V6_RATE_LIMIT_UNKNOWN_IP;
  const scope: AresV6RateLimitDescriptor['scope'] = hasTrustedIp ? 'IP_DEVICE' : 'UNKNOWN_IP';

  return {
    key: `${KEY_PREFIX}:${ipHash}:${deviceId ?? '_'}`,
    scope,
    limit,
    windowSeconds: ARES_V6_RATE_WINDOW_SECONDS,
    ipHash,
    hasTrustedIp,
    deviceId,
  };
}

/** Redis-backed store reusing the shared ioredis client. INCR + EXPIRE + TTL. */
function redisStore(): AresV6RateLimitStore | null {
  const client = getRedisClient();
  if (!client) return null;

  return {
    async hit(key, windowSeconds) {
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, windowSeconds);
      }
      let ttlSeconds = await client.ttl(key);
      if (ttlSeconds < 0) {
        // Key exists without a TTL (e.g. expire raced/failed): re-arm the window.
        await client.expire(key, windowSeconds);
        ttlSeconds = windowSeconds;
      }
      return { count, ttlSeconds };
    },
  };
}

function failOpen(descriptor: AresV6RateLimitDescriptor, now: number): AresV6RateLimitResult {
  return {
    allowed: true,
    limit: descriptor.limit,
    remaining: descriptor.limit,
    resetAt: new Date(now + descriptor.windowSeconds * 1000),
    scope: descriptor.scope,
    key: descriptor.key,
    ipHash: descriptor.ipHash,
    degraded: true,
  };
}

/**
 * Check (and consume) the rate limit for a request. Never throws: on a missing
 * or failing store it fails open (lab posture) and flags `degraded`.
 */
export async function checkAresV6RateLimit(
  request: Request,
  parsedBody?: AresV6RateLimitBody,
  options?: AresV6RateLimitOptions,
): Promise<AresV6RateLimitResult> {
  const now = options?.now ?? Date.now();
  const descriptor = getAresV6RateLimitKey(request, parsedBody);
  const store = options && 'store' in options ? options.store : redisStore();

  if (!store) {
    logger.warn('ares_v6.rate_limit_store_unavailable', {
      scope: descriptor.scope,
      ipHash: descriptor.ipHash,
    });
    return failOpen(descriptor, now);
  }

  try {
    const { count, ttlSeconds } = await store.hit(descriptor.key, descriptor.windowSeconds, now);
    const allowed = count <= descriptor.limit;
    return {
      allowed,
      limit: descriptor.limit,
      remaining: Math.max(0, descriptor.limit - count),
      resetAt: new Date(now + ttlSeconds * 1000),
      ...(allowed ? {} : { retryAfterSeconds: Math.max(1, ttlSeconds) }),
      scope: descriptor.scope,
      key: descriptor.key,
      ipHash: descriptor.ipHash,
      degraded: false,
    };
  } catch (error) {
    logger.warn('ares_v6.rate_limit_check_failed', {
      scope: descriptor.scope,
      error: String(error),
    });
    return failOpen(descriptor, now);
  }
}
