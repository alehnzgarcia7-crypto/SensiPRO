import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// ═══════════════════════════════════════════════════════════════
// Fase 3F.1 — manual review-session workflow safety. Static assertions that the
// workflow stays manual-only, uses the protected environment, and passes
// operator inputs ONLY as quoted bash arrays (no bash -c / eval / unquoted
// `-- $VAR` word-splitting → no command-injection surface).
// ═══════════════════════════════════════════════════════════════

const source = readFileSync(
  join(process.cwd(), '.github/workflows/ares-v6-internal-review-session.yml'),
  'utf8',
);

describe('review-session workflow safety', () => {
  it('is workflow_dispatch only (no push / pull_request triggers)', () => {
    expect(source).toMatch(/workflow_dispatch:/);
    expect(source).not.toMatch(/^\s*push:/m);
    expect(source).not.toMatch(/^\s*pull_request:/m);
  });

  it('runs in the protected environment', () => {
    expect(source).toMatch(/environment:\s*ares-v6-internal-lab/);
  });

  it('uses no re-parsing shell (no bash -c, no eval)', () => {
    expect(source).not.toContain('bash -c');
    expect(source).not.toMatch(/\beval\b/);
  });

  it('passes inputs only as quoted bash arrays (no unquoted -- $VAR)', () => {
    // The dangerous form `npm run X -- $ARGS` (string word-splitting) must be gone.
    expect(source).not.toMatch(/--\s+\$[A-Z_]+/);
    // The safe form `"${SOME_ARGS[@]}"` must be present.
    expect(source).toMatch(/\$\{[A-Z_]+\[@\]\}"/);
  });

  // ── Fase 3G additions ──
  it('runs the target-url-check / execution-mode step', () => {
    expect(source).toMatch(/ares:v6:target-check/);
    expect(source).toMatch(/--emit-mode ares-v6-real-execution-mode\.json/);
  });

  it('runs the real-evidence validation gate', () => {
    expect(source).toMatch(/ares:v6:validate-real-evidence/);
  });

  it('keeps feedback OFF by default', () => {
    expect(source).toMatch(/enableFeedback:[\s\S]*?default: false/);
  });

  it('keeps persistGenerations ON by default', () => {
    expect(source).toMatch(/persistGenerations:[\s\S]*?default: true/);
  });

  it('uploads the new 3G artifacts', () => {
    expect(source).toMatch(/ares-v6-real-execution-mode\.json/);
    expect(source).toMatch(/ares-v6-real-evidence-validation\.json/);
  });
});
