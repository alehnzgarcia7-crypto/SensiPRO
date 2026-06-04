import {
  evaluateAresV6UiReadiness,
  type AresV6UiReadinessTarget,
} from '../src/lib/ares-v6/internal-ui-readiness';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal UI execution readiness CLI (Fase 3F). INTERNAL ONLY.
//
//   npm run ares:v6:ui-readiness -- --json --target local
//   npm run ares:v6:ui-readiness -- --strict --target preview --ui-only
//   npm run ares:v6:ui-readiness -- --strict --target production --with-persistence
// Prints ONLY status (booleans / mode names) — never secret values.
// Exit 1 in --strict when there are errors; 0 otherwise.
// ═══════════════════════════════════════════════════════════════

function parseTarget(argv: readonly string[]): AresV6UiReadinessTarget {
  const index = argv.indexOf('--target');
  const value = index !== -1 ? argv[index + 1] : undefined;
  if (value === 'preview' || value === 'production') return value;
  return 'local';
}

const argv = process.argv.slice(2);
const asJson = argv.includes('--json') || argv.includes('--for-workflow');
const strict = argv.includes('--strict');

const result = evaluateAresV6UiReadiness({
  target: parseTarget(argv),
  uiOnly: argv.includes('--ui-only'),
  withFeedback: argv.includes('--with-feedback'),
  withPersistence: argv.includes('--with-persistence'),
  env: process.env,
});

if (asJson) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  process.stdout.write(
    `ARES v6 UI readiness (target=${result.target}, ui-only=${result.uiOnly}): ` +
      `${result.passed ? 'PASS' : 'FAIL'} — ${result.errors.length} error(s), ${result.warnings.length} warning(s)\n`,
  );
  for (const check of result.checks) {
    process.stdout.write(`  [${check.status.toUpperCase()}] ${check.name}: ${check.detail}\n`);
  }
  process.stdout.write('\n  Checklist humano (verificación manual):\n');
  for (const item of result.checklist) {
    process.stdout.write(`  [ ] ${item.required ? '(obligatorio) ' : ''}${item.label}\n`);
  }
}

if (strict && !result.passed) {
  process.exit(1);
}
process.exit(0);
