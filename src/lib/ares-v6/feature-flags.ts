// ═══════════════════════════════════════════════════════════════
// ARES v6 — Feature flags (backend only)
//
// These flags keep the v6 backend OFF by default. They are read at call
// time (not module load) so they can flip without a restart, and they never
// use NEXT_PUBLIC_* — v6 must not be exposed to the client through env.
// ═══════════════════════════════════════════════════════════════

/** A flag is enabled only when its env var is exactly the string "true". */
function readBooleanFlag(name: string): boolean {
  return process.env[name] === 'true';
}

/** Enables the isolated POST /api/generate/v6 endpoint. Default: false. */
export function isAresV6ApiEnabled(): boolean {
  return readBooleanFlag('ARES_V6_API_ENABLED');
}

/** Enables experimental lab-mode output for internal users. Default: false. */
export function isAresV6LabMode(): boolean {
  return readBooleanFlag('ARES_V6_LAB_MODE');
}

/** Enables persisting v6 feedback. Not used yet in Phase 2. Default: false. */
export function isAresV6FeedbackWriteEnabled(): boolean {
  return readBooleanFlag('ARES_V6_WRITE_FEEDBACK');
}
