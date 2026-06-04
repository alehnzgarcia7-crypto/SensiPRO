import {
  verifyAresV6InternalEnv,
  type AresV6PreflightTarget,
} from '../src/lib/ares-v6/internal-env-preflight';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal environment preflight CLI (Fase 3C.1)
//
//   npm run ares:v6:verify-env -- --json
//   npm run ares:v6:verify-env -- --strict --target preview
// Prints ONLY status (booleans / mode names) — never secret values.
// Exit 1 in --strict when there are errors; 0 otherwise.
// ═══════════════════════════════════════════════════════════════

function parseTarget(argv: readonly string[]): AresV6PreflightTarget {
  const index = argv.indexOf('--target');
  return index !== -1 && argv[index + 1] === 'preview' ? 'preview' : 'local';
}

const argv = process.argv.slice(2);
const asJson = argv.includes('--json') || argv.includes('--for-workflow');
const strict = argv.includes('--strict');
const result = verifyAresV6InternalEnv({ target: parseTarget(argv), env: process.env });

if (asJson) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  process.stdout.write(
    `ARES v6 internal env preflight (target=${result.target}): ` +
      `${result.passed ? 'PASS' : 'FAIL'} — ${result.errors} error(s), ${result.warnings} warning(s)\n`,
  );
  for (const check of result.checks) {
    process.stdout.write(`  [${check.status.toUpperCase()}] ${check.name}: ${check.detail}\n`);
  }
}

if (strict && !result.passed) {
  process.exit(1);
}
process.exit(0);
