import 'server-only';

import { notFound } from 'next/navigation';

import { getAresV6EnabledSurfaces } from './internal-access';
import {
  getAresV6InternalUiFlagState,
  getAresV6InternalUiMode,
  isAresV6InternalUiEnabled,
  type AresV6InternalUiFlagState,
  type AresV6InternalUiMode,
} from './internal-ui-flags';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal UI access guard (Fase 3E)
//
// Protects the hidden Server-Component route. Posture (research basis §2):
//   1. Browser page loads can NOT carry the internal lab token safely, so the
//      page does NOT use the header-token guard (that stays for the API).
//   2. The route is gated by a SERVER env flag (ARES_V6_INTERNAL_UI_ENABLED).
//   3. In production, rendering additionally requires an explicit acknowledgement
//      that deployment-level protection (Vercel password / protected preview)
//      sits in front: ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION === 'true'. Without it
//      the page 404s — we never lean on obscurity, and we never invent auth.
//
// READ-ONLY. No NextAuth, no token, no secrets returned. notFound() is injected
// so the decision is unit-testable without the Next runtime.
// ═══════════════════════════════════════════════════════════════

/** Why the internal UI was allowed or denied (no secrets, safe for logs/UI). */
export type AresV6InternalUiAccessReason =
  | 'OK'
  | 'UI_FLAG_OFF'
  | 'PRODUCTION_PROTECTION_REQUIRED';

const PRODUCTION_PROTECTION_FLAG = 'ARES_V6_INTERNAL_UI_ALLOW_PRODUCTION';

export interface AresV6InternalUiAccessState {
  ok: boolean;
  reason: AresV6InternalUiAccessReason;
  mode: AresV6InternalUiMode;
  /** NODE_ENV at evaluation time (for diagnostics; never a secret). */
  environment: string;
  /** True only when the operator acknowledged deployment protection in prod. */
  productionProtectionAcknowledged: boolean;
}

function isProtectionAcknowledged(): boolean {
  return process.env[PRODUCTION_PROTECTION_FLAG] === 'true';
}

/**
 * Pure access decision (reads env, never throws). The route uses
 * {@link assertCanViewAresV6InternalUi}; tests assert this directly.
 */
export function getAresV6InternalUiAccessState(): AresV6InternalUiAccessState {
  const mode = getAresV6InternalUiMode();
  const environment = process.env.NODE_ENV ?? 'development';
  const productionProtectionAcknowledged = isProtectionAcknowledged();

  if (!isAresV6InternalUiEnabled()) {
    return { ok: false, reason: 'UI_FLAG_OFF', mode, environment, productionProtectionAcknowledged };
  }

  // Enabled in production but deployment protection not acknowledged → deny.
  if (mode === 'PRODUCTION' && !productionProtectionAcknowledged) {
    return {
      ok: false,
      reason: 'PRODUCTION_PROTECTION_REQUIRED',
      mode,
      environment,
      productionProtectionAcknowledged,
    };
  }

  return { ok: true, reason: 'OK', mode, environment, productionProtectionAcknowledged };
}

/**
 * Assert the caller may view the internal UI; otherwise render the 404.
 * `deny` is injectable (defaults to Next's {@link notFound}) so the guard can be
 * unit-tested without the Next runtime. Returns the access state on success.
 */
export function assertCanViewAresV6InternalUi(deny: () => never = notFound): AresV6InternalUiAccessState {
  const state = getAresV6InternalUiAccessState();
  if (!state.ok) {
    // Stealth: a denied internal UI is indistinguishable from a missing route.
    deny();
  }
  return state;
}

/** Non-sensitive operator context for the dashboard header. No token, ever. */
export interface AresV6InternalUiOperatorContext {
  mode: AresV6InternalUiMode;
  environment: string;
  productionProtectionAcknowledged: boolean;
  /** Names of the v6 backend surfaces currently live (flag names only). */
  enabledSurfaces: string[];
  flags: AresV6InternalUiFlagState;
}

/**
 * Build the operator context when access is allowed, else null. Surfaces are
 * reported by FLAG NAME only (via {@link getAresV6EnabledSurfaces}) — no tokens,
 * hashes, IPs or URLs cross this boundary.
 */
export function maybeGetAresV6InternalUiOperatorContext(): AresV6InternalUiOperatorContext | null {
  const state = getAresV6InternalUiAccessState();
  if (!state.ok) return null;

  return {
    mode: state.mode,
    environment: state.environment,
    productionProtectionAcknowledged: state.productionProtectionAcknowledged,
    enabledSurfaces: getAresV6EnabledSurfaces(),
    flags: getAresV6InternalUiFlagState(),
  };
}
