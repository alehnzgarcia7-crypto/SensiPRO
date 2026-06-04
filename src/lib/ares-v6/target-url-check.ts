// ═══════════════════════════════════════════════════════════════
// ARES v6 — Target URL contract for the 3G real-evidence session
//
// Pure validation of the operator-supplied `targetUrl` (the protected preview
// the http lab will hit to persist REAL generations). Tooling-only: never
// imported by a React component, so it carries NO `server-only` marker.
//
// Hard rules (errors): must be HTTPS, never localhost/loopback, never embed
// credentials (user:pass@), never carry a secret-looking query/fragment.
// Reachability is a SEPARATE best-effort probe surfaced as WARNINGS — a Vercel
// protected preview answers 401/403 to an anonymous probe (that IS the
// protection), so a probe can never be the gate. Deployment protection stays a
// HUMAN checklist (see internal-ui-readiness + the 3G operator guide).
//
// Output is redaction-first: the raw URL is never echoed — only a redacted
// scheme://host/path with the query masked. No secrets ever printed.
// ═══════════════════════════════════════════════════════════════

/** Loopback / wildcard hosts that can never be a real protected preview. */
const FORBIDDEN_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);

/** Query/fragment keys that must never travel in a shared targetUrl. */
const SENSITIVE_QUERY_KEYS = [
  'token',
  'access_token',
  'accesstoken',
  'id_token',
  'refresh_token',
  'key',
  'api_key',
  'apikey',
  'secret',
  'client_secret',
  'password',
  'passwd',
  'pwd',
  'auth',
  'authorization',
  'bearer',
  'session',
  'sessionid',
  'sid',
  'sig',
  'signature',
];

const SENSITIVE_FRAGMENT_RE = /token|secret|key|password|auth|bearer|session|sig/i;

export interface AresV6TargetUrlCheckOptions {
  /** When true, an ABSENT targetUrl is an error (real-evidence mode needs one). */
  requireForRealMode?: boolean;
}

export interface AresV6TargetUrlCheckResult {
  present: boolean;
  passed: boolean;
  errors: string[];
  warnings: string[];
  /** Safe-to-log form: scheme://host/path with credentials stripped + query masked. NEVER the raw value. */
  redactedTargetUrl: string | null;
}

/**
 * Build a safe-to-log representation: scheme + host (with port) + path, never
 * the credentials, never the query VALUES. Returns null if the URL is unparseable.
 */
export function redactAresV6TargetUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const hasQuery = [...url.searchParams.keys()].length > 0;
  const path = url.pathname === '/' ? '' : url.pathname;
  // url.host carries host:port; username/password are intentionally dropped.
  return `${url.protocol}//${url.host}${path}${hasQuery ? '?[redacted]' : ''}${url.hash ? '#[redacted]' : ''}`;
}

/**
 * Validate the targetUrl string. Pure (no network). Reachability is a separate
 * best-effort probe (see `probeAresV6TargetUrl`).
 */
export function checkAresV6TargetUrl(
  raw: string | null | undefined,
  options: AresV6TargetUrlCheckOptions = {},
): AresV6TargetUrlCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const value = (raw ?? '').trim();
  const present = value.length > 0;

  if (!present) {
    if (options.requireForRealMode) {
      errors.push('targetUrl es obligatorio para el modo de evidencia real (3G). Sin él NO hay evidencia real.');
    } else {
      warnings.push('Sin targetUrl: modo dry-run-local. NO produce evidencia real (evidenceFixtureCoverage seguirá en 0).');
    }
    return { present, passed: errors.length === 0, errors, warnings, redactedTargetUrl: null };
  }

  let url: URL | null = null;
  try {
    url = new URL(value);
  } catch {
    url = null;
  }
  if (!url) {
    errors.push('targetUrl no es una URL válida.');
    return { present, passed: false, errors, warnings, redactedTargetUrl: null };
  }

  const redactedTargetUrl = redactAresV6TargetUrl(value);

  if (url.protocol !== 'https:') {
    errors.push('targetUrl debe usar HTTPS.');
  }

  const host = url.hostname.toLowerCase();
  if (FORBIDDEN_HOSTS.has(host) || host.endsWith('.localhost')) {
    errors.push(`targetUrl no puede apuntar a un host local/loopback (${url.hostname}).`);
  }

  if (url.username !== '' || url.password !== '') {
    errors.push('targetUrl no debe incluir credenciales embebidas (user:pass@) en la URL.');
  }

  const offendingKeys = [...url.searchParams.keys()]
    .map((key) => key.toLowerCase())
    .filter((key) => SENSITIVE_QUERY_KEYS.includes(key));
  if (offendingKeys.length > 0) {
    errors.push(`targetUrl no debe llevar parámetros sensibles en la query (${[...new Set(offendingKeys)].join(', ')}).`);
  }

  if (url.hash && SENSITIVE_FRAGMENT_RE.test(url.hash)) {
    errors.push('targetUrl no debe llevar datos sensibles en el fragmento (#...).');
  }

  return { present, passed: errors.length === 0, errors, warnings, redactedTargetUrl };
}

// ── Reachability probe (best-effort; WARNINGS only — never the gate) ─────────

export interface AresV6TargetUrlProbeResult {
  attempted: boolean;
  reachable: boolean;
  status: number | null;
  /** Human note — never echoes the raw URL, headers, cookies or body. */
  note: string;
}

/**
 * Best-effort reachability probe. A protected preview answers 401/403 to an
 * anonymous request (expected). Network failure → reachable:false (a WARNING for
 * the caller, never a hard gate). Never logs the URL / headers / body.
 */
export async function probeAresV6TargetUrl(
  rawUrl: string,
  fetchImpl: typeof fetch | undefined = typeof fetch === 'function' ? fetch : undefined,
  timeoutMs = 5000,
): Promise<AresV6TargetUrlProbeResult> {
  if (!fetchImpl) {
    return { attempted: false, reachable: false, status: null, note: 'fetch no disponible en este runtime.' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(rawUrl, { method: 'GET', redirect: 'manual', signal: controller.signal });
    const status = response.status;
    let note: string;
    if (status === 401 || status === 403) {
      note = `responde ${status}: requiere autenticación — consistente con deployment protection.`;
    } else if (status >= 300 && status < 400) {
      note = `responde ${status}: redirección (posible gateway de autenticación).`;
    } else if (status >= 200 && status < 300) {
      note = `responde ${status}: 2xx sin autenticación — verifica MANUALMENTE que /internal/ esté protegido.`;
    } else {
      note = `responde con status ${status}.`;
    }
    return { attempted: true, reachable: true, status, note };
  } catch {
    return { attempted: true, reachable: false, status: null, note: 'no respondió (timeout / error de red).' };
  } finally {
    clearTimeout(timer);
  }
}
