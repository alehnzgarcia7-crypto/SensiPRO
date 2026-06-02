import { createHash } from 'crypto';

import { afterEach, describe, expect, it } from 'vitest';

import { checkAresV6InternalAccess, getAresV6InternalAccessMode } from '../internal-access';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal access guard (Fase 3C)
// ═══════════════════════════════════════════════════════════════

const snapshot = new Map<string, string | undefined>();
function setEnv(name: string, value: string | undefined): void {
  if (!snapshot.has(name)) snapshot.set(name, process.env[name]);
  if (value === undefined) delete process.env[name];
  else (process.env as Record<string, string | undefined>)[name] = value;
}
afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else (process.env as Record<string, string | undefined>)[name] = value;
  }
  snapshot.clear();
});

const TOKEN = 'super-secret-internal-lab-token';
const TOKEN_HASH = createHash('sha256').update(TOKEN).digest('hex');

function request(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/generate/v6', { method: 'POST', headers });
}

describe('getAresV6InternalAccessMode', () => {
  it('honours an explicit mode and defaults sensibly', () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    expect(getAresV6InternalAccessMode()).toBe('header');
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', undefined);
    setEnv('ARES_V6_INTERNAL_ACCESS_ENABLED', 'true');
    expect(getAresV6InternalAccessMode()).toBe('header');
    setEnv('ARES_V6_INTERNAL_ACCESS_ENABLED', undefined);
    expect(getAresV6InternalAccessMode()).toBe('lab'); // test env is not production
  });
});

describe('checkAresV6InternalAccess', () => {
  it('allows in lab and off modes without a token', () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'lab');
    expect(checkAresV6InternalAccess(request()).ok).toBe(true);
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'off');
    expect(checkAresV6InternalAccess(request()).ok).toBe(true);
  });

  it('blocks (stealth 404) when header mode has no configured token hash', () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', undefined);
    const result = checkAresV6InternalAccess(request({ authorization: `Bearer ${TOKEN}` }));
    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
    expect(result.reason).toBe('token_hash_unset');
  });

  it('allows a correct token via Authorization and via x-ares-v6-lab-token', () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', TOKEN_HASH);
    expect(checkAresV6InternalAccess(request({ authorization: `Bearer ${TOKEN}` })).ok).toBe(true);
    expect(checkAresV6InternalAccess(request({ 'x-ares-v6-lab-token': TOKEN })).ok).toBe(true);
  });

  it('blocks a missing or wrong token (and never echoes it)', () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', TOKEN_HASH);
    const missing = checkAresV6InternalAccess(request());
    expect(missing.ok).toBe(false);
    expect(missing.reason).toBe('token_missing');
    const wrong = checkAresV6InternalAccess(request({ authorization: 'Bearer nope' }));
    expect(wrong.ok).toBe(false);
    expect(wrong.reason).toBe('token_mismatch');
    expect(JSON.stringify(wrong)).not.toContain('nope');
  });

  it('does not break on a wrong-length configured hash (timing-safe length guard)', () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', 'too-short');
    const result = checkAresV6InternalAccess(request({ authorization: `Bearer ${TOKEN}` }));
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('token_hash_unset');
  });

  it('returns 403 instead of 404 when lab mode is on', () => {
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', TOKEN_HASH);
    setEnv('ARES_V6_LAB_MODE', 'true');
    const result = checkAresV6InternalAccess(request());
    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
  });
});
