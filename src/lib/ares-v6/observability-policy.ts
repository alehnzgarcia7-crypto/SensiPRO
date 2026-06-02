// ═══════════════════════════════════════════════════════════════
// ARES v6 — Observability config policy (log salt)
//
// The IP/UA hash salt must not silently fall back to a public default once the
// API is serving real traffic in production: a known salt makes hashes
// correlatable. When the v6 API is enabled in production a strong salt is
// REQUIRED; otherwise the route fails closed (503) before processing.
// ═══════════════════════════════════════════════════════════════

const MIN_LOG_SALT_LENGTH = 16;
const DEFAULT_LAB_SALT = 'ares-v6-lab-salt';

export interface AresV6ConfigError {
  code: string;
  message: string;
}

export function isAresV6LogSaltStrong(): boolean {
  const salt = process.env.ARES_V6_LOG_SALT;
  return typeof salt === 'string' && salt.length >= MIN_LOG_SALT_LENGTH;
}

/** The salt used for log hashing. Lab default only when a strong salt is not required. */
export function getAresV6LogSalt(): string {
  return process.env.ARES_V6_LOG_SALT ?? DEFAULT_LAB_SALT;
}

/**
 * Validate runtime config required before serving v6. Returns a config error
 * (→ 503) or null. The message is generic and NEVER contains the salt value.
 */
export function checkAresV6RuntimeConfig(): AresV6ConfigError | null {
  const isProduction = process.env.NODE_ENV === 'production';
  const apiEnabled = process.env.ARES_V6_API_ENABLED === 'true';

  if (isProduction && apiEnabled && !isAresV6LogSaltStrong()) {
    return {
      code: 'CONFIGURATION_ERROR',
      message: 'El servicio no está configurado correctamente.',
    };
  }

  return null;
}
