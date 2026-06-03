import { NotFoundError } from '@ares/errors';
import { NextRequest } from 'next/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { POST as feedbackPost } from '@/app/api/feedback/v6/route';
import { POST } from '@/app/api/generate/v6/route';
import { GET as evidenceGet } from '@/app/api/lab/v6/evidence/route';
import { GET as metricsGet } from '@/app/api/lab/v6/metrics/route';

import { generateAresV6CalibrationProposals } from '../calibration-proposals';
import { buildAresV6EvidenceSnapshot } from '../evidence-snapshot';
import { generateAresV6ForDeviceId } from '../generate-service';
import { runAresV6LabCleanup } from '../lab-cleanup';
import { getAresV6LabMetrics } from '../lab-metrics';
import { buildAresV6ComparisonMatrix, summarizeAresV6Comparison } from '../legacy-vs-v6-comparator';
import { checkAresV6RateLimit } from '../rate-limit';
import type { AresV6RateLimitConfig } from '../rate-limit-policy';
import {
  ARES_V6_SMOKE_SCREEN_DPI,
  seedAresV6FixtureKnownDevices,
  seedAresV6SmokeDevices,
  type AresV6FixtureKnownSeedResult,
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
  let fixtureDevices: AresV6FixtureKnownSeedResult[] = [];

  beforeAll(async () => {
    // Self-sufficient: ensure the endpoint + lab proxy mode + low device limit
    // for a fast 429, then seed the smoke + fixture-known devices into the real DB.
    process.env.ARES_V6_API_ENABLED = 'true';
    process.env.ARES_V6_PROXY_TRUST_MODE = 'lab';
    process.env.ARES_V6_INTERNAL_ACCESS_MODE = 'lab';
    process.env.ARES_V6_RATE_LIMIT_IP_DEVICE_LIMIT = '3';
    process.env.ARES_V6_RATE_LIMIT_IP_GLOBAL_LIMIT = '50';
    process.env.ARES_V6_PERSIST_GENERATIONS = 'true';
    process.env.ARES_V6_PERSIST_GENERATIONS_REQUIRED = 'true';
    process.env.ARES_V6_WRITE_FEEDBACK = 'true';
    process.env.ARES_V6_LAB_METRICS_ENABLED = 'true';
    process.env.ARES_V6_LAB_EVIDENCE_ENABLED = 'true';

    const { prisma } = await import('@ares/database');
    const seeded = await seedAresV6SmokeDevices(prisma);
    activeId = seeded.activeId;
    inactiveId = seeded.inactiveId;
    fixtureDevices = await seedAresV6FixtureKnownDevices(prisma);
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

  describe('Evidence tribunal (Fase 3D)', () => {
    function genRequest(ip: string, presetId: string): NextRequest {
      return new Request('http://localhost/api/generate/v6', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
        body: JSON.stringify({
          deviceId: activeId,
          presetId,
          player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
        }),
      }) as unknown as NextRequest;
    }
    function fbRequest(generationId: string, ip: string, body: Record<string, unknown>): NextRequest {
      return new Request('http://localhost/api/feedback/v6', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
        body: JSON.stringify({ generationId, ...body }),
      }) as unknown as NextRequest;
    }
    async function createGeneration(ip: string, presetId: string): Promise<string> {
      const res = await POST(genRequest(ip, presetId));
      expect(res.status).toBe(200);
      const body = (await res.json()) as { meta: { generationId?: string } };
      expect(body.meta.generationId).toBeTruthy();
      return body.meta.generationId as string;
    }

    it('builds an evidence snapshot from real generations + TRUSTED/SUSPICIOUS feedback, with no auto-apply', async () => {
      const g1 = await createGeneration(uniqueIp(40), 'STANDARD_PRO');
      const g2 = await createGeneration(uniqueIp(41), 'TODO_ROJO');

      // TRUSTED feedback.
      const trusted = await feedbackPost(fbRequest(g1, uniqueIp(42), { rating: 5, outcome: 'BETTER' }));
      expect(trusted.status).toBe(201);
      // SUSPICIOUS feedback: WORSE + problemResolved=true → OUTCOME_RESOLVED_CONFLICT.
      const suspicious = await feedbackPost(
        fbRequest(g2, uniqueIp(43), { rating: 2, outcome: 'WORSE', problemResolved: true }),
      );
      expect(suspicious.status).toBe(201);

      // Lab metrics over the real DB exclude SUSPICIOUS from trusted metrics.
      const metrics = await getAresV6LabMetrics({});
      expect(metrics.totalGenerations).toBeGreaterThanOrEqual(2);
      expect(metrics.totalFeedback).toBeGreaterThanOrEqual(1);
      expect(metrics.suspiciousFeedbackExcluded).toBeGreaterThanOrEqual(1);

      // Legacy-vs-v6 comparator runs fixtures-only (pure, no DB) with no false danger.
      const comparison = buildAresV6ComparisonMatrix({ standardOnly: true });
      expect(comparison.length).toBeGreaterThan(0);
      expect(summarizeAresV6Comparison(comparison).dangerous).toBe(0);

      // Evidence snapshot assembled from the real DB + the comparison.
      const snapshot = await buildAresV6EvidenceSnapshot({ comparisonRows: comparison });
      expect(snapshot.metrics.totalGenerations).toBeGreaterThanOrEqual(2);
      expect(snapshot.trustedFeedbackSummary.suspiciousExcluded).toBeGreaterThanOrEqual(1);

      // Proposals NEVER auto-apply; every proposal requires human review.
      const proposals = generateAresV6CalibrationProposals(snapshot);
      expect(proposals.proposals.length).toBeGreaterThan(0);
      for (const proposal of proposals.proposals) {
        expect(proposal.autoApplyAllowed).toBe(false);
        expect(proposal.humanReviewRequired).toBe(true);
      }
    });
  });

  describe('Evidence integrity (Fase 3D.1)', () => {
    function evidenceRequest(query: string, ip: string): NextRequest {
      return new NextRequest(`http://localhost/api/lab/v6/evidence${query}`, {
        method: 'GET',
        headers: { 'x-forwarded-for': ip },
      });
    }
    async function generateFixture(deviceId: string, ip: string): Promise<void> {
      const res = await POST(makeRequest(deviceId, ip));
      expect(res.status).toBe(200);
    }

    it('EVIDENCE coverage > 0 from fixture-known devices; alias mirrors evidence (not comparison)', async () => {
      expect(fixtureDevices.length).toBeGreaterThanOrEqual(2);
      await generateFixture(fixtureDevices[0]!.deviceId, uniqueIp(50));
      await generateFixture(fixtureDevices[1]!.deviceId, uniqueIp(51));

      const comparison = buildAresV6ComparisonMatrix({ standardOnly: true });
      const snapshot = await buildAresV6EvidenceSnapshot({ comparisonRows: comparison });

      expect(snapshot.evidenceCoveredFixtures).toBeGreaterThanOrEqual(2);
      expect(snapshot.evidenceFixtureCoverage).toBeGreaterThan(0);
      expect(snapshot.comparisonCoveredFixtures).toBe(snapshot.totalFixtures); // standardOnly covers all
      expect(snapshot.fixtureCoverage).toBe(snapshot.evidenceFixtureCoverage);
      expect(snapshot.coveredFixtures).toBe(snapshot.evidenceCoveredFixtures);
    });

    it('endpoint filters the comparison by presetId (compareScope=filtered default)', async () => {
      const res = await evidenceGet(evidenceRequest('?includeLegacyCompare=true&presetId=STANDARD_PRO', uniqueIp(52)));
      expect(res.status).toBe(200);
      const body = (await res.json()) as { data: { comparisonSummary: { byPreset: Record<string, unknown> } } };
      expect(Object.keys(body.data.comparisonSummary.byPreset)).toEqual(['STANDARD_PRO']);
    });

    it('endpoint default response excludes legacy/v6 vectors and deltas (summary rows only)', async () => {
      const res = await evidenceGet(evidenceRequest('?includeLegacyCompare=true', uniqueIp(53)));
      expect(res.status).toBe(200);
      const body = (await res.json()) as { data: { highRiskRows?: unknown; highRiskSummaryRows?: unknown[] } };
      expect(body.data.highRiskRows).toBeUndefined();
      expect(Array.isArray(body.data.highRiskSummaryRows)).toBe(true);
      const serialized = JSON.stringify(body.data.highRiskSummaryRows ?? []);
      expect(serialized).not.toContain('"deltas"');
      expect(serialized).not.toContain('"source":"LEGACY"');
    });

    it('endpoint includeRows=true returns full rows capped at 100', async () => {
      const res = await evidenceGet(evidenceRequest('?includeLegacyCompare=true&includeRows=true', uniqueIp(54)));
      expect(res.status).toBe(200);
      const body = (await res.json()) as { data: { highRiskRows?: unknown[] } };
      expect(Array.isArray(body.data.highRiskRows)).toBe(true);
      expect((body.data.highRiskRows ?? []).length).toBeLessThanOrEqual(100);
    });

    it('endpoint rejects an invalid presetId with 400', async () => {
      const res = await evidenceGet(evidenceRequest('?presetId=NOT_A_PRESET', uniqueIp(55)));
      expect(res.status).toBe(400);
    });
  });
});
