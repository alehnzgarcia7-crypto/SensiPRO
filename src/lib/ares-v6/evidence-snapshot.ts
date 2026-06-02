import { ARES_V6_LATAM_CALIBRATION_FIXTURES } from '@ares/algorithms/engine-v6';

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
// ARES v6 — Evidence snapshot builder (Fase 3D)
//
// Assembles a single auditable snapshot from: lab metrics, per device×preset
// sample counts, TRUSTED feedback stats, the suspicious count, the (injected)
// legacy-vs-v6 comparison and the GO/NO-GO verdict.
//
// SUSPICIOUS feedback is EXCLUDED from trusted metrics by default; pass
// includeSuspicious only when explicitly auditing it. This module is LEGACY-FREE
// at runtime: comparison rows are computed by the caller (CLI/endpoint) and
// passed in (type-only comparator import), so the snapshot never bundles the
// legacy engine. It never mutates the engine, presets or the research matrix.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_EVIDENCE_SNAPSHOT_SCHEMA_VERSION = '3D.1';

const TRUSTED_FIXTURE_COUNT = ARES_V6_LATAM_CALIBRATION_FIXTURES.length;

export interface AresV6DevicePresetCount {
  deviceId: string;
  presetId: string;
  generations: number;
  trustedFeedback: number;
}

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
  fixtureCoverage: number;
  coveredFixtures: number;
  totalFixtures: number;
  trustedFeedbackSummary: AresV6TrustedFeedbackSummary;
  comparisonSummary: AresV6EvidenceComparisonSummary;
  highRiskRows: AresV6ComparisonRow[];
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

function distinctFixtureCount(rows: readonly AresV6ComparisonRow[]): number {
  return new Set(rows.map((row) => row.fixtureId)).size;
}

function highOrLabVerifiedRate(metrics: AresV6LabMetrics): number {
  const dist = metrics.confidenceDistribution;
  const high = (dist.HIGH ?? 0) + (dist.LAB_VERIFIED ?? 0);
  return rate(high, metrics.totalGenerations);
}

/** Derive the flat GO/NO-GO input from metrics, cells, feedback and fixture coverage. */
export function deriveGoNoGoMetrics(params: {
  metrics: AresV6LabMetrics;
  counts: readonly AresV6DevicePresetCount[];
  feedback: AresV6TrustedFeedbackSummary;
  fixtureCoverage: number;
  thresholds: AresV6EvidenceThresholds;
  dangerousComparisonRows: number;
  generationErrorRate?: number;
}): AresV6GoNoGoMetrics {
  const { metrics, counts, feedback, fixtureCoverage, thresholds } = params;
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
    dangerousComparisonRows: params.dangerousComparisonRows,
    fixtureCoverage,
    feedbackCoverageRate: metrics.feedbackCoverageRate,
    suspiciousFeedbackRate: rate(metrics.suspiciousFeedbackExcluded, totalFeedbackWithSuspicious),
  };
}

function buildNextActions(
  goNoGo: AresV6GoNoGoResult,
  comparison: AresV6EvidenceComparisonSummary,
  insufficient: readonly AresV6DevicePresetCount[],
): string[] {
  const actions: string[] = [];
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
      case 'fixtureCoverage':
        actions.push('Ampliar la cobertura de fixtures en la comparación legacy-vs-v6.');
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
        actions.push('Abrir propuesta de calibración para revisión HUMANA (sin auto-aplicar).');
        break;
      case 'suspiciousFeedbackRate':
        actions.push('Investigar posible data poisoning antes de confiar en la muestra.');
        break;
      default:
        break;
    }
  }
  if (comparison.dangerous > 0) {
    actions.push(`Revisar ${comparison.dangerous} fila(s) DANGEROUS de la comparación legacy-vs-v6.`);
  }
  if (comparison.needsReview > 0) {
    actions.push(`Revisar ${comparison.needsReview} fila(s) NEEDS_REVIEW.`);
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

async function defaultGetDevicePresetCounts(
  filter: AresV6LabMetricsFilter,
  includeSuspicious: boolean,
): Promise<AresV6DevicePresetCount[]> {
  const { prisma } = await import('@ares/database');
  const createdAt: { gte?: Date; lte?: Date } = {};
  if (filter.since) createdAt.gte = filter.since;
  if (filter.until) createdAt.lte = filter.until;
  const where = {
    ...(filter.since || filter.until ? { createdAt } : {}),
    ...(filter.deviceId ? { deviceId: filter.deviceId } : {}),
    ...(filter.presetId ? { presetId: filter.presetId } : {}),
  };

  const [generations, feedback] = await Promise.all([
    prisma.aresV6Generation.groupBy({ by: ['deviceId', 'presetId'], _count: { _all: true }, where }),
    prisma.aresV6Feedback.groupBy({
      by: ['deviceId', 'presetId'],
      _count: { _all: true },
      where: { ...where, ...(includeSuspicious ? {} : { qualityFlag: { not: 'SUSPICIOUS' } }) },
    }),
  ]);

  const cells = new Map<string, AresV6DevicePresetCount>();
  for (const row of generations) {
    const key = `${row.deviceId}:${row.presetId}`;
    cells.set(key, { deviceId: row.deviceId, presetId: row.presetId, generations: row._count._all, trustedFeedback: 0 });
  }
  for (const row of feedback) {
    const key = `${row.deviceId}:${row.presetId}`;
    const existing = cells.get(key) ?? {
      deviceId: row.deviceId,
      presetId: row.presetId,
      generations: 0,
      trustedFeedback: 0,
    };
    existing.trustedFeedback = row._count._all;
    cells.set(key, existing);
  }
  return [...cells.values()];
}

const DEFAULT_DEPS: AresV6EvidenceSnapshotDeps = {
  getMetrics: getAresV6LabMetrics,
  getDevicePresetCounts: defaultGetDevicePresetCounts,
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
  const coveredFixtures = distinctFixtureCount(comparisonRows);
  const fixtureCoverage = TRUSTED_FIXTURE_COUNT > 0 ? rate(coveredFixtures, TRUSTED_FIXTURE_COUNT) : 0;

  const goNoGoInput = deriveGoNoGoMetrics({
    metrics,
    counts,
    feedback: trustedFeedbackSummary,
    fixtureCoverage,
    thresholds,
    dangerousComparisonRows: comparisonSummary.dangerous,
    generationErrorRate: input.generationErrorRate,
  });
  const goNoGo = evaluateAresV6GoNoGo(goNoGoInput, thresholds);

  const insufficientEvidenceRows = summarizeEvidenceByDevicePreset(counts, thresholds)
    .filter((cell) => !cell.sufficient)
    .map(({ deviceId, presetId, generations, trustedFeedback }) => ({ deviceId, presetId, generations, trustedFeedback }));

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
    fixtureCoverage,
    coveredFixtures,
    totalFixtures: TRUSTED_FIXTURE_COUNT,
    trustedFeedbackSummary,
    comparisonSummary,
    highRiskRows: [...highRiskRows],
    insufficientEvidenceRows,
    recommendedNextActions: buildNextActions(goNoGo, comparisonSummary, insufficientEvidenceRows),
  };
}
