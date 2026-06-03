import { afterEach, describe, expect, it } from 'vitest';

import {
  getAresV6InternalUiFlagState,
  getAresV6InternalUiMode,
  isAresV6InternalUiEnabled,
  shouldShowAresV6InternalUiLink,
} from '../internal-ui-flags';

// ═══════════════════════════════════════════════════════════════
// Fase 3E — internal UI flags. Proves the server gate is the only real switch
// and that NEXT_PUBLIC alone never enables anything.
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

describe('isAresV6InternalUiEnabled', () => {
  it('is false by default (server flag off)', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', undefined);
    expect(isAresV6InternalUiEnabled()).toBe(false);
  });

  it('requires the exact string "true"', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', '1');
    expect(isAresV6InternalUiEnabled()).toBe(false);
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    expect(isAresV6InternalUiEnabled()).toBe(true);
  });

  it('NEXT_PUBLIC_ARES_V6_ENABLED alone does NOT enable the server UI', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', undefined);
    setEnv('NEXT_PUBLIC_ARES_V6_ENABLED', 'true');
    expect(isAresV6InternalUiEnabled()).toBe(false);
  });
});

describe('shouldShowAresV6InternalUiLink', () => {
  it('requires BOTH the server gate and the public hint', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    setEnv('NEXT_PUBLIC_ARES_V6_ENABLED', undefined);
    expect(shouldShowAresV6InternalUiLink()).toBe(false);

    setEnv('NEXT_PUBLIC_ARES_V6_ENABLED', 'true');
    expect(shouldShowAresV6InternalUiLink()).toBe(true);
  });

  it('public flag alone never shows the link', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', undefined);
    setEnv('NEXT_PUBLIC_ARES_V6_ENABLED', 'true');
    expect(shouldShowAresV6InternalUiLink()).toBe(false);
  });
});

describe('getAresV6InternalUiMode', () => {
  it('is OFF when the server flag is off', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', undefined);
    expect(getAresV6InternalUiMode()).toBe('OFF');
  });

  it('is LAB when enabled outside production', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    (process.env as Record<string, string>).NODE_ENV = 'test';
    expect(getAresV6InternalUiMode()).toBe('LAB');
  });

  it('is PRODUCTION when enabled in production', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    const previous = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'production';
    expect(getAresV6InternalUiMode()).toBe('PRODUCTION');
    (process.env as Record<string, string | undefined>).NODE_ENV = previous;
  });
});

describe('getAresV6InternalUiFlagState', () => {
  it('reports booleans only — never a secret value', () => {
    setEnv('ARES_V6_INTERNAL_UI_ENABLED', 'true');
    setEnv('ARES_V6_LAB_EVIDENCE_ENABLED', 'true');
    const state = getAresV6InternalUiFlagState();
    expect(state.internalUiEnabled).toBe(true);
    expect(state.labEvidenceEnabled).toBe(true);
    expect(state.apiEnabled).toBe(false);
    const serialized = JSON.stringify(state);
    expect(serialized).not.toMatch(/token/i);
    expect(serialized).not.toMatch(/sha256/i);
  });
});
