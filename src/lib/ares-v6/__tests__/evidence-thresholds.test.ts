import { describe, expect, it } from 'vitest';

import {
  ARES_V6_EVIDENCE_THRESHOLDS_VERSION,
  evaluateAresV6GoNoGo,
  explainGoNoGoDecision,
  getDefaultAresV6EvidenceThresholds,
  type AresV6GoNoGoMetrics,
} from '../evidence-thresholds';

// All thresholds pass → GO. Each test mutates one axis to force a NO_GO category.
function goMetrics(overrides: Partial<AresV6GoNoGoMetrics> = {}): AresV6GoNoGoMetrics {
  return {
    totalGenerations: 120,
    totalTrustedFeedback: 40,
    evaluatedCells: 12,
    insufficientSampleCells: 0,
    p95TotalDurationMs: 320,
    generationErrorRate: 0,
    persistenceDegradedRate: 0,
    fallbackPpiRate: 0.02,
    highOrLabVerifiedRate: 0.92,
    averageRating: 4.6,
    worseOutcomeRate: 0.05,
    dangerousStructuralRows: 0,
    reviewStructuralRows: 0,
    evidenceFixtureCoverage: 0.92,
    comparisonFixtureCoverage: 0.92,
    feedbackCoverageRate: 0.4,
    suspiciousFeedbackRate: 0.05,
    ...overrides,
  };
}

describe('getDefaultAresV6EvidenceThresholds', () => {
  it('exposes the versioned default thresholds', () => {
    const t = getDefaultAresV6EvidenceThresholds();
    expect(t.minTrustedFeedbackPerDevicePreset).toBe(5);
    expect(t.minGenerationsPerDevicePreset).toBe(5);
    expect(t.minFixtureCoverage).toBe(0.8);
    expect(t.maxFallbackPpiRate).toBe(0.05);
    expect(t.maxP95TotalDurationMs).toBe(700);
    expect(t.maxGenerationErrorRate).toBe(0.01);
    expect(t.maxPersistenceDegradedRate).toBe(0);
    expect(t.minHighOrLabVerifiedRate).toBe(0.8);
    expect(t.minFeedbackCoverageRate).toBe(0.3);
    expect(t.minAverageRatingForGo).toBe(4.3);
    expect(t.maxWorseOutcomeRate).toBe(0.15);
    expect(t.maxSuspiciousFeedbackRate).toBe(0.2);
    expect(t.version).toBe(ARES_V6_EVIDENCE_THRESHOLDS_VERSION);
  });
});

describe('evaluateAresV6GoNoGo', () => {
  it('returns GO when all thresholds pass', () => {
    const result = evaluateAresV6GoNoGo(goMetrics());
    expect(result.decision).toBe('GO_INTERNAL_UI_EXPERIMENT');
    expect(result.failedCriteria).toHaveLength(0);
  });

  it('returns NO_GO_MORE_DATA when sample size is low', () => {
    const result = evaluateAresV6GoNoGo(goMetrics({ totalTrustedFeedback: 2, insufficientSampleCells: 3 }));
    expect(result.decision).toBe('NO_GO_MORE_DATA');
    expect(result.failedCriteria.some((c) => c.criterion === 'totalTrustedFeedback')).toBe(true);
  });

  it('returns NO_GO_MORE_DATA when suspicious feedback is dominant', () => {
    const result = evaluateAresV6GoNoGo(goMetrics({ suspiciousFeedbackRate: 0.5 }));
    expect(result.decision).toBe('NO_GO_MORE_DATA');
    expect(result.failedCriteria.some((c) => c.criterion === 'suspiciousFeedbackRate')).toBe(true);
  });

  it('returns NO_GO_INFRA when p95 latency is high', () => {
    const result = evaluateAresV6GoNoGo(goMetrics({ p95TotalDurationMs: 900 }));
    expect(result.decision).toBe('NO_GO_INFRA');
    expect(result.failedCriteria[0]?.category).toBe('INFRA');
  });

  it('returns NO_GO_INFRA when persistence is degraded', () => {
    const result = evaluateAresV6GoNoGo(goMetrics({ persistenceDegradedRate: 0.1 }));
    expect(result.decision).toBe('NO_GO_INFRA');
  });

  it('prioritises INFRA over MORE_DATA and FIX_ENGINE', () => {
    const result = evaluateAresV6GoNoGo(
      goMetrics({ p95TotalDurationMs: 900, totalTrustedFeedback: 1, averageRating: 1 }),
    );
    expect(result.decision).toBe('NO_GO_INFRA');
  });

  it('returns NO_GO_FIX_ENGINE when rating is bad but sample/infra are fine', () => {
    const result = evaluateAresV6GoNoGo(goMetrics({ averageRating: 3.0 }));
    expect(result.decision).toBe('NO_GO_FIX_ENGINE');
    expect(result.failedCriteria.some((c) => c.criterion === 'averageRating')).toBe(true);
  });

  it('returns NO_GO_FIX_ENGINE when outcome is bad', () => {
    const result = evaluateAresV6GoNoGo(goMetrics({ worseOutcomeRate: 0.4 }));
    expect(result.decision).toBe('NO_GO_FIX_ENGINE');
  });

  it('returns NO_GO_FIX_ENGINE when a structural row is DANGEROUS', () => {
    const result = evaluateAresV6GoNoGo(goMetrics({ dangerousStructuralRows: 1 }));
    expect(result.decision).toBe('NO_GO_FIX_ENGINE');
    expect(result.failedCriteria.some((c) => c.criterion === 'dangerousStructuralRows')).toBe(true);
  });

  it('gates fixture coverage on EVIDENCE, not COMPARISON coverage', () => {
    // High comparison coverage must NOT rescue low real-evidence coverage.
    const result = evaluateAresV6GoNoGo(goMetrics({ evidenceFixtureCoverage: 0.1, comparisonFixtureCoverage: 1 }));
    expect(result.decision).toBe('NO_GO_MORE_DATA');
    expect(result.failedCriteria.some((c) => c.criterion === 'evidenceFixtureCoverage')).toBe(true);
  });

  it('is deterministic for the same input', () => {
    const m = goMetrics({ averageRating: 3.0 });
    expect(evaluateAresV6GoNoGo(m)).toEqual(evaluateAresV6GoNoGo(m));
  });
});

describe('explainGoNoGoDecision', () => {
  it('explains a GO with a human-decision reminder', () => {
    const lines = explainGoNoGoDecision(evaluateAresV6GoNoGo(goMetrics()));
    expect(lines.join('\n')).toContain('GO');
    expect(lines.join('\n')).toContain('UI experimental');
  });

  it('explains a NO_GO with the failed criteria', () => {
    const lines = explainGoNoGoDecision(evaluateAresV6GoNoGo(goMetrics({ averageRating: 2 })));
    expect(lines.join('\n')).toContain('NO-GO');
    expect(lines.join('\n')).toContain('averageRating');
  });
});
