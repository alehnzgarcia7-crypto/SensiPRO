import { describe, expect, it } from 'vitest';

import { evaluateAresV6UiReadiness } from '../internal-ui-readiness';

// ═══════════════════════════════════════════════════════════════
// Fase 3F — UI execution readiness. Pure over an injected env. Proves: security
// gaps fail a deployed target, production needs the protection ack, NEXT_PUBLIC
// alone never passes, feedback needs its flag, and no secret value leaks.
// ═══════════════════════════════════════════════════════════════

const SECURE: NodeJS.ProcessEnv = {
  ARES_V6_INTERNAL_UI_ENABLED: 'true',
  ARES_V6_RATE_LIMIT_FAIL_MODE: 'closed',
  ARES_V6_PROXY_TRUST_MODE: 'strict',
  ARES_V6_LOG_SALT: 'a-sufficiently-long-salt',
  DATABASE_URL: 'postgresql://user:secret@localhost/db',
  REDIS_URL: 'redis://localhost:6379',
  ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256: 'a'.repeat(64),
};

function names(checks: { name: string }[]): string[] {
  return checks.map((c) => c.name);
}

describe('preview target', () => {
  it('fails when token/salt/db/redis are missing and a surface is active', () => {
    const env: NodeJS.ProcessEnv = {
      ARES_V6_INTERNAL_UI_ENABLED: 'true',
      ARES_V6_LAB_EVIDENCE_ENABLED: 'true',
    };
    const result = evaluateAresV6UiReadiness({ target: 'preview', env });
    expect(result.passed).toBe(false);
    expect(names(result.errors)).toEqual(
      expect.arrayContaining([
        'rate_limit_fail_mode',
        'proxy_trust_mode',
        'log_salt',
        'internal_access_token_hash',
        'database_url',
        'redis_url',
      ]),
    );
  });

  it('passes when fully configured', () => {
    const result = evaluateAresV6UiReadiness({ target: 'preview', env: { ...SECURE, ARES_V6_LAB_EVIDENCE_ENABLED: 'true' } });
    expect(result.passed).toBe(true);
  });
});

describe('production target', () => {
  it('fails without the deployment-protection ack', () => {
    const result = evaluateAresV6UiReadiness({ target: 'production', env: SECURE });
    expect(result.passed).toBe(false);
    const ack = result.checks.find((c) => c.name === 'production_protection_ack');
    expect(ack?.status).toBe('error');
  });

  it('passes with the ack, and keeps deployment protection as a required checklist item', () => {
    const result = evaluateAresV6UiReadiness({
      target: 'production',
      env: { ...SECURE, ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION: 'true' },
    });
    expect(result.passed).toBe(true);
    const item = result.checklist.find((c) => c.id === 'deployment_protection');
    expect(item?.required).toBe(true);
  });
});

describe('NEXT_PUBLIC is not security', () => {
  it('does not pass on the public flag alone', () => {
    const result = evaluateAresV6UiReadiness({ target: 'local', env: { NEXT_PUBLIC_ARES_V6_ENABLED: 'true' } });
    expect(result.passed).toBe(false);
    expect(result.checks.find((c) => c.name === 'internal_ui_enabled')?.status).toBe('error');
  });
});

describe('feedback session', () => {
  it('requires WRITE_FEEDBACK when --with-feedback is set', () => {
    const result = evaluateAresV6UiReadiness({ target: 'preview', env: SECURE, withFeedback: true });
    const feedback = result.checks.find((c) => c.name === 'write_feedback');
    expect(feedback?.status).toBe('error');
    expect(result.passed).toBe(false);
  });
});

describe('no secret leak', () => {
  it('never includes a token value or db password in the JSON', () => {
    const result = evaluateAresV6UiReadiness({ target: 'preview', env: SECURE });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('a'.repeat(64));
    expect(serialized).not.toContain('secret@localhost');
  });
});

describe('token hash hex validation (3F.1)', () => {
  // preview + an active surface ⇒ the token-hash check is required (error if invalid).
  function tokenStatus(token: string | undefined): string {
    const env: NodeJS.ProcessEnv = { ...SECURE, ARES_V6_LAB_EVIDENCE_ENABLED: 'true' };
    if (token === undefined) delete env.ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256;
    else env.ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256 = token;
    const result = evaluateAresV6UiReadiness({ target: 'preview', env });
    return result.checks.find((c) => c.name === 'internal_access_token_hash')?.status ?? 'absent';
  }

  it('accepts a real 64-hex SHA-256 (lowercase, uppercase, mixed)', () => {
    expect(tokenStatus('a'.repeat(64))).toBe('ok');
    expect(tokenStatus('A'.repeat(64))).toBe('ok');
    expect(tokenStatus('0123456789abcdef'.repeat(4))).toBe('ok');
  });

  it('rejects non-hex 64, 63 hex, 65 hex, and missing', () => {
    expect(tokenStatus('g'.repeat(64))).toBe('error'); // 64 chars but not hex
    expect(tokenStatus('z'.repeat(64))).toBe('error');
    expect(tokenStatus('a'.repeat(63))).toBe('error'); // too short
    expect(tokenStatus('a'.repeat(65))).toBe('error'); // too long
    expect(tokenStatus(undefined)).toBe('error'); // missing
  });
});
