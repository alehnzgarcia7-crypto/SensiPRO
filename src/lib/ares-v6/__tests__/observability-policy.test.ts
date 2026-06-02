import { afterEach, describe, expect, it } from 'vitest';

import { checkAresV6RuntimeConfig, getAresV6LogSalt, isAresV6LogSaltStrong } from '../observability-policy';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Log salt / runtime config policy (Phase 3B)
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

describe('isAresV6LogSaltStrong', () => {
  it('is false for a short or missing salt and true for >= 16 chars', () => {
    setEnv('ARES_V6_LOG_SALT', undefined);
    expect(isAresV6LogSaltStrong()).toBe(false);
    setEnv('ARES_V6_LOG_SALT', 'short');
    expect(isAresV6LogSaltStrong()).toBe(false);
    setEnv('ARES_V6_LOG_SALT', 'a-strong-enough-salt-value');
    expect(isAresV6LogSaltStrong()).toBe(true);
  });
});

describe('getAresV6LogSalt', () => {
  it('returns the env salt when set, otherwise a lab default', () => {
    setEnv('ARES_V6_LOG_SALT', 'env-provided-salt-value');
    expect(getAresV6LogSalt()).toBe('env-provided-salt-value');
    setEnv('ARES_V6_LOG_SALT', undefined);
    expect(getAresV6LogSalt().length).toBeGreaterThan(0);
  });
});

describe('checkAresV6RuntimeConfig', () => {
  it('passes in the test environment with the default salt', () => {
    expect(checkAresV6RuntimeConfig()).toBeNull();
  });

  it('fails closed in production + API enabled when the salt is missing', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('ARES_V6_API_ENABLED', 'true');
    setEnv('ARES_V6_LOG_SALT', undefined);
    const result = checkAresV6RuntimeConfig();
    expect(result?.code).toBe('CONFIGURATION_ERROR');
    // Generic message — never echoes the (missing) salt value.
    expect(result?.message).not.toContain('salt');
  });

  it('fails when the salt is too short in production + API enabled', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('ARES_V6_API_ENABLED', 'true');
    setEnv('ARES_V6_LOG_SALT', 'tooshort');
    expect(checkAresV6RuntimeConfig()?.code).toBe('CONFIGURATION_ERROR');
  });

  it('passes in production + API enabled with a strong salt', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('ARES_V6_API_ENABLED', 'true');
    setEnv('ARES_V6_LOG_SALT', 'a-strong-enough-production-salt');
    expect(checkAresV6RuntimeConfig()).toBeNull();
  });

  it('does not require a salt when the API is disabled', () => {
    setEnv('NODE_ENV', 'production');
    setEnv('ARES_V6_API_ENABLED', 'false');
    setEnv('ARES_V6_LOG_SALT', undefined);
    expect(checkAresV6RuntimeConfig()).toBeNull();
  });
});
