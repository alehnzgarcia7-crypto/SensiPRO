import { afterEach, describe, expect, it } from 'vitest';

import { generateAresV6, getAresV6CalibrationFixture } from '@ares/algorithms/engine-v6';

import {
  buildAresV6GenerationMetrics,
  createAresV6RequestContext,
  extractClientIp,
  logAresV6Event,
  redactAresV6LogPayload,
} from '../observability';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Observability (Phase 3A + 3B). Must never leak PII.
// ═══════════════════════════════════════════════════════════════

const snapshot = new Map<string, string | undefined>();

function setEnv(name: string, value: string | undefined): void {
  if (!snapshot.has(name)) snapshot.set(name, process.env[name]);
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  snapshot.clear();
});

function request(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/generate/v6', { method: 'POST', headers });
}

describe('extractClientIp', () => {
  it('delegates to the proxy trust policy (lab accepts x-forwarded-for)', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'lab');
    expect(extractClientIp(request({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe('203.0.113.9');
    expect(extractClientIp(request())).toBeNull();
  });
});

describe('createAresV6RequestContext', () => {
  it('builds a context with a requestId, hashed IP and proxy metadata', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'lab');
    const ctx = createAresV6RequestContext(request({ 'x-forwarded-for': '203.0.113.7', 'user-agent': 'curl/8' }));
    expect(ctx.requestId.length).toBeGreaterThan(0);
    expect(ctx.endpoint).toBe('/api/generate/v6');
    expect(ctx.ipHash).not.toBe('203.0.113.7');
    expect(ctx.ipHash).toHaveLength(16);
    expect(ctx.userAgentHash).not.toBe('curl/8');
    expect(ctx.proxyIpSource).toBe('FORWARDED_FOR');
    expect(ctx.proxyTrusted).toBe(true);
  });

  it('does not hash an untrusted IP (strict mode → ipHash unknown)', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'strict');
    const ctx = createAresV6RequestContext(request({ 'x-forwarded-for': '203.0.113.7' }));
    expect(ctx.ipHash).toBe('unknown');
    expect(ctx.proxyTrusted).toBe(false);
    expect(ctx.proxyIpSource).toBe('FORWARDED_FOR');
  });
});

describe('redactAresV6LogPayload', () => {
  it('masks sensitive keys (incl. salt + nested) and never keeps the raw IP', () => {
    const redacted = redactAresV6LogPayload({
      ip: '1.2.3.4',
      email: 'player@example.com',
      salt: 'super-secret-salt',
      keep: 'visible',
      nested: { userAgent: 'Mozilla', token: 'abc', ok: 1 },
    });
    expect(redacted.ip).toBe('[redacted]');
    expect(redacted.email).toBe('[redacted]');
    expect(redacted.salt).toBe('[redacted]');
    expect(redacted.keep).toBe('visible');
    expect((redacted.nested as Record<string, unknown>).userAgent).toBe('[redacted]');
    expect((redacted.nested as Record<string, unknown>).ok).toBe(1);
    expect(JSON.stringify(redacted)).not.toContain('1.2.3.4');
    expect(JSON.stringify(redacted)).not.toContain('super-secret-salt');
  });
});

describe('buildAresV6GenerationMetrics', () => {
  it('captures engine + operational metrics without PII', () => {
    const fixture = getAresV6CalibrationFixture('redmi-note-13');
    if (!fixture) throw new Error('fixture missing');
    const generation = generateAresV6({
      device: fixture.device,
      presetId: 'STANDARD_PRO',
      player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
    });

    const metrics = buildAresV6GenerationMetrics({
      deviceId: 'ckdevicea1b2c3d4e5f6g7h8',
      durationMs: 12,
      player: { mode: 'BATTLE_ROYALE', fingers: 3, usesGyroscope: false },
      generation,
      operational: {
        rateLimitScopes: ['IP_GLOBAL', 'IP_DEVICE'],
        rateLimitDegraded: false,
        rateLimitFailMode: 'closed',
        proxyIpSource: 'FORWARDED_FOR',
        proxyTrusted: true,
        dbDurationMs: 3,
        engineDurationMs: 1,
        totalDurationMs: 12,
      },
    });

    expect(metrics.presetId).toBe('STANDARD_PRO');
    expect(metrics.ppiSource).toBe('PPI');
    expect(metrics.rateLimitScopes).toEqual(['IP_GLOBAL', 'IP_DEVICE']);
    expect(metrics.rateLimitFailMode).toBe('closed');
    expect(metrics.proxyTrusted).toBe(true);
    expect(metrics.dbDurationMs).toBe(3);
  });
});

describe('logAresV6Event', () => {
  it('returns a record with requestId + proxy metadata, never the raw body', () => {
    const ctx = createAresV6RequestContext(request({ 'x-forwarded-for': '203.0.113.7' }));
    const record = logAresV6Event({ type: 'ares_v6.rate_limited', ctx, data: { scopes: ['IP_GLOBAL'] } });
    expect(record.event).toBe('ares_v6.rate_limited');
    expect(record.requestId).toBe(ctx.requestId);
    expect(record.proxyIpSource).toBeTruthy();
    expect(JSON.stringify(record)).not.toContain('"body"');
  });

  it('redacts sensitive values inside event data', () => {
    const ctx = createAresV6RequestContext(request());
    const record = logAresV6Event({ type: 'ares_v6.failed', ctx, data: { ip: '1.2.3.4', error: 'internal' } });
    expect(record.data?.ip).toBe('[redacted]');
    expect(record.data?.error).toBe('internal');
  });
});
