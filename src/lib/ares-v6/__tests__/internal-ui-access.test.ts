import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  assertCanViewAresV6InternalUi,
  getAresV6InternalUiAccessState,
  maybeGetAresV6InternalUiOperatorContext,
} from '../internal-ui-access';

// ═══════════════════════════════════════════════════════════════
// Fase 3E — internal UI access guard. Proves: flag off → blocked; on in
// dev/test → allowed; production without protection → blocked; no token leaks.
// ═══════════════════════════════════════════════════════════════

const snapshot = new Map<string, string | undefined>();
function setEnv(name: string, value: string | undefined): void {
  if (!snapshot.has(name)) snapshot.set(name, process.env[name]);
  if (value === undefined) delete process.env[name];
  else (process.env as Record<string, string | undefined>)[name] = value;
}
function setNodeEnv(value: string): void {
  if (!snapshot.has('NODE_ENV')) snapshot.set('NODE_ENV', process.env.NODE_ENV);
  (process.env as Record<string, string>).NODE_ENV = value;
}

afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else (process.env as Record<string, string | undefined>)[name] = value;
  }
  snapshot.clear();
});

describe('getAresV6InternalUiAccessState', () => {
  it('blocks when the UI flag is off', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', undefined);
    const state = getAresV6InternalUiAccessState();
    expect(state.ok).toBe(false);
    expect(state.reason).toBe('UI_FLAG_OFF');
  });

  it('allows when enabled in a non-production environment', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    setNodeEnv('test');
    const state = getAresV6InternalUiAccessState();
    expect(state.ok).toBe(true);
    expect(state.reason).toBe('OK');
    expect(state.mode).toBe('LAB');
  });

  it('blocks in production without the deployment-protection ack', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    setEnv('ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION', undefined);
    setNodeEnv('production');
    const state = getAresV6InternalUiAccessState();
    expect(state.ok).toBe(false);
    expect(state.reason).toBe('PRODUCTION_PROTECTION_REQUIRED');
  });

  it('allows in production once protection is acknowledged', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    setEnv('ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION', 'true');
    setNodeEnv('production');
    const state = getAresV6InternalUiAccessState();
    expect(state.ok).toBe(true);
    expect(state.mode).toBe('PRODUCTION');
  });
});

describe('assertCanViewAresV6InternalUi', () => {
  it('calls deny (404) when the UI flag is off', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', undefined);
    const deny = vi.fn((): never => {
      throw new Error('denied');
    });
    expect(() => assertCanViewAresV6InternalUi(deny)).toThrow('denied');
    expect(deny).toHaveBeenCalledTimes(1);
  });

  it('returns the state without denying when allowed', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    setNodeEnv('test');
    const deny = vi.fn((): never => {
      throw new Error('denied');
    });
    const state = assertCanViewAresV6InternalUi(deny);
    expect(deny).not.toHaveBeenCalled();
    expect(state.ok).toBe(true);
  });
});

describe('maybeGetAresV6InternalUiOperatorContext', () => {
  it('is null when access is denied', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', undefined);
    expect(maybeGetAresV6InternalUiOperatorContext()).toBeNull();
  });

  it('returns flag-name-only surfaces and never a token when allowed', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    setEnv('ARES_V6_LAB_EVIDENCE_ENABLED', 'true');
    setEnv('ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256', 'a'.repeat(64));
    setNodeEnv('test');

    const context = maybeGetAresV6InternalUiOperatorContext();
    expect(context).not.toBeNull();
    expect(context?.enabledSurfaces).toContain('ARES_V6_LAB_EVIDENCE_ENABLED');

    const serialized = JSON.stringify(context);
    // The configured token hash must never appear in the operator context.
    expect(serialized).not.toContain('a'.repeat(64));
    expect(serialized).not.toMatch(/TOKEN_SHA256/);
  });
});
