import { describe, expect, it } from 'vitest';

import {
  buildAresV6HumanReviewPacket,
  buildDefaultAresV6HumanReviewPlan,
  evaluateAresV6HumanReviewReadiness,
  sanitizeAresV6HumanReviewPacket,
  type AresV6ReviewEvidenceInput,
} from '../human-review-session';

// ═══════════════════════════════════════════════════════════════
// Fase 3F — human review session model. Proves the decision precedence, the
// DRAFT-until-human invariant, and the secret sanitizer.
// ═══════════════════════════════════════════════════════════════

function evidence(overrides: Partial<AresV6ReviewEvidenceInput> = {}): AresV6ReviewEvidenceInput {
  return {
    mode: 'from-db',
    goNoGoDecision: 'GO_INTERNAL_UI_EXPERIMENT',
    structuralRisk: 'CLEAR',
    evidenceFixtureCoverage: 0.9,
    comparisonFixtureCoverage: 1,
    totalFixtures: 12,
    evidenceCoveredFixtures: 11,
    feedbackCoverageRate: 0.5,
    totalGenerations: 120,
    totalTrustedFeedback: 60,
    dangerousRows: 0,
    needsReviewRows: 0,
    highRiskSummaryRows: [],
    recommendedNextActions: [],
    proposalsCount: 0,
    ...overrides,
  };
}

describe('buildDefaultAresV6HumanReviewPlan', () => {
  it('includes all 12 LATAM fixtures', () => {
    expect(buildDefaultAresV6HumanReviewPlan().fixtures).toHaveLength(12);
  });
});

describe('evaluateAresV6HumanReviewReadiness', () => {
  it('recommends NO_GO_MORE_EVIDENCE when evidence coverage is zero', () => {
    const result = evaluateAresV6HumanReviewReadiness({ evidence: evidence({ evidenceFixtureCoverage: 0, mode: 'fixtures-only' }) });
    expect(result.recommendedDecision).toBe('NO_GO_MORE_EVIDENCE');
    expect(result.closedBetaReady).toBe(false);
  });

  it('recommends NO_GO_FIX_BLOCKERS when structural risk is BLOCKING', () => {
    const result = evaluateAresV6HumanReviewReadiness({
      evidence: evidence({ structuralRisk: 'BLOCKING', dangerousRows: 2 }),
    });
    expect(result.recommendedDecision).toBe('NO_GO_FIX_BLOCKERS');
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it('recommends GO_PREPARE_CLOSED_BETA_DESIGN when every gate passes', () => {
    const result = evaluateAresV6HumanReviewReadiness({
      evidence: evidence(),
      smoke: { ran: true, passed: true },
      deploymentProtectionVerified: true,
    });
    expect(result.recommendedDecision).toBe('GO_PREPARE_CLOSED_BETA_DESIGN');
    expect(result.closedBetaReady).toBe(true);
  });

  it('falls back to GO_HIDDEN_UI_CONTINUE when healthy but deployment protection is unverified', () => {
    const result = evaluateAresV6HumanReviewReadiness({ evidence: evidence(), smoke: { ran: true, passed: true } });
    expect(result.recommendedDecision).toBe('GO_HIDDEN_UI_CONTINUE');
    expect(result.unmetClosedBetaGates).toContain('Protección de deployment no verificada por un humano.');
  });
});

describe('buildAresV6HumanReviewPacket', () => {
  it('stays DRAFT (decision null) until a human decides', () => {
    const packet = buildAresV6HumanReviewPacket({
      plan: buildDefaultAresV6HumanReviewPlan(),
      readinessInput: { evidence: evidence({ evidenceFixtureCoverage: 0 }) },
      generatedAt: '1970-01-01T00:00:00.000Z',
    });
    expect(packet.decision.status).toBe('DRAFT');
    expect(packet.decision.decision).toBeNull();
    expect(packet.decision.recommendedDecision).toBe('NO_GO_MORE_EVIDENCE');
  });

  it('becomes FINAL only with decidedBy + rationale + decision', () => {
    const packet = buildAresV6HumanReviewPacket({
      plan: buildDefaultAresV6HumanReviewPlan(),
      readinessInput: { evidence: evidence() },
      generatedAt: '1970-01-01T00:00:00.000Z',
      human: { decision: 'GO_HIDDEN_UI_CONTINUE', decidedBy: 'alex', rationale: ['evidence reviewed'] },
    });
    expect(packet.decision.status).toBe('FINAL');
    expect(packet.decision.decision).toBe('GO_HIDDEN_UI_CONTINUE');
  });
});

describe('sanitizeAresV6HumanReviewPacket', () => {
  it('redacts secret-looking values', () => {
    const packet = buildAresV6HumanReviewPacket({
      plan: buildDefaultAresV6HumanReviewPlan(),
      readinessInput: { evidence: evidence() },
      generatedAt: '1970-01-01T00:00:00.000Z',
      human: { decision: 'GO_HIDDEN_UI_CONTINUE', decidedBy: 'alex', rationale: [`leaked ${'a'.repeat(64)}`] },
    });
    const clean = sanitizeAresV6HumanReviewPacket(packet);
    expect(JSON.stringify(clean)).not.toContain('a'.repeat(64));
    expect(clean.decision.rationale[0]).toBe('[redacted]');
  });
});
