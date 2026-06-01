import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';

import { POST } from '../route';

// ═══════════════════════════════════════════════════════════════
// POST /api/generate/v6 — hardened route handler tests (Phase 3A)
//
// Prisma is mocked (no DB). The rate limiter is mocked so the route's behaviour
// is tested against controlled allow/block outcomes; the limiter's own logic is
// covered in rate-limit.test.ts. Feature flag + lab mode are driven via env.
// ═══════════════════════════════════════════════════════════════

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('@ares/database', () => ({ prisma: { device: { findUnique } } }));
vi.mock('@/lib/ares-v6/rate-limit', () => ({ checkAresV6RateLimit: vi.fn() }));

const mockedRateLimit = vi.mocked(checkAresV6RateLimit);

interface ErrorBody {
  success: false;
  error: { code: string; message: string; statusCode: number };
  meta: { requestId: string | null };
}

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
  meta: { engine: string; labMode: boolean; requestId: string; rateLimit: { limit: number; remaining: number; resetAt: string }; warnings?: string[] };
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

const FLAG = 'ARES_V6_API_ENABLED';
const LAB_FLAG = 'ARES_V6_LAB_MODE';

function setEnv(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function allowedResult() {
  return {
    allowed: true,
    limit: 20,
    remaining: 19,
    resetAt: new Date('2030-01-01T00:01:00.000Z'),
    scope: 'IP_DEVICE' as const,
    key: 'ares:v6:rl:hash:device',
    ipHash: 'hash',
    degraded: false,
  };
}

function makeRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  return new Request('http://localhost/api/generate/v6', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  }) as unknown as NextRequest;
}

let originalFlag: string | undefined;
let originalLab: string | undefined;

beforeEach(() => {
  originalFlag = process.env[FLAG];
  originalLab = process.env[LAB_FLAG];
  findUnique.mockReset();
  mockedRateLimit.mockReset();
  mockedRateLimit.mockResolvedValue(allowedResult());
  setEnv(FLAG, 'true');
  setEnv(LAB_FLAG, undefined);
});

afterEach(() => {
  setEnv(FLAG, originalFlag);
  setEnv(LAB_FLAG, originalLab);
});

describe('POST /api/generate/v6 — gate & guards', () => {
  it('returns 404 (and skips DB + rate limit) when the feature flag is off', async () => {
    setEnv(FLAG, undefined);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
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
    const res = await POST(makeRequest('{ not json'));
    expect(res.status).toBe(400);
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
  it('returns 429 with Retry-After and does not touch Prisma when blocked', async () => {
    mockedRateLimit.mockResolvedValue({
      allowed: false,
      limit: 20,
      remaining: 0,
      resetAt: new Date('2030-01-01T00:01:00.000Z'),
      retryAfterSeconds: 42,
      scope: 'IP_DEVICE',
      key: 'ares:v6:rl:hash:device',
      ipHash: 'hash',
      degraded: false,
    });
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('42');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe('POST /api/generate/v6 — generation', () => {
  it('returns 404 when the device does not exist', async () => {
    findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
  });

  it('returns 404 for an inactive device (anti-enumeration)', async () => {
    findUnique.mockResolvedValue({ ...MOCK_DEVICE, isActive: false });
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
  });

  it('returns 200 with a complete generation built from the DB screenDpi', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('20');

    const body = (await res.json()) as SuccessBody;
    expect(body.success).toBe(true);
    expect(body.data.device.screenDpi).toBe(395);
    expect(body.data.generation.dpi.detectedPpi).toBe(395);
    // The adapter promotes DB screenDpi into the engine's ppi (Phase 2 golden
    // rule), so a concrete value drove the calc → source is PPI (not a fallback).
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
    expect(body.data.generation.dpi.source).toBe('PPI');
  });

  it('deduplicates symptoms so firstTuningSteps has no duplicates', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const body = {
      ...VALID_BODY,
      player: { ...VALID_BODY.player, symptoms: ['DEVICE_LAGS', 'DEVICE_LAGS', 'AIM_SHAKES'] },
    };
    const res = await POST(makeRequest(JSON.stringify(body)));
    const json = (await res.json()) as SuccessBody;
    expect(json.data.generation.firstTuningSteps).toHaveLength(2);
    const symptoms = json.data.generation.firstTuningSteps.map((step) => step.symptom);
    expect(new Set(symptoms).size).toBe(2);
  });

  it('exposes labMode metadata when ARES_V6_LAB_MODE=true', async () => {
    setEnv(LAB_FLAG, 'true');
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    const body = (await res.json()) as SuccessBody;
    expect(body.meta.labMode).toBe(true);
    expect(body.meta.requestId.length).toBeGreaterThan(0);
    expect(body.meta.rateLimit).toBeTruthy();
    expect(Array.isArray(body.meta.warnings)).toBe(true);
  });

  it('echoes a requestId in error envelopes too', async () => {
    findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    const body = (await res.json()) as ErrorBody;
    expect(body.success).toBe(false);
    expect(body.meta.requestId).not.toBeNull();
  });
});
