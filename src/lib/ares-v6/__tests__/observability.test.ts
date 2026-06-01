import { describe, expect, it } from 'vitest';

import { generateAresV6, getAresV6CalibrationFixture } from '@ares/algorithms/engine-v6';

import {
  buildAresV6GenerationMetrics,
  createAresV6RequestContext,
  extractClientIp,
  logAresV6Event,
  redactAresV6LogPayload,
} from '../observability';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Observability (Phase 3A). Must never leak PII.
// ═══════════════════════════════════════════════════════════════

function request(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/generate/v6', { method: 'POST', headers });
}

describe('extractClientIp', () => {
  it('uses the first hop of x-forwarded-for', () => {
    expect(extractClientIp(request({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe('203.0.113.9');
  });

  it('falls back to x-real-ip and returns null when absent or garbage', () => {
    expect(extractClientIp(request({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
    expect(extractClientIp(request())).toBeNull();
    expect(extractClientIp(request({ 'x-forwarded-for': 'not an ip <script>' }))).toBeNull();
  });
});

describe('createAresV6RequestContext', () => {
  it('builds a context with a requestId and a hashed (non-raw) IP', () => {
    const ctx = createAresV6RequestContext(request({ 'x-forwarded-for': '203.0.113.7', 'user-agent': 'curl/8' }));
    expect(ctx.requestId.length).toBeGreaterThan(0);
    expect(ctx.method).toBe('POST');
    expect(ctx.endpoint).toBe('/api/generate/v6');
    expect(ctx.ipHash).not.toBe('203.0.113.7');
    expect(ctx.ipHash).toHaveLength(16);
    expect(ctx.userAgentHash).not.toBe('curl/8');
    expect(typeof ctx.startedAt).toBe('number');
  });

  it('marks ip/userAgent hashes as "unknown" when headers are missing', () => {
    const ctx = createAresV6RequestContext(request());
    expect(ctx.ipHash).toBe('unknown');
    expect(ctx.userAgentHash).toBe('unknown');
  });
});

describe('redactAresV6LogPayload', () => {
  it('masks sensitive keys (incl. nested) and never keeps the raw IP', () => {
    const redacted = redactAresV6LogPayload({
      ip: '1.2.3.4',
      email: 'player@example.com',
      keep: 'visible',
      nested: { userAgent: 'Mozilla', token: 'abc', ok: 1 },
    });
    expect(redacted.ip).toBe('[redacted]');
    expect(redacted.email).toBe('[redacted]');
    expect(redacted.keep).toBe('visible');
    expect((redacted.nested as Record<string, unknown>).userAgent).toBe('[redacted]');
    expect((redacted.nested as Record<string, unknown>).ok).toBe(1);
    expect(JSON.stringify(redacted)).not.toContain('1.2.3.4');
    expect(JSON.stringify(redacted)).not.toContain('player@example.com');
  });
});

describe('buildAresV6GenerationMetrics', () => {
  it('captures confidence, preset, mode and ppi source without PII', () => {
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
    });

    expect(metrics.status).toBe('ok');
    expect(metrics.presetId).toBe('STANDARD_PRO');
    expect(metrics.mode).toBe('BATTLE_ROYALE');
    expect(metrics.ppiSource).toBe('PPI');
    expect(metrics.confidenceGrade).toBeTruthy();
    expect(metrics.confidenceScore).toBeGreaterThan(0);
    expect(metrics.fallbackPpi).toBe(false);
  });
});

describe('logAresV6Event', () => {
  it('returns a record with the requestId and event, never the raw body', () => {
    const ctx = createAresV6RequestContext(request({ 'x-forwarded-for': '203.0.113.7' }));
    const record = logAresV6Event({ type: 'ares_v6.validation_failed', ctx, data: { reason: 'schema', code: 'unrecognized_keys' } });
    expect(record.event).toBe('ares_v6.validation_failed');
    expect(record.requestId).toBe(ctx.requestId);
    expect(JSON.stringify(record)).not.toContain('"body"');
  });

  it('redacts sensitive values inside event data', () => {
    const ctx = createAresV6RequestContext(request());
    const record = logAresV6Event({ type: 'ares_v6.failed', ctx, data: { ip: '1.2.3.4', error: 'internal' } });
    expect(record.data?.ip).toBe('[redacted]');
    expect(record.data?.error).toBe('internal');
  });
});
