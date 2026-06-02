// ═══════════════════════════════════════════════════════════════
// ARES v6 — Evidence thresholds & GO/NO-GO evaluator (Fase 3D)
//
// Versioned, auditable thresholds that decide whether ARES v6 has earned a
// hidden internal UI experiment. PURE: no DB, no env, no engine mutation. The
// evaluator only READS aggregated evidence and returns a decision + the exact
// criteria that failed. It never changes curves, presets or the research matrix.
//
// Decision precedence (most blocking first): INFRA → MORE_DATA → FIX_ENGINE.
// A clean sample that is too small can never be a FIX_ENGINE verdict, and an
// unhealthy infra never reads as a calibration problem.
// ═══════════════════════════════════════════════════════════════

/** Bumped whenever a threshold value or the decision logic changes (OB53-versionable). */
export const ARES_V6_EVIDENCE_THRESHOLDS_VERSION = '3D.1';

export interface AresV6EvidenceThresholds {
  /** Minimum TRUSTED feedback rows required per device×preset cell to judge it. */
  minTrustedFeedbackPerDevicePreset: number;
  /** Minimum persisted generations required per device×preset cell to judge it. */
  minGenerationsPerDevicePreset: number;
  /** Fraction of calibration fixtures that must have evidence (0..1). */
  minFixtureCoverage: number;
  /** Max share of generations falling back to tier PPI (0..1). */
  maxFallbackPpiRate: number;
  /** Max acceptable p95 of total request duration (ms). */
  maxP95TotalDurationMs: number;
  /** Max share of generation attempts that errored (0..1). */
  maxGenerationErrorRate: number;
  /** Max share of generations flagged persistence/degraded (0..1). 0 = none allowed. */
  maxPersistenceDegradedRate: number;
  /** Min share of generations at HIGH or LAB_VERIFIED confidence (0..1). */
  minHighOrLabVerifiedRate: number;
  /** Min share of generations that received feedback (0..1). */
  minFeedbackCoverageRate: number;
  /** Min average TRUSTED rating (1..5) required to consider a GO. */
  minAverageRatingForGo: number;
  /** Max share of TRUSTED feedback reporting a WORSE outcome (0..1). */
  maxWorseOutcomeRate: number;
  /** Max share of feedback flagged SUSPICIOUS before the sample is untrustworthy (0..1). */
  maxSuspiciousFeedbackRate: number;
  /** Version stamp carried into snapshots/proposals for auditability. */
  version: string;
}

export function getDefaultAresV6EvidenceThresholds(): AresV6EvidenceThresholds {
  return {
    minTrustedFeedbackPerDevicePreset: 5,
    minGenerationsPerDevicePreset: 5,
    minFixtureCoverage: 0.8,
    maxFallbackPpiRate: 0.05,
    maxP95TotalDurationMs: 700,
    maxGenerationErrorRate: 0.01,
    maxPersistenceDegradedRate: 0,
    minHighOrLabVerifiedRate: 0.8,
    minFeedbackCoverageRate: 0.3,
    minAverageRatingForGo: 4.3,
    maxWorseOutcomeRate: 0.15,
    maxSuspiciousFeedbackRate: 0.2,
    version: ARES_V6_EVIDENCE_THRESHOLDS_VERSION,
  };
}

// ── GO/NO-GO model ──────────────────────────────────────────────

export type AresV6GoNoGoDecision =
  | 'GO_INTERNAL_UI_EXPERIMENT'
  | 'NO_GO_MORE_DATA'
  | 'NO_GO_FIX_ENGINE'
  | 'NO_GO_INFRA';

export type AresV6GoNoGoCategory = 'INFRA' | 'MORE_DATA' | 'FIX_ENGINE';

/**
 * Aggregated evidence the evaluator reads. The snapshot builder fills this from
 * lab metrics + trusted feedback + fixture coverage. All rates are 0..1.
 */
export interface AresV6GoNoGoMetrics {
  totalGenerations: number;
  totalTrustedFeedback: number;
  /** device×preset cells considered for sufficiency. */
  evaluatedCells: number;
  /** device×preset cells that fell below the generation/feedback floors. */
  insufficientSampleCells: number;

  p95TotalDurationMs: number;
  generationErrorRate: number;
  persistenceDegradedRate: number;

  fallbackPpiRate: number;
  highOrLabVerifiedRate: number;
  averageRating: number;
  worseOutcomeRate: number;
  /** Legacy-vs-v6 rows flagged DANGEROUS by the comparator. Any > 0 blocks a GO. */
  dangerousComparisonRows: number;

  fixtureCoverage: number;
  feedbackCoverageRate: number;
  suspiciousFeedbackRate: number;
}

export interface AresV6FailedCriterion {
  criterion: string;
  category: AresV6GoNoGoCategory;
  actual: number;
  threshold: number;
  /** 'gt' = failed because actual > threshold; 'lt' = failed because actual < threshold. */
  comparison: 'gt' | 'lt';
}

export interface AresV6GoNoGoResult {
  decision: AresV6GoNoGoDecision;
  failedCriteria: AresV6FailedCriterion[];
  warnings: string[];
  rationale: string[];
  thresholdsVersion: string;
}

const WARN_MARGIN = 0.1; // within 10% of a limit → warn (heads-up before it trips)

function fail(
  criterion: string,
  category: AresV6GoNoGoCategory,
  actual: number,
  threshold: number,
  comparison: 'gt' | 'lt',
): AresV6FailedCriterion {
  return { criterion, category, actual, threshold, comparison };
}

/**
 * Evaluate the GO/NO-GO decision. Pure and deterministic: same metrics +
 * thresholds always yield the same verdict. NEVER applies anything.
 */
export function evaluateAresV6GoNoGo(
  metrics: AresV6GoNoGoMetrics,
  thresholds: AresV6EvidenceThresholds = getDefaultAresV6EvidenceThresholds(),
): AresV6GoNoGoResult {
  const failed: AresV6FailedCriterion[] = [];
  const warnings: string[] = [];

  // ── INFRA — reliability gates. If infra is unhealthy nothing else is trustworthy.
  if (metrics.p95TotalDurationMs > thresholds.maxP95TotalDurationMs) {
    failed.push(fail('p95TotalDurationMs', 'INFRA', metrics.p95TotalDurationMs, thresholds.maxP95TotalDurationMs, 'gt'));
  }
  if (metrics.generationErrorRate > thresholds.maxGenerationErrorRate) {
    failed.push(fail('generationErrorRate', 'INFRA', metrics.generationErrorRate, thresholds.maxGenerationErrorRate, 'gt'));
  }
  if (metrics.persistenceDegradedRate > thresholds.maxPersistenceDegradedRate) {
    failed.push(
      fail('persistenceDegradedRate', 'INFRA', metrics.persistenceDegradedRate, thresholds.maxPersistenceDegradedRate, 'gt'),
    );
  }

  // ── MORE_DATA — not enough or not clean enough evidence to judge the engine.
  if (metrics.insufficientSampleCells > 0) {
    failed.push(fail('insufficientSampleCells', 'MORE_DATA', metrics.insufficientSampleCells, 0, 'gt'));
  }
  if (metrics.totalGenerations < thresholds.minGenerationsPerDevicePreset) {
    failed.push(fail('totalGenerations', 'MORE_DATA', metrics.totalGenerations, thresholds.minGenerationsPerDevicePreset, 'lt'));
  }
  if (metrics.totalTrustedFeedback < thresholds.minTrustedFeedbackPerDevicePreset) {
    failed.push(
      fail('totalTrustedFeedback', 'MORE_DATA', metrics.totalTrustedFeedback, thresholds.minTrustedFeedbackPerDevicePreset, 'lt'),
    );
  }
  if (metrics.fixtureCoverage < thresholds.minFixtureCoverage) {
    failed.push(fail('fixtureCoverage', 'MORE_DATA', metrics.fixtureCoverage, thresholds.minFixtureCoverage, 'lt'));
  }
  if (metrics.feedbackCoverageRate < thresholds.minFeedbackCoverageRate) {
    failed.push(fail('feedbackCoverageRate', 'MORE_DATA', metrics.feedbackCoverageRate, thresholds.minFeedbackCoverageRate, 'lt'));
  }
  if (metrics.suspiciousFeedbackRate > thresholds.maxSuspiciousFeedbackRate) {
    failed.push(
      fail('suspiciousFeedbackRate', 'MORE_DATA', metrics.suspiciousFeedbackRate, thresholds.maxSuspiciousFeedbackRate, 'gt'),
    );
  }

  // ── FIX_ENGINE — clean, sufficient data but the engine quality is not GO-worthy.
  if (metrics.highOrLabVerifiedRate < thresholds.minHighOrLabVerifiedRate) {
    failed.push(
      fail('highOrLabVerifiedRate', 'FIX_ENGINE', metrics.highOrLabVerifiedRate, thresholds.minHighOrLabVerifiedRate, 'lt'),
    );
  }
  if (metrics.fallbackPpiRate > thresholds.maxFallbackPpiRate) {
    failed.push(fail('fallbackPpiRate', 'FIX_ENGINE', metrics.fallbackPpiRate, thresholds.maxFallbackPpiRate, 'gt'));
  }
  if (metrics.averageRating < thresholds.minAverageRatingForGo) {
    failed.push(fail('averageRating', 'FIX_ENGINE', metrics.averageRating, thresholds.minAverageRatingForGo, 'lt'));
  }
  if (metrics.worseOutcomeRate > thresholds.maxWorseOutcomeRate) {
    failed.push(fail('worseOutcomeRate', 'FIX_ENGINE', metrics.worseOutcomeRate, thresholds.maxWorseOutcomeRate, 'gt'));
  }
  if (metrics.dangerousComparisonRows > 0) {
    failed.push(fail('dangerousComparisonRows', 'FIX_ENGINE', metrics.dangerousComparisonRows, 0, 'gt'));
  }

  // ── Near-miss warnings (advisory, never change the decision).
  if (
    metrics.suspiciousFeedbackRate <= thresholds.maxSuspiciousFeedbackRate &&
    metrics.suspiciousFeedbackRate > thresholds.maxSuspiciousFeedbackRate * (1 - WARN_MARGIN)
  ) {
    warnings.push('suspiciousFeedbackRate se acerca al límite — vigilar posible data poisoning.');
  }
  if (
    metrics.fallbackPpiRate <= thresholds.maxFallbackPpiRate &&
    metrics.fallbackPpiRate > thresholds.maxFallbackPpiRate * (1 - WARN_MARGIN)
  ) {
    warnings.push('fallbackPpiRate cerca del límite — faltan specs de PPI en algunos devices.');
  }
  if (
    metrics.p95TotalDurationMs <= thresholds.maxP95TotalDurationMs &&
    metrics.p95TotalDurationMs > thresholds.maxP95TotalDurationMs * (1 - WARN_MARGIN)
  ) {
    warnings.push('p95TotalDurationMs cerca del límite de latencia.');
  }

  const decision = decideFrom(failed);
  return {
    decision,
    failedCriteria: failed,
    warnings,
    rationale: buildRationale(decision, failed),
    thresholdsVersion: thresholds.version,
  };
}

function decideFrom(failed: readonly AresV6FailedCriterion[]): AresV6GoNoGoDecision {
  if (failed.some((f) => f.category === 'INFRA')) return 'NO_GO_INFRA';
  if (failed.some((f) => f.category === 'MORE_DATA')) return 'NO_GO_MORE_DATA';
  if (failed.some((f) => f.category === 'FIX_ENGINE')) return 'NO_GO_FIX_ENGINE';
  return 'GO_INTERNAL_UI_EXPERIMENT';
}

const DECISION_HEADLINE: Record<AresV6GoNoGoDecision, string> = {
  GO_INTERNAL_UI_EXPERIMENT:
    'GO — la evidencia respalda un experimento de UI interna oculta (sigue OFF hasta decisión humana).',
  NO_GO_MORE_DATA: 'NO-GO — muestra insuficiente o sospechosa. Recolectar más evidencia TRUSTED antes de decidir.',
  NO_GO_FIX_ENGINE: 'NO-GO — la calidad del motor no alcanza el umbral. Requiere revisión humana de calibración.',
  NO_GO_INFRA: 'NO-GO — la infraestructura no está sana. Estabilizar latencia/persistencia antes de evaluar el motor.',
};

function buildRationale(decision: AresV6GoNoGoDecision, failed: readonly AresV6FailedCriterion[]): string[] {
  const lines = [DECISION_HEADLINE[decision]];
  for (const f of failed) {
    const op = f.comparison === 'gt' ? '>' : '<';
    lines.push(`[${f.category}] ${f.criterion}: ${round4(f.actual)} ${op} límite ${round4(f.threshold)}.`);
  }
  if (failed.length === 0) {
    lines.push('Todos los umbrales pasaron. La decisión de activar UI experimental sigue siendo HUMANA.');
  }
  return lines;
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/** Human-readable explanation lines (markdown-friendly) for a GO/NO-GO result. */
export function explainGoNoGoDecision(result: AresV6GoNoGoResult): string[] {
  const lines = [...result.rationale];
  if (result.warnings.length > 0) {
    lines.push('Advertencias:');
    for (const w of result.warnings) lines.push(`- ${w}`);
  }
  lines.push(
    result.decision === 'GO_INTERNAL_UI_EXPERIMENT'
      ? 'Siguiente paso sugerido: preparar UI experimental oculta tras flag; NO activar producción pública.'
      : 'Siguiente paso sugerido: ninguna calibración automática. Atender los criterios fallidos y re-evaluar.',
  );
  lines.push(`(thresholds ${result.thresholdsVersion})`);
  return lines;
}
