import 'server-only';

import { ARES_V6_LATAM_CALIBRATION_FIXTURES } from '@ares/algorithms/engine-v6';

import {
  calculateComparisonFixtureCoverage,
  calculateEvidenceFixtureCoverage,
} from './evidence-fixture-coverage';
import { getAresV6DevicePresetCounts, type AresV6DevicePresetCount } from './evidence-repository';
import {
  evaluateAresV6GoNoGo,
  getDefaultAresV6EvidenceThresholds,
  type AresV6EvidenceThresholds,
  type AresV6GoNoGoMetrics,
  type AresV6GoNoGoResult,
} from './evidence-thresholds';
import { getAresV6LabMetrics, type AresV6LabMetrics, type AresV6LabMetricsFilter } from './lab-metrics';
import type { AresV6ComparisonRow } from './legacy-vs-v6-comparator';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Evidence snapshot builder (Fase 3D / 3D.1)
//
// Assembles a single auditable snapshot from: lab metrics, per device×preset
// sample counts, TRUSTED feedback stats, the suspicious count, the (injected)
// legacy-vs-v6 comparison and the GO/NO-GO verdict.
//
// 3D.1 integrity fixes:
//   • EVIDENCE coverage (real DB) ≠ COMPARISON coverage (fixtures-only reference).
//     GO/NO-GO gates on evidence coverage; comparison coverage only informs.
//   • STRUCTURAL RISK (dangerous cascades) is a SEPARATE field, visible even when
//     the decision is NO_GO_MORE_DATA — sample size can never hide a broken row.
//
// SUSPICIOUS feedback is EXCLUDED from trusted metrics by default. LEGACY-FREE at
// runtime (type-only comparator import). Never mutates the engine/presets/matrix.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_EVIDENCE_SNAPSHOT_SCHEMA_VERSION = '3D.2';

const TOTAL_FIXTURES = ARES_V6_LATAM_CALIBRATION_FIXTURES.length;

export type { AresV6DevicePresetCount } from './evidence-repository';

export interface AresV6TrustedFeedbackSummary {
  count: number;
  averageRating: number;
  betterRate: number;
  sameRate: number;
  worseRate: number;
  unsureRate: number;
  unresolvedProblemRate: number;
  suspiciousExcluded: number;
  ratingDistribution: Record<string, number>;
  outcomeDistribution: Record<string, number>;
}

export interface AresV6EvidenceComparisonSummary {
  total: number;
  legacyComparable: number;
  noLegacyEquivalent: number;
  expected: number;
  needsReview: number;
  dangerous: number;
  requiresHumanReview: number;
  fallbackPpiRows: number;
  byPreset: Record<string, { total: number; dangerous: number; needsReview: number }>;
}

export type AresV6StructuralRiskDecision = 'CLEAR' | 'REVIEW_REQUIRED' | 'BLOCKING';

export interface AresV6StructuralRisk {
  decision: AresV6StructuralRiskDecision;
  dangerousRows: number;
  needsReviewRows: number;
  fallbackPpiRows: number;
  noLegacyEquivalentRows: number;
  rationale: string[];
}

/** Lightweight high-risk row WITHOUT legacy/v6 vectors or deltas (safe for endpoints). */
export interface AresV6HighRiskSummaryRow {
  fixtureId: string;
  brand: string;
  model: string;
  presetId: AresV6ComparisonRow['presetId'];
  ppi: number;
  ppiSource: string;
  expectedness: AresV6ComparisonRow['expectedness'];
  requiresHumanReview: boolean;
  rationale: string[];
  legacyEquivalent: boolean;
  fallbackPpi: boolean;
}

export interface AresV6EvidenceSnapshot {
  id?: string;
  schemaVersion: string;
  generatedAt: string;
  filter: AresV6LabMetricsFilter;
  includeSuspicious: boolean;
  thresholds: AresV6EvidenceThresholds;
  goNoGo: AresV6GoNoGoResult;
  goNoGoInput: AresV6GoNoGoMetrics;
  metrics: AresV6LabMetrics;

  // ── Coverage (3D.1: evidence ≠ comparison) ──
  /** Real DB evidence breadth (gates GO/NO-GO). */
  evidenceFixtureCoverage: number;
  evidenceCoveredFixtures: number;
  /** Fixtures-only reference matrix breadth (informational only). */
  comparisonFixtureCoverage: number;
  comparisonCoveredFixtures: number;
  totalFixtures: number;
  /** @deprecated alias of evidenceFixtureCoverage (kept for back-compat). */
  fixtureCoverage: number;
  /** @deprecated alias of evidenceCoveredFixtures. */
  coveredFixtures: number;

  // ── Structural risk (3D.1: separate from sample-size verdict) ──
  structuralRisk: AresV6StructuralRisk;

  trustedFeedbackSummary: AresV6TrustedFeedbackSummary;
  comparisonSummary: AresV6EvidenceComparisonSummary;
  highRiskRows: AresV6ComparisonRow[];
  highRiskSummaryRows: AresV6HighRiskSummaryRow[];
  insufficientEvidenceRows: AresV6DevicePresetCount[];
  recommendedNextActions: string[];
}

// ── Pure calculators ────────────────────────────────────────────

function sumValues(record: Record<string, number>): number {
  return Object.values(record).reduce((sum, value) => sum + value, 0);
}

function rate(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 10000) / 10000;
}

/** Weighted average rating from a {"1":n,...,"5":n} distribution. 0 when empty. */
export function averageRatingFromDistribution(distribution: Record<string, number>): number {
  let total = 0;
  let weighted = 0;
  for (const [key, count] of Object.entries(distribution)) {
    const value = Number(key);
    if (!Number.isFinite(value)) continue;
    total += count;
    weighted += value * count;
  }
  return total > 0 ? Math.round((weighted / total) * 100) / 100 : 0;
}

/** Trusted feedback stats derived from lab metrics (already excludes SUSPICIOUS by default). */
export function calculateTrustedFeedbackStats(metrics: AresV6LabMetrics): AresV6TrustedFeedbackSummary {
  const outcomes = metrics.outcomeDistribution;
  const totalOutcomes = sumValues(outcomes);
  return {
    count: metrics.totalFeedback,
    averageRating: averageRatingFromDistribution(metrics.ratingDistribution),
    betterRate: rate(outcomes.BETTER ?? 0, totalOutcomes),
    sameRate: rate(outcomes.SAME ?? 0, totalOutcomes),
    worseRate: rate(outcomes.WORSE ?? 0, totalOutcomes),
    unsureRate: rate(outcomes.UNSURE ?? 0, totalOutcomes),
    unresolvedProblemRate: metrics.unresolvedProblemRate,
    suspiciousExcluded: metrics.suspiciousFeedbackExcluded,
    ratingDistribution: metrics.ratingDistribution,
    outcomeDistribution: metrics.outcomeDistribution,
  };
}

/** Annotate device×preset cells with whether they meet the sample floors. */
export function summarizeEvidenceByDevicePreset(
  counts: readonly AresV6DevicePresetCount[],
  thresholds: AresV6EvidenceThresholds,
): Array<AresV6DevicePresetCount & { sufficient: boolean }> {
  return counts.map((cell) => ({
    ...cell,
    sufficient:
      cell.generations >= thresholds.minGenerationsPerDevicePreset &&
      cell.trustedFeedback >= thresholds.minTrustedFeedbackPerDevicePreset,
  }));
}

/** Aggregate sample counts by preset. */
export function summarizeEvidenceByPreset(
  counts: readonly AresV6DevicePresetCount[],
): Record<string, { generations: number; trustedFeedback: number; cells: number }> {
  const out: Record<string, { generations: number; trustedFeedback: number; cells: number }> = {};
  for (const cell of counts) {
    const bucket = out[cell.presetId] ?? { generations: 0, trustedFeedback: 0, cells: 0 };
    bucket.generations += cell.generations;
    bucket.trustedFeedback += cell.trustedFeedback;
    bucket.cells += 1;
    out[cell.presetId] = bucket;
  }
  return out;
}

function summarizeComparisonRows(rows: readonly AresV6ComparisonRow[]): AresV6EvidenceComparisonSummary {
  const byPreset: Record<string, { total: number; dangerous: number; needsReview: number }> = {};
  let expected = 0;
  let needsReview = 0;
  let dangerous = 0;
  let requiresHumanReview = 0;
  let legacyComparable = 0;
  let fallbackPpiRows = 0;

  for (const row of rows) {
    const bucket = byPreset[row.presetId] ?? { total: 0, dangerous: 0, needsReview: 0 };
    bucket.total += 1;
    if (row.expectedness === 'DANGEROUS') {
      dangerous += 1;
      bucket.dangerous += 1;
    } else if (row.expectedness === 'NEEDS_REVIEW') {
      needsReview += 1;
      bucket.needsReview += 1;
    } else {
      expected += 1;
    }
    byPreset[row.presetId] = bucket;
    if (row.legacyEquivalent) legacyComparable += 1;
    if (row.requiresHumanReview) requiresHumanReview += 1;
    if (row.fallbackPpi) fallbackPpiRows += 1;
  }

  return {
    total: rows.length,
    legacyComparable,
    noLegacyEquivalent: rows.length - legacyComparable,
    expected,
    needsReview,
    dangerous,
    requiresHumanReview,
    fallbackPpiRows,
    byPreset,
  };
}

/** Structural risk over comparison rows. INDEPENDENT of sample size / GO-NO-GO. */
export function computeAresV6StructuralRisk(rows: readonly AresV6ComparisonRow[]): AresV6StructuralRisk {
  let dangerous = 0;
  let needsReview = 0;
  let fallback = 0;
  let noLegacy = 0;
  for (const row of rows) {
    if (row.expectedness === 'DANGEROUS') dangerous += 1;
    else if (row.expectedness === 'NEEDS_REVIEW') needsReview += 1;
    if (row.fallbackPpi) fallback += 1;
    if (!row.legacyEquivalent) noLegacy += 1;
  }

  const rationale: string[] = [];
  let decision: AresV6StructuralRiskDecision = 'CLEAR';
  if (dangerous > 0) {
    decision = 'BLOCKING';
    rationale.push(`${dangerous} fila(s) DANGEROUS estructural(es): cascada/relación de sliders inválida.`);
  } else if (needsReview + fallback + noLegacy > 0) {
    decision = 'REVIEW_REQUIRED';
    if (needsReview > 0) rationale.push(`${needsReview} fila(s) NEEDS_REVIEW.`);
    if (fallback > 0) rationale.push(`${fallback} fila(s) con PPI fallback.`);
    if (noLegacy > 0) rationale.push(`${noLegacy} fila(s) sin equivalente legacy.`);
  } else {
    rationale.push('Sin riesgo estructural: todas las filas comparables son EXPECTED.');
  }

  return {
    decision,
    dangerousRows: dangerous,
    needsReviewRows: needsReview,
    fallbackPpiRows: fallback,
    noLegacyEquivalentRows: noLegacy,
    rationale,
  };
}

function toHighRiskSummaryRow(row: AresV6ComparisonRow): AresV6HighRiskSummaryRow {
  return {
    fixtureId: row.fixtureId,
    brand: row.brand,
    model: row.model,
    presetId: row.presetId,
    ppi: row.ppi,
    ppiSource: row.ppiSource,
    expectedness: row.expectedness,
    requiresHumanReview: row.requiresHumanReview,
    rationale: row.rationale,
    legacyEquivalent: row.legacyEquivalent,
    fallbackPpi: row.fallbackPpi,
  };
}

function highOrLabVerifiedRate(metrics: AresV6LabMetrics): number {
  const dist = metrics.confidenceDistribution;
  const high = (dist.HIGH ?? 0) + (dist.LAB_VERIFIED ?? 0);
  return rate(high, metrics.totalGenerations);
}

/** Derive the flat GO/NO-GO input. fixtureCoverage gates on EVIDENCE coverage. */
export function deriveGoNoGoMetrics(params: {
  metrics: AresV6LabMetrics;
  counts: readonly AresV6DevicePresetCount[];
  feedback: AresV6TrustedFeedbackSummary;
  evidenceFixtureCoverage: number;
  comparisonFixtureCoverage: number;
  structuralRisk: AresV6StructuralRisk;
  thresholds: AresV6EvidenceThresholds;
  generationErrorRate?: number;
}): AresV6GoNoGoMetrics {
  const { metrics, counts, feedback, structuralRisk, thresholds } = params;
  const cells = summarizeEvidenceByDevicePreset(counts, thresholds);
  const insufficient = cells.filter((cell) => !cell.sufficient).length;
  const totalFeedbackWithSuspicious = metrics.totalFeedback + metrics.suspiciousFeedbackExcluded;

  return {
    totalGenerations: metrics.totalGenerations,
    totalTrustedFeedback: metrics.totalFeedback,
    evaluatedCells: cells.length,
    insufficientSampleCells: insufficient,
    p95TotalDurationMs: metrics.p95TotalDurationMs,
    generationErrorRate: params.generationErrorRate ?? 0,
    persistenceDegradedRate: rate(metrics.rateLimitDegradedCount, metrics.totalGenerations),
    fallbackPpiRate: metrics.fallbackPpiRate,
    highOrLabVerifiedRate: highOrLabVerifiedRate(metrics),
    averageRating: feedback.averageRating,
    worseOutcomeRate: feedback.worseRate,
    dangerousStructuralRows: structuralRisk.dangerousRows,
    reviewStructuralRows: structuralRisk.needsReviewRows,
    evidenceFixtureCoverage: params.evidenceFixtureCoverage,
    comparisonFixtureCoverage: params.comparisonFixtureCoverage,
    feedbackCoverageRate: metrics.feedbackCoverageRate,
    suspiciousFeedbackRate: rate(metrics.suspiciousFeedbackExcluded, totalFeedbackWithSuspicious),
  };
}

function buildNextActions(
  goNoGo: AresV6GoNoGoResult,
  structuralRisk: AresV6StructuralRisk,
  insufficient: readonly AresV6DevicePresetCount[],
): string[] {
  const actions: string[] = [];
  // Structural BLOCKING is surfaced FIRST, even under NO_GO_MORE_DATA.
  if (structuralRisk.decision === 'BLOCKING') {
    actions.push(
      `URGENTE: ${structuralRisk.dangerousRows} fila(s) DANGEROUS estructural(es) — revisión HUMANA obligatoria antes de cualquier activación.`,
    );
  }
  for (const failed of goNoGo.failedCriteria) {
    switch (failed.criterion) {
      case 'totalTrustedFeedback':
      case 'feedbackCoverageRate':
        actions.push('Recolectar más feedback TRUSTED interno antes de re-evaluar.');
        break;
      case 'insufficientSampleCells':
      case 'totalGenerations':
        actions.push(`Cubrir ${insufficient.length} celda(s) device×preset con muestra suficiente.`);
        break;
      case 'evidenceFixtureCoverage':
        actions.push('Ampliar la cobertura de EVIDENCIA real (más fixtures con generaciones persistidas).');
        break;
      case 'fallbackPpiRate':
        actions.push('Completar specs de PPI de los devices que caen en TIER_FALLBACK.');
        break;
      case 'p95TotalDurationMs':
      case 'persistenceDegradedRate':
      case 'generationErrorRate':
        actions.push('Estabilizar la infraestructura (latencia/persistencia) antes de juzgar el motor.');
        break;
      case 'averageRating':
      case 'worseOutcomeRate':
      case 'highOrLabVerifiedRate':
      case 'dangerousStructuralRows':
        actions.push('Abrir propuesta de calibración para revisión HUMANA (sin auto-aplicar).');
        break;
      case 'suspiciousFeedbackRate':
        actions.push('Investigar posible data poisoning antes de confiar en la muestra.');
        break;
      default:
        break;
    }
  }
  if (structuralRisk.decision === 'REVIEW_REQUIRED') {
    actions.push(`Revisar ${structuralRisk.needsReviewRows + structuralRisk.fallbackPpiRows + structuralRisk.noLegacyEquivalentRows} fila(s) NEEDS_REVIEW/fallback/sin-legacy.`);
  }
  if (actions.length === 0) {
    actions.push('Mantener OFF. La activación de UI experimental requiere decisión HUMANA explícita.');
  }
  return [...new Set(actions)];
}

// ── Builder ─────────────────────────────────────────────────────

export interface AresV6EvidenceSnapshotInput {
  filter?: AresV6LabMetricsFilter;
  includeSuspicious?: boolean;
  thresholds?: AresV6EvidenceThresholds;
  /** Legacy-vs-v6 comparison rows (computed by the caller; [] when not requested). */
  comparisonRows?: readonly AresV6ComparisonRow[];
  /** Error rate from a lab run, if known (DB persists only successes). */
  generationErrorRate?: number;
}

export interface AresV6EvidenceSnapshotDeps {
  getMetrics(filter: AresV6LabMetricsFilter): Promise<AresV6LabMetrics>;
  getDevicePresetCounts(filter: AresV6LabMetricsFilter, includeSuspicious: boolean): Promise<AresV6DevicePresetCount[]>;
  now(): number;
}

const DEFAULT_DEPS: AresV6EvidenceSnapshotDeps = {
  getMetrics: getAresV6LabMetrics,
  getDevicePresetCounts: getAresV6DevicePresetCounts,
  now: () => Date.now(),
};

/**
 * Build the full evidence snapshot. SUSPICIOUS feedback is excluded by default.
 * Read-only: no DB writes, no engine mutation. The decision is HUMAN; this only
 * produces the evidence and the GO/NO-GO recommendation.
 */
export async function buildAresV6EvidenceSnapshot(
  input: AresV6EvidenceSnapshotInput = {},
  deps: AresV6EvidenceSnapshotDeps = DEFAULT_DEPS,
): Promise<AresV6EvidenceSnapshot> {
  const filter = input.filter ?? {};
  const includeSuspicious = input.includeSuspicious ?? false;
  const thresholds = input.thresholds ?? getDefaultAresV6EvidenceThresholds();
  const comparisonRows = input.comparisonRows ?? [];

  const metricsFilter: AresV6LabMetricsFilter = { ...filter, includeSuspicious };
  const [metrics, counts] = await Promise.all([
    deps.getMetrics(metricsFilter),
    deps.getDevicePresetCounts(filter, includeSuspicious),
  ]);

  const trustedFeedbackSummary = calculateTrustedFeedbackStats(metrics);
  const comparisonSummary = summarizeComparisonRows(comparisonRows);
  const structuralRisk = computeAresV6StructuralRisk(comparisonRows);

  // Two DIFFERENT coverages (the 3D.1 fix).
  const evidenceCoverage = calculateEvidenceFixtureCoverage(counts);
  const comparisonCoverage = calculateComparisonFixtureCoverage(comparisonRows);

  const goNoGoInput = deriveGoNoGoMetrics({
    metrics,
    counts,
    feedback: trustedFeedbackSummary,
    evidenceFixtureCoverage: evidenceCoverage.coverage,
    comparisonFixtureCoverage: comparisonCoverage.coverage,
    structuralRisk,
    thresholds,
    generationErrorRate: input.generationErrorRate,
  });
  const goNoGo = evaluateAresV6GoNoGo(goNoGoInput, thresholds);

  const insufficientEvidenceRows = summarizeEvidenceByDevicePreset(counts, thresholds)
    .filter((cell) => !cell.sufficient)
    .map(({ deviceId, presetId, generations, trustedFeedback, deviceBrand, deviceModel, deviceSlug }) => ({
      deviceId,
      presetId,
      generations,
      trustedFeedback,
      deviceBrand,
      deviceModel,
      deviceSlug,
    }));

  const highRiskRows = comparisonRows.filter((row) => row.requiresHumanReview);

  return {
    schemaVersion: ARES_V6_EVIDENCE_SNAPSHOT_SCHEMA_VERSION,
    generatedAt: new Date(deps.now()).toISOString(),
    filter,
    includeSuspicious,
    thresholds,
    goNoGo,
    goNoGoInput,
    metrics,
    evidenceFixtureCoverage: evidenceCoverage.coverage,
    evidenceCoveredFixtures: evidenceCoverage.coveredFixtures,
    comparisonFixtureCoverage: comparisonCoverage.coverage,
    comparisonCoveredFixtures: comparisonCoverage.coveredFixtures,
    totalFixtures: TOTAL_FIXTURES,
    fixtureCoverage: evidenceCoverage.coverage,
    coveredFixtures: evidenceCoverage.coveredFixtures,
    structuralRisk,
    trustedFeedbackSummary,
    comparisonSummary,
    highRiskRows: [...highRiskRows],
    highRiskSummaryRows: highRiskRows.map(toHighRiskSummaryRow),
    insufficientEvidenceRows,
    recommendedNextActions: buildNextActions(goNoGo, structuralRisk, insufficientEvidenceRows),
  };
}
