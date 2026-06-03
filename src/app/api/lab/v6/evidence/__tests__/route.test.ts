import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { GET } from '../route';

// ═══════════════════════════════════════════════════════════════
// GET /api/lab/v6/evidence — unit tests (infra-free paths).
//
// Asserts the flag gate (404) and query validation (400) which run BEFORE any DB
// access. The 200 path + filter/summary/includeRows semantics need real Postgres
// + Redis and are covered by the real-infra smoke (route checks there). Rate
// limit is forced fail-open so validation is reachable without Redis in CI.
// ═══════════════════════════════════════════════════════════════

const TOUCHED = [
  'ARES_V6_LAB_EVIDENCE_ENABLED',
  'ARES_V6_RATE_LIMIT_FAIL_MODE',
  'ARES_V6_PROXY_TRUST_MODE',
  'ARES_V6_INTERNAL_ACCESS_MODE',
  'ARES_V6_LOG_SALT',
] as const;

const saved: Record<string, string | undefined> = {};

function get(query = ''): Promise<Response> {
  return GET(
    new NextRequest(`http://localhost/api/lab/v6/evidence${query}`, {
      headers: { 'x-forwarded-for': '10.20.30.40' },
    }),
  ) as unknown as Promise<Response>;
}

describe('GET /api/lab/v6/evidence', () => {
  beforeEach(() => {
    for (const key of TOUCHED) saved[key] = process.env[key];
    process.env.ARES_V6_RATE_LIMIT_FAIL_MODE = 'open';
    process.env.ARES_V6_PROXY_TRUST_MODE = 'lab';
    process.env.ARES_V6_INTERNAL_ACCESS_MODE = 'lab';
    process.env.ARES_V6_LOG_SALT = 'unit-test-salt-evidence-route-1234';
  });

  afterEach(() => {
    for (const key of TOUCHED) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it('returns 404 when the flag is OFF', async () => {
    delete process.env.ARES_V6_LAB_EVIDENCE_ENABLED;
    expect((await get()).status).toBe(404);
  });

  it('rejects an invalid presetId with 400 (validated against ARES_V6_PRESETS)', async () => {
    process.env.ARES_V6_LAB_EVIDENCE_ENABLED = 'true';
    expect((await get('?presetId=NOT_A_PRESET')).status).toBe(400);
  });

  it('rejects an unknown query key with 400 (strict schema)', async () => {
    process.env.ARES_V6_LAB_EVIDENCE_ENABLED = 'true';
    expect((await get('?bogusKey=1')).status).toBe(400);
  });

  it('rejects an invalid compareScope with 400', async () => {
    process.env.ARES_V6_LAB_EVIDENCE_ENABLED = 'true';
    expect((await get('?compareScope=sideways')).status).toBe(400);
  });
});
