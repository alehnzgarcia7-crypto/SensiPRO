import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isAresV6PersistenceRequired,
  persistAresV6Generation,
  shouldPersistAresV6Generations,
} from '@/lib/ares-v6/generation-persistence';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';

import { POST } from '../route';

// ═══════════════════════════════════════════════════════════════
// POST /api/generate/v6 — hardened route (3A + 3B + 3C)
// ═══════════════════════════════════════════════════════════════

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('@ares/database', () => ({ prisma: { device: { findUnique } } }));
vi.mock('@/lib/ares-v6/rate-limit', () => ({ checkAresV6RateLimit: vi.fn() }));
vi.mock('@/lib/ares-v6/generation-persistence', () => ({
  shouldPersistAresV6Generations: vi.fn(() => false),
  isAresV6PersistenceRequired: vi.fn(() => false),
  buildAresV6GenerationRecord: vi.fn(() => ({})),
  persistAresV6Generation: vi.fn(),
}));

const mockedRateLimit = vi.mocked(checkAresV6RateLimit);
const mockedShouldPersist = vi.mocked(shouldPersistAresV6Generations);
const mockedRequired = vi.mocked(isAresV6PersistenceRequired);
const mockedPersist = vi.mocked(persistAresV6Generation);

interface SuccessBody {
  success: true;
  data: { device: { screenDpi: number | null }; generation: { dpi: { detectedPpi: number | null; source: string } } };
  meta: { engine: string; labMode: boolean; requestId: string; generationId?: string; persistence?: { persisted: boolean; degraded?: boolean } };
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
    buckets: [],
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
  mockedShouldPersist.mockReturnValue(false);
  mockedRequired.mockReturnValue(false);
  mockedPersist.mockReset();
  setEnv('ARES_V6_API_ENABLED', 'true');
  setEnv('ARES_V6_LAB_MODE', undefined);
  setEnv('ARES_V6_INTERNAL_ACCESS_MODE', undefined);
});

afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else (process.env as Record<string, string | undefined>)[name] = value;
  }
  snapshot.clear();
});

describe('POST /api/generate/v6 — gates', () => {
  it('returns 404 when the feature flag is off', async () => {
    setEnv('ARES_V6_API_ENABLED', undefined);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('blocks (no DB / no rate) when internal access is required and no token is given', async () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
    expect(findUnique).not.toHaveBeenCalled();
    expect(mockedRateLimit).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown root key', async () => {
    const res = await POST(makeRequest(JSON.stringify({ ...VALID_BODY, hacker: true })));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/generate/v6 — rate limiting', () => {
  it('returns 429 and never touches Prisma when blocked', async () => {
    mockedRateLimit.mockResolvedValue(rateResult({ allowed: false, remaining: 0, retryAfterSeconds: 42 }));
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(429);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns 503 (fail-closed) when the store is unavailable', async () => {
    mockedRateLimit.mockResolvedValue(rateResult({ allowed: false, storeUnavailable: true, retryAfterSeconds: 5 }));
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(503);
    expect(findUnique).not.toHaveBeenCalled();
  });
});

describe('POST /api/generate/v6 — generation + persistence', () => {
  it('returns 200 without persistence when the flag is off', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessBody;
    expect(body.data.generation.dpi.detectedPpi).toBe(395);
    expect(body.meta.generationId).toBeUndefined();
    expect(mockedPersist).not.toHaveBeenCalled();
  });

  it('persists and returns generationId when the flag is on', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    mockedShouldPersist.mockReturnValue(true);
    mockedPersist.mockResolvedValue({ id: 'gen_9' });
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessBody;
    expect(body.meta.generationId).toBe('gen_9');
    expect(body.meta.persistence?.persisted).toBe(true);
  });

  it('returns 503 when persistence fails and is required', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    mockedShouldPersist.mockReturnValue(true);
    mockedRequired.mockReturnValue(true);
    mockedPersist.mockRejectedValue(new Error('db down'));
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(503);
  });

  it('returns 200 + degraded meta when persistence fails and is not required', async () => {
    findUnique.mockResolvedValue(MOCK_DEVICE);
    mockedShouldPersist.mockReturnValue(true);
    mockedRequired.mockReturnValue(false);
    mockedPersist.mockRejectedValue(new Error('db down'));
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(200);
    const body = (await res.json()) as SuccessBody;
    expect(body.meta.persistence?.degraded).toBe(true);
  });

  it('returns 404 for an inactive device', async () => {
    findUnique.mockResolvedValue({ ...MOCK_DEVICE, isActive: false });
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
  });
});
