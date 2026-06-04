// ═══════════════════════════════════════════════════════════════
// ARES v6 — Rate limit policy (limits + fail mode)
//
// Centralises configurable limits and the fail posture. Invalid env values
// fall back to safe defaults. Fail mode separates lab (fail-open: availability
// over blocking) from beta/prod (fail-closed: block when the store is down).
// ═══════════════════════════════════════════════════════════════

export type AresV6RateLimitFailMode = 'open' | 'closed';

export interface AresV6RateLimitConfig {
  windowSeconds: number;
  ipGlobalLimit: number;
  ipDeviceLimit: number;
  unknownGlobalLimit: number;
  unknownDeviceLimit: number;
  failMode: AresV6RateLimitFailMode;
}

export const ARES_V6_RATE_LIMIT_DEFAULTS = {
  windowSeconds: 60,
  ipGlobalLimit: 60,
  ipDeviceLimit: 20,
  unknownGlobalLimit: 12,
  unknownDeviceLimit: 8,
} as const;

function parsePositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

/**
 * Resolve the fail mode. Explicit env wins; otherwise production with the API
 * enabled defaults to 'closed' (auditable posture), everything else 'open'.
 */
export function getAresV6RateLimitFailMode(): AresV6RateLimitFailMode {
  const explicit = process.env.ARES_V6_RATE_LIMIT_FAIL_MODE;
  if (explicit === 'open' || explicit === 'closed') return explicit;
  const isProduction = process.env.NODE_ENV === 'production';
  const apiEnabled = process.env.ARES_V6_API_ENABLED === 'true';
  return isProduction && apiEnabled ? 'closed' : 'open';
}

export function getAresV6RateLimitConfig(): AresV6RateLimitConfig {
  return {
    windowSeconds: parsePositiveInt('ARES_V6_RATE_LIMIT_WINDOW_SECONDS', ARES_V6_RATE_LIMIT_DEFAULTS.windowSeconds),
    ipGlobalLimit: parsePositiveInt('ARES_V6_RATE_LIMIT_IP_GLOBAL_LIMIT', ARES_V6_RATE_LIMIT_DEFAULTS.ipGlobalLimit),
    ipDeviceLimit: parsePositiveInt('ARES_V6_RATE_LIMIT_IP_DEVICE_LIMIT', ARES_V6_RATE_LIMIT_DEFAULTS.ipDeviceLimit),
    unknownGlobalLimit: parsePositiveInt(
      'ARES_V6_RATE_LIMIT_UNKNOWN_GLOBAL_LIMIT',
      ARES_V6_RATE_LIMIT_DEFAULTS.unknownGlobalLimit,
    ),
    unknownDeviceLimit: parsePositiveInt(
      'ARES_V6_RATE_LIMIT_UNKNOWN_DEVICE_LIMIT',
      ARES_V6_RATE_LIMIT_DEFAULTS.unknownDeviceLimit,
    ),
    failMode: getAresV6RateLimitFailMode(),
  };
}
