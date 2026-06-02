import { createHash, timingSafeEqual } from 'crypto';

import { isAresV6LabMode } from './feature-flags';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal access guard (Fase 3C)
//
// Prevents ARES_V6_API_ENABLED=true from accidentally making the endpoint
// public. When required (production with the API on, or explicitly enabled),
// a strong bearer/header token is mandatory; it is compared against a SHA-256
// hash with timingSafeEqual. The raw token is NEVER stored or logged. Denials
// are stealth 404 by default, 403 in lab mode.
//
// No session / NextAuth — this is a transport-level lab gate, not user auth.
// ═══════════════════════════════════════════════════════════════

export type AresV6InternalAccessMode = 'off' | 'header' | 'lab';

export interface AresV6InternalAccessResult {
  ok: boolean;
  mode: AresV6InternalAccessMode;
  status?: number;
  code?: string;
  /** Non-sensitive reason for logs. Never contains the token. */
  reason?: string;
}

const TOKEN_HEADER = 'x-ares-v6-lab-token';
const SHA256_HEX_LENGTH = 64;

export function getAresV6InternalAccessMode(): AresV6InternalAccessMode {
  const explicit = process.env.ARES_V6_INTERNAL_ACCESS_MODE;
  if (explicit === 'off' || explicit === 'header' || explicit === 'lab') return explicit;
  if (process.env.ARES_V6_INTERNAL_ACCESS_ENABLED === 'true') return 'header';
  const isProduction = process.env.NODE_ENV === 'production';
  const apiEnabled = process.env.ARES_V6_API_ENABLED === 'true';
  return isProduction && apiEnabled ? 'header' : 'lab';
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
  const mode = getAresV6InternalAccessMode();

  if (mode === 'off' || mode === 'lab') {
    return { ok: true, mode };
  }

  // mode === 'header': require a valid token. Stealth 404 by default; 403 in lab mode.
  const deniedStatus = isAresV6LabMode() ? 403 : 404;
  const deny = (reason: string): AresV6InternalAccessResult => ({
    ok: false,
    mode,
    status: deniedStatus,
    code: deniedStatus === 404 ? 'NOT_FOUND' : 'FORBIDDEN',
    reason,
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

  return { ok: true, mode };
}
