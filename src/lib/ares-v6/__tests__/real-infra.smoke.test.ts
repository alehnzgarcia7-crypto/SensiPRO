import { NotFoundError } from '@ares/errors';
import type { NextRequest } from 'next/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/generate/v6/route';

import { generateAresV6ForDeviceId } from '../generate-service';
import { checkAresV6RateLimit } from '../rate-limit';
import type { AresV6RateLimitConfig } from '../rate-limit-policy';
import {
  ARES_V6_SMOKE_SCREEN_DPI,
  seedAresV6SmokeDevices,
} from '../testing/seed-real-infra';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — REAL INFRA SMOKE (Redis + Postgres). NOT a unit test.
//
// Runs ONLY when ARES_V6_REAL_INFRA_SMOKE === 'true' (set by the dedicated CI
// job with service containers, or locally against a throwaway smoke DB + Redis).
// It exercises the real atomic Redis limiter and the real Prisma path — no mocks.
// ═══════════════════════════════════════════════════════════════

const SMOKE = process.env.ARES_V6_REAL_INFRA_SMOKE === 'true';

// Unique per run so re-runs within the 60s window never collide on Redis keys.
const RUN = Date.now();
function uniqueIp(seed: number): string {
  const v = (RUN + seed * 7919) >>> 0;
  return `10.${(v >> 16) & 255}.${(v >> 8) & 255}.${(v & 255) || 1}`;
}

function smokeConfig(overrides: Partial<AresV6RateLimitConfig> = {}): AresV6RateLimitConfig {
  return {
    windowSeconds: 60,
    ipGlobalLimit: 60,
    ipDeviceLimit: 20,
    unknownGlobalLimit: 12,
    unknownDeviceLimit: 8,
    failMode: 'closed',
    ...overrides,
  };
}

function makeRequest(deviceId: string, ip: string): NextRequest {
  return new Request('http://localhost/api/generate/v6', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify({
      deviceId,
      presetId: 'STANDARD_PRO',
      player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
    }),
  }) as unknown as NextRequest;
}

describe.skipIf(!SMOKE)('ARES v6 — real infra smoke (Redis + Postgres)', () => {
  let activeId = '';
  let inactiveId = '';

  beforeAll(async () => {
    // Self-sufficient: ensure the endpoint + lab proxy mode + low device limit
    // for a fast 429, then seed the two smoke devices into the real DB.
    process.env.ARES_V6_API_ENABLED = 'true';
    process.env.ARES_V6_PROXY_TRUST_MODE = 'lab';
    process.env.ARES_V6_RATE_LIMIT_IP_DEVICE_LIMIT = '3';
    process.env.ARES_V6_RATE_LIMIT_IP_GLOBAL_LIMIT = '50';

    const { prisma } = await import('@ares/database');
    const seeded = await seedAresV6SmokeDevices(prisma);
    activeId = seeded.activeId;
    inactiveId = seeded.inactiveId;
  });

  afterAll(async () => {
    const { prisma } = await import('@ares/database');
    await prisma.$disconnect();
  });

  describe('Redis (atomic limiter)', () => {
    it('increments a real counter with a positive TTL', async () => {
      const clientIp = { ip: uniqueIp(1), source: 'FORWARDED_FOR' as const, trusted: true };
      const result = await checkAresV6RateLimit(makeRequest(activeId, clientIp.ip), { deviceId: activeId }, {
        clientIp,
        config: smokeConfig({ ipGlobalLimit: 100, ipDeviceLimit: 100 }),
      });
      expect(result.allowed).toBe(true);
      expect(result.storeUnavailable).toBe(false);
      const ipGlobal = result.buckets.find((b) => b.scope === 'IP_GLOBAL');
      expect(ipGlobal?.count).toBe(1);
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('blocks via IP_DEVICE after the configured limit', async () => {
      const clientIp = { ip: uniqueIp(2), source: 'FORWARDED_FOR' as const, trusted: true };
      const config = smokeConfig({ ipGlobalLimit: 100, ipDeviceLimit: 3 });
      for (let i = 0; i < 3; i += 1) {
        const ok = await checkAresV6RateLimit(makeRequest(activeId, clientIp.ip), { deviceId: activeId }, { clientIp, config });
        expect(ok.allowed).toBe(true);
      }
      const blocked = await checkAresV6RateLimit(makeRequest(activeId, clientIp.ip), { deviceId: activeId }, { clientIp, config });
      expect(blocked.allowed).toBe(false);
    });

    it('blocks via IP_GLOBAL even as the deviceId rotates', async () => {
      const clientIp = { ip: uniqueIp(3), source: 'FORWARDED_FOR' as const, trusted: true };
      const config = smokeConfig({ ipGlobalLimit: 3, ipDeviceLimit: 100 });
      for (let i = 0; i < 3; i += 1) {
        const ok = await checkAresV6RateLimit(makeRequest(activeId, clientIp.ip), { deviceId: `rot-${i}` }, { clientIp, config });
        expect(ok.allowed).toBe(true);
      }
      const blocked = await checkAresV6RateLimit(makeRequest(activeId, clientIp.ip), { deviceId: 'rot-final' }, { clientIp, config });
      expect(blocked.allowed).toBe(false);
      expect(blocked.scopesApplied).toContain('IP_GLOBAL');
    });
  });

  describe('Postgres (real Prisma path)', () => {
    it('generates for an active device and preserves screenDpi → detectedPpi', async () => {
      const result = await generateAresV6ForDeviceId({
        deviceId: activeId,
        presetId: 'STANDARD_PRO',
        player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
      });
      expect(result.generation.dpi.detectedPpi).toBe(ARES_V6_SMOKE_SCREEN_DPI);
      expect(result.timings.dbDurationMs).toBeGreaterThanOrEqual(0);
    });

    it('denies an inactive device as NotFound', async () => {
      await expect(
        generateAresV6ForDeviceId({
          deviceId: inactiveId,
          presetId: 'STANDARD_PRO',
          player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws NotFound for an unknown device id', async () => {
      await expect(
        generateAresV6ForDeviceId({
          deviceId: 'cknonexistent000000000000',
          presetId: 'STANDARD_PRO',
          player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Route (end-to-end, real stores)', () => {
    it('returns 200 for an active device', async () => {
      const res = await POST(makeRequest(activeId, uniqueIp(10)));
      expect(res.status).toBe(200);
    });

    it('returns 404 for an inactive device', async () => {
      const res = await POST(makeRequest(inactiveId, uniqueIp(11)));
      expect(res.status).toBe(404);
    });

    it('returns 429 once the real per-device limit is exceeded', async () => {
      const ip = uniqueIp(12);
      const statuses: number[] = [];
      for (let i = 0; i < 5; i += 1) {
        const res = await POST(makeRequest(activeId, ip));
        statuses.push(res.status);
      }
      expect(statuses).toContain(200);
      expect(statuses).toContain(429);
    });
  });
});
