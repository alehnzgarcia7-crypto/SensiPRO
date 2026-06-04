import { writeFileSync } from 'node:fs';

import {
  resolveAresV6RealExecutionMode,
  type AresV6RealExecutionMode,
} from '../src/lib/ares-v6/real-evidence-validation';
import {
  checkAresV6TargetUrl,
  probeAresV6TargetUrl,
  type AresV6TargetUrlProbeResult,
} from '../src/lib/ares-v6/target-url-check';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Target URL contract check + execution-mode emitter (Fase 3G).
// INTERNAL ONLY.
//
//   npm run ares:v6:target-check -- --target-url https://example.com --json
//   npm run ares:v6:target-check -- --target-url "$URL" --for-workflow --probe \
//       --emit-mode ares-v6-real-execution-mode.json --output ares-v6-target-url-check.json
//
// Validates the protected-preview targetUrl (HTTPS, no localhost, no creds, no
// secret query) and writes the real-execution-mode descriptor the 3G workflow
// uploads as an artifact. Prints ONLY a redacted URL — never the raw value,
// never a secret. Exit 1 in --strict/--for-workflow when validation fails.
// ═══════════════════════════════════════════════════════════════

interface CliOptions {
  targetUrl: string | null;
  json: boolean;
  output: string | null;
  emitMode: string | null;
  strict: boolean;
  requireForRealMode: boolean;
  probe: boolean;
  persistGenerations: boolean;
  feedbackEnabled: boolean;
}

function envBool(value: string | undefined): boolean {
  return value === 'true';
}

function parseArgs(argv: readonly string[], env: NodeJS.ProcessEnv): CliOptions {
  const options: CliOptions = {
    targetUrl: env.ARES_V6_TARGET_URL ?? env.INPUT_TARGET_URL ?? null,
    json: false,
    output: null,
    emitMode: null,
    strict: false,
    requireForRealMode: false,
    probe: false,
    persistGenerations: envBool(env.ARES_V6_PERSIST_GENERATIONS),
    feedbackEnabled: envBool(env.ARES_V6_WRITE_FEEDBACK),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--target-url':
        options.targetUrl = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--output':
      case '--out':
        options.output = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--emit-mode':
        options.emitMode = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--json':
      case '--for-workflow':
        options.json = true;
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--require':
      case '--require-real':
        options.requireForRealMode = true;
        break;
      case '--probe':
        options.probe = true;
        break;
      case '--persist':
        options.persistGenerations = true;
        break;
      case '--no-persist':
        options.persistGenerations = false;
        break;
      case '--feedback':
        options.feedbackEnabled = true;
        break;
      case '--no-feedback':
        options.feedbackEnabled = false;
        break;
      default:
        break;
    }
  }
  // --for-workflow implies the strict exit behaviour used in CI.
  if (argv.includes('--for-workflow')) options.strict = true;
  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2), process.env);
  const result = checkAresV6TargetUrl(options.targetUrl, { requireForRealMode: options.requireForRealMode });

  let probe: AresV6TargetUrlProbeResult | null = null;
  if (options.probe && result.present && result.redactedTargetUrl) {
    // Probe the RAW url but only ever surface status/note (never the raw url).
    // Probe outcomes are WARNINGS only — a protected preview answers 401/403, so
    // reachability can never gate the workflow (deployment protection is human-verified).
    probe = await probeAresV6TargetUrl((options.targetUrl ?? '').trim());
    result.warnings.push(`Reachability: ${probe.note}`);
  }

  const executionMode: AresV6RealExecutionMode = resolveAresV6RealExecutionMode({
    targetUrlPresent: result.present,
    targetUrlRedacted: result.redactedTargetUrl,
    persistGenerations: options.persistGenerations,
    feedbackEnabled: options.feedbackEnabled,
  });

  if (options.emitMode) {
    writeFileSync(options.emitMode, `${JSON.stringify(executionMode, null, 2)}\n`, 'utf8');
  }

  const payload = {
    present: result.present,
    passed: result.passed,
    errors: result.errors,
    warnings: result.warnings,
    redactedTargetUrl: result.redactedTargetUrl,
    probe,
    executionMode,
  };

  if (options.output) {
    writeFileSync(options.output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else {
    process.stdout.write(
      `ARES v6 target-url check: ${result.passed ? 'PASS' : 'FAIL'} — mode=${executionMode.mode} · ` +
        `target=${result.redactedTargetUrl ?? '(none)'} · ${result.errors.length} error(s), ${result.warnings.length} warning(s)\n`,
    );
    for (const error of result.errors) process.stdout.write(`  [ERROR] ${error}\n`);
    for (const warning of result.warnings) process.stdout.write(`  [WARN]  ${warning}\n`);
  }

  if (options.strict && !result.passed) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error: unknown) => {
  process.stderr.write(`ares-v6-target-url-check failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
