import type { Redis } from 'ioredis';
import { describe, expect, it } from 'vitest';

import type { AresV6ClientIpResult } from '../proxy-trust';
import {
  checkAresV6RateLimit,
  planAresV6RateLimitBuckets,
  type AresV6RateLimitStore,
} from '../rate-limit';
import type { AresV6RateLimitConfig } from '../rate-limit-policy';
import { createRedisRateLimitStore, parseLuaHitResult } from '../redis-rate-limit-store';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Dual-bucket rate limiter (Phase 3B). Tests inject an in-memory
// store; the real path is atomic Redis Lua (covered by real-infra smoke).
// ═══════════════════════════════════════════════════════════════

const REQ = new Request('http://localhost/api/generate/v6', { method: 'POST' });
const NOW = 1_000_000;

interface MemoryStore extends AresV6RateLimitStore {
  reset(): void;
}

function memoryStore(): MemoryStore {
  const counts = new Map<string, number>();
  return {
    async hit(key, windowSeconds) {
      const count = (counts.get(key) ?? 0) + 1;
      counts.set(key, count);
      return { count, ttlSeconds: windowSeconds };
    },
    reset() {
      counts.clear();
    },
  };
}

const BASE_CONFIG: AresV6RateLimitConfig = {
  windowSeconds: 60,
  ipGlobalLimit: 60,
  ipDeviceLimit: 20,
  unknownGlobalLimit: 12,
  unknownDeviceLimit: 8,
  failMode: 'open',
};

function cfg(overrides: Partial<AresV6RateLimitConfig> = {}): AresV6RateLimitConfig {
  return { ...BASE_CONFIG, ...overrides };
}

function trusted(ip = '203.0.113.7'): AresV6ClientIpResult {
  return { ip, source: 'FORWARDED_FOR', trusted: true };
}

function untrusted(): AresV6ClientIpResult {
  return { ip: null, source: 'NONE', trusted: false };
}

describe('planAresV6RateLimitBuckets', () => {
  it('uses IP buckets for a trusted IP and hashes the address', () => {
    const { buckets, ipHash } = planAresV6RateLimitBuckets(trusted('203.0.113.7'), 'devA', BASE_CONFIG);
    expect(buckets.map((b) => b.scope)).toEqual(['IP_GLOBAL', 'IP_DEVICE']);
    expect(ipHash).not.toBe('203.0.113.7');
    expect(buckets.every((b) => !b.key.includes('203.0.113.7'))).toBe(true);
  });

  it('drops IP_DEVICE when there is no deviceId', () => {
    const { buckets } = planAresV6RateLimitBuckets(trusted(), null, BASE_CONFIG);
    expect(buckets.map((b) => b.scope)).toEqual(['IP_GLOBAL']);
  });

  it('uses UNKNOWN buckets for an untrusted client', () => {
    const { buckets } = planAresV6RateLimitBuckets(untrusted(), 'devA', BASE_CONFIG);
    expect(buckets.map((b) => b.scope)).toEqual(['UNKNOWN_GLOBAL', 'UNKNOWN_DEVICE']);
  });
});

describe('checkAresV6RateLimit — dual bucket', () => {
  it('blocks via IP_GLOBAL even when the deviceId keeps rotating', async () => {
    const store = memoryStore();
    const config = cfg({ ipGlobalLimit: 3, ipDeviceLimit: 100 });
    const clientIp = trusted('203.0.113.10');
    for (let i = 0; i < 3; i += 1) {
      const ok = await checkAresV6RateLimit(REQ, { deviceId: `dev-${i}` }, { store, clientIp, config, now: NOW });
      expect(ok.allowed).toBe(true);
    }
    const blocked = await checkAresV6RateLimit(REQ, { deviceId: 'dev-rotated' }, { store, clientIp, config, now: NOW });
    expect(blocked.allowed).toBe(false);
    expect(blocked.scopesApplied).toContain('IP_GLOBAL');
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('blocks via IP_DEVICE for the same device', async () => {
    const store = memoryStore();
    const config = cfg({ ipGlobalLimit: 100, ipDeviceLimit: 2 });
    const clientIp = trusted('203.0.113.11');
    expect((await checkAresV6RateLimit(REQ, { deviceId: 'd' }, { store, clientIp, config, now: NOW })).allowed).toBe(true);
    expect((await checkAresV6RateLimit(REQ, { deviceId: 'd' }, { store, clientIp, config, now: NOW })).allowed).toBe(true);
    expect((await checkAresV6RateLimit(REQ, { deviceId: 'd' }, { store, clientIp, config, now: NOW })).allowed).toBe(false);
  });

  it('blocks via UNKNOWN_GLOBAL across rotating deviceIds for untrusted clients', async () => {
    const store = memoryStore();
    const config = cfg({ unknownGlobalLimit: 3, unknownDeviceLimit: 100 });
    const clientIp = untrusted();
    for (let i = 0; i < 3; i += 1) {
      const ok = await checkAresV6RateLimit(REQ, { deviceId: `dev-${i}` }, { store, clientIp, config, now: NOW });
      expect(ok.allowed).toBe(true);
    }
    const blocked = await checkAresV6RateLimit(REQ, { deviceId: 'dev-x' }, { store, clientIp, config, now: NOW });
    expect(blocked.allowed).toBe(false);
    expect(blocked.scopesApplied).toContain('UNKNOWN_GLOBAL');
  });

  it('reports remaining as the minimum across buckets', async () => {
    const store = memoryStore();
    const config = cfg({ ipGlobalLimit: 10, ipDeviceLimit: 3 });
    const result = await checkAresV6RateLimit(REQ, { deviceId: 'd' }, { store, clientIp: trusted('203.0.113.12'), config, now: NOW });
    expect(result.remaining).toBe(2); // IP_DEVICE 3-1 = 2 is scarcer than IP_GLOBAL 10-1
  });

  it('fails open (allowed + degraded) when no store and failMode=open', async () => {
    const result = await checkAresV6RateLimit(REQ, { deviceId: 'd' }, { store: null, clientIp: trusted(), config: cfg({ failMode: 'open' }), now: NOW });
    expect(result.allowed).toBe(true);
    expect(result.degraded).toBe(true);
    expect(result.storeUnavailable).toBe(true);
  });

  it('fails closed (blocked) when no store and failMode=closed', async () => {
    const result = await checkAresV6RateLimit(REQ, { deviceId: 'd' }, { store: null, clientIp: trusted(), config: cfg({ failMode: 'closed' }), now: NOW });
    expect(result.allowed).toBe(false);
    expect(result.storeUnavailable).toBe(true);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('fails per policy when the store throws', async () => {
    const throwing: AresV6RateLimitStore = { hit: () => Promise.reject(new Error('redis down')) };
    const open = await checkAresV6RateLimit(REQ, { deviceId: 'd' }, { store: throwing, clientIp: trusted(), config: cfg({ failMode: 'open' }), now: NOW });
    expect(open.allowed).toBe(true);
    expect(open.degraded).toBe(true);
    const closed = await checkAresV6RateLimit(REQ, { deviceId: 'd' }, { store: throwing, clientIp: trusted(), config: cfg({ failMode: 'closed' }), now: NOW });
    expect(closed.allowed).toBe(false);
    expect(closed.storeUnavailable).toBe(true);
  });
});

describe('atomic Redis store', () => {
  it('parses the Lua [count, ttl] reply', () => {
    expect(parseLuaHitResult([5, 42])).toEqual({ count: 5, ttlSeconds: 42 });
  });

  it('throws on a malformed reply', () => {
    expect(() => parseLuaHitResult('nope')).toThrow();
    expect(() => parseLuaHitResult([Number.NaN, 1])).toThrow();
  });

  it('runs EVAL and returns the typed count/ttl', async () => {
    const fakeClient = { eval: () => Promise.resolve([3, 55]) } as unknown as Redis;
    const store = createRedisRateLimitStore(fakeClient);
    await expect(store.hit('ares:v6:rl:ip:hash', 60)).resolves.toEqual({ count: 3, ttlSeconds: 55 });
  });
});
