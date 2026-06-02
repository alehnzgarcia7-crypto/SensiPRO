import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAresV6LabMetrics } from '@/lib/ares-v6/lab-metrics';

import { GET } from '../route';

// ═══════════════════════════════════════════════════════════════
// GET /api/lab/v6/metrics — internal lab metrics (Fase 3C)
// ═══════════════════════════════════════════════════════════════

vi.mock('@/lib/ares-v6/lab-metrics', () => ({ getAresV6LabMetrics: vi.fn() }));
const mockedMetrics = vi.mocked(getAresV6LabMetrics);

const SAMPLE = { totalGenerations: 5, totalFeedback: 2 } as unknown as Awaited<ReturnType<typeof getAresV6LabMetrics>>;

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

describe('GET /api/lab/v6/metrics', () => {
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

  it('returns 200 with metrics for a valid request', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { totalGenerations: number } };
    expect(body.data.totalGenerations).toBe(5);
  });

  it('returns 400 for an invalid query', async () => {
    const res = await GET(makeRequest('?since=not-a-date'));
    expect(res.status).toBe(400);
    expect(mockedMetrics).not.toHaveBeenCalled();
  });
});
