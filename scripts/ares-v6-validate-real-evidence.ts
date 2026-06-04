import { readFileSync, writeFileSync } from 'node:fs';

import {
  validateAresV6RealEvidence,
  type AresV6RealEvidenceArtifacts,
  type AresV6RealExecutionModeName,
} from '../src/lib/ares-v6/real-evidence-validation';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Real-evidence validation CLI (Fase 3G). INTERNAL ONLY.
//
//   npm run ares:v6:validate-real-evidence -- \
//     --mode-json ares-v6-real-execution-mode.json \
//     --evidence-json ares-v6-evidence-summary.json \
//     --lab-report-json ares-v6-internal-lab-report.json \
//     --human-review-json human-review-packet.json \
//     --ui-smoke-json ares-v6-ui-smoke.json --require-ui-smoke \
//     --json --output ares-v6-real-evidence-validation.json
//
// Independent, skeptical auditor of the produced artifacts. real-http demands
// REAL persisted evidence (no fixtures-only, evCov>0, totalGenerations>0, packet
// present, FINAL needs a human, closed-beta gates met, no secrets). dry-run-local
// must stay NO_GO_MORE_EVIDENCE. Exit 1 on failure (in real mode this fails CI).
// ═══════════════════════════════════════════════════════════════

interface CliOptions {
  mode: AresV6RealExecutionModeName | null;
  modeJson: string | null;
  evidenceJson: string | null;
  labReportJson: string | null;
  humanReviewJson: string | null;
  uiSmokeJson: string | null;
  requireUiSmoke: boolean;
  json: boolean;
  output: string | null;
}

function parseArgs(argv: readonly string[]): CliOptions {
  const options: CliOptions = {
    mode: null,
    modeJson: null,
    evidenceJson: null,
    labReportJson: null,
    humanReviewJson: null,
    uiSmokeJson: null,
    requireUiSmoke: false,
    json: false,
    output: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--mode': {
        const value = argv[i + 1];
        if (value !== 'real-http' && value !== 'dry-run-local') {
          throw new Error('--mode debe ser real-http|dry-run-local');
        }
        options.mode = value;
        i += 1;
        break;
      }
      case '--mode-json':
        options.modeJson = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--evidence-json':
        options.evidenceJson = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--lab-report-json':
        options.labReportJson = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--human-review-json':
        options.humanReviewJson = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--ui-smoke-json':
        options.uiSmokeJson = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--require-ui-smoke':
        options.requireUiSmoke = true;
        break;
      case '--json':
      case '--for-workflow':
        options.json = true;
        break;
      case '--output':
      case '--out':
        options.output = argv[i + 1] ?? null;
        i += 1;
        break;
      default:
        break;
    }
  }
  return options;
}

/** Read + parse a JSON artifact. Returns null when the path is absent or unreadable. */
function readJsonOrNull(path: string | null): unknown | null {
  if (!path) return null;
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resolveMode(options: CliOptions): AresV6RealExecutionModeName {
  if (options.modeJson) {
    const json = readJsonOrNull(options.modeJson);
    if (json && typeof json === 'object') {
      const record = json as Record<string, unknown>;
      if (record.mode === 'real-http' || record.mode === 'dry-run-local') return record.mode;
    }
  }
  return options.mode ?? 'dry-run-local';
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const mode = resolveMode(options);

  const artifacts: AresV6RealEvidenceArtifacts = {
    labReport: readJsonOrNull(options.labReportJson),
    evidence: readJsonOrNull(options.evidenceJson),
    humanPacket: readJsonOrNull(options.humanReviewJson),
    uiSmoke: readJsonOrNull(options.uiSmokeJson),
  };

  const result = validateAresV6RealEvidence({ mode, artifacts, requireUiSmoke: options.requireUiSmoke });

  if (options.output) {
    writeFileSync(options.output, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(
      `ARES v6 real-evidence validation (mode=${result.mode}): ${result.passed ? 'PASS' : 'FAIL'} — ` +
        `${result.errors.length} error(s), ${result.warnings.length} warning(s)\n`,
    );
    for (const check of result.checks) {
      process.stdout.write(`  [${check.status.toUpperCase()}] ${check.name}: ${check.detail}\n`);
    }
  }

  process.stderr.write(
    `ARES v6 real-evidence: mode=${result.mode} · passed=${result.passed} · ` +
      `evMode=${result.summary.evidenceMode ?? 'n/a'} · evCov=${result.summary.evidenceFixtureCoverage ?? 'n/a'} · ` +
      `gen=${result.summary.totalGenerations ?? 'n/a'} · risk=${result.summary.structuralRisk ?? 'n/a'} · ` +
      `rec=${result.summary.recommendedDecision ?? 'n/a'}\n`,
  );

  if (!result.passed) {
    process.exit(1);
  }
  process.exit(0);
}

try {
  main();
} catch (error) {
  process.stderr.write(`ares-v6-validate-real-evidence failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
