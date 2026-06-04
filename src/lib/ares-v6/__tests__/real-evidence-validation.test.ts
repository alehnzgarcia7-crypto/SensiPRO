import { describe, expect, it } from 'vitest';

import {
  findAresV6ArtifactSecrets,
  resolveAresV6RealExecutionMode,
  validateAresV6RealEvidence,
  type AresV6RealEvidenceArtifacts,
} from '../real-evidence-validation';

// ═══════════════════════════════════════════════════════════════
// Fase 3G — real-evidence validation. Proves real-http demands REAL persisted
// evidence, dry-run-local can never claim it, FINAL needs a human, closed-beta
// gates are enforced even on a forged packet, and any secret in an artifact fails.
// ═══════════════════════════════════════════════════════════════

interface EvidenceOpts {
  mode?: 'from-db' | 'fixtures-only';
  evCov?: number;
  cmpCov?: number;
  risk?: 'CLEAR' | 'REVIEW_REQUIRED' | 'BLOCKING';
  gen?: number;
  fb?: number;
}

function evidenceArtifact(opts: EvidenceOpts = {}): Record<string, unknown> {
  return {
    schemaVersion: '3D.2',
    mode: opts.mode ?? 'from-db',
    snapshot: {
      evidenceFixtureCoverage: opts.evCov ?? 0.9,
      comparisonFixtureCoverage: opts.cmpCov ?? 1,
      structuralRisk: { decision: opts.risk ?? 'CLEAR' },
      metrics: { totalGenerations: opts.gen ?? 120, totalFeedback: opts.fb ?? 40 },
    },
  };
}

interface PacketOpts {
  status?: 'DRAFT' | 'FINAL';
  decision?: string | null;
  decidedBy?: string;
  rationale?: string[];
  recommended?: string;
  evidenceMode?: 'from-db' | 'fixtures-only';
  executionMode?: 'real-http' | 'dry-run-local';
  deploymentProtectionVerified?: boolean;
  smoke?: { ran: boolean; passed: boolean } | null;
}

function packetArtifact(opts: PacketOpts = {}): Record<string, unknown> {
  const recommended = opts.recommended ?? 'GO_HIDDEN_UI_CONTINUE';
  return {
    schemaVersion: '3G',
    decision: {
      status: opts.status ?? 'DRAFT',
      decision: opts.decision ?? null,
      recommendedDecision: recommended,
      decidedBy: opts.decidedBy ?? '',
      rationale: opts.rationale ?? [],
    },
    readiness: { recommendedDecision: recommended },
    evidence: { mode: opts.evidenceMode ?? 'from-db' },
    execution: {
      executionMode: opts.executionMode ?? 'real-http',
      deploymentProtectionVerified: opts.deploymentProtectionVerified ?? false,
    },
    // `'smoke' in opts` distinguishes an explicit null ("no smoke") from "not provided".
    smoke: 'smoke' in opts ? opts.smoke : { ran: true, passed: true },
  };
}

function labReport(): Record<string, unknown> {
  return { total: 12, successCount: 12, failureCount: 0 };
}

const goodSmoke = { ran: true, passed: true };

describe('resolveAresV6RealExecutionMode', () => {
  it('is real-http when a targetUrl is present', () => {
    const mode = resolveAresV6RealExecutionMode({
      targetUrlPresent: true,
      targetUrlRedacted: 'https://x.vercel.app/internal',
      persistGenerations: true,
      feedbackEnabled: false,
    });
    expect(mode.mode).toBe('real-http');
    expect(mode.requiresHumanDecision).toBe(true);
    expect(mode.persistGenerations).toBe(true);
    expect(mode.feedbackEnabled).toBe(false);
  });

  it('is dry-run-local when no targetUrl', () => {
    const mode = resolveAresV6RealExecutionMode({
      targetUrlPresent: false,
      targetUrlRedacted: null,
      persistGenerations: false,
      feedbackEnabled: false,
    });
    expect(mode.mode).toBe('dry-run-local');
  });
});

describe('findAresV6ArtifactSecrets', () => {
  it('flags a 64-hex SHA-256-looking value', () => {
    expect(findAresV6ArtifactSecrets({ note: 'a'.repeat(64) })).not.toHaveLength(0);
  });
  it('flags a sensitive key with a value', () => {
    expect(findAresV6ArtifactSecrets({ token: 'abc123' })).not.toHaveLength(0);
  });
  it('does not flag a redacted value or a normal string', () => {
    expect(findAresV6ArtifactSecrets({ token: '[redacted]', label: 'ares-v6' })).toHaveLength(0);
  });
});

describe('validateAresV6RealEvidence — real-http', () => {
  function realArtifacts(overrides: Partial<AresV6RealEvidenceArtifacts> = {}): AresV6RealEvidenceArtifacts {
    return {
      labReport: labReport(),
      evidence: evidenceArtifact(),
      humanPacket: packetArtifact(),
      uiSmoke: goodSmoke,
      ...overrides,
    };
  }

  it('passes when real evidence is present', () => {
    const result = validateAresV6RealEvidence({ mode: 'real-http', artifacts: realArtifacts(), requireUiSmoke: true });
    expect(result.passed).toBe(true);
  });

  it('fails when evidenceFixtureCoverage = 0', () => {
    const result = validateAresV6RealEvidence({
      mode: 'real-http',
      artifacts: realArtifacts({ evidence: evidenceArtifact({ evCov: 0 }) }),
    });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/evidence_coverage_positive/);
  });

  it('fails when totalGenerations = 0', () => {
    const result = validateAresV6RealEvidence({
      mode: 'real-http',
      artifacts: realArtifacts({ evidence: evidenceArtifact({ gen: 0 }) }),
    });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/total_generations_positive/);
  });

  it('fails when the evidence is fixtures-only', () => {
    const result = validateAresV6RealEvidence({
      mode: 'real-http',
      artifacts: realArtifacts({ evidence: evidenceArtifact({ mode: 'fixtures-only' }) }),
    });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/evidence_mode_real/);
  });

  it('fails when the human packet is missing', () => {
    const result = validateAresV6RealEvidence({ mode: 'real-http', artifacts: realArtifacts({ humanPacket: null }) });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/human_packet_present/);
  });

  it('fails when runUiSmoke is required but the smoke did not run', () => {
    const result = validateAresV6RealEvidence({
      mode: 'real-http',
      artifacts: realArtifacts({ uiSmoke: null, humanPacket: packetArtifact({ smoke: null }) }),
      requireUiSmoke: true,
    });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/ui_smoke_ran/);
  });

  it('fails a FINAL packet without a human (decidedBy + rationale)', () => {
    const result = validateAresV6RealEvidence({
      mode: 'real-http',
      artifacts: realArtifacts({ humanPacket: packetArtifact({ status: 'FINAL', decision: 'GO_HIDDEN_UI_CONTINUE', decidedBy: '', rationale: [] }) }),
    });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/packet_final_requires_human/);
  });

  it('fails a closed-beta recommendation with structuralRisk REVIEW_REQUIRED', () => {
    const result = validateAresV6RealEvidence({
      mode: 'real-http',
      artifacts: realArtifacts({
        evidence: evidenceArtifact({ risk: 'REVIEW_REQUIRED' }),
        humanPacket: packetArtifact({ recommended: 'GO_PREPARE_CLOSED_BETA_DESIGN', deploymentProtectionVerified: true }),
      }),
    });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/closed_beta_gates/);
  });

  it('fails when a secret leaks into an artifact', () => {
    const result = validateAresV6RealEvidence({
      mode: 'real-http',
      artifacts: realArtifacts({ labReport: { ...labReport(), note: 'a'.repeat(64) } }),
    });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/no_secrets_in_artifacts/);
  });
});

describe('validateAresV6RealEvidence — dry-run-local', () => {
  it('passes with evCov = 0 when the packet says NO_GO_MORE_EVIDENCE', () => {
    const result = validateAresV6RealEvidence({
      mode: 'dry-run-local',
      artifacts: {
        labReport: null,
        evidence: evidenceArtifact({ mode: 'fixtures-only', evCov: 0, gen: 0 }),
        humanPacket: packetArtifact({ recommended: 'NO_GO_MORE_EVIDENCE', evidenceMode: 'fixtures-only', executionMode: 'dry-run-local', smoke: null }),
        uiSmoke: null,
      },
    });
    expect(result.passed).toBe(true);
    expect(result.summary.recommendedDecision).toBe('NO_GO_MORE_EVIDENCE');
  });

  it('fails when a dry-run packet recommends closed-beta', () => {
    const result = validateAresV6RealEvidence({
      mode: 'dry-run-local',
      artifacts: {
        labReport: null,
        evidence: evidenceArtifact({ mode: 'fixtures-only', evCov: 0, gen: 0 }),
        humanPacket: packetArtifact({ recommended: 'GO_PREPARE_CLOSED_BETA_DESIGN', evidenceMode: 'fixtures-only', executionMode: 'dry-run-local' }),
        uiSmoke: null,
      },
    });
    expect(result.passed).toBe(false);
    expect(result.errors.join(' ')).toMatch(/dry_run/);
  });
});
