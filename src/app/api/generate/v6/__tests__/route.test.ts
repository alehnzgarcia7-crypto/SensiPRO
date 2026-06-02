import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';

import { POST } from '../route';

// ═══════════════════════════════════════════════════════════════
// POST /api/generate/v6 — hardened route handler tests (Phase 3A + 3B)
//
// Prisma is mocked (no DB). The rate limiter is mocked so the route is tested
// against controlled allow/block/store-unavailable outcomes; the limiter logic
// is covered in rate-limit.test.ts and the real-infra smoke. Flags via env.
// ═══════════════════════════════════════════════════════════════

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('@ares/database', () => ({ prisma: { device: { findUnique } } }));
vi.mock('@/lib/ares-v6/rate-limit', () => ({ checkAresV6RateLimit: vi.fn() }));

const mockedRateLimit = vi.mocked(checkAresV6RateLimit);

interface SuccessBody {
  success: true;
  data: {
    device: { id: string; brand: string; model: string; slug: string; screenDpi: number | null };
    generation: {
      algorithmVersion: string;
      dpi: { detectedPpi: number | null; source: string };
      sensitivity: Record<string, number>;
      confidence: { grade: string };
      firstTuningSteps: { symptom: string }[];
    };
  };
  meta: { engine: string; labMode: boolean; requestId: string; rateLimit: { limit: number; remaining: number }; warnings?: string[] };
}

const DEVICE_ID = 'ckdevicea1b2c3d4e5f6g7h8';

const MOCK_DEVICE = {
  id: DEVICE_ID,
  brand: 'Redmi',
  model: 'Note 13',
  slug: 'redmi-note-13',
  screenSize: 6.67,
  ramGb: 6,
  screenHz: 120,
  panelType: 'AMOLED',
  tier: 'MID',
  screenDpi: 395,
  chipset: 'Snapdragon 685',
  releaseYear: 2024,
  isActive: true,
};

const VALID_BODY = {
  deviceId: DEVICE_ID,
  presetId: 'STANDARD_PRO',
  player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
};

type RateResult = Awaited<ReturnType<typeof checkAresV6RateLimit>>;

function rateResult(overrides: Partial<RateResult> = {}): RateResult {
  return {
    allowed: true,
    limit: 20,
    remaining: 19,
    resetAt: new Date('2030-01-01T00:01:00.000Z'),
    buckets: [{ scope: 'IP_GLOBAL', key: 'ares:v6:rl:ip:deadbeefdeadbeef', limit: 60, count: 1, remaining: 59, allowed: true, resetAt: new Date('2030-01-01T00:01:00.000Z'), retryAfterSeconds: 60 }],
    scopesApplied: ['IP_GLOBAL', 'IP_DEVICE'],
    degraded: false,
    storeUnavailable: false,
    ipHash: 'deadbeefdeadbeef',
    proxyIpSource: 'FORWARDED_FOR',
    proxyTrusted: true,
    ...overrides,
  };
}

const snapshot = new Map<string, string | undefined>();
function setEnv(name: string, value: string | undefined): void {
  if (!snapshot.has(name)) snapshot.set(name, process.env[name]);
  if (value === undefined) delete process.env[name];
  else (process.env as Record<string, string | undefined>)[name] = value;
}

function makeRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  return new Request('http://localhost/api/generate/v6', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7', ...headers },
    body,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  findUnique.mockReset();
  mockedRateLimit.mockReset();
  mockedRateLimit.mockResolvedValue(rateResult());
  setEnv('ARES_V6_API_ENABLED', 'true');
  setEnv('ARES_V6_LAB_MODE', undefined);
});

afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else (process.env as Record<string, string | undefined>)[name] = value;
  }
  snapshot.clear();
});

describe('POST /api/generate/v6 — gate & guards', () => {
  it('returns 404 (skips DB + rate limit) when the feature flag is off', async () => {
    setEnv('ARES_V6_API_ENABLED', undefined);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
    expect(findUnique).not.toHaveBeenCalled();
    expect(mockedRateLimit).not.toHaveBeenCalled();
  });

  it('returns 503 (config error) in production + API enabled with a missing salt', async () => {
    setEnv('NODE_ENV', 'production');
    setEnv('ARES_V6_LOG_SALT', undefined);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(503);
    expect(findUnique).not.toHaveBeenCalled();
    expect(mockedRateLimit).not.toHaveBeenCalled();
  });

  it('returns 413 when Content-Length exceeds the limit', async () => {
    const big = JSON.stringify({ filler: 'a'.repeat(21_000) });
    const res = await POST(makeRequest(big, { 'content-length': String(Buffer.byteLength(big)) }));
    expect(res.status).toBe(413);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    expect((await POST(makeRequest('{ not json'))).status).toBe(400);
  });

  it('returns 400 for an unknown root key (strict schema)', async () => {
    const res = await POST(makeRequest(JSON.stringify({ ...VALID_BODY, hackerField: true })));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid request body', async () => {
    const res = await POST(makeRequest(JSON.stringify({ deviceId: DEVICE_ID, presetId: 'STANDARD_PRO', player: {} })));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/generate/v6 — rate limiting', () => {
  it('returns 429 (IP_GLOBAL) with Retry-After and never touches Prisma when blocked', async () => {
    mockedRateLimit.mockResolvedValue(
      rateResult({ allowed: false, remaining: 0, retryAfterSeconds: 42, scopesApplied: ['IP_GLOBAL'] }),
    );
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('42');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns 503 (fail-closed) when the store is unavailable and never touches Prisma', async () => {
    mockedRateLimit.mockResolvedValue(
      rateResult({ allowed: false, storeUnavailable: true, retryAfterSeconds: 5, limit: 0, remaining: 0 }),
    );
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('5');
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('continues (200) when the store is unavailable but fail-open/degraded', async () => {
    mockedRateLimit.mockResolvedValue(rateResult({ degraded: true, storeUnavailable: true }));
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(200);
  });

  it('never leaks the redis key or ipHash in a 429 response', async () => {
    mockedRateLimit.mockResolvedValue(
      rateResult({ allowed: false, remaining: 0, retryAfterSeconds: 9 }),
    );
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    const text = await res.text();
    expect(text).not.toContain('deadbeefdeadbeef');
    expect(text).not.toContain('ares:v6:rl');
  });
});

describe('POST /api/generate/v6 — generation', () => {
  it('returns 404 when the device does not exist', async () => {
    findUnique.mockResolvedValue(null);
    expect((await POST(makeRequest(JSON.stringify(VALID_BODY)))).status).toBe(404);
  });

  it('returns 404 for an inactive device (anti-enumeration)', async () => {
    findUnique.mockResolvedValue({ ...MOCK_DEVICE, isActive: false });
    expect((await POST(makeRequest(JSON.stringify(VALID_BODY)))).status).toBe(404);
  });

  it('returns 200 with a complete generation built from the DB screenDpi', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('20');

    const body = (await res.json()) as SuccessBody;
    expect(body.data.device.screenDpi).toBe(395);
    expect(body.data.generation.dpi.detectedPpi).toBe(395);
    expect(body.data.generation.dpi.source).toBe('PPI');
    expect(body.meta.engine).toBe('ARES-v6-refoundation');
    expect(body.meta.labMode).toBe(false);
    expect(body.meta.requestId.length).toBeGreaterThan(0);
    expect(body.meta.rateLimit.limit).toBe(20);
  });

  it('lets an override ppi win over the DB screenDpi', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify({ ...VALID_BODY, overrides: { ppi: 460 } })));
    const body = (await res.json()) as SuccessBody;
    expect(body.data.generation.dpi.detectedPpi).toBe(460);
  });

  it('deduplicates symptoms so firstTuningSteps has no duplicates', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const body = { ...VALID_BODY, player: { ...VALID_BODY.player, symptoms: ['DEVICE_LAGS', 'DEVICE_LAGS', 'AIM_SHAKES'] } };
    const res = await POST(makeRequest(JSON.stringify(body)));
    const json = (await res.json()) as SuccessBody;
    expect(json.data.generation.firstTuningSteps).toHaveLength(2);
  });

  it('exposes labMode metadata when ARES_V6_LAB_MODE=true', async () => {
    setEnv('ARES_V6_LAB_MODE', 'true');
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    const body = (await res.json()) as SuccessBody;
    expect(body.meta.labMode).toBe(true);
    expect(Array.isArray(body.meta.warnings)).toBe(true);
  });
});
