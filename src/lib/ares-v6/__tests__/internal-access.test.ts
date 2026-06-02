import { createHash } from 'crypto';

import { afterEach, describe, expect, it } from 'vitest';

import {
  checkAresV6InternalAccess,
  getAresV6EnabledSurfaces,
  isAresV6SurfaceEnabled,
  shouldRequireAresV6InternalAccess,
} from '../internal-access';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal access guard (Fase 3C.1 P0 fix)
// ═══════════════════════════════════════════════════════════════

const SURFACE_AND_CONTROL_FLAGS = [
  'NODE_ENV',
  'ARES_V6_API_ENABLED',
  'ARES_V6_WRITE_FEEDBACK',
  'ARES_V6_LAB_METRICS_ENABLED',
  'ARES_V6_PERSIST_GENERATIONS',
  'ARES_V6_INTERNAL_ACCESS_ENABLED',
  'ARES_V6_INTERNAL_ACCESS_MODE',
  'ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256',
  'ARES_V6_LAB_MODE',
];

const snapshot = new Map<string, string | undefined>();
function setEnv(name: string, value: string | undefined): void {
  if (!snapshot.has(name)) snapshot.set(name, process.env[name]);
  if (value === undefined) delete process.env[name];
  else (process.env as Record<string, string | undefined>)[name] = value;
}
function clearSurfaces(): void {
  for (const flag of SURFACE_AND_CONTROL_FLAGS) setEnv(flag, undefined);
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

describe('surface detection', () => {
  it('lists enabled surfaces and reports activity', () => {
    clearSurfaces();
    setEnv('ARES_V6_WRITE_FEEDBACK', 'true');
    expect(getAresV6EnabledSurfaces()).toContain('ARES_V6_WRITE_FEEDBACK');
    expect(isAresV6SurfaceEnabled()).toBe(true);
  });
});

describe('shouldRequireAresV6InternalAccess', () => {
  it('requires a token for ANY surface active in production', () => {
    for (const surface of [
      'ARES_V6_API_ENABLED',
      'ARES_V6_WRITE_FEEDBACK',
      'ARES_V6_LAB_METRICS_ENABLED',
      'ARES_V6_PERSIST_GENERATIONS',
    ]) {
      clearSurfaces();
      setEnv('NODE_ENV', 'production');
      setEnv(surface, 'true');
      expect(shouldRequireAresV6InternalAccess()).toBe(true);
    }
  });

  it('does not require in dev/test with no surfaces', () => {
    clearSurfaces();
    setEnv('NODE_ENV', 'test');
    expect(shouldRequireAresV6InternalAccess()).toBe(false);
  });

  it('requires when mode=header or internal access explicitly enabled (any env)', () => {
    clearSurfaces();
    setEnv('NODE_ENV', 'test');
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    expect(shouldRequireAresV6InternalAccess()).toBe(true);
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', undefined);
    setEnv('ARES_V6_INTERNAL_ACCESS_ENABLED', 'true');
    expect(shouldRequireAresV6InternalAccess()).toBe(true);
  });
});

describe('checkAresV6InternalAccess — production surfaces require a token', () => {
  function prodSurface(surface: string): void {
    clearSurfaces();
    setEnv('NODE_ENV', 'production');
    setEnv(surface, 'true');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', TOKEN_HASH);
  }

  it('feedback-only in production requires a token', () => {
    prodSurface('ARES_V6_WRITE_FEEDBACK');
    expect(checkAresV6InternalAccess(request()).ok).toBe(false);
    expect(checkAresV6InternalAccess(request({ authorization: `Bearer ${TOKEN}` })).ok).toBe(true);
  });

  it('metrics-only in production requires a token', () => {
    prodSurface('ARES_V6_LAB_METRICS_ENABLED');
    expect(checkAresV6InternalAccess(request()).ok).toBe(false);
  });

  it('persistence-only in production requires a token', () => {
    prodSurface('ARES_V6_PERSIST_GENERATIONS');
    expect(checkAresV6InternalAccess(request()).ok).toBe(false);
  });

  it('ignores an explicit lab/off mode in production with a surface active', () => {
    prodSurface('ARES_V6_WRITE_FEEDBACK');
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'lab');
    const lab = checkAresV6InternalAccess(request());
    expect(lab.ok).toBe(false);
    expect(lab.unsafeModeIgnored).toBe('lab');

    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'off');
    const off = checkAresV6InternalAccess(request());
    expect(off.ok).toBe(false);
    expect(off.unsafeModeIgnored).toBe('off');
  });
});

describe('checkAresV6InternalAccess — token handling', () => {
  it('allows dev/test with no surfaces (lab)', () => {
    clearSurfaces();
    setEnv('NODE_ENV', 'test');
    expect(checkAresV6InternalAccess(request()).ok).toBe(true);
  });

  it('accepts a valid token and denies an invalid one', () => {
    clearSurfaces();
    setEnv('NODE_ENV', 'test');
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', TOKEN_HASH);
    expect(checkAresV6InternalAccess(request({ authorization: `Bearer ${TOKEN}` })).ok).toBe(true);
    const bad = checkAresV6InternalAccess(request({ authorization: 'Bearer nope' }));
    expect(bad.ok).toBe(false);
    expect(JSON.stringify(bad)).not.toContain('nope');
  });

  it('denies when the token hash is missing', () => {
    clearSurfaces();
    setEnv('NODE_ENV', 'test');
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', undefined);
    const result = checkAresV6InternalAccess(request({ authorization: `Bearer ${TOKEN}` }));
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('token_hash_unset');
  });

  it('never leaks the token in the result', () => {
    clearSurfaces();
    setEnv('NODE_ENV', 'test');
    setEnv('ARES_V6_INTERNAL_ACCESS_MODE', 'header');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', TOKEN_HASH);
    const result = checkAresV6InternalAccess(request({ 'x-ares-v6-lab-token': TOKEN }));
    expect(JSON.stringify(result)).not.toContain(TOKEN);
  });
});
