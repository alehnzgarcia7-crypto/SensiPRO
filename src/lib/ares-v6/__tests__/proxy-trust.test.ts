import { afterEach, describe, expect, it } from 'vitest';

import { getProxyTrustMode, getTrustedClientIp, isTrustedProxyHeaderSource } from '../proxy-trust';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Proxy trust policy (Phase 3B)
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

describe('getProxyTrustMode', () => {
  it('honours an explicit mode', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'strict');
    expect(getProxyTrustMode()).toBe('strict');
  });

  it('defaults to vercel when VERCEL=1, otherwise lab', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', undefined);
    setEnv('VERCEL', '1');
    expect(getProxyTrustMode()).toBe('vercel');
    setEnv('VERCEL', undefined);
    expect(getProxyTrustMode()).toBe('lab');
  });
});

describe('getTrustedClientIp', () => {
  it('lab mode accepts x-forwarded-for (first hop)', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'lab');
    const result = getTrustedClientIp(request({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }));
    expect(result).toEqual({ ip: '203.0.113.9', source: 'FORWARDED_FOR', trusted: true });
  });

  it('vercel mode prefers x-vercel-forwarded-for over x-forwarded-for', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'vercel');
    const result = getTrustedClientIp(
      request({ 'x-vercel-forwarded-for': '198.51.100.7', 'x-forwarded-for': '203.0.113.9' }),
    );
    expect(result.ip).toBe('198.51.100.7');
    expect(result.source).toBe('VERCEL');
    expect(result.trusted).toBe(true);
  });

  it('strict mode does NOT trust a spoofable x-forwarded-for', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'strict');
    const result = getTrustedClientIp(request({ 'x-forwarded-for': '203.0.113.9' }));
    expect(result.source).toBe('FORWARDED_FOR');
    expect(result.trusted).toBe(false);
  });

  it('strict mode trusts the platform x-vercel-forwarded-for', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'strict');
    const result = getTrustedClientIp(request({ 'x-vercel-forwarded-for': '198.51.100.7' }));
    expect(result.trusted).toBe(true);
  });

  it('returns null for a malformed IP header', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'lab');
    const result = getTrustedClientIp(request({ 'x-forwarded-for': 'not an ip <script>' }));
    expect(result).toEqual({ ip: null, source: 'NONE', trusted: false });
  });

  it('returns NONE when no forwarding headers are present', () => {
    setEnv('ARES_V6_PROXY_TRUST_MODE', 'lab');
    expect(getTrustedClientIp(request())).toEqual({ ip: null, source: 'NONE', trusted: false });
  });
});

describe('isTrustedProxyHeaderSource', () => {
  it('always trusts VERCEL and never trusts NONE', () => {
    expect(isTrustedProxyHeaderSource('VERCEL', 'strict')).toBe(true);
    expect(isTrustedProxyHeaderSource('NONE', 'lab')).toBe(false);
  });

  it('only trusts forwarding headers outside strict mode', () => {
    expect(isTrustedProxyHeaderSource('FORWARDED_FOR', 'lab')).toBe(true);
    expect(isTrustedProxyHeaderSource('FORWARDED_FOR', 'vercel')).toBe(true);
    expect(isTrustedProxyHeaderSource('FORWARDED_FOR', 'strict')).toBe(false);
  });
});
