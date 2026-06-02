// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal environment preflight verifier (Fase 3C.1)
//
// Confirms the activation environment is safe BEFORE running the internal lab.
// Pure (env is injectable) and testable. Security checks are ERRORS for a
// deployed `preview` target and WARNINGS for `local` (engine-only dry-run).
// The report contains ONLY booleans/status/mode-names — never secret values.
// ═══════════════════════════════════════════════════════════════

const SHA256_HEX_LENGTH = 64;
const MIN_LOG_SALT_LENGTH = 16;

export type AresV6PreflightTarget = 'local' | 'preview';
export type AresV6PreflightStatus = 'ok' | 'warning' | 'error';

export interface AresV6PreflightCheck {
  name: string;
  status: AresV6PreflightStatus;
  /** Human detail — NEVER includes a secret value. */
  detail: string;
}

export interface AresV6PreflightResult {
  target: AresV6PreflightTarget;
  passed: boolean;
  errors: number;
  warnings: number;
  checks: AresV6PreflightCheck[];
  context: { nodeEnv: string; vercel: boolean };
}

export function verifyAresV6InternalEnv(opts: {
  target: AresV6PreflightTarget;
  env?: NodeJS.ProcessEnv;
}): AresV6PreflightResult {
  const env = opts.env ?? process.env;
  const target = opts.target;
  const securityStatus: AresV6PreflightStatus = target === 'preview' ? 'error' : 'warning';
  const checks: AresV6PreflightCheck[] = [];

  const tokenHash = env.ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256;
  const tokenOk = typeof tokenHash === 'string' && tokenHash.length === SHA256_HEX_LENGTH;
  checks.push({
    name: 'internal_access_token_hash',
    status: tokenOk ? 'ok' : securityStatus,
    detail: tokenOk ? 'configured (64 hex)' : 'missing or not 64 hex',
  });

  const salt = env.ARES_V6_LOG_SALT;
  const saltOk = typeof salt === 'string' && salt.length >= MIN_LOG_SALT_LENGTH;
  checks.push({
    name: 'log_salt',
    status: saltOk ? 'ok' : securityStatus,
    detail: saltOk ? 'configured (>=16 chars)' : 'missing or too short',
  });

  const failClosed = env.ARES_V6_RATE_LIMIT_FAIL_MODE === 'closed';
  checks.push({
    name: 'rate_limit_fail_mode',
    status: failClosed ? 'ok' : securityStatus,
    detail: failClosed ? 'closed' : `expected closed (got ${env.ARES_V6_RATE_LIMIT_FAIL_MODE ?? 'unset'})`,
  });

  const proxyStrict = env.ARES_V6_PROXY_TRUST_MODE === 'strict';
  checks.push({
    name: 'proxy_trust_mode',
    status: proxyStrict ? 'ok' : securityStatus,
    detail: proxyStrict ? 'strict' : `expected strict (got ${env.ARES_V6_PROXY_TRUST_MODE ?? 'unset'})`,
  });

  const apiEnabled = env.ARES_V6_API_ENABLED === 'true';
  checks.push({
    name: 'api_enabled',
    status: apiEnabled ? 'warning' : 'ok',
    detail: apiEnabled ? 'true (ensure intentional)' : 'false',
  });

  const writeFeedback = env.ARES_V6_WRITE_FEEDBACK === 'true';
  checks.push({
    name: 'write_feedback',
    status: writeFeedback ? 'warning' : 'ok',
    detail: writeFeedback ? 'enabled (ensure intentional)' : 'false (default)',
  });

  const persist = env.ARES_V6_PERSIST_GENERATIONS === 'true';
  const metrics = env.ARES_V6_LAB_METRICS_ENABLED === 'true';
  const anySurface = apiEnabled || writeFeedback || persist || metrics;

  const hasDatabase = typeof env.DATABASE_URL === 'string' && env.DATABASE_URL.length > 0;
  checks.push({
    name: 'database_url',
    status: hasDatabase ? 'ok' : persist || metrics ? 'error' : 'warning',
    detail: hasDatabase ? 'present' : 'required when persistence/metrics enabled',
  });

  const hasRedis = typeof env.REDIS_URL === 'string' && env.REDIS_URL.length > 0;
  checks.push({
    name: 'redis_url',
    status: hasRedis ? 'ok' : anySurface ? 'error' : 'warning',
    detail: hasRedis ? 'present' : 'required when an endpoint is active',
  });

  const errors = checks.filter((check) => check.status === 'error').length;
  const warnings = checks.filter((check) => check.status === 'warning').length;

  return {
    target,
    passed: errors === 0,
    errors,
    warnings,
    checks,
    context: { nodeEnv: env.NODE_ENV ?? 'unset', vercel: env.VERCEL === '1' },
  };
}
