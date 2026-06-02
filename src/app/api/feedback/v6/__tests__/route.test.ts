import { ConflictError, NotFoundError } from '@ares/errors';
import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { submitAresV6Feedback } from '@/lib/ares-v6/feedback-service';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';

import { POST } from '../route';

// ═══════════════════════════════════════════════════════════════
// POST /api/feedback/v6 — internal feedback v0 (Fase 3C)
// ═══════════════════════════════════════════════════════════════

vi.mock('@/lib/ares-v6/rate-limit', () => ({ checkAresV6RateLimit: vi.fn() }));
vi.mock('@/lib/ares-v6/feedback-service', () => ({ submitAresV6Feedback: vi.fn() }));

const mockedRateLimit = vi.mocked(checkAresV6RateLimit);
const mockedSubmit = vi.mocked(submitAresV6Feedback);

const GEN_ID = 'ckgenerationa1b2c3d4e5f6';
const VALID_BODY = { generationId: GEN_ID, rating: 4, outcome: 'BETTER' };

type RateResult = Awaited<ReturnType<typeof checkAresV6RateLimit>>;
function rateResult(overrides: Partial<RateResult> = {}): RateResult {
  return {
    allowed: true,
    limit: 20,
    remaining: 19,
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

function makeRequest(body: string): NextRequest {
  return new Request('http://localhost/api/feedback/v6', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.7' },
    body,
  }) as unknown as NextRequest;
}

beforeEach(() => {
  mockedRateLimit.mockReset();
  mockedRateLimit.mockResolvedValue(rateResult());
  mockedSubmit.mockReset();
  mockedSubmit.mockResolvedValue({ id: 'fb-1', qualityFlag: 'TRUSTED', qualityReasons: [] });
  setEnv('ARES_V6_WRITE_FEEDBACK', 'true');
  setEnv('ARES_V6_INTERNAL_ACCESS_MODE', undefined);
});

afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else (process.env as Record<string, string | undefined>)[name] = value;
  }
  snapshot.clear();
});

describe('POST /api/feedback/v6', () => {
  it('returns 404 when the feedback flag is off', async () => {
    setEnv('ARES_V6_WRITE_FEEDBACK', undefined);
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it('blocks when internal access is required and no token is given', async () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid rating', async () => {
    const res = await POST(makeRequest(JSON.stringify({ ...VALID_BODY, rating: 9 })));
    expect(res.status).toBe(400);
  });

  it('returns 400 for a PII comment', async () => {
    const res = await POST(makeRequest(JSON.stringify({ ...VALID_BODY, comment: 'escribeme a a@b.com' })));
    expect(res.status).toBe(400);
  });

  it('returns 429 (no service call) when rate limited', async () => {
    mockedRateLimit.mockResolvedValue(rateResult({ allowed: false, remaining: 0, retryAfterSeconds: 7 }));
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(429);
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it('creates feedback (201) for a valid request', async () => {
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(201);
    const body = (await res.json()) as { data: { feedbackId: string } };
    expect(body.data.feedbackId).toBe('fb-1');
  });

  it('returns 409 for duplicate feedback', async () => {
    mockedSubmit.mockRejectedValue(new ConflictError('FEEDBACK_EXISTS', 'dup'));
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(409);
  });

  it('returns 404 when the generation is unknown', async () => {
    mockedSubmit.mockRejectedValue(new NotFoundError('Generation', GEN_ID));
    const res = await POST(makeRequest(JSON.stringify(VALID_BODY)));
    expect(res.status).toBe(404);
  });
});
