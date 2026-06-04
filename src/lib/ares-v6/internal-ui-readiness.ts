import 'server-only';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal UI execution readiness (Fase 3F)
//
// Confirms the environment is safe to run a REAL internal session of the hidden
// UI. Pure (env is injectable) and testable. Security checks are ERRORS for a
// deployed `preview`/`production` target and WARNINGS for a `local` dry-run.
//
// Posture this encodes:
//   • ARES_V6_INTERNAL_UI_ENABLED is the server gate (error if off — the UI
//     cannot run without it). NEXT_PUBLIC_ARES_V6_ENABLED is irrelevant to
//     access (surfaced as an informational note, never a pass criterion).
//   • In production the page also needs the deployment-protection ACK
//     (ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION) — but the ack is NOT real
//     protection: a human MUST verify Vercel auth / password / trusted IPs
//     (emitted as a required checklist item).
//
// The report contains ONLY booleans / status / mode-names — never secret values.
// ═══════════════════════════════════════════════════════════════

const MIN_LOG_SALT_LENGTH = 16;

/** True only for a real 64-char lowercase/uppercase SHA-256 hex digest. */
function isSha256Hex(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}

export type AresV6UiReadinessTarget = 'local' | 'preview' | 'production';
export type AresV6UiReadinessStatus = 'ok' | 'warning' | 'error';

export interface AresV6UiReadinessCheck {
  name: string;
  status: AresV6UiReadinessStatus;
  /** Human detail — NEVER includes a secret value. */
  detail: string;
}

export interface AresV6UiReadinessChecklistItem {
  id: string;
  label: string;
  required: boolean;
}

export interface AresV6UiReadinessOptions {
  target: AresV6UiReadinessTarget;
  /** Only the hidden read-only UI (no generate/feedback HTTP surface). */
  uiOnly?: boolean;
  /** The session intends to enable feedback writes. */
  withFeedback?: boolean;
  /** The session intends to persist generations. */
  withPersistence?: boolean;
  env?: NodeJS.ProcessEnv;
}

export interface AresV6UiReadinessResult {
  target: AresV6UiReadinessTarget;
  uiOnly: boolean;
  withFeedback: boolean;
  withPersistence: boolean;
  passed: boolean;
  errors: AresV6UiReadinessCheck[];
  warnings: AresV6UiReadinessCheck[];
  checks: AresV6UiReadinessCheck[];
  checklist: AresV6UiReadinessChecklistItem[];
  context: { nodeEnv: string; vercel: boolean };
}

function isTrue(value: string | undefined): boolean {
  return value === 'true';
}

/**
 * Evaluate UI execution readiness. Deployment protection is NOT checkable from
 * env alone, so it is emitted as a required human checklist item — never a pass.
 */
export function evaluateAresV6UiReadiness(opts: AresV6UiReadinessOptions): AresV6UiReadinessResult {
  const env = opts.env ?? process.env;
  const target = opts.target;
  const uiOnly = opts.uiOnly ?? false;
  const withFeedback = opts.withFeedback ?? false;
  const withPersistence = opts.withPersistence ?? false;

  // Security severity: a deployed target must be safe (error); local is a dry-run (warning).
  const deployed = target === 'preview' || target === 'production';
  const securityStatus: AresV6UiReadinessStatus = deployed ? 'error' : 'warning';

  const checks: AresV6UiReadinessCheck[] = [];
  const push = (name: string, status: AresV6UiReadinessStatus, detail: string): void => {
    checks.push({ name, status, detail });
  };

  // 1. The server gate — required for ALL targets (the UI cannot run without it).
  const uiEnabled = isTrue(env.ARES_V6_INTERNAL_UI_ENABLED);
  push(
    'internal_ui_enabled',
    uiEnabled ? 'ok' : 'error',
    uiEnabled ? 'true' : 'ARES_V6_INTERNAL_UI_ENABLED must be "true" to run the UI',
  );

  // 2. Production deployment-protection acknowledgement.
  if (target === 'production') {
    const ack = isTrue(env.ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION);
    push(
      'production_protection_ack',
      ack ? 'ok' : 'error',
      ack
        ? 'acknowledged (still verify real deployment protection — see checklist)'
        : 'ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION must be "true" in production',
    );
  } else {
    push('production_protection_ack', 'ok', 'n/a outside production');
  }

  // 3. NEXT_PUBLIC is NOT security — informational only.
  push(
    'next_public_flag_note',
    'ok',
    `NEXT_PUBLIC_ARES_V6_ENABLED=${isTrue(env.NEXT_PUBLIC_ARES_V6_ENABLED) ? 'true' : 'unset/false'} does NOT affect access (client hint only)`,
  );

  // 4. Evidence surface — recommended so the panel shows real evidence.
  const evidenceEnabled = isTrue(env.ARES_V6_LAB_EVIDENCE_ENABLED);
  push(
    'lab_evidence_enabled',
    evidenceEnabled ? 'ok' : deployed ? 'warning' : 'ok',
    evidenceEnabled ? 'true' : 'false (UI falls back to fixtures-only evidence)',
  );

  // 5. Generate API — only needed when the session is NOT ui-only.
  const apiEnabled = isTrue(env.ARES_V6_API_ENABLED);
  if (uiOnly) {
    push('api_enabled', 'ok', `not required (ui-only); value=${apiEnabled ? 'true' : 'false'}`);
  } else {
    push(
      'api_enabled',
      apiEnabled ? 'ok' : 'warning',
      apiEnabled ? 'true' : 'false (http lab runner / real generations unavailable)',
    );
  }

  // 6. Persistence — required when the session intends to persist.
  const persist = isTrue(env.ARES_V6_PERSIST_GENERATIONS);
  if (withPersistence) {
    push(
      'persist_generations',
      persist ? 'ok' : 'error',
      persist ? 'true' : 'ARES_V6_PERSIST_GENERATIONS must be "true" for a persistence session',
    );
  } else {
    push('persist_generations', 'ok', persist ? 'true (ensure intentional)' : 'false');
  }

  // 7. Feedback — off by default; required ON only when explicitly requested.
  const writeFeedback = isTrue(env.ARES_V6_WRITE_FEEDBACK);
  if (withFeedback) {
    push(
      'write_feedback',
      writeFeedback ? 'ok' : 'error',
      writeFeedback ? 'true' : 'ARES_V6_WRITE_FEEDBACK must be "true" for a feedback session',
    );
  } else {
    push(
      'write_feedback',
      writeFeedback ? 'warning' : 'ok',
      writeFeedback ? 'true but not requested — open feedback only after the first batch' : 'false (default; open later)',
    );
  }

  // Whether any internal HTTP/persistence surface will be live.
  const anyInternalSurface = (!uiOnly && apiEnabled) || withFeedback || withPersistence || evidenceEnabled;

  // 8. Rate-limit fail mode — must be closed on a deployed target.
  const failClosed = env.ARES_V6_RATE_LIMIT_FAIL_MODE === 'closed';
  push(
    'rate_limit_fail_mode',
    failClosed ? 'ok' : securityStatus,
    failClosed ? 'closed' : `expected closed (got ${env.ARES_V6_RATE_LIMIT_FAIL_MODE ?? 'unset'})`,
  );

  // 9. Proxy trust — must be strict on a deployed target.
  const proxyStrict = env.ARES_V6_PROXY_TRUST_MODE === 'strict';
  push(
    'proxy_trust_mode',
    proxyStrict ? 'ok' : securityStatus,
    proxyStrict ? 'strict' : `expected strict (got ${env.ARES_V6_PROXY_TRUST_MODE ?? 'unset'})`,
  );

  // 10. Log salt — needed once any internal surface is live (or on a deployed target).
  const salt = env.ARES_V6_LOG_SALT;
  const saltOk = typeof salt === 'string' && salt.length >= MIN_LOG_SALT_LENGTH;
  const saltNeeded = deployed || anyInternalSurface;
  push(
    'log_salt',
    saltOk ? 'ok' : saltNeeded ? securityStatus : 'warning',
    saltOk ? 'configured (>=16 chars)' : 'missing or too short',
  );

  // 11. Internal access token hash — needed when an internal API is reachable.
  const tokenHash = env.ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256;
  const tokenOk = isSha256Hex(tokenHash);
  const tokenNeeded = deployed && ((!uiOnly && apiEnabled) || withFeedback || withPersistence || evidenceEnabled);
  push(
    'internal_access_token_hash',
    tokenOk ? 'ok' : tokenNeeded ? 'error' : 'warning',
    tokenOk ? 'configured (64 hex)' : 'missing or not valid 64-hex SHA-256',
  );

  // 12. Database — required when persistence/evidence/metrics are involved.
  const metricsEnabled = isTrue(env.ARES_V6_LAB_METRICS_ENABLED);
  const dbNeeded = withPersistence || persist || evidenceEnabled || metricsEnabled;
  const hasDatabase = typeof env.DATABASE_URL === 'string' && env.DATABASE_URL.length > 0;
  push(
    'database_url',
    hasDatabase ? 'ok' : dbNeeded ? 'error' : 'warning',
    hasDatabase ? 'present' : 'required when persistence/evidence/metrics enabled',
  );

  // 13. Redis — required when any endpoint / rate limiter is active.
  const hasRedis = typeof env.REDIS_URL === 'string' && env.REDIS_URL.length > 0;
  push(
    'redis_url',
    hasRedis ? 'ok' : anyInternalSurface ? 'error' : 'warning',
    hasRedis ? 'present' : 'required when an endpoint / rate limiter is active',
  );

  const errors = checks.filter((c) => c.status === 'error');
  const warnings = checks.filter((c) => c.status === 'warning');

  const checklist: AresV6UiReadinessChecklistItem[] = [
    {
      id: 'deployment_protection',
      label:
        'Verifica protección de deployment (Vercel Authentication / Password / Trusted IPs) delante de /internal/. El flag ALLOW_PRODUCTION es solo un acuse, NO protección real.',
      required: deployed,
    },
    { id: 'route_hidden', label: 'Confirma que /internal/ares-v6 no aparece en nav, sitemap ni SEO.', required: true },
    { id: 'read_only_ui', label: 'Confirma que la UI no tiene botón de aplicar/aprobar/publicar propuestas.', required: true },
    { id: 'no_public_feedback', label: 'Confirma que el feedback NO está expuesto a usuarios.', required: true },
    { id: 'kill_switch', label: 'Confirma el kill switch: ARES_V6_INTERNAL_UI_ENABLED=false ⇒ 404 stealth.', required: true },
  ];

  return {
    target,
    uiOnly,
    withFeedback,
    withPersistence,
    passed: errors.length === 0,
    errors,
    warnings,
    checks,
    checklist,
    context: { nodeEnv: env.NODE_ENV ?? 'unset', vercel: env.VERCEL === '1' },
  };
}
