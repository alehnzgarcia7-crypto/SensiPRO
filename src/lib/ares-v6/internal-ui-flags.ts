import 'server-only';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal UI feature flags (Fase 3E)
//
// Flags that gate the HIDDEN internal read-only lab UI. Read at call time (not
// module load) so they flip without a restart.
//
// SECURITY MODEL (OWASP + research basis):
//   • ARES_V6_INTERNAL_UI_ENABLED  → the ONLY server-side gate for the route.
//   • NEXT_PUBLIC_ARES_V6_ENABLED  → a CLIENT visibility/nav HINT only. It is
//     shipped to the browser, so it can NEVER be treated as access control.
//   • The other surface flags (evidence/api/metrics) are read here only to
//     SHOW the operator which backend surfaces are live — never to grant access.
//
// This module never reads or returns secrets (no tokens, no hashes, no URLs).
// ═══════════════════════════════════════════════════════════════

/** A flag is enabled only when its env var is exactly the string "true". */
function readBooleanFlag(name: string): boolean {
  return process.env[name] === 'true';
}

/**
 * The single server-side gate for the hidden internal UI route. When false the
 * route MUST 404 (see {@link import('./internal-ui-access')}). Never derived
 * from a NEXT_PUBLIC_* value.
 */
export function isAresV6InternalUiEnabled(): boolean {
  return readBooleanFlag('ARES_V6_INTERNAL_UI_ENABLED');
}

/**
 * Whether a (still non-existent) nav hint MAY be shown to the client. This is a
 * presentation hint ONLY: it combines the server gate with the public flag, but
 * the public flag alone can never satisfy it AND it never protects the route.
 * Phase 3E ships NO public nav link regardless of this value.
 */
export function shouldShowAresV6InternalUiLink(): boolean {
  // Server gate is required even for a hint; the public flag can only suppress.
  return isAresV6InternalUiEnabled() && readBooleanFlag('NEXT_PUBLIC_ARES_V6_ENABLED');
}

export type AresV6InternalUiMode = 'OFF' | 'LAB' | 'PRODUCTION';

/**
 * Effective UI mode purely from flag + NODE_ENV (the access layer applies the
 * production deployment-protection acknowledgement on top of this).
 *   OFF        → server flag off (route 404s).
 *   LAB        → enabled outside production (dev/test/preview lab).
 *   PRODUCTION → enabled in production (still requires protection ack to render).
 */
export function getAresV6InternalUiMode(): AresV6InternalUiMode {
  if (!isAresV6InternalUiEnabled()) return 'OFF';
  return process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'LAB';
}

/** Non-sensitive snapshot of the flags relevant to the internal UI (no secrets). */
export interface AresV6InternalUiFlagState {
  internalUiEnabled: boolean;
  publicHintEnabled: boolean;
  apiEnabled: boolean;
  labEvidenceEnabled: boolean;
  labMetricsEnabled: boolean;
  mode: AresV6InternalUiMode;
}

/** Read every flag the dashboard surfaces. Pure read of booleans — never secrets. */
export function getAresV6InternalUiFlagState(): AresV6InternalUiFlagState {
  return {
    internalUiEnabled: isAresV6InternalUiEnabled(),
    publicHintEnabled: readBooleanFlag('NEXT_PUBLIC_ARES_V6_ENABLED'),
    apiEnabled: readBooleanFlag('ARES_V6_API_ENABLED'),
    labEvidenceEnabled: readBooleanFlag('ARES_V6_LAB_EVIDENCE_ENABLED'),
    labMetricsEnabled: readBooleanFlag('ARES_V6_LAB_METRICS_ENABLED'),
    mode: getAresV6InternalUiMode(),
  };
}
