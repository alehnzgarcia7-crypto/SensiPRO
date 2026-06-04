import type { Redis } from 'ioredis';

import { getRedisClient } from '@/lib/cache/redis';

import type { AresV6RateLimitStore } from './rate-limit';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Atomic Redis rate-limit store
//
// INCR + conditional EXPIRE + TTL must be a single atomic operation so a key
// can never be left without a TTL (which would leak a permanent counter and
// permanently throttle a client). We run it as one Lua script via EVAL,
// reusing the shared ioredis client (no extra connection).
// ═══════════════════════════════════════════════════════════════

const HIT_LUA = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("TTL", KEYS[1])
if ttl < 0 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { current, ttl }
`;

/** Parse the Lua `{ count, ttl }` reply into typed numbers; throws on a bad shape. */
export function parseLuaHitResult(raw: unknown): { count: number; ttlSeconds: number } {
  if (!Array.isArray(raw) || raw.length < 2) {
    throw new Error('ares_v6 rate limit: unexpected Redis EVAL result shape');
  }
  const count = Number(raw[0]);
  const ttlSeconds = Number(raw[1]);
  if (!Number.isFinite(count) || !Number.isFinite(ttlSeconds)) {
    throw new Error('ares_v6 rate limit: non-numeric Redis EVAL result');
  }
  return { count, ttlSeconds };
}

export function createRedisRateLimitStore(client: Redis): AresV6RateLimitStore {
  return {
    async hit(key, windowSeconds) {
      const raw: unknown = await client.eval(HIT_LUA, 1, key, String(windowSeconds));
      return parseLuaHitResult(raw);
    },
  };
}

/** Default store backed by the shared ioredis client. Null when REDIS_URL is unset. */
export function getDefaultRedisRateLimitStore(): AresV6RateLimitStore | null {
  const client = getRedisClient();
  if (!client) return null;
  return createRedisRateLimitStore(client);
}
