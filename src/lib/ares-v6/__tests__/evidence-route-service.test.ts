import { describe, expect, it, vi } from 'vitest';

import {
  ARES_V6_EVIDENCE_WARNING_COMPARISON_NOT_FILTERED,
  parseAresV6EvidenceQuery,
  type AresV6NormalizedEvidenceQuery,
} from '../evidence-query-schema';
import {
  buildAresV6EvidenceRoutePayload,
  selectAresV6ComparisonRows,
  type AresV6EvidenceRouteDeps,
} from '../evidence-route-service';
import { buildAresV6EvidenceSnapshot, type AresV6EvidenceSnapshot } from '../evidence-snapshot';
import { computeAresV6LabMetrics } from '../lab-metrics';
import { buildAresV6ComparisonMatrix } from '../legacy-vs-v6-comparator';

// ═══════════════════════════════════════════════════════════════
// Proves the 200-PATH behavior of the evidence endpoint WITHOUT DB/Redis, by
// testing the route service with mocked deps. This is what the old route tests
// (only 404/400) could not prove — killing the false positive.
// ═══════════════════════════════════════════════════════════════

const NOW = Date.parse('2026-06-02T00:00:00.000Z');
const FULL_COMPARISON = buildAresV6ComparisonMatrix({});

async function makeSnapshot(): Promise<AresV6EvidenceSnapshot> {
  return buildAresV6EvidenceSnapshot(
    { comparisonRows: FULL_COMPARISON },
    {
      getMetrics: async () => computeAresV6LabMetrics([], []),
      getDevicePresetCounts: async () => [],
      now: () => 0,
    },
  );
}

function query(raw: Record<string, string>): AresV6NormalizedEvidenceQuery {
  const result = parseAresV6EvidenceQuery(raw, NOW);
  if (!result.ok) throw new Error(`query invalid: ${result.message}`);
  return result.query;
}

function makeDeps(snapshot: AresV6EvidenceSnapshot) {
  const buildComparison = vi.fn(
    async (_opts?: Parameters<AresV6EvidenceRouteDeps['buildComparison']>[0]) => FULL_COMPARISON,
  );
  const buildSnapshot = vi.fn(
    async (_input?: Parameters<AresV6EvidenceRouteDeps['buildSnapshot']>[0]) => snapshot,
  );
  const deps: AresV6EvidenceRouteDeps = { buildComparison, buildSnapshot };
  return { deps, buildComparison, buildSnapshot };
}

describe('selectAresV6ComparisonRows', () => {
  it('filters the comparison by presetId when compareScope=filtered', async () => {
    const { deps, buildComparison } = makeDeps(await makeSnapshot());
    await selectAresV6ComparisonRows(
      query({ presetId: 'STANDARD_PRO', includeLegacyCompare: 'true' }),
      deps,
    );
    expect(buildComparison).toHaveBeenCalledWith({ presetId: 'STANDARD_PRO' });
  });

  it('ignores the presetId when compareScope=all (full matrix)', async () => {
    const { deps, buildComparison } = makeDeps(await makeSnapshot());
    await selectAresV6ComparisonRows(
      query({ presetId: 'STANDARD_PRO', includeLegacyCompare: 'true', compareScope: 'all' }),
      deps,
    );
    expect(buildComparison).toHaveBeenCalledWith({});
  });

  it('does NOT call the comparator when includeLegacyCompare is absent', async () => {
    const { deps, buildComparison } = makeDeps(await makeSnapshot());
    const rows = await selectAresV6ComparisonRows(query({}), deps);
    expect(buildComparison).not.toHaveBeenCalled();
    expect(rows).toEqual([]);
  });
});

describe('buildAresV6EvidenceRoutePayload — default (summary only)', () => {
  it('returns highRiskSummaryRows and NO highRiskRows / vectors / deltas', async () => {
    const { deps } = makeDeps(await makeSnapshot());
    const { data, meta } = await buildAresV6EvidenceRoutePayload(query({ includeLegacyCompare: 'true' }), deps);

    expect(data.highRiskSummaryRows).toBeDefined();
    expect(data.highRiskRows).toBeUndefined();
    expect(meta.rowsIncluded).toBe(false);

    const serialized = JSON.stringify(data.highRiskSummaryRows);
    expect(serialized).not.toContain('"deltas"');
    expect(serialized).not.toContain('"relativeDeltas"');
    expect(serialized).not.toContain('"v6":');
    expect(serialized).not.toContain('"legacy":');
    expect(serialized).not.toContain('"source":"LEGACY"');
  });

  it('exposes evidence vs comparison coverage + structuralRisk; aliases mirror evidence', async () => {
    const { deps } = makeDeps(await makeSnapshot());
    const { data } = await buildAresV6EvidenceRoutePayload(query({ includeLegacyCompare: 'true' }), deps);

    expect(typeof data.evidenceFixtureCoverage).toBe('number');
    expect(typeof data.comparisonFixtureCoverage).toBe('number');
    expect(typeof data.evidenceCoveredFixtures).toBe('number');
    expect(typeof data.comparisonCoveredFixtures).toBe('number');
    expect(typeof data.totalFixtures).toBe('number');
    expect(data.structuralRisk).toBeDefined();
    expect(data.fixtureCoverage).toBe(data.evidenceFixtureCoverage);
    expect(data.coveredFixtures).toBe(data.evidenceCoveredFixtures);
  });
});

describe('buildAresV6EvidenceRoutePayload — includeRows=true (internal)', () => {
  it('returns highRiskRows capped at 100 with rows meta', async () => {
    const snapshot = await makeSnapshot();
    const { deps } = makeDeps(snapshot);
    const { data, meta } = await buildAresV6EvidenceRoutePayload(
      query({ includeLegacyCompare: 'true', includeRows: 'true' }),
      deps,
    );

    expect(Array.isArray(data.highRiskRows)).toBe(true);
    expect((data.highRiskRows ?? []).length).toBeLessThanOrEqual(100);
    expect(data.highRiskSummaryRows).toBeUndefined();
    expect(meta.rowsIncluded).toBe(true);
    expect(meta.rowsLimit).toBe(100);
    expect(meta.rowsTruncated).toBe(Math.max(0, snapshot.highRiskRows.length - 100));
  });
});

describe('buildAresV6EvidenceRoutePayload — compareScope warning', () => {
  it('surfaces comparison_not_filtered_by_preset in meta.warnings', async () => {
    const { deps } = makeDeps(await makeSnapshot());
    const { meta } = await buildAresV6EvidenceRoutePayload(
      query({ presetId: 'STANDARD_PRO', includeLegacyCompare: 'true', compareScope: 'all' }),
      deps,
    );
    expect(meta.warnings).toContain(ARES_V6_EVIDENCE_WARNING_COMPARISON_NOT_FILTERED);
  });

  it('forwards the deviceId/presetId filter into the snapshot call', async () => {
    const { deps, buildSnapshot } = makeDeps(await makeSnapshot());
    await buildAresV6EvidenceRoutePayload(query({ presetId: 'STANDARD_PRO', deviceId: 'abc123' }), deps);
    const arg = buildSnapshot.mock.calls[0]?.[0];
    expect(arg?.filter?.presetId).toBe('STANDARD_PRO');
    expect(arg?.filter?.deviceId).toBe('abc123');
  });
});
