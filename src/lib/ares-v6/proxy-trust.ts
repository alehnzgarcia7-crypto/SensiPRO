// ═══════════════════════════════════════════════════════════════
// ARES v6 — Proxy trust policy
//
// x-forwarded-for is client-spoofable. We never trust it blindly: the trust
// level depends on an explicit mode. Platform-injected headers (Vercel's
// x-vercel-forwarded-for) are trusted; arbitrary x-forwarded-for is trusted
// only in 'vercel'/'lab' mode, and rejected in 'strict' mode. Untrusted IPs
// fall back to the stricter "unknown" rate-limit buckets — they never grant
// the higher per-IP budget, and the raw value is never logged.
// ═══════════════════════════════════════════════════════════════

export type AresV6ProxyTrustMode = 'vercel' | 'strict' | 'lab';
export type AresV6ClientIpSource = 'VERCEL' | 'FORWARDED_FOR' | 'REAL_IP' | 'NONE';

export interface AresV6ClientIpResult {
  ip: string | null;
  source: AresV6ClientIpSource;
  trusted: boolean;
}

const IP_PATTERN = /^[0-9a-fA-F:.]{3,45}$/;

function isValidIp(value: string | null | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < 3 || trimmed.length > 45) return false;
  if (!IP_PATTERN.test(trimmed)) return false;
  // Must look like an IPv4 (dot) or IPv6 (colon) literal.
  return trimmed.includes('.') || trimmed.includes(':');
}

/** Left-most (client) hop of a comma-separated forwarding header, validated. */
function firstHop(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const first = headerValue.split(',')[0]?.trim();
  return isValidIp(first) ? first : null;
}

export function getProxyTrustMode(): AresV6ProxyTrustMode {
  const explicit = process.env.ARES_V6_PROXY_TRUST_MODE;
  if (explicit === 'vercel' || explicit === 'strict' || explicit === 'lab') return explicit;
  if (process.env.VERCEL === '1') return 'vercel';
  return 'lab';
}

/** Whether a header source can be trusted under a given mode. */
export function isTrustedProxyHeaderSource(
  source: AresV6ClientIpSource,
  mode: AresV6ProxyTrustMode,
): boolean {
  if (source === 'VERCEL') return true; // platform-injected, not client-spoofable
  if (source === 'NONE') return false;
  if (mode === 'strict') return false; // only the platform header is trusted
  // lab + vercel: accept forwarding headers (local/dev or behind a known proxy)
  return source === 'FORWARDED_FOR' || source === 'REAL_IP';
}

/**
 * Resolve the client IP and how much to trust it. The IP may be returned with
 * `trusted: false` (e.g. spoofable x-forwarded-for in strict mode); callers
 * must treat untrusted IPs as "unknown" and must never hash/log the raw value.
 */
export function getTrustedClientIp(request: Request): AresV6ClientIpResult {
  const mode = getProxyTrustMode();

  const vercelIp = firstHop(request.headers.get('x-vercel-forwarded-for'));
  if (vercelIp) return { ip: vercelIp, source: 'VERCEL', trusted: true };

  const forwardedFor = firstHop(request.headers.get('x-forwarded-for'));
  if (forwardedFor) {
    return { ip: forwardedFor, source: 'FORWARDED_FOR', trusted: isTrustedProxyHeaderSource('FORWARDED_FOR', mode) };
  }

  const realIpHeader = request.headers.get('x-real-ip');
  if (isValidIp(realIpHeader)) {
    return { ip: realIpHeader.trim(), source: 'REAL_IP', trusted: isTrustedProxyHeaderSource('REAL_IP', mode) };
  }

  return { ip: null, source: 'NONE', trusted: false };
}
