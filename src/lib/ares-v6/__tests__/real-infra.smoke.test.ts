import { NotFoundError } from '@ares/errors';
import { NextRequest } from 'next/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { POST as feedbackPost } from '@/app/api/feedback/v6/route';
import { POST } from '@/app/api/generate/v6/route';
import { GET as metricsGet } from '@/app/api/lab/v6/metrics/route';

import { generateAresV6ForDeviceId } from '../generate-service';
import { runAresV6LabCleanup } from '../lab-cleanup';
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
    process.env.ARES_V6_INTERNAL_ACCESS_MODE = 'lab';
    process.env.ARES_V6_RATE_LIMIT_IP_DEVICE_LIMIT = '3';
    process.env.ARES_V6_RATE_LIMIT_IP_GLOBAL_LIMIT = '50';
    process.env.ARES_V6_PERSIST_GENERATIONS = 'true';
    process.env.ARES_V6_PERSIST_GENERATIONS_REQUIRED = 'true';
    process.env.ARES_V6_WRITE_FEEDBACK = 'true';
    process.env.ARES_V6_LAB_METRICS_ENABLED = 'true';

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

  describe('Persistence + feedback + metrics + cleanup', () => {
    function feedbackRequest(generationId: string, ip: string): NextRequest {
      return new Request('http://localhost/api/feedback/v6', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
        body: JSON.stringify({ generationId, rating: 5, outcome: 'BETTER' }),
      }) as unknown as NextRequest;
    }

    it('persists a generation, accepts feedback once (409 on duplicate), and metrics see them', async () => {
      const genRes = await POST(makeRequest(activeId, uniqueIp(20)));
      expect(genRes.status).toBe(200);
      const genBody = (await genRes.json()) as { meta: { generationId?: string } };
      const generationId = genBody.meta.generationId;
      expect(generationId).toBeTruthy();

      const fbRes = await feedbackPost(feedbackRequest(generationId as string, uniqueIp(21)));
      expect(fbRes.status).toBe(201);

      const dupRes = await feedbackPost(feedbackRequest(generationId as string, uniqueIp(22)));
      expect(dupRes.status).toBe(409);

      const metricsRes = await metricsGet(
        new NextRequest('http://localhost/api/lab/v6/metrics', {
          method: 'GET',
          headers: { 'x-forwarded-for': uniqueIp(23) },
        }),
      );
      expect(metricsRes.status).toBe(200);
      const metricsBody = (await metricsRes.json()) as {
        data: { totalGenerations: number; totalFeedback: number };
      };
      expect(metricsBody.data.totalGenerations).toBeGreaterThanOrEqual(1);
      expect(metricsBody.data.totalFeedback).toBeGreaterThanOrEqual(1);
    });

    it('cleanup dry-run counts rows without deleting', async () => {
      const result = await runAresV6LabCleanup({ dryRun: true, nowMs: Date.now() });
      expect(result.dryRun).toBe(true);
      expect(result.generations).toBeGreaterThanOrEqual(0);
      expect(result.feedback).toBeGreaterThanOrEqual(0);
    });

    it('requires an internal token when header mode is enforced (real route, no token => 404)', async () => {
      const previous = process.env.ARES_V6_INTERNAL_ACCESS_MODE;
      process.env.ARES_V6_INTERNAL_ACCESS_MODE = 'header';
      try {
        const res = await metricsGet(
          new NextRequest('http://localhost/api/lab/v6/metrics', {
            method: 'GET',
            headers: { 'x-forwarded-for': uniqueIp(30) },
          }),
        );
        expect(res.status).toBe(404);
      } finally {
        process.env.ARES_V6_INTERNAL_ACCESS_MODE = previous;
      }
    });
  });
});
