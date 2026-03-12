/**
 * Session & visitor identity management
 *
 * - visitor_id: Persists across sessions (localStorage)
 * - session_id: Per-session (sessionStorage, 30 min timeout)
 * - user_id: From NextAuth session when available
 */

const VISITOR_KEY = 'sp_visitor_id';
const SESSION_KEY = 'sp_session_id';
const SESSION_TS_KEY = 'sp_session_ts';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}_${rand}`;
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr';

  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = generateId('v');
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return generateId('v');
  }
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';

  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    const lastTs = sessionStorage.getItem(SESSION_TS_KEY);
    const now = Date.now();

    // Reuse session if within timeout
    if (existing && lastTs && (now - parseInt(lastTs, 10)) < SESSION_TIMEOUT_MS) {
      sessionStorage.setItem(SESSION_TS_KEY, now.toString());
      return existing;
    }

    // New session
    const id = generateId('s');
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_TS_KEY, now.toString());
    return id;
  } catch {
    return generateId('s');
  }
}

/** Touch session to prevent timeout */
export function touchSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_TS_KEY, Date.now().toString());
  } catch {
    // Ignore
  }
}
