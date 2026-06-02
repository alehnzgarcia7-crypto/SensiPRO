import { createHash, timingSafeEqual } from 'crypto';

import { isAresV6LabMode } from './feature-flags';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal access guard (Fase 3C + 3C.1 P0 fix)
//
// P0: ANY active v6 surface (API, feedback, metrics, persistence, internal
// access) must require an internal token in production — not just
// ARES_V6_API_ENABLED. An explicit 'off'/'lab' mode is IGNORED (forced to
// 'header') when a surface is active in production, so a single mis-set flag
// can never expose a surface publicly. Token compared via SHA-256 +
// timingSafeEqual; NEVER stored or logged. Denials: stealth 404 (403 in lab).
// No session / NextAuth — transport-level lab gate, not user auth.
// ═══════════════════════════════════════════════════════════════

export type AresV6InternalAccessMode = 'off' | 'header' | 'lab';

export interface AresV6InternalAccessResult {
  ok: boolean;
  mode: AresV6InternalAccessMode;
  status?: number;
  code?: string;
  /** Non-sensitive reason for logs. Never contains the token. */
  reason?: string;
  /** Set when an explicit off/lab mode was overridden to header for safety. */
  unsafeModeIgnored?: 'off' | 'lab';
}

const TOKEN_HEADER = 'x-ares-v6-lab-token';
const SHA256_HEX_LENGTH = 64;

/** Flags whose activation makes an ARES v6 surface reachable. */
const ARES_V6_SURFACE_FLAGS = [
  'ARES_V6_API_ENABLED',
  'ARES_V6_WRITE_FEEDBACK',
  'ARES_V6_LAB_METRICS_ENABLED',
  'ARES_V6_PERSIST_GENERATIONS',
  'ARES_V6_INTERNAL_ACCESS_ENABLED',
] as const;

/** Names of the currently-enabled surfaces (for diagnostics; no secrets). */
export function getAresV6EnabledSurfaces(): string[] {
  return ARES_V6_SURFACE_FLAGS.filter((flag) => process.env[flag] === 'true');
}

export function isAresV6SurfaceEnabled(): boolean {
  return getAresV6EnabledSurfaces().length > 0;
}

/**
 * Internal access is REQUIRED when mode is explicitly 'header', internal access
 * is explicitly enabled, OR (the P0 fix) any surface is active in production.
 */
export function shouldRequireAresV6InternalAccess(): boolean {
  if (process.env.ARES_V6_INTERNAL_ACCESS_MODE === 'header') return true;
  if (process.env.ARES_V6_INTERNAL_ACCESS_ENABLED === 'true') return true;
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction && isAresV6SurfaceEnabled();
}

/** Effective mode: 'header' whenever a token is required; else explicit 'off' or 'lab'. */
export function getAresV6InternalAccessMode(): AresV6InternalAccessMode {
  if (shouldRequireAresV6InternalAccess()) return 'header';
  return process.env.ARES_V6_INTERNAL_ACCESS_MODE === 'off' ? 'off' : 'lab';
}

function extractToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.slice(7).trim();
    if (token.length > 0) return token;
  }
  const headerToken = request.headers.get(TOKEN_HEADER)?.trim();
  return headerToken && headerToken.length > 0 ? headerToken : null;
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Constant-time compare of two equal-length hex strings; false on length mismatch. */
function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function checkAresV6InternalAccess(request: Request): AresV6InternalAccessResult {
  const explicitMode = process.env.ARES_V6_INTERNAL_ACCESS_MODE;
  const requireToken = shouldRequireAresV6InternalAccess();
  const unsafeModeIgnored =
    requireToken && (explicitMode === 'off' || explicitMode === 'lab') ? explicitMode : undefined;

  if (!requireToken) {
    return { ok: true, mode: explicitMode === 'off' ? 'off' : 'lab' };
  }

  // Token required. Stealth 404 by default; 403 in lab mode.
  const deniedStatus = isAresV6LabMode() ? 403 : 404;
  const deny = (reason: string): AresV6InternalAccessResult => ({
    ok: false,
    mode: 'header',
    status: deniedStatus,
    code: deniedStatus === 404 ? 'NOT_FOUND' : 'FORBIDDEN',
    reason,
    ...(unsafeModeIgnored ? { unsafeModeIgnored } : {}),
  });

  const expectedHash = process.env.ARES_V6_INTERNAL_ACCESS_TOKEN_SHA256;
  if (!expectedHash || expectedHash.length !== SHA256_HEX_LENGTH) {
    // Misconfigured (no/invalid hash) → cannot validate → deny. Never open.
    return deny('token_hash_unset');
  }

  const token = extractToken(request);
  if (!token) return deny('token_missing');

  if (!timingSafeHexEqual(sha256Hex(token), expectedHash.toLowerCase())) {
    return deny('token_mismatch');
  }

  return { ok: true, mode: 'header', ...(unsafeModeIgnored ? { unsafeModeIgnored } : {}) };
}
