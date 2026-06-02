import { describe, expect, it } from 'vitest';

import {
  averageRatingFromDistribution,
  buildAresV6EvidenceSnapshot,
  calculateTrustedFeedbackStats,
  summarizeEvidenceByDevicePreset,
  type AresV6DevicePresetCount,
  type AresV6EvidenceSnapshotDeps,
} from '../evidence-snapshot';
import { getDefaultAresV6EvidenceThresholds } from '../evidence-thresholds';
import type { AresV6LabMetrics } from '../lab-metrics';
import type { AresV6ComparisonRow } from '../legacy-vs-v6-comparator';

function makeMetrics(overrides: Partial<AresV6LabMetrics> = {}): AresV6LabMetrics {
  return {
    totalGenerations: 120,
    totalFeedback: 40,
    p50TotalDurationMs: 200,
    p95TotalDurationMs: 300,
    p99TotalDurationMs: 400,
    avgDbDurationMs: 5,
    avgEngineDurationMs: 1,
    fallbackPpiRate: 0.02,
    confidenceDistribution: { HIGH: 100, LAB_VERIFIED: 12, MEDIUM: 8 },
    presetDistribution: {},
    modeDistribution: {},
    deviceDistribution: {},
    ratingDistribution: { '5': 30, '4': 8, '3': 2 },
    outcomeDistribution: { BETTER: 36, SAME: 3, WORSE: 1 },
    unresolvedProblemRate: 0.05,
    feedbackCoverageRate: 0.4,
    rateLimitDegradedCount: 0,
    labModeCount: 0,
    suspiciousFeedbackExcluded: 0,
    ...overrides,
  };
}

function sufficientCells(): AresV6DevicePresetCount[] {
  return [
    { deviceId: 'dev1', presetId: 'STANDARD_PRO', generations: 30, trustedFeedback: 12 },
    { deviceId: 'dev2', presetId: 'STANDARD_PRO', generations: 30, trustedFeedback: 10 },
  ];
}

function deps(metrics: AresV6LabMetrics, counts: AresV6DevicePresetCount[]): AresV6EvidenceSnapshotDeps {
  return {
    getMetrics: async () => metrics,
    getDevicePresetCounts: async () => counts,
    now: () => 0,
  };
}

function comparisonRow(overrides: Partial<AresV6ComparisonRow>): AresV6ComparisonRow {
  return {
    fixtureId: 'samsung-galaxy-a14',
    brand: 'Samsung',
    model: 'Galaxy A14',
    presetId: 'STANDARD_PRO',
    ppi: 400,
    ppiSource: 'PPI',
    fallbackPpi: false,
    legacyEquivalent: true,
    legacy: null,
    v6: { general: 180, redPoint: 165, scope2x: 160, scope4x: 140, sniperScope: 115, freeView: 80, source: 'ARES_V6' },
    deltas: { general: 80, redPoint: 70, scope2x: 70, scope4x: 60, sniperScope: 55, freeView: 13 },
    relativeDeltas: { general: null, redPoint: null, scope2x: null, scope4x: null, sniperScope: null, freeView: null },
    severities: { general: 'HIGH', redPoint: 'HIGH', scope2x: 'HIGH', scope4x: 'HIGH', sniperScope: 'HIGH', freeView: 'MEDIUM' },
    directions: { general: 'V6_HIGHER', redPoint: 'V6_HIGHER', scope2x: 'V6_HIGHER', scope4x: 'V6_HIGHER', sniperScope: 'V6_HIGHER', freeView: 'V6_HIGHER' },
    expectedness: 'EXPECTED',
    rationale: ['ok'],
    requiresHumanReview: false,
    ...overrides,
  };
}

describe('averageRatingFromDistribution', () => {
  it('computes a weighted average and 0 for empty', () => {
    expect(averageRatingFromDistribution({ '5': 3, '4': 1 })).toBe(4.75);
    expect(averageRatingFromDistribution({})).toBe(0);
  });
});

describe('calculateTrustedFeedbackStats', () => {
  it('derives rates from the (trusted) lab metrics', () => {
    const stats = calculateTrustedFeedbackStats(makeMetrics());
    expect(stats.count).toBe(40);
    expect(stats.averageRating).toBeGreaterThan(4.5);
    expect(stats.worseRate).toBeCloseTo(1 / 40, 4);
  });
});

describe('summarizeEvidenceByDevicePreset', () => {
  it('flags cells below the sample floors', () => {
    const cells = summarizeEvidenceByDevicePreset(
      [{ deviceId: 'd', presetId: 'STANDARD_PRO', generations: 2, trustedFeedback: 1 }],
      getDefaultAresV6EvidenceThresholds(),
    );
    expect(cells[0]?.sufficient).toBe(false);
  });
});

describe('buildAresV6EvidenceSnapshot', () => {
  it('builds a trusted-only snapshot and covers fixtures from comparison rows', async () => {
    const snapshot = await buildAresV6EvidenceSnapshot(
      { comparisonRows: [comparisonRow({})] },
      deps(makeMetrics(), sufficientCells()),
    );
    expect(snapshot.metrics.totalGenerations).toBe(120);
    expect(snapshot.trustedFeedbackSummary.count).toBe(40);
    expect(snapshot.coveredFixtures).toBe(1);
    expect(snapshot.generatedAt).toBe(new Date(0).toISOString());
  });

  it('includes the suspicious count but excludes it from trusted metrics', async () => {
    const metrics = makeMetrics({ suspiciousFeedbackExcluded: 8 });
    const snapshot = await buildAresV6EvidenceSnapshot({}, deps(metrics, sufficientCells()));
    expect(snapshot.trustedFeedbackSummary.suspiciousExcluded).toBe(8);
    // 8 suspicious out of (40 trusted + 8) → rate ~0.1667, still trusted-driven metrics.
    expect(snapshot.goNoGoInput.suspiciousFeedbackRate).toBeCloseTo(8 / 48, 3);
    expect(snapshot.goNoGoInput.totalTrustedFeedback).toBe(40);
  });

  it('identifies insufficient-evidence cells and yields NO_GO_MORE_DATA', async () => {
    const counts: AresV6DevicePresetCount[] = [
      { deviceId: 'd', presetId: 'STANDARD_PRO', generations: 2, trustedFeedback: 1 },
    ];
    const snapshot = await buildAresV6EvidenceSnapshot({}, deps(makeMetrics(), counts));
    expect(snapshot.insufficientEvidenceRows.length).toBe(1);
    expect(snapshot.goNoGo.decision).toBe('NO_GO_MORE_DATA');
  });

  it('surfaces high-risk comparison rows', async () => {
    const danger = comparisonRow({ expectedness: 'DANGEROUS', requiresHumanReview: true });
    const snapshot = await buildAresV6EvidenceSnapshot({ comparisonRows: [danger] }, deps(makeMetrics(), sufficientCells()));
    expect(snapshot.highRiskRows).toHaveLength(1);
    expect(snapshot.comparisonSummary.dangerous).toBe(1);
  });
});
