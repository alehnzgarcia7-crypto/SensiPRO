import { describe, expect, it } from 'vitest';

import {
  AresV6EvidenceParseError,
  AresV6HumanReviewArgError,
  buildAresV6HumanReviewMarkdown,
  extractAresV6ReviewEvidence,
  parseAresV6HumanReviewArgs,
} from '../human-review-cli';
import { buildAresV6HumanReviewPacket, buildDefaultAresV6HumanReviewPlan } from '../human-review-session';

// ═══════════════════════════════════════════════════════════════
// Fase 3F — human review CLI core. Proves arg validation, tolerant evidence
// extraction, the decision pipeline over real evidence shapes, and no secrets.
// ═══════════════════════════════════════════════════════════════

function evidenceJson(overrides: {
  mode?: 'from-db' | 'fixtures-only';
  decision?: string;
  structuralRisk?: string;
  coverage?: number;
  feedbackCoverage?: number;
} = {}): unknown {
  return {
    mode: overrides.mode ?? 'from-db',
    proposals: null,
    snapshot: {
      goNoGo: { decision: overrides.decision ?? 'GO_INTERNAL_UI_EXPERIMENT' },
      structuralRisk: { decision: overrides.structuralRisk ?? 'CLEAR', dangerousRows: 0, needsReviewRows: 0 },
      evidenceFixtureCoverage: overrides.coverage ?? 0.9,
      comparisonFixtureCoverage: 1,
      totalFixtures: 12,
      evidenceCoveredFixtures: 11,
      metrics: { feedbackCoverageRate: overrides.feedbackCoverage ?? 0.5, totalGenerations: 100, totalFeedback: 60 },
      highRiskSummaryRows: [],
      recommendedNextActions: ['Mantener OFF.'],
    },
  };
}

describe('parseAresV6HumanReviewArgs', () => {
  it('requires --evidence-json', () => {
    expect(() => parseAresV6HumanReviewArgs([])).toThrow(AresV6HumanReviewArgError);
  });

  it('parses a full arg set', () => {
    const opts = parseAresV6HumanReviewArgs([
      '--evidence-json',
      'ev.json',
      '--operator',
      'alex',
      '--deployment-protection-verified',
      '--dry-run',
    ]);
    expect(opts.evidenceJson).toBe('ev.json');
    expect(opts.operator).toBe('alex');
    expect(opts.deploymentProtectionVerified).toBe(true);
    expect(opts.dryRun).toBe(true);
  });
});

describe('extractAresV6ReviewEvidence', () => {
  it('maps a valid evidence report', () => {
    const ev = extractAresV6ReviewEvidence(evidenceJson({ coverage: 0.8 }));
    expect(ev.goNoGoDecision).toBe('GO_INTERNAL_UI_EXPERIMENT');
    expect(ev.evidenceFixtureCoverage).toBe(0.8);
    expect(ev.structuralRisk).toBe('CLEAR');
  });

  it('throws on a malformed report', () => {
    expect(() => extractAresV6ReviewEvidence({ mode: 'from-db' })).toThrow(AresV6EvidenceParseError);
  });
});

describe('decision pipeline over extracted evidence', () => {
  it('NO_GO_MORE_DATA evidence → NO_GO_MORE_EVIDENCE packet', () => {
    const ev = extractAresV6ReviewEvidence(
      evidenceJson({ mode: 'fixtures-only', decision: 'NO_GO_MORE_DATA', coverage: 0 }),
    );
    const packet = buildAresV6HumanReviewPacket({
      plan: buildDefaultAresV6HumanReviewPlan(),
      readinessInput: { evidence: ev },
      generatedAt: '1970-01-01T00:00:00.000Z',
    });
    expect(packet.readiness.recommendedDecision).toBe('NO_GO_MORE_EVIDENCE');
    expect(packet.decision.status).toBe('DRAFT');
  });

  it('GO evidence + clear smoke + verified protection → GO_PREPARE_CLOSED_BETA_DESIGN (still DRAFT)', () => {
    const ev = extractAresV6ReviewEvidence(evidenceJson({ coverage: 0.85 }));
    const packet = buildAresV6HumanReviewPacket({
      plan: buildDefaultAresV6HumanReviewPlan(),
      readinessInput: { evidence: ev, smoke: { ran: true, passed: true }, deploymentProtectionVerified: true },
      generatedAt: '1970-01-01T00:00:00.000Z',
    });
    expect(packet.readiness.recommendedDecision).toBe('GO_PREPARE_CLOSED_BETA_DESIGN');
    expect(packet.decision.status).toBe('DRAFT');
  });
});

describe('buildAresV6HumanReviewMarkdown', () => {
  it('renders sections and never leaks a secret', () => {
    const ev = extractAresV6ReviewEvidence(evidenceJson());
    const packet = buildAresV6HumanReviewPacket({
      plan: buildDefaultAresV6HumanReviewPlan({ operator: 'alex' }),
      readinessInput: { evidence: ev },
      generatedAt: '1970-01-01T00:00:00.000Z',
    });
    const md = buildAresV6HumanReviewMarkdown(packet);
    expect(md).toContain('# ARES v6 — Human Review Packet (Fase 3F)');
    expect(md).toContain('## 8. Decisión');
    expect(md).toContain('El sistema RECOMIENDA, no aprueba');
    expect(md).not.toMatch(/sha256/i);
    expect(md).not.toMatch(/\b[a-f0-9]{64}\b/);
  });
});
