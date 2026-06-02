import { describe, expect, it, vi } from 'vitest';

import {
  average,
  computeAresV6LabMetrics,
  getAresV6LabMetrics,
  percentile,
  type AresV6FeedbackMetricRow,
  type AresV6GenerationMetricRow,
} from '../lab-metrics';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Lab metrics (Fase 3C)
// ═══════════════════════════════════════════════════════════════

function gen(overrides: Partial<AresV6GenerationMetricRow> = {}): AresV6GenerationMetricRow {
  return {
    totalDurationMs: 100,
    dbDurationMs: 5,
    engineDurationMs: 2,
    ppiSource: 'PPI',
    detectedPpi: 395,
    confidenceGrade: 'HIGH',
    presetId: 'STANDARD_PRO',
    mode: 'BATTLE_ROYALE',
    deviceId: 'dev-1',
    rateLimitDegraded: false,
    labMode: true,
    ...overrides,
  };
}

function fb(overrides: Partial<AresV6FeedbackMetricRow> = {}): AresV6FeedbackMetricRow {
  return { rating: 4, outcome: 'BETTER', problemResolved: true, qualityFlag: 'TRUSTED', ...overrides };
}

describe('percentile / average', () => {
  it('computes nearest-rank percentiles and averages', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(values, 50)).toBe(5);
    expect(percentile(values, 95)).toBe(10);
    expect(percentile([], 95)).toBe(0);
    expect(average([2, 4, 6])).toBe(4);
  });
});

describe('computeAresV6LabMetrics', () => {
  it('returns zeros for empty input', () => {
    const metrics = computeAresV6LabMetrics([], []);
    expect(metrics.totalGenerations).toBe(0);
    expect(metrics.p95TotalDurationMs).toBe(0);
    expect(metrics.fallbackPpiRate).toBe(0);
    expect(metrics.feedbackCoverageRate).toBe(0);
  });

  it('computes distributions, fallback rate and excludes suspicious feedback by default', () => {
    const generations = [
      gen({ totalDurationMs: 100 }),
      gen({ totalDurationMs: 200, detectedPpi: null, ppiSource: 'TIER_FALLBACK', confidenceGrade: 'MEDIUM' }),
      gen({ totalDurationMs: 300, rateLimitDegraded: true }),
      gen({ totalDurationMs: 400 }),
    ];
    const feedback = [
      fb({ rating: 5, outcome: 'BETTER' }),
      fb({ rating: 1, outcome: 'WORSE', problemResolved: false, qualityFlag: 'SUSPICIOUS' }),
    ];

    const metrics = computeAresV6LabMetrics(generations, feedback);
    expect(metrics.totalGenerations).toBe(4);
    expect(metrics.totalFeedback).toBe(1); // suspicious excluded
    expect(metrics.suspiciousFeedbackExcluded).toBe(1);
    expect(metrics.fallbackPpiRate).toBe(0.25);
    expect(metrics.confidenceDistribution.HIGH).toBe(3);
    expect(metrics.rateLimitDegradedCount).toBe(1);
    expect(metrics.outcomeDistribution.BETTER).toBe(1);
    expect(metrics.feedbackCoverageRate).toBe(0.25);
  });

  it('includes suspicious feedback when requested', () => {
    const metrics = computeAresV6LabMetrics([gen()], [fb({ qualityFlag: 'SUSPICIOUS' })], true);
    expect(metrics.totalFeedback).toBe(1);
    expect(metrics.suspiciousFeedbackExcluded).toBe(0);
  });
});

describe('getAresV6LabMetrics', () => {
  it('fetches via injected deps and computes', async () => {
    const result = await getAresV6LabMetrics(
      {},
      {
        fetchGenerations: vi.fn().mockResolvedValue([gen(), gen({ totalDurationMs: 500 })]),
        fetchFeedback: vi.fn().mockResolvedValue([fb()]),
      },
    );
    expect(result.totalGenerations).toBe(2);
    expect(result.totalFeedback).toBe(1);
  });
});
