import { logger } from '@ares/logger';

import { hashAresV6Ip } from './observability';
import { getTrustedClientIp, type AresV6ClientIpResult } from './proxy-trust';
import { getAresV6RateLimitConfig, type AresV6RateLimitConfig } from './rate-limit-policy';
import { getDefaultRedisRateLimitStore } from './redis-rate-limit-store';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Dual-bucket abuse guard
//
// Phase 3A keyed only by IP+deviceId, so an attacker could rotate deviceId to
// get a fresh budget per request. Phase 3B evaluates MULTIPLE buckets and
// blocks if ANY is exceeded:
//   trusted IP   → IP_GLOBAL (per IP, all devices) + IP_DEVICE (per IP+device)
//   untrusted IP → UNKNOWN_GLOBAL (all untrusted) + UNKNOWN_DEVICE (per device)
// The per-IP/global buckets close the deviceId-rotation bypass.
//
// The store is Redis (atomic Lua, shared ioredis). On store failure the result
// honours the configured fail mode (open = degraded-allow; closed = block 503).
// Keys embed the HASHED IP, never the raw address.
// ═══════════════════════════════════════════════════════════════

export type AresV6RateLimitScope = 'IP_GLOBAL' | 'IP_DEVICE' | 'UNKNOWN_GLOBAL' | 'UNKNOWN_DEVICE';

/** Atomic counter store. Returns the post-increment count and the key TTL. */
export interface AresV6RateLimitStore {
  hit(key: string, windowSeconds: number): Promise<{ count: number; ttlSeconds: number }>;
}

/** The only field the limiter reads from a validated body. */
export interface AresV6RateLimitBody {
  deviceId?: string;
}

export interface AresV6RateLimitBucketResult {
  scope: AresV6RateLimitScope;
  /** Key contains the hashed IP, never the raw address. Safe to log. */
  key: string;
  limit: number;
  count: number;
  remaining: number;
  allowed: boolean;
  resetAt: Date;
  retryAfterSeconds: number;
}

export interface AresV6RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds?: number;
  buckets: readonly AresV6RateLimitBucketResult[];
  scopesApplied: readonly AresV6RateLimitScope[];
  degraded: boolean;
  storeUnavailable: boolean;
  ipHash: string;
  proxyIpSource: AresV6ClientIpResult['source'];
  proxyTrusted: boolean;
}

export interface AresV6RateLimitOptions {
  /** Inject a store (tests). `null` forces the store-unavailable path. */
  store?: AresV6RateLimitStore | null;
  now?: number;
  clientIp?: AresV6ClientIpResult;
  config?: AresV6RateLimitConfig;
}

const KEY_PREFIX = 'ares:v6:rl';
const STORE_UNAVAILABLE_RETRY_SECONDS = 5;

interface PlannedBucket {
  scope: AresV6RateLimitScope;
  key: string;
  limit: number;
}

/** Decide which buckets apply for a client + device, and the hashed IP. */
export function planAresV6RateLimitBuckets(
  clientIp: AresV6ClientIpResult,
  deviceId: string | null,
  config: AresV6RateLimitConfig,
): { ipHash: string; buckets: PlannedBucket[] } {
  const hasTrustedIp = clientIp.trusted && clientIp.ip !== null;
  const ipHash = hasTrustedIp && clientIp.ip ? hashAresV6Ip(clientIp.ip) : 'unknown';
  const buckets: PlannedBucket[] = [];

  if (hasTrustedIp) {
    buckets.push({ scope: 'IP_GLOBAL', key: `${KEY_PREFIX}:ip:${ipHash}`, limit: config.ipGlobalLimit });
    if (deviceId) {
      buckets.push({
        scope: 'IP_DEVICE',
        key: `${KEY_PREFIX}:ip-device:${ipHash}:${deviceId}`,
        limit: config.ipDeviceLimit,
      });
    }
  } else {
    buckets.push({ scope: 'UNKNOWN_GLOBAL', key: `${KEY_PREFIX}:unknown`, limit: config.unknownGlobalLimit });
    if (deviceId) {
      buckets.push({
        scope: 'UNKNOWN_DEVICE',
        key: `${KEY_PREFIX}:unknown-device:${deviceId}`,
        limit: config.unknownDeviceLimit,
      });
    }
  }

  return { ipHash, buckets };
}

function storeUnavailableResult(
  config: AresV6RateLimitConfig,
  clientIp: AresV6ClientIpResult,
  ipHash: string,
  scopesApplied: readonly AresV6RateLimitScope[],
  now: number,
): AresV6RateLimitResult {
  const allowed = config.failMode === 'open';
  return {
    allowed,
    limit: 0,
    remaining: 0,
    resetAt: new Date(now + STORE_UNAVAILABLE_RETRY_SECONDS * 1000),
    ...(allowed ? {} : { retryAfterSeconds: STORE_UNAVAILABLE_RETRY_SECONDS }),
    buckets: [],
    scopesApplied,
    degraded: allowed, // fail-open is a degraded allow
    storeUnavailable: true,
    ipHash,
    proxyIpSource: clientIp.source,
    proxyTrusted: clientIp.trusted,
  };
}

/**
 * Evaluate every applicable bucket and combine. allowed = all buckets allowed;
 * remaining = min across buckets; the binding (most restrictive) bucket drives
 * the headers. Never throws: store failures map to the fail-mode policy.
 */
export async function checkAresV6RateLimit(
  request: Request,
  parsedBody?: AresV6RateLimitBody,
  options?: AresV6RateLimitOptions,
): Promise<AresV6RateLimitResult> {
  const now = options?.now ?? Date.now();
  const config = options?.config ?? getAresV6RateLimitConfig();
  const clientIp = options?.clientIp ?? getTrustedClientIp(request);
  const deviceId = parsedBody?.deviceId ?? null;
  const { ipHash, buckets: planned } = planAresV6RateLimitBuckets(clientIp, deviceId, config);
  const scopesApplied = planned.map((bucket) => bucket.scope);

  const store = options && 'store' in options ? options.store : getDefaultRedisRateLimitStore();

  if (!store) {
    logger.warn('ares_v6.rate_limit_store_unavailable', { failMode: config.failMode, scopes: scopesApplied });
    return storeUnavailableResult(config, clientIp, ipHash, scopesApplied, now);
  }

  let buckets: AresV6RateLimitBucketResult[];
  try {
    buckets = await Promise.all(
      planned.map(async (bucket): Promise<AresV6RateLimitBucketResult> => {
        const { count, ttlSeconds } = await store.hit(bucket.key, config.windowSeconds);
        return {
          scope: bucket.scope,
          key: bucket.key,
          limit: bucket.limit,
          count,
          remaining: Math.max(0, bucket.limit - count),
          allowed: count <= bucket.limit,
          resetAt: new Date(now + ttlSeconds * 1000),
          retryAfterSeconds: Math.max(1, ttlSeconds),
        };
      }),
    );
  } catch (error) {
    logger.warn('ares_v6.rate_limit_check_failed', { failMode: config.failMode, error: String(error) });
    return storeUnavailableResult(config, clientIp, ipHash, scopesApplied, now);
  }

  const allowed = buckets.every((bucket) => bucket.allowed);
  const blocking = buckets.filter((bucket) => !bucket.allowed);
  const remaining = buckets.reduce((min, bucket) => Math.min(min, bucket.remaining), Number.POSITIVE_INFINITY);

  // Binding bucket: the blocking one with the longest retry, else the scarcest.
  const binding =
    blocking.length > 0
      ? blocking.reduce((a, b) => (b.retryAfterSeconds > a.retryAfterSeconds ? b : a))
      : buckets.reduce((a, b) => (b.remaining < a.remaining ? b : a));

  const resetAt =
    blocking.length > 0
      ? new Date(Math.max(...blocking.map((bucket) => bucket.resetAt.getTime())))
      : binding.resetAt;

  return {
    allowed,
    limit: binding.limit,
    remaining: Number.isFinite(remaining) ? remaining : 0,
    resetAt,
    ...(allowed ? {} : { retryAfterSeconds: Math.max(...blocking.map((bucket) => bucket.retryAfterSeconds), 1) }),
    buckets,
    scopesApplied,
    degraded: false,
    storeUnavailable: false,
    ipHash,
    proxyIpSource: clientIp.source,
    proxyTrusted: clientIp.trusted,
  };
}
