import { describe, expect, it } from 'vitest';

import {
  ARES_V6_RATE_LIMIT_PER_IP_DEVICE,
  ARES_V6_RATE_LIMIT_UNKNOWN_IP,
  checkAresV6RateLimit,
  getAresV6RateLimitKey,
  type AresV6RateLimitStore,
} from '../rate-limit';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Rate limiter (Phase 3A). Tests inject an in-memory store with a
// controllable clock; the real path is Redis (never hit here).
// ═══════════════════════════════════════════════════════════════

const DEVICE_ID = 'ckdevicea1b2c3d4e5f6g7h8';
const OTHER_DEVICE_ID = 'ckother9z8y7x6w5v4u3t2s1';
const NOW = 1_000_000;

interface MemoryStore extends AresV6RateLimitStore {
  reset(): void;
}

function createMemoryStore(): MemoryStore {
  const buckets = new Map<string, { count: number; expiresAt: number }>();
  return {
    async hit(key, windowSeconds, now) {
      const existing = buckets.get(key);
      if (!existing || existing.expiresAt <= now) {
        buckets.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
        return { count: 1, ttlSeconds: windowSeconds };
      }
      existing.count += 1;
      return { count: existing.count, ttlSeconds: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)) };
    },
    reset() {
      buckets.clear();
    },
  };
}

function requestWithIp(ip?: string): Request {
  const headers: Record<string, string> = {};
  if (ip) headers['x-forwarded-for'] = ip;
  return new Request('http://localhost/api/generate/v6', { method: 'POST', headers });
}

describe('getAresV6RateLimitKey', () => {
  it('keys by hashed IP + deviceId with the trusted-IP limit', () => {
    const descriptor = getAresV6RateLimitKey(requestWithIp('203.0.113.7'), { deviceId: DEVICE_ID });
    expect(descriptor.scope).toBe('IP_DEVICE');
    expect(descriptor.limit).toBe(ARES_V6_RATE_LIMIT_PER_IP_DEVICE);
    expect(descriptor.key).toContain(DEVICE_ID);
    expect(descriptor.key).not.toContain('203.0.113.7');
    expect(descriptor.ipHash).not.toBe('203.0.113.7');
  });

  it('uses the stricter limit when no trustworthy IP is present', () => {
    const descriptor = getAresV6RateLimitKey(requestWithIp(undefined), { deviceId: DEVICE_ID });
    expect(descriptor.scope).toBe('UNKNOWN_IP');
    expect(descriptor.limit).toBe(ARES_V6_RATE_LIMIT_UNKNOWN_IP);
    expect(descriptor.hasTrustedIp).toBe(false);
  });
});

describe('checkAresV6RateLimit', () => {
  it('allows a request under the limit', async () => {
    const store = createMemoryStore();
    const result = await checkAresV6RateLimit(requestWithIp('203.0.113.7'), { deviceId: DEVICE_ID }, { store, now: NOW });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(ARES_V6_RATE_LIMIT_PER_IP_DEVICE - 1);
    expect(result.degraded).toBe(false);
  });

  it('blocks once the limit is exceeded and reports Retry-After', async () => {
    const store = createMemoryStore();
    const request = requestWithIp('203.0.113.7');
    for (let i = 0; i < ARES_V6_RATE_LIMIT_PER_IP_DEVICE; i += 1) {
      const ok = await checkAresV6RateLimit(request, { deviceId: DEVICE_ID }, { store, now: NOW });
      expect(ok.allowed).toBe(true);
    }
    const blocked = await checkAresV6RateLimit(request, { deviceId: DEVICE_ID }, { store, now: NOW });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('applies the stricter unknown-ip policy', async () => {
    const store = createMemoryStore();
    const request = requestWithIp(undefined);
    for (let i = 0; i < ARES_V6_RATE_LIMIT_UNKNOWN_IP; i += 1) {
      const ok = await checkAresV6RateLimit(request, { deviceId: DEVICE_ID }, { store, now: NOW });
      expect(ok.allowed).toBe(true);
    }
    const blocked = await checkAresV6RateLimit(request, { deviceId: DEVICE_ID }, { store, now: NOW });
    expect(blocked.allowed).toBe(false);
  });

  it('keeps a separate bucket per deviceId on the same IP', async () => {
    const store = createMemoryStore();
    const request = requestWithIp('203.0.113.7');
    for (let i = 0; i < ARES_V6_RATE_LIMIT_PER_IP_DEVICE; i += 1) {
      await checkAresV6RateLimit(request, { deviceId: DEVICE_ID }, { store, now: NOW });
    }
    const exhausted = await checkAresV6RateLimit(request, { deviceId: DEVICE_ID }, { store, now: NOW });
    const otherDevice = await checkAresV6RateLimit(request, { deviceId: OTHER_DEVICE_ID }, { store, now: NOW });
    expect(exhausted.allowed).toBe(false);
    expect(otherDevice.allowed).toBe(true);
  });

  it('supports a reset helper between test runs', async () => {
    const store = createMemoryStore();
    const request = requestWithIp('203.0.113.7');
    for (let i = 0; i < ARES_V6_RATE_LIMIT_PER_IP_DEVICE + 1; i += 1) {
      await checkAresV6RateLimit(request, { deviceId: DEVICE_ID }, { store, now: NOW });
    }
    store.reset();
    const afterReset = await checkAresV6RateLimit(request, { deviceId: DEVICE_ID }, { store, now: NOW });
    expect(afterReset.allowed).toBe(true);
  });

  it('fails open (allowed + degraded) when no store is available', async () => {
    const result = await checkAresV6RateLimit(requestWithIp('203.0.113.7'), { deviceId: DEVICE_ID }, { store: null, now: NOW });
    expect(result.allowed).toBe(true);
    expect(result.degraded).toBe(true);
  });

  it('fails open when the store throws', async () => {
    const throwingStore: AresV6RateLimitStore = {
      hit: () => Promise.reject(new Error('redis down')),
    };
    const result = await checkAresV6RateLimit(
      requestWithIp('203.0.113.7'),
      { deviceId: DEVICE_ID },
      { store: throwingStore, now: NOW },
    );
    expect(result.allowed).toBe(true);
    expect(result.degraded).toBe(true);
  });
});
