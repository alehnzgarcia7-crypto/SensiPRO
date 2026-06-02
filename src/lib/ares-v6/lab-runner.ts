import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  generateAresV6,
  type AresV6CalibrationFixture,
  type AresV6PresetId,
} from '@ares/algorithms/engine-v6';

import { percentile } from './lab-metrics';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal lab runner core (Fase 3C)
//
// Pure, testable helpers behind the lab runner CLI: arg parsing, fixture/preset
// selection, local-service generation (engine only, no DB) and run summary.
// The access token is NEVER part of the options object or the summary artifact.
// ═══════════════════════════════════════════════════════════════

export interface AresV6LabRunnerOptions {
  url: string | null;
  fixtureId: string | null;
  allFixtures: boolean;
  presetId: AresV6PresetId | null;
  allPresets: boolean;
  writeFeedbackSamples: boolean;
  output: string | null;
  json: boolean;
  label: string;
}

export function parseAresV6LabRunnerArgs(argv: readonly string[]): AresV6LabRunnerOptions {
  const options: AresV6LabRunnerOptions = {
    url: null,
    fixtureId: null,
    allFixtures: false,
    presetId: null,
    allPresets: false,
    writeFeedbackSamples: false,
    output: null,
    json: false,
    label: 'ares-v6-internal-lab',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--all-fixtures':
        options.allFixtures = true;
        break;
      case '--all-presets':
        options.allPresets = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--write-feedback-samples':
        options.writeFeedbackSamples = true;
        break;
      case '--url':
        options.url = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--token':
        // Consumed but intentionally NOT stored on options (never serialized).
        i += 1;
        break;
      case '--fixture':
        options.fixtureId = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--preset': {
        const value = argv[i + 1];
        i += 1;
        if (value) options.presetId = value as AresV6PresetId;
        break;
      }
      case '--output':
        options.output = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--label':
        options.label = argv[i + 1] ?? options.label;
        i += 1;
        break;
      default:
        break;
    }
  }

  return options;
}

/** Resolve the http-mode token from argv/env. Used ONLY by the CLI for the request header. */
export function resolveAresV6LabRunnerToken(
  argv: readonly string[],
  env: NodeJS.ProcessEnv,
): string | null {
  const index = argv.indexOf('--token');
  if (index !== -1) {
    const value = argv[index + 1];
    if (value) return value;
  }
  return env.ARES_V6_INTERNAL_ACCESS_TOKEN ?? null;
}

export function selectAresV6LabFixtures(options: AresV6LabRunnerOptions): AresV6CalibrationFixture[] {
  if (options.fixtureId) {
    return ARES_V6_LATAM_CALIBRATION_FIXTURES.filter((f) => f.id === options.fixtureId);
  }
  return [...ARES_V6_LATAM_CALIBRATION_FIXTURES];
}

export function selectAresV6LabPresets(
  fixture: AresV6CalibrationFixture,
  options: AresV6LabRunnerOptions,
): AresV6PresetId[] {
  if (options.presetId) return [options.presetId];
  if (options.allPresets) return [...fixture.primaryPresets];
  return ['STANDARD_PRO'];
}

export interface AresV6LabRunRow {
  fixture: string;
  device: string;
  preset: AresV6PresetId;
  ppi: number;
  ppiSource: string;
  general: number;
  confidenceScore: number;
  confidenceGrade: string;
  fallbackPpi: boolean;
  totalDurationMs: number;
  ok: boolean;
  error?: string;
}

function fixturePpi(fixture: AresV6CalibrationFixture): number {
  return fixture.device.ppi ?? fixture.device.screenDpi ?? 0;
}

/** Run the engine locally (no DB, no HTTP) for the selected fixtures × presets. */
export function runAresV6LocalLab(options: AresV6LabRunnerOptions): AresV6LabRunRow[] {
  const fixtures = selectAresV6LabFixtures(options);
  const rows: AresV6LabRunRow[] = [];

  for (const fixture of fixtures) {
    for (const preset of selectAresV6LabPresets(fixture, options)) {
      const start = Date.now();
      try {
        const generation = generateAresV6({
          device: fixture.device,
          presetId: preset,
          player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
        });
        rows.push({
          fixture: fixture.id,
          device: `${fixture.device.brand} ${fixture.device.model}`,
          preset,
          ppi: fixturePpi(fixture),
          ppiSource: generation.dpi.source,
          general: generation.sensitivity.general,
          confidenceScore: generation.confidence.score,
          confidenceGrade: generation.confidence.grade,
          fallbackPpi: generation.dpi.detectedPpi === null,
          totalDurationMs: Math.max(0, Date.now() - start),
          ok: true,
        });
      } catch (error) {
        rows.push({
          fixture: fixture.id,
          device: `${fixture.device.brand} ${fixture.device.model}`,
          preset,
          ppi: fixturePpi(fixture),
          ppiSource: 'ERROR',
          general: 0,
          confidenceScore: 0,
          confidenceGrade: 'ERROR',
          fallbackPpi: false,
          totalDurationMs: 0,
          ok: false,
          error: error instanceof Error ? error.message : 'unknown error',
        });
      }
    }
  }

  return rows;
}

export interface AresV6LabRunSummary {
  label: string;
  commitSha: string | null;
  environment: string;
  startedAt: string;
  completedAt: string;
  total: number;
  successCount: number;
  failureCount: number;
  p50TotalDurationMs: number;
  p95TotalDurationMs: number;
  fallbackPpiRate: number;
  confidenceDistribution: Record<string, number>;
  rows: AresV6LabRunRow[];
  errors: string[];
}

export interface AresV6LabRunMeta {
  label: string;
  commitSha: string | null;
  environment: string;
  startedAt: string;
  completedAt: string;
}

export function summarizeAresV6LabRun(rows: AresV6LabRunRow[], meta: AresV6LabRunMeta): AresV6LabRunSummary {
  const ok = rows.filter((r) => r.ok);
  const durations = ok.map((r) => r.totalDurationMs);
  const confidenceDistribution: Record<string, number> = {};
  for (const row of ok) {
    confidenceDistribution[row.confidenceGrade] = (confidenceDistribution[row.confidenceGrade] ?? 0) + 1;
  }
  const fallback = ok.filter((r) => r.fallbackPpi).length;

  return {
    label: meta.label,
    commitSha: meta.commitSha,
    environment: meta.environment,
    startedAt: meta.startedAt,
    completedAt: meta.completedAt,
    total: rows.length,
    successCount: ok.length,
    failureCount: rows.length - ok.length,
    p50TotalDurationMs: percentile(durations, 50),
    p95TotalDurationMs: percentile(durations, 95),
    fallbackPpiRate: ok.length > 0 ? Math.round((fallback / ok.length) * 10000) / 10000 : 0,
    confidenceDistribution,
    rows,
    errors: rows.filter((r) => !r.ok && r.error).map((r) => `${r.fixture}/${r.preset}: ${r.error ?? ''}`),
  };
}
