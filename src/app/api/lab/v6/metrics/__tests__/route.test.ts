import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAresV6LabMetrics } from '@/lib/ares-v6/lab-metrics';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';

import { GET } from '../route';

// ═══════════════════════════════════════════════════════════════
// GET /api/lab/v6/metrics — internal lab metrics (Fase 3C + 3C.1)
// ═══════════════════════════════════════════════════════════════

vi.mock('@/lib/ares-v6/lab-metrics', () => ({ getAresV6LabMetrics: vi.fn() }));
vi.mock('@/lib/ares-v6/rate-limit', () => ({ checkAresV6RateLimit: vi.fn() }));

const mockedMetrics = vi.mocked(getAresV6LabMetrics);
const mockedRateLimit = vi.mocked(checkAresV6RateLimit);

const SAMPLE = { totalGenerations: 5, totalFeedback: 2 } as unknown as Awaited<ReturnType<typeof getAresV6LabMetrics>>;

type RateResult = Awaited<ReturnType<typeof checkAresV6RateLimit>>;
function rateResult(overrides: Partial<RateResult> = {}): RateResult {
  return {
    allowed: true,
    limit: 60,
    remaining: 59,
    resetAt: new Date('2030-01-01T00:01:00.000Z'),
    buckets: [],
    scopesApplied: ['IP_GLOBAL'],
    degraded: false,
    storeUnavailable: false,
    ipHash: 'hash',
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

function makeRequest(query = ''): NextRequest {
  return new NextRequest(`http://localhost/api/lab/v6/metrics${query}`, {
    method: 'GET',
    headers: { 'x-forwarded-for': '203.0.113.7' },
  });
}

beforeEach(() => {
  mockedMetrics.mockReset();
  mockedMetrics.mockResolvedValue(SAMPLE);
  mockedRateLimit.mockReset();
  mockedRateLimit.mockResolvedValue(rateResult());
  setEnv('ARES_V6_LAB_METRICS_ENABLED', 'true');
  setEnv('ARES_V6_INTERNAL_ACCESS_MODE', undefined);
});

afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else (process.env as Record<string, string | undefined>)[name] = value;
  }
  snapshot.clear();
});

describe('GET /api/lab/v6/metrics — gates', () => {
  it('returns 404 when the metrics flag is off', async () => {
    setEnv('ARES_V6_LAB_METRICS_ENABLED', undefined);
    const res = await GET(makeRequest());
    expect(res.status).toBe(404);
    expect(mockedMetrics).not.toHaveBeenCalled();
  });

  it('blocks when internal access is required and no token is given', async () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    const res = await GET(makeRequest());
    expect(res.status).toBe(404);
    expect(mockedMetrics).not.toHaveBeenCalled();
  });
});

describe('GET /api/lab/v6/metrics — rate limit', () => {
  it('returns 429 and never queries the DB when rate limited', async () => {
    mockedRateLimit.mockResolvedValue(rateResult({ allowed: false, remaining: 0, retryAfterSeconds: 9 }));
    const res = await GET(makeRequest());
    expect(res.status).toBe(429);
    expect(mockedMetrics).not.toHaveBeenCalled();
  });

  it('returns 503 (fail-closed) and never queries the DB when the store is unavailable', async () => {
    mockedRateLimit.mockResolvedValue(rateResult({ allowed: false, storeUnavailable: true, retryAfterSeconds: 5 }));
    const res = await GET(makeRequest());
    expect(res.status).toBe(503);
    expect(mockedMetrics).not.toHaveBeenCalled();
  });
});

describe('GET /api/lab/v6/metrics — window & query', () => {
  it('applies a default 7d window when since is absent', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const arg = mockedMetrics.mock.calls[0]?.[0];
    expect(arg?.since).toBeInstanceOf(Date);
    expect(arg?.until).toBeInstanceOf(Date);
    const spanMs = (arg?.until as Date).getTime() - (arg?.since as Date).getTime();
    expect(Math.round(spanMs / (24 * 60 * 60 * 1000))).toBe(7);
  });

  it('rejects a range larger than 90 days', async () => {
    const res = await GET(makeRequest('?since=2020-01-01T00:00:00.000Z&until=2026-01-01T00:00:00.000Z'));
    expect(res.status).toBe(400);
    expect(mockedMetrics).not.toHaveBeenCalled();
  });

  it('rejects until before since', async () => {
    const res = await GET(makeRequest('?since=2026-06-01T00:00:00.000Z&until=2026-01-01T00:00:00.000Z'));
    expect(res.status).toBe(400);
    expect(mockedMetrics).not.toHaveBeenCalled();
  });

  it('rejects an unknown query key', async () => {
    const res = await GET(makeRequest('?hacker=1'));
    expect(res.status).toBe(400);
    expect(mockedMetrics).not.toHaveBeenCalled();
  });

  it('returns 200 with metrics for a valid request', async () => {
    const res = await GET(makeRequest());
    const body = (await res.json()) as { data: { totalGenerations: number } };
    expect(body.data.totalGenerations).toBe(5);
  });
});
