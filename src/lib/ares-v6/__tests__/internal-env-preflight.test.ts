import { describe, expect, it } from 'vitest';

import { verifyAresV6InternalEnv } from '../internal-env-preflight';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal environment preflight (Fase 3C.1)
// ═══════════════════════════════════════════════════════════════

const STRONG_TOKEN_HASH = 'a'.repeat(64);
const STRONG_SALT = 'a-strong-enough-salt-value';

function validPreviewEnv(): NodeJS.ProcessEnv {
  return {
    ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256: STRONG_TOKEN_HASH,
    ARES_V6_LOG_SALT: STRONG_SALT,
    ARES_V6_RATE_LIMIT_FAIL_MODE: 'closed',
    ARES_V6_PROXY_TRUST_MODE: 'strict',
    ARES_V6_LAB_METRICS_ENABLED: 'true',
    DATABASE_URL: 'postgresql://x@localhost:5432/db',
    REDIS_URL: 'redis://localhost:6379',
    NODE_ENV: 'production',
  } as NodeJS.ProcessEnv;
}

describe('verifyAresV6InternalEnv', () => {
  it('passes a fully-configured preview env', () => {
    const result = verifyAresV6InternalEnv({ target: 'preview', env: validPreviewEnv() });
    expect(result.passed).toBe(true);
    expect(result.errors).toBe(0);
  });

  it('fails preview when the token hash is missing', () => {
    const env = validPreviewEnv();
    delete env.ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256;
    const result = verifyAresV6InternalEnv({ target: 'preview', env });
    expect(result.passed).toBe(false);
    expect(result.checks.find((c) => c.name === 'internal_access_token_hash')?.status).toBe('error');
  });

  it('fails preview when the salt is too short', () => {
    const env = validPreviewEnv();
    env.ARES_V6_LOG_SALT = 'tooshort';
    expect(verifyAresV6InternalEnv({ target: 'preview', env }).passed).toBe(false);
  });

  it('fails preview when fail mode is open', () => {
    const env = validPreviewEnv();
    env.ARES_V6_RATE_LIMIT_FAIL_MODE = 'open';
    expect(verifyAresV6InternalEnv({ target: 'preview', env }).passed).toBe(false);
  });

  it('fails preview when proxy trust is lab', () => {
    const env = validPreviewEnv();
    env.ARES_V6_PROXY_TRUST_MODE = 'lab';
    expect(verifyAresV6InternalEnv({ target: 'preview', env }).passed).toBe(false);
  });

  it('treats security gaps as warnings (not errors) for a local target', () => {
    const env = { ARES_V6_LAB_METRICS_ENABLED: 'true', DATABASE_URL: 'x', REDIS_URL: 'x' } as NodeJS.ProcessEnv;
    const result = verifyAresV6InternalEnv({ target: 'local', env });
    expect(result.passed).toBe(true);
    expect(result.warnings).toBeGreaterThan(0);
  });

  it('never prints secret values', () => {
    const result = verifyAresV6InternalEnv({ target: 'preview', env: validPreviewEnv() });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(STRONG_TOKEN_HASH);
    expect(serialized).not.toContain(STRONG_SALT);
  });
});
