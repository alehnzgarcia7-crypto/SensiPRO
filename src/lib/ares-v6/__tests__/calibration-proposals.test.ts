import { describe, expect, it } from 'vitest';

import { ARES_V6_LATAM_CALIBRATION_FIXTURES } from '@ares/algorithms/engine-v6';

import { generateAresV6CalibrationProposals } from '../calibration-proposals';
import {
  buildAresV6EvidenceSnapshot,
  type AresV6DevicePresetCount,
  type AresV6EvidenceSnapshot,
  type AresV6EvidenceSnapshotDeps,
} from '../evidence-snapshot';
import type { AresV6LabMetrics } from '../lab-metrics';
import { buildAresV6ComparisonMatrix, type AresV6ComparisonRow } from '../legacy-vs-v6-comparator';

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

const sufficientCells: AresV6DevicePresetCount[] = [
  { deviceId: 'dev1', presetId: 'STANDARD_PRO', generations: 30, trustedFeedback: 12 },
  { deviceId: 'dev2', presetId: 'STANDARD_PRO', generations: 30, trustedFeedback: 10 },
];

/** Sufficient cells mapped to the first `count` real fixtures → real evidence coverage. */
function fixtureCells(count: number): AresV6DevicePresetCount[] {
  return ARES_V6_LATAM_CALIBRATION_FIXTURES.slice(0, count).map((fixture, index) => ({
    deviceId: `dev-${index}`,
    presetId: 'STANDARD_PRO',
    generations: 30,
    trustedFeedback: 12,
    deviceBrand: fixture.device.brand,
    deviceModel: fixture.device.model,
    deviceSlug: fixture.id,
  }));
}

const realComparison = buildAresV6ComparisonMatrix({ standardOnly: true });

/** One synthetic DANGEROUS comparison row (structural risk BLOCKING). */
function dangerousRows(): AresV6ComparisonRow[] {
  const nulls = { general: null, redPoint: null, scope2x: null, scope4x: null, sniperScope: null, freeView: null };
  const same = { general: 'SAME', redPoint: 'SAME', scope2x: 'SAME', scope4x: 'SAME', sniperScope: 'SAME', freeView: 'SAME' } as const;
  const none = { general: 'NONE', redPoint: 'NONE', scope2x: 'NONE', scope4x: 'NONE', sniperScope: 'NONE', freeView: 'NONE' } as const;
  return [
    {
      fixtureId: 'samsung-galaxy-a14',
      brand: 'Samsung',
      model: 'Galaxy A14',
      presetId: 'STANDARD_PRO',
      ppi: 400,
      ppiSource: 'PPI',
      fallbackPpi: false,
      legacyEquivalent: true,
      legacy: { general: 99, redPoint: 94, scope2x: 89, scope4x: 79, sniperScope: 59, freeView: 67, source: 'LEGACY' },
      v6: { general: 180, redPoint: 165, scope2x: 110, scope4x: 150, sniperScope: 100, freeView: 80, source: 'ARES_V6' },
      deltas: { ...nulls },
      relativeDeltas: { ...nulls },
      severities: { ...none },
      directions: { ...same },
      expectedness: 'DANGEROUS',
      rationale: ['PELIGRO: scope4x > scope2x.'],
      requiresHumanReview: true,
    },
  ];
}

async function snapshot(
  metrics: AresV6LabMetrics,
  counts: AresV6DevicePresetCount[],
  comparisonRows = realComparison,
): Promise<AresV6EvidenceSnapshot> {
  const deps: AresV6EvidenceSnapshotDeps = {
    getMetrics: async () => metrics,
    getDevicePresetCounts: async () => counts,
    now: () => 0,
  };
  return buildAresV6EvidenceSnapshot({ comparisonRows }, deps);
}

describe('generateAresV6CalibrationProposals — gates', () => {
  it('NO proposal with low sample size (INSUFFICIENT_SAMPLE)', async () => {
    const snap = await snapshot(makeMetrics({ totalFeedback: 2 }), [
      { deviceId: 'd', presetId: 'STANDARD_PRO', generations: 2, trustedFeedback: 1 },
    ]);
    const result = generateAresV6CalibrationProposals(snap);
    expect(result.proposals).toHaveLength(1);
    expect(result.proposals[0]?.proposalType).toBe('NO_CHANGE_RECOMMENDED');
    expect(result.proposals[0]?.blockedReasons).toContain('INSUFFICIENT_SAMPLE');
  });

  it('NO proposal from SUSPICIOUS-dominant feedback', async () => {
    const snap = await snapshot(makeMetrics({ suspiciousFeedbackExcluded: 50, totalFeedback: 10 }), sufficientCells);
    const result = generateAresV6CalibrationProposals(snap);
    expect(result.proposals[0]?.blockedReasons).toContain('SUSPICIOUS_FEEDBACK_DOMINANT');
  });

  it('NO proposal when infra is failing (INFRA_UNHEALTHY)', async () => {
    const snap = await snapshot(makeMetrics({ p95TotalDurationMs: 1200 }), sufficientCells);
    const result = generateAresV6CalibrationProposals(snap);
    expect(result.proposals[0]?.blockedReasons).toContain('INFRA_UNHEALTHY');
  });

  it('NO proposal when PPI fallback dominates (FALLBACK_PPI_DOMINANT)', async () => {
    const snap = await snapshot(makeMetrics({ fallbackPpiRate: 0.5 }), sufficientCells);
    const result = generateAresV6CalibrationProposals(snap);
    expect(result.proposals[0]?.blockedReasons).toContain('FALLBACK_PPI_DOMINANT');
  });

  it('NO change when evidence is good (GO)', async () => {
    const snap = await snapshot(makeMetrics(), fixtureCells(12));
    expect(snap.goNoGo.decision).toBe('GO_INTERNAL_UI_EXPERIMENT');
    const result = generateAresV6CalibrationProposals(snap);
    expect(result.proposals[0]?.proposalType).toBe('NO_CHANGE_RECOMMENDED');
    expect(result.proposals[0]?.blockedReasons).toHaveLength(0);
  });
});

describe('generateAresV6CalibrationProposals — actionable (FIX_ENGINE)', () => {
  it('emits a human-review proposal when trusted rating is low', async () => {
    const snap = await snapshot(makeMetrics({ ratingDistribution: { '2': 30, '3': 10 } }), fixtureCells(12));
    expect(snap.goNoGo.decision).toBe('NO_GO_FIX_ENGINE');
    const result = generateAresV6CalibrationProposals(snap);
    const actionable = result.proposals.find((p) => p.status === 'PENDING_HUMAN_REVIEW');
    expect(actionable).toBeDefined();
    expect(actionable?.humanReviewRequired).toBe(true);
    expect(actionable?.proposalType).not.toBe('NO_CHANGE_RECOMMENDED');
  });
});

describe('generateAresV6CalibrationProposals — 3D.1 structural risk + coverage gates', () => {
  it('surfaces structural risk but blocks proposals when the sample is thin (dangerous + no data)', async () => {
    const snap = await snapshot(makeMetrics({ totalFeedback: 2 }), [], dangerousRows());
    expect(snap.structuralRisk.decision).toBe('BLOCKING');
    const result = generateAresV6CalibrationProposals(snap);
    expect(result.proposals[0]?.proposalType).toBe('NO_CHANGE_RECOMMENDED');
    expect(result.proposals[0]?.blockedReasons).toContain('STRUCTURAL_RISK_REVIEW_REQUIRED');
    expect(result.proposals[0]?.blockedReasons).toContain('INSUFFICIENT_SAMPLE');
  });

  it('generates human-review proposals for structural risk WHEN evidence is sufficient', async () => {
    const snap = await snapshot(makeMetrics(), fixtureCells(12), dangerousRows());
    expect(snap.structuralRisk.decision).toBe('BLOCKING');
    const result = generateAresV6CalibrationProposals(snap);
    const actionable = result.proposals.find((p) => p.status === 'PENDING_HUMAN_REVIEW');
    expect(actionable).toBeDefined();
    expect(actionable?.humanReviewRequired).toBe(true);
    expect(actionable?.autoApplyAllowed).toBe(false);
  });

  it('blocks proposals when EVIDENCE coverage is insufficient (sample fine, breadth thin)', async () => {
    // One fixture-known sufficient cell → 1/13 evidence coverage < 0.8.
    const snap = await snapshot(makeMetrics(), fixtureCells(1));
    const result = generateAresV6CalibrationProposals(snap);
    expect(result.proposals[0]?.proposalType).toBe('NO_CHANGE_RECOMMENDED');
    expect(result.proposals[0]?.blockedReasons).toContain('EVIDENCE_COVERAGE_INSUFFICIENT');
  });
});

describe('invariants', () => {
  it('autoApplyAllowed is ALWAYS false and humanReviewRequired ALWAYS true', async () => {
    const snaps = await Promise.all([
      snapshot(makeMetrics(), sufficientCells),
      snapshot(makeMetrics({ ratingDistribution: { '2': 40 } }), sufficientCells),
      snapshot(makeMetrics({ p95TotalDurationMs: 1200 }), sufficientCells),
      snapshot(makeMetrics({ totalFeedback: 1 }), [{ deviceId: 'd', presetId: 'STANDARD_PRO', generations: 1, trustedFeedback: 0 }]),
    ]);
    for (const snap of snaps) {
      for (const proposal of generateAresV6CalibrationProposals(snap).proposals) {
        expect(proposal.autoApplyAllowed).toBe(false);
        expect(proposal.humanReviewRequired).toBe(true);
      }
    }
  });
});
