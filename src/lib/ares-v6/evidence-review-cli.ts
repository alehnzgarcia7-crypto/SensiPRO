import { ARES_V6_PRESETS, type AresV6PresetId } from '@ares/algorithms/engine-v6';

import {
  generateAresV6CalibrationProposals,
  type AresV6CalibrationProposalResult,
} from './calibration-proposals';
import {
  buildAresV6EvidenceSnapshot,
  type AresV6EvidenceSnapshot,
  type AresV6EvidenceSnapshotDeps,
} from './evidence-snapshot';
import { computeAresV6LabMetrics, type AresV6LabMetricsFilter } from './lab-metrics';
import { buildAresV6ComparisonMatrix, type AresV6ComparisonRow } from './legacy-vs-v6-comparator';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Evidence review CLI core (Fase 3D)
//
// Pure, testable arg parsing + orchestration + renderers behind the evidence
// CLI. Default is a SAFE dry-run: no DB writes, no engine mutation. The produced
// artifacts (JSON / markdown) carry NO tokens, NO raw IP, NO request body — the
// underlying evidence model has no such fields by construction.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_EVIDENCE_REPORT_SCHEMA_VERSION = '3D.1';

const VALID_PRESET_IDS = new Set<string>(ARES_V6_PRESETS.map((preset) => preset.id));
const ISO_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

export interface AresV6EvidenceReviewOptions {
  fromDb: boolean;
  fixturesOnly: boolean;
  legacyCompare: boolean;
  proposals: boolean;
  json: boolean;
  markdown: boolean;
  output: string | null;
  since: string | null;
  until: string | null;
  presetId: AresV6PresetId | null;
  fixtureId: string | null;
}

export class AresV6EvidenceArgError extends Error {}

function need(value: string | undefined, flag: string): string {
  if (!value) throw new AresV6EvidenceArgError(`${flag} requiere un valor`);
  return value;
}

/** Parse evidence-review CLI args. Throws AresV6EvidenceArgError on bad input. */
export function parseAresV6EvidenceReviewArgs(argv: readonly string[]): AresV6EvidenceReviewOptions {
  const options: AresV6EvidenceReviewOptions = {
    fromDb: false,
    fixturesOnly: false,
    legacyCompare: false,
    proposals: false,
    json: false,
    markdown: false,
    output: null,
    since: null,
    until: null,
    presetId: null,
    fixtureId: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--from-db':
        options.fromDb = true;
        break;
      case '--fixtures-only':
        options.fixturesOnly = true;
        break;
      case '--legacy-compare':
        options.legacyCompare = true;
        break;
      case '--proposals':
        options.proposals = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--markdown':
        options.markdown = true;
        break;
      case '--output':
      case '--out':
        options.output = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--since':
        options.since = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--until':
        options.until = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--preset': {
        const value = need(argv[i + 1], arg);
        if (!VALID_PRESET_IDS.has(value)) throw new AresV6EvidenceArgError(`--preset inválido: ${value}`);
        options.presetId = value as AresV6PresetId;
        i += 1;
        break;
      }
      case '--fixture':
        options.fixtureId = need(argv[i + 1], arg);
        i += 1;
        break;
      default:
        throw new AresV6EvidenceArgError(`Argumento desconocido: ${arg ?? '(vacío)'}`);
    }
  }

  if (options.since && !ISO_RE.test(options.since)) throw new AresV6EvidenceArgError('--since debe ser ISO 8601');
  if (options.until && !ISO_RE.test(options.until)) throw new AresV6EvidenceArgError('--until debe ser ISO 8601');
  // Safe default: when no source is chosen, run fixtures-only (no DB access).
  if (!options.fromDb && !options.fixturesOnly) options.fixturesOnly = true;

  return options;
}

export interface AresV6EvidenceReport {
  schemaVersion: string;
  mode: 'from-db' | 'fixtures-only';
  generatedAt: string;
  options: AresV6EvidenceReviewOptions;
  goNoGo: AresV6EvidenceSnapshot['goNoGo'];
  snapshot: AresV6EvidenceSnapshot;
  comparisonRows: AresV6ComparisonRow[];
  proposals: AresV6CalibrationProposalResult | null;
}

export interface AresV6EvidenceReviewDeps {
  buildSnapshot: typeof buildAresV6EvidenceSnapshot;
  buildComparison: (opts: { fixtureId?: string; presetId?: AresV6PresetId }) => AresV6ComparisonRow[];
  /** Snapshot deps for fixtures-only mode (no DB). */
  fixturesOnlyDeps: AresV6EvidenceSnapshotDeps;
  now: () => number;
}

function makeFixturesOnlyDeps(now: () => number): AresV6EvidenceSnapshotDeps {
  return {
    getMetrics: async () => computeAresV6LabMetrics([], []),
    getDevicePresetCounts: async () => [],
    now,
  };
}

/** Build the default deps (real DB snapshot + real comparator). */
export function defaultAresV6EvidenceReviewDeps(now: () => number = () => Date.now()): AresV6EvidenceReviewDeps {
  return {
    buildSnapshot: buildAresV6EvidenceSnapshot,
    buildComparison: (opts) => buildAresV6ComparisonMatrix(opts),
    fixturesOnlyDeps: makeFixturesOnlyDeps(now),
    now,
  };
}

/** Orchestrate an evidence review into a report object. Read-only. */
export async function runAresV6EvidenceReview(
  options: AresV6EvidenceReviewOptions,
  deps: AresV6EvidenceReviewDeps = defaultAresV6EvidenceReviewDeps(),
): Promise<AresV6EvidenceReport> {
  const comparisonRows = options.legacyCompare
    ? deps.buildComparison({
        fixtureId: options.fixtureId ?? undefined,
        presetId: options.presetId ?? undefined,
      })
    : [];

  const filter: AresV6LabMetricsFilter = {
    ...(options.since ? { since: new Date(options.since) } : {}),
    ...(options.until ? { until: new Date(options.until) } : {}),
    ...(options.presetId ? { presetId: options.presetId } : {}),
  };

  const snapshot = options.fromDb
    ? await deps.buildSnapshot({ filter, comparisonRows })
    : await deps.buildSnapshot({ filter, comparisonRows }, deps.fixturesOnlyDeps);

  const proposals = options.proposals ? generateAresV6CalibrationProposals(snapshot) : null;

  return {
    schemaVersion: ARES_V6_EVIDENCE_REPORT_SCHEMA_VERSION,
    mode: options.fromDb ? 'from-db' : 'fixtures-only',
    generatedAt: snapshot.generatedAt,
    options,
    goNoGo: snapshot.goNoGo,
    snapshot,
    comparisonRows,
    proposals,
  };
}

// ── Renderers ───────────────────────────────────────────────────

export function renderAresV6EvidenceJson(report: AresV6EvidenceReport): string {
  return JSON.stringify(report, null, 2);
}

export function renderAresV6EvidenceSummaryLine(report: AresV6EvidenceReport): string {
  const s = report.snapshot;
  return (
    `ARES v6 evidence (${report.mode}): ${s.goNoGo.decision} · ` +
    `gen=${s.metrics.totalGenerations} fb=${s.metrics.totalFeedback} ` +
    `cmp=${s.comparisonSummary.total}(dang=${s.comparisonSummary.dangerous},rev=${s.comparisonSummary.needsReview}) ` +
    `proposals=${report.proposals ? report.proposals.proposals.length : 'no-solicitado'}`
  );
}

function mdList(items: readonly string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : '- (ninguno)';
}

export function renderAresV6EvidenceMarkdown(report: AresV6EvidenceReport): string {
  const s = report.snapshot;
  const cmp = s.comparisonSummary;
  const fb = s.trustedFeedbackSummary;
  const lines: string[] = [];

  lines.push('# ARES v6 — Evidence Review (Fase 3D)');
  lines.push('');
  lines.push(`**Modo:** ${report.mode}  ·  **Generado:** ${report.generatedAt}  ·  **schema:** ${report.schemaVersion}`);
  lines.push('');
  lines.push(`## GO/NO-GO: ${s.goNoGo.decision}`);
  lines.push('');
  lines.push(mdList(s.goNoGo.rationale));
  lines.push('');

  lines.push('## Métricas');
  lines.push('');
  lines.push('| Métrica | Valor |');
  lines.push('|---|---|');
  lines.push(`| totalGenerations | ${s.metrics.totalGenerations} |`);
  lines.push(`| totalTrustedFeedback | ${s.metrics.totalFeedback} |`);
  lines.push(`| p95TotalDurationMs | ${s.metrics.p95TotalDurationMs} |`);
  lines.push(`| fallbackPpiRate | ${s.metrics.fallbackPpiRate} |`);
  lines.push(`| feedbackCoverageRate | ${s.metrics.feedbackCoverageRate} |`);
  lines.push(`| highOrLabVerifiedRate | ${s.goNoGoInput.highOrLabVerifiedRate} |`);
  lines.push(`| averageRating | ${fb.averageRating} |`);
  lines.push(`| worseOutcomeRate | ${fb.worseRate} |`);
  lines.push(`| suspiciousFeedbackExcluded | ${fb.suspiciousExcluded} |`);
  lines.push(`| fixtureCoverage | ${s.fixtureCoverage} (${s.coveredFixtures}/${s.totalFixtures}) |`);
  lines.push('');

  lines.push('## Comparación legacy-vs-v6');
  lines.push('');
  lines.push(
    `Total ${cmp.total} · EXPECTED ${cmp.expected} · NEEDS_REVIEW ${cmp.needsReview} · ` +
      `DANGEROUS ${cmp.dangerous} · sin equivalente legacy ${cmp.noLegacyEquivalent} · fallbackPpi ${cmp.fallbackPpiRows}`,
  );
  lines.push('');
  if (s.highRiskRows.length > 0) {
    lines.push('| fixture | preset | ppi | src | expectedness | rationale |');
    lines.push('|---|---|---|---|---|---|');
    for (const row of s.highRiskRows) {
      lines.push(
        `| ${row.fixtureId} | ${row.presetId} | ${row.ppi} | ${row.ppiSource} | ${row.expectedness} | ${row.rationale.join('; ')} |`,
      );
    }
  } else {
    lines.push('Sin filas de alto riesgo.');
  }
  lines.push('');

  lines.push('## Propuestas de calibración');
  lines.push('');
  if (!report.proposals) {
    lines.push('No solicitado (usar `--proposals`). Ninguna propuesta se aplica automáticamente.');
  } else {
    lines.push(`Generadas: ${report.proposals.proposals.length} (autoApply SIEMPRE false, humanReview SIEMPRE true).`);
    lines.push('');
    lines.push('| id | tipo | status | riesgo | target | bloqueos |');
    lines.push('|---|---|---|---|---|---|');
    for (const p of report.proposals.proposals) {
      const target = [p.target.presetId, p.target.fixtureId, p.target.ppiBand].filter(Boolean).join('/') || 'global';
      lines.push(
        `| ${p.id} | ${p.proposalType} | ${p.status} | ${p.riskLevel} | ${target} | ${p.blockedReasons.join(',') || '—'} |`,
      );
    }
  }
  lines.push('');

  lines.push('## Próximas acciones');
  lines.push('');
  lines.push(mdList(s.recommendedNextActions));
  lines.push('');

  return `${lines.join('\n')}\n`;
}
