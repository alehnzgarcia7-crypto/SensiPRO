import {
  ARES_V6_EVIDENCE_MAX_INCLUDED_ROWS,
  type AresV6NormalizedEvidenceQuery,
} from './evidence-query-schema';
import { buildAresV6EvidenceSnapshot, type AresV6EvidenceSnapshot } from './evidence-snapshot';
import type { AresV6ComparisonRow } from './legacy-vs-v6-comparator';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Evidence route service (Fase 3D.1B)
//
// The testable core of GET /api/lab/v6/evidence: select the comparison rows
// honouring the preset filter + compareScope, build the snapshot, and SANITIZE
// the response (summary rows by default; full rows only when includeRows=true,
// capped). Deps are injectable so the 200-path is unit-tested WITHOUT DB/Redis
// (kills the previous "only 400/404 tested" false positive), and the legacy
// engine is lazy-loaded only when a comparison is actually requested.
// ═══════════════════════════════════════════════════════════════

export interface AresV6EvidenceRouteDeps {
  buildComparison: (opts: {
    presetId?: AresV6NormalizedEvidenceQuery['presetId'];
  }) => AresV6ComparisonRow[] | Promise<AresV6ComparisonRow[]>;
  buildSnapshot: typeof buildAresV6EvidenceSnapshot;
}

async function defaultBuildComparison(opts: {
  presetId?: AresV6NormalizedEvidenceQuery['presetId'];
}): Promise<AresV6ComparisonRow[]> {
  // Lazy-load the comparator (and thus the frozen legacy engine) ONLY when asked.
  const { buildAresV6ComparisonMatrix } = await import('./legacy-vs-v6-comparator');
  return buildAresV6ComparisonMatrix(opts);
}

export const DEFAULT_ARES_V6_EVIDENCE_ROUTE_DEPS: AresV6EvidenceRouteDeps = {
  buildComparison: defaultBuildComparison,
  buildSnapshot: buildAresV6EvidenceSnapshot,
};

/**
 * Select the legacy-vs-v6 comparison rows for a query:
 *   - includeLegacyCompare !== true → [] (no comparator call, no legacy load).
 *   - presetId + compareScope=filtered → comparison filtered by that preset.
 *   - otherwise → the full matrix (compareScope=all or no preset).
 */
export async function selectAresV6ComparisonRows(
  query: AresV6NormalizedEvidenceQuery,
  deps: AresV6EvidenceRouteDeps = DEFAULT_ARES_V6_EVIDENCE_ROUTE_DEPS,
): Promise<AresV6ComparisonRow[]> {
  if (!query.includeLegacyCompare) return [];
  if (query.presetId && query.compareScope === 'filtered') {
    return deps.buildComparison({ presetId: query.presetId });
  }
  return deps.buildComparison({});
}

export interface AresV6EvidenceResponseData {
  schemaVersion: string;
  goNoGo: AresV6EvidenceSnapshot['goNoGo'];
  goNoGoInput: AresV6EvidenceSnapshot['goNoGoInput'];
  metrics: AresV6EvidenceSnapshot['metrics'];
  evidenceFixtureCoverage: number;
  evidenceCoveredFixtures: number;
  comparisonFixtureCoverage: number;
  comparisonCoveredFixtures: number;
  totalFixtures: number;
  /** @deprecated alias of evidenceFixtureCoverage (kept for back-compat). */
  fixtureCoverage: number;
  /** @deprecated alias of evidenceCoveredFixtures. */
  coveredFixtures: number;
  structuralRisk: AresV6EvidenceSnapshot['structuralRisk'];
  trustedFeedbackSummary: AresV6EvidenceSnapshot['trustedFeedbackSummary'];
  comparisonSummary: AresV6EvidenceSnapshot['comparisonSummary'];
  insufficientEvidenceRows: AresV6EvidenceSnapshot['insufficientEvidenceRows'];
  recommendedNextActions: string[];
  highRiskRows?: AresV6EvidenceSnapshot['highRiskRows'];
  highRiskSummaryRows?: AresV6EvidenceSnapshot['highRiskSummaryRows'];
}

/**
 * Project a snapshot into the response data. Default: summary rows only (NO
 * legacy/v6 vectors, NO deltas). includeRows=true: full rows capped at 100.
 */
export function sanitizeAresV6EvidenceResponse(
  snapshot: AresV6EvidenceSnapshot,
  query: AresV6NormalizedEvidenceQuery,
): AresV6EvidenceResponseData {
  const base: AresV6EvidenceResponseData = {
    schemaVersion: snapshot.schemaVersion,
    goNoGo: snapshot.goNoGo,
    goNoGoInput: snapshot.goNoGoInput,
    metrics: snapshot.metrics,
    evidenceFixtureCoverage: snapshot.evidenceFixtureCoverage,
    evidenceCoveredFixtures: snapshot.evidenceCoveredFixtures,
    comparisonFixtureCoverage: snapshot.comparisonFixtureCoverage,
    comparisonCoveredFixtures: snapshot.comparisonCoveredFixtures,
    totalFixtures: snapshot.totalFixtures,
    fixtureCoverage: snapshot.fixtureCoverage,
    coveredFixtures: snapshot.coveredFixtures,
    structuralRisk: snapshot.structuralRisk,
    trustedFeedbackSummary: snapshot.trustedFeedbackSummary,
    comparisonSummary: snapshot.comparisonSummary,
    insufficientEvidenceRows: snapshot.insufficientEvidenceRows,
    recommendedNextActions: snapshot.recommendedNextActions,
  };
  if (query.includeRows) {
    base.highRiskRows = snapshot.highRiskRows.slice(0, ARES_V6_EVIDENCE_MAX_INCLUDED_ROWS);
  } else {
    base.highRiskSummaryRows = snapshot.highRiskSummaryRows;
  }
  return base;
}

export interface AresV6EvidenceRouteMeta {
  compareScope: AresV6NormalizedEvidenceQuery['compareScope'];
  includeLegacyCompare: boolean;
  includeRows: boolean;
  rowsIncluded: boolean;
  warnings: string[];
  rowsLimit?: number;
  rowsTruncated?: number;
}

export interface AresV6EvidenceRoutePayload {
  data: AresV6EvidenceResponseData;
  meta: AresV6EvidenceRouteMeta;
}

/** Build the full route payload (data + meta) for a normalized query. Read-only. */
export async function buildAresV6EvidenceRoutePayload(
  query: AresV6NormalizedEvidenceQuery,
  deps: AresV6EvidenceRouteDeps = DEFAULT_ARES_V6_EVIDENCE_ROUTE_DEPS,
): Promise<AresV6EvidenceRoutePayload> {
  const comparisonRows = await selectAresV6ComparisonRows(query, deps);
  const snapshot = await deps.buildSnapshot({
    filter: {
      since: query.since,
      until: query.until,
      ...(query.deviceId ? { deviceId: query.deviceId } : {}),
      ...(query.presetId ? { presetId: query.presetId } : {}),
    },
    includeSuspicious: query.includeSuspicious,
    comparisonRows,
  });

  const data = sanitizeAresV6EvidenceResponse(snapshot, query);
  const meta: AresV6EvidenceRouteMeta = {
    compareScope: query.compareScope,
    includeLegacyCompare: query.includeLegacyCompare,
    includeRows: query.includeRows,
    rowsIncluded: query.includeRows,
    warnings: query.warnings,
  };
  if (query.includeRows) {
    meta.rowsLimit = ARES_V6_EVIDENCE_MAX_INCLUDED_ROWS;
    meta.rowsTruncated = Math.max(0, snapshot.highRiskRows.length - ARES_V6_EVIDENCE_MAX_INCLUDED_ROWS);
  }
  return { data, meta };
}
