import 'server-only';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Lab metrics aggregator (Fase 3C)
//
// Pure calculators over row arrays (fully testable without a DB) plus a
// DB-backed entry point with injectable deps. Suspicious feedback is excluded
// from trusted metrics by default. No PII is read or produced.
// ═══════════════════════════════════════════════════════════════

/** Lab v0 caps per-table row processing; SQL rollups come later. */
export const ARES_V6_LAB_METRICS_MAX_ROWS = 10_000;

export interface AresV6GenerationMetricRow {
  totalDurationMs: number | null;
  dbDurationMs: number | null;
  engineDurationMs: number | null;
  ppiSource: string;
  detectedPpi: number | null;
  confidenceGrade: string;
  presetId: string;
  mode: string;
  deviceId: string;
  rateLimitDegraded: boolean;
  labMode: boolean;
}

export interface AresV6FeedbackMetricRow {
  rating: number;
  outcome: string;
  problemResolved: boolean | null;
  qualityFlag: string;
}

export interface AresV6LabMetricsFilter {
  since?: Date;
  until?: Date;
  deviceId?: string;
  presetId?: string;
  includeSuspicious?: boolean;
}

export interface AresV6LabMetrics {
  totalGenerations: number;
  totalFeedback: number;
  p50TotalDurationMs: number;
  p95TotalDurationMs: number;
  p99TotalDurationMs: number;
  avgDbDurationMs: number;
  avgEngineDurationMs: number;
  fallbackPpiRate: number;
  confidenceDistribution: Record<string, number>;
  presetDistribution: Record<string, number>;
  modeDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
  ratingDistribution: Record<string, number>;
  outcomeDistribution: Record<string, number>;
  unresolvedProblemRate: number;
  feedbackCoverageRate: number;
  rateLimitDegradedCount: number;
  labModeCount: number;
  suspiciousFeedbackExcluded: number;
}

function finiteNumbers(values: ReadonlyArray<number | null>): number[] {
  return values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

/** Nearest-rank percentile. Returns 0 for an empty set. */
export function percentile(values: ReadonlyArray<number>, p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  const index = Math.min(sorted.length - 1, Math.max(0, rank - 1));
  return sorted[index] ?? 0;
}

export function average(values: ReadonlyArray<number>): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function distribution(items: ReadonlyArray<string>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) out[item] = (out[item] ?? 0) + 1;
  return out;
}

function round(value: number, decimals = 4): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateLatencyPercentiles(rows: ReadonlyArray<AresV6GenerationMetricRow>): {
  p50: number;
  p95: number;
  p99: number;
  avgDb: number;
  avgEngine: number;
} {
  const totals = finiteNumbers(rows.map((r) => r.totalDurationMs));
  return {
    p50: percentile(totals, 50),
    p95: percentile(totals, 95),
    p99: percentile(totals, 99),
    avgDb: average(finiteNumbers(rows.map((r) => r.dbDurationMs))),
    avgEngine: average(finiteNumbers(rows.map((r) => r.engineDurationMs))),
  };
}

export function calculateConfidenceDistribution(rows: ReadonlyArray<AresV6GenerationMetricRow>): Record<string, number> {
  return distribution(rows.map((r) => r.confidenceGrade));
}

export function calculateFallbackPpiRate(rows: ReadonlyArray<AresV6GenerationMetricRow>): number {
  if (rows.length === 0) return 0;
  const fallback = rows.filter((r) => r.detectedPpi === null || r.ppiSource === 'TIER_FALLBACK').length;
  return round(fallback / rows.length);
}

export function calculateFeedbackDistribution(rows: ReadonlyArray<AresV6FeedbackMetricRow>): {
  ratingDistribution: Record<string, number>;
  outcomeDistribution: Record<string, number>;
} {
  return {
    ratingDistribution: distribution(rows.map((r) => String(r.rating))),
    outcomeDistribution: distribution(rows.map((r) => r.outcome)),
  };
}

export function computeAresV6LabMetrics(
  generations: ReadonlyArray<AresV6GenerationMetricRow>,
  feedback: ReadonlyArray<AresV6FeedbackMetricRow>,
  includeSuspicious = false,
): AresV6LabMetrics {
  const suspiciousExcluded = includeSuspicious ? 0 : feedback.filter((f) => f.qualityFlag === 'SUSPICIOUS').length;
  const trustedFeedback = includeSuspicious ? feedback : feedback.filter((f) => f.qualityFlag !== 'SUSPICIOUS');

  const latency = calculateLatencyPercentiles(generations);
  const { ratingDistribution, outcomeDistribution } = calculateFeedbackDistribution(trustedFeedback);

  const resolvedKnown = trustedFeedback.filter((f) => f.problemResolved !== null);
  const unresolved = resolvedKnown.filter((f) => f.problemResolved === false).length;

  return {
    totalGenerations: generations.length,
    totalFeedback: trustedFeedback.length,
    p50TotalDurationMs: latency.p50,
    p95TotalDurationMs: latency.p95,
    p99TotalDurationMs: latency.p99,
    avgDbDurationMs: latency.avgDb,
    avgEngineDurationMs: latency.avgEngine,
    fallbackPpiRate: calculateFallbackPpiRate(generations),
    confidenceDistribution: calculateConfidenceDistribution(generations),
    presetDistribution: distribution(generations.map((r) => r.presetId)),
    modeDistribution: distribution(generations.map((r) => r.mode)),
    deviceDistribution: distribution(generations.map((r) => r.deviceId)),
    ratingDistribution,
    outcomeDistribution,
    unresolvedProblemRate: resolvedKnown.length > 0 ? round(unresolved / resolvedKnown.length) : 0,
    feedbackCoverageRate:
      generations.length > 0 ? round(Math.min(1, trustedFeedback.length / generations.length)) : 0,
    rateLimitDegradedCount: generations.filter((r) => r.rateLimitDegraded).length,
    labModeCount: generations.filter((r) => r.labMode).length,
    suspiciousFeedbackExcluded: suspiciousExcluded,
  };
}

export interface AresV6LabMetricsDeps {
  fetchGenerations(filter: AresV6LabMetricsFilter): Promise<AresV6GenerationMetricRow[]>;
  fetchFeedback(filter: AresV6LabMetricsFilter): Promise<AresV6FeedbackMetricRow[]>;
}

function createdAtWhere(filter: AresV6LabMetricsFilter): { gte?: Date; lte?: Date } | undefined {
  const where: { gte?: Date; lte?: Date } = {};
  if (filter.since) where.gte = filter.since;
  if (filter.until) where.lte = filter.until;
  return Object.keys(where).length > 0 ? where : undefined;
}

async function defaultFetchGenerations(filter: AresV6LabMetricsFilter): Promise<AresV6GenerationMetricRow[]> {
  const { prisma } = await import('@ares/database');
  const createdAt = createdAtWhere(filter);
  return prisma.aresV6Generation.findMany({
    where: {
      ...(createdAt ? { createdAt } : {}),
      ...(filter.deviceId ? { deviceId: filter.deviceId } : {}),
      ...(filter.presetId ? { presetId: filter.presetId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: ARES_V6_LAB_METRICS_MAX_ROWS,
    select: {
      totalDurationMs: true,
      dbDurationMs: true,
      engineDurationMs: true,
      ppiSource: true,
      detectedPpi: true,
      confidenceGrade: true,
      presetId: true,
      mode: true,
      deviceId: true,
      rateLimitDegraded: true,
      labMode: true,
    },
  });
}

async function defaultFetchFeedback(filter: AresV6LabMetricsFilter): Promise<AresV6FeedbackMetricRow[]> {
  const { prisma } = await import('@ares/database');
  const createdAt = createdAtWhere(filter);
  return prisma.aresV6Feedback.findMany({
    where: {
      ...(createdAt ? { createdAt } : {}),
      ...(filter.deviceId ? { deviceId: filter.deviceId } : {}),
      ...(filter.presetId ? { presetId: filter.presetId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: ARES_V6_LAB_METRICS_MAX_ROWS,
    select: { rating: true, outcome: true, problemResolved: true, qualityFlag: true },
  });
}

const DEFAULT_DEPS: AresV6LabMetricsDeps = {
  fetchGenerations: defaultFetchGenerations,
  fetchFeedback: defaultFetchFeedback,
};

export async function getAresV6LabMetrics(
  filter: AresV6LabMetricsFilter = {},
  deps: AresV6LabMetricsDeps = DEFAULT_DEPS,
): Promise<AresV6LabMetrics> {
  const [generations, feedback] = await Promise.all([deps.fetchGenerations(filter), deps.fetchFeedback(filter)]);
  return computeAresV6LabMetrics(generations, feedback, filter.includeSuspicious ?? false);
}
