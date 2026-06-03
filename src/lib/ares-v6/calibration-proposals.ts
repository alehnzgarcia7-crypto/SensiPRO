import type { AresV6PresetId, AresV6WeaponCategory } from '@ares/algorithms/engine-v6';

import type { AresV6EvidenceSnapshot } from './evidence-snapshot';
import type { AresV6EvidenceThresholds } from './evidence-thresholds';
import type { AresV6ComparisonRow, AresV6Slider } from './legacy-vs-v6-comparator';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Calibration proposal governance (Fase 3D)
//
// GENERATES proposals. NEVER applies them. Every proposal is humanReviewRequired
// and autoApplyAllowed=false — there is no code path that mutates the engine,
// presets or the research matrix. Proposals are JSON artifacts (no Prisma model
// added: a draft proposal has no clear DB-persistence need yet — see CALIBRATION-
// GOVERNANCE.md). Hard gates block proposals when the evidence cannot support one:
// infra unhealthy, sample too small, SUSPICIOUS feedback dominant, or PPI fallback
// dominant. Feedback is EVIDENCE, never automatic truth.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_CALIBRATION_PROPOSAL_SCHEMA_VERSION = '3D.2';

export type AresV6ProposalStatus = 'DRAFT' | 'PENDING_HUMAN_REVIEW' | 'APPROVED' | 'REJECTED';

export type AresV6ProposalType =
  | 'PPI_BAND_ADJUSTMENT'
  | 'PRESET_BIAS_ADJUSTMENT'
  | 'WEAPON_BIAS_ADJUSTMENT'
  | 'HUD_BUTTON_ADJUSTMENT'
  | 'CONFIDENCE_RULE_ADJUSTMENT'
  | 'NO_CHANGE_RECOMMENDED';

export type AresV6ProposalRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export type AresV6ProposalBlockedReason =
  | 'INFRA_UNHEALTHY'
  | 'INSUFFICIENT_SAMPLE'
  | 'SUSPICIOUS_FEEDBACK_DOMINANT'
  | 'FALLBACK_PPI_DOMINANT'
  | 'STRUCTURAL_RISK_REVIEW_REQUIRED'
  | 'EVIDENCE_COVERAGE_INSUFFICIENT';

export interface AresV6CalibrationProposalTarget {
  presetId?: AresV6PresetId;
  fixtureId?: string;
  ppiBand?: string;
  weaponCategory?: AresV6WeaponCategory;
  slider?: AresV6Slider;
}

export interface AresV6ProposalEvidenceSummary {
  decision: AresV6EvidenceSnapshot['goNoGo']['decision'];
  averageRating: number;
  worseOutcomeRate: number;
  fallbackPpiRate: number;
  highOrLabVerifiedRate: number;
  trustedFeedbackCount: number;
  totalGenerations: number;
  expectedness?: AresV6ComparisonRow['expectedness'];
  rowRationale?: string[];
}

export interface AresV6CalibrationProposal {
  id: string;
  schemaVersion: string;
  createdAt: string;
  status: AresV6ProposalStatus;
  proposalType: AresV6ProposalType;
  target: AresV6CalibrationProposalTarget;
  /** A conservative HINT only; null means "no numeric suggestion, human decides". */
  suggestedDelta: Partial<Record<AresV6Slider, number>> | null;
  evidenceSummary: AresV6ProposalEvidenceSummary;
  requiredEvidence: string[];
  riskLevel: AresV6ProposalRisk;
  /** Invariants of Fase 3D: ALWAYS true / ALWAYS false respectively. */
  humanReviewRequired: true;
  autoApplyAllowed: false;
  rationale: string[];
  blockedReasons: AresV6ProposalBlockedReason[];
}

export interface AresV6ProposalOptions {
  /** Upper bound on emitted proposals (excess is dropped and logged in `truncated`). */
  maxProposals?: number;
  thresholds?: AresV6EvidenceThresholds;
}

export interface AresV6CalibrationProposalResult {
  proposals: AresV6CalibrationProposal[];
  truncated: number;
  generatedFrom: {
    decision: AresV6EvidenceSnapshot['goNoGo']['decision'];
    snapshotGeneratedAt: string;
    thresholdsVersion: string;
  };
}

const DEFAULT_MAX_PROPOSALS = 20;

function baseEvidence(snapshot: AresV6EvidenceSnapshot): AresV6ProposalEvidenceSummary {
  return {
    decision: snapshot.goNoGo.decision,
    averageRating: snapshot.trustedFeedbackSummary.averageRating,
    worseOutcomeRate: snapshot.trustedFeedbackSummary.worseRate,
    fallbackPpiRate: snapshot.goNoGoInput.fallbackPpiRate,
    highOrLabVerifiedRate: snapshot.goNoGoInput.highOrLabVerifiedRate,
    trustedFeedbackCount: snapshot.trustedFeedbackSummary.count,
    totalGenerations: snapshot.metrics.totalGenerations,
  };
}

function slug(value: string | undefined, fallback: string): string {
  return (value ?? fallback).toString().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function makeProposal(params: {
  index: number;
  createdAt: string;
  status: AresV6ProposalStatus;
  proposalType: AresV6ProposalType;
  target: AresV6CalibrationProposalTarget;
  riskLevel: AresV6ProposalRisk;
  rationale: string[];
  requiredEvidence: string[];
  evidenceSummary: AresV6ProposalEvidenceSummary;
  blockedReasons?: AresV6ProposalBlockedReason[];
  suggestedDelta?: Partial<Record<AresV6Slider, number>> | null;
}): AresV6CalibrationProposal {
  const id = `proposal-${slug(params.proposalType, 'type')}-${slug(params.target.presetId, 'global')}-${slug(
    params.target.fixtureId,
    'all',
  )}-${params.index}`;
  return {
    id,
    schemaVersion: ARES_V6_CALIBRATION_PROPOSAL_SCHEMA_VERSION,
    createdAt: params.createdAt,
    status: params.status,
    proposalType: params.proposalType,
    target: params.target,
    suggestedDelta: params.suggestedDelta ?? null,
    evidenceSummary: params.evidenceSummary,
    requiredEvidence: params.requiredEvidence,
    riskLevel: params.riskLevel,
    humanReviewRequired: true,
    autoApplyAllowed: false,
    rationale: params.rationale,
    blockedReasons: params.blockedReasons ?? [],
  };
}

/** Single NO_CHANGE_RECOMMENDED proposal (used for both gated and "good evidence" cases). */
function noChange(
  snapshot: AresV6EvidenceSnapshot,
  rationale: string[],
  blockedReasons: AresV6ProposalBlockedReason[],
  requiredEvidence: string[],
): AresV6CalibrationProposal {
  return makeProposal({
    index: 0,
    createdAt: snapshot.generatedAt,
    status: 'DRAFT',
    proposalType: 'NO_CHANGE_RECOMMENDED',
    target: {},
    riskLevel: 'LOW',
    rationale,
    requiredEvidence,
    evidenceSummary: baseEvidence(snapshot),
    blockedReasons,
    suggestedDelta: null,
  });
}

function result(
  snapshot: AresV6EvidenceSnapshot,
  proposals: AresV6CalibrationProposal[],
  truncated: number,
): AresV6CalibrationProposalResult {
  return {
    proposals,
    truncated,
    generatedFrom: {
      decision: snapshot.goNoGo.decision,
      snapshotGeneratedAt: snapshot.generatedAt,
      thresholdsVersion: snapshot.thresholds.version,
    },
  };
}

/**
 * Generate human-gated calibration proposals from an evidence snapshot.
 * Returns NO_CHANGE_RECOMMENDED (never an actionable proposal) whenever a gate
 * blocks: infra unhealthy, suspicious-feedback dominant, PPI-fallback dominant,
 * insufficient sample, insufficient EVIDENCE coverage, or structural-risk review
 * required without enough data. Structural BLOCKING is surfaced even under low
 * sample. Never mutates the engine.
 */
export function generateAresV6CalibrationProposals(
  snapshot: AresV6EvidenceSnapshot,
  options: AresV6ProposalOptions = {},
): AresV6CalibrationProposalResult {
  const thresholds = options.thresholds ?? snapshot.thresholds;
  const maxProposals = options.maxProposals ?? DEFAULT_MAX_PROPOSALS;
  const input = snapshot.goNoGoInput;

  // ── Hard gates: no actionable proposal can be generated. ────────
  if (snapshot.goNoGo.decision === 'NO_GO_INFRA') {
    return result(
      snapshot,
      [
        noChange(
          snapshot,
          ['Infraestructura no sana: ninguna propuesta de calibración hasta estabilizar latencia/persistencia.'],
          ['INFRA_UNHEALTHY'],
          ['p95 < umbral', 'persistencia degradada = 0', 'tasa de error de generación < umbral'],
        ),
      ],
      0,
    );
  }

  if (input.suspiciousFeedbackRate > thresholds.maxSuspiciousFeedbackRate) {
    return result(
      snapshot,
      [
        noChange(
          snapshot,
          ['Feedback SUSPICIOUS dominante: no se proponen cambios desde evidencia potencialmente envenenada.'],
          ['SUSPICIOUS_FEEDBACK_DOMINANT'],
          ['Reducir tasa de feedback SUSPICIOUS bajo el umbral con muestra TRUSTED limpia.'],
        ),
      ],
      0,
    );
  }

  if (input.fallbackPpiRate > thresholds.maxFallbackPpiRate) {
    return result(
      snapshot,
      [
        noChange(
          snapshot,
          ['PPI fallback dominante: corregir specs de devices antes de proponer; el motor no es la causa raíz.'],
          ['FALLBACK_PPI_DOMINANT'],
          ['Completar PPI real de los devices afectados y re-medir.'],
        ),
      ],
      0,
    );
  }

  const structuralRisk = snapshot.structuralRisk;
  // Sample (depth) and coverage (breadth) are ORTHOGONAL — neither implies the other.
  const sampleInsufficient =
    input.totalTrustedFeedback < thresholds.minTrustedFeedbackPerDevicePreset ||
    input.insufficientSampleCells > 0;
  const coverageInsufficient = input.evidenceFixtureCoverage < thresholds.minFixtureCoverage;

  // Structural BLOCKING is handled EXPLICITLY so it is never masked by sample size.
  // When the data is too thin/narrow to propose a fix, we still surface the risk.
  if (structuralRisk.decision === 'BLOCKING' && (sampleInsufficient || coverageInsufficient)) {
    const reasons: AresV6ProposalBlockedReason[] = ['STRUCTURAL_RISK_REVIEW_REQUIRED'];
    if (coverageInsufficient) reasons.push('EVIDENCE_COVERAGE_INSUFFICIENT');
    if (sampleInsufficient) reasons.push('INSUFFICIENT_SAMPLE');
    return result(
      snapshot,
      [
        noChange(
          snapshot,
          [
            `Riesgo estructural BLOCKING (${structuralRisk.dangerousRows} fila[s] DANGEROUS) visible, pero la evidencia no alcanza para proponer un cambio.`,
            'Revisión HUMANA obligatoria; sin auto-aplicar.',
          ],
          reasons,
          [
            'Confirmar/corregir las filas DANGEROUS con revisión humana.',
            `Cobertura de EVIDENCIA ≥ ${thresholds.minFixtureCoverage} y ≥ ${thresholds.minTrustedFeedbackPerDevicePreset} feedback TRUSTED por celda.`,
          ],
        ),
      ],
      0,
    );
  }

  // Not structurally blocking → coverage / sample / GO gates (blocking + sufficient falls through).
  if (structuralRisk.decision !== 'BLOCKING') {
    if (coverageInsufficient) {
      const reasons: AresV6ProposalBlockedReason[] = ['EVIDENCE_COVERAGE_INSUFFICIENT'];
      if (sampleInsufficient) reasons.push('INSUFFICIENT_SAMPLE');
      return result(
        snapshot,
        [
          noChange(
            snapshot,
            ['Cobertura de EVIDENCIA real insuficiente: la comparación fixtures-only NO es evidencia. No se proponen cambios.'],
            reasons,
            [`Cobertura de EVIDENCIA ≥ ${thresholds.minFixtureCoverage} (más fixtures con generaciones persistidas).`],
          ),
        ],
        0,
      );
    }
    if (sampleInsufficient) {
      return result(
        snapshot,
        [
          noChange(
            snapshot,
            ['Muestra insuficiente: una muestra pequeña produce hipótesis, no cambios de motor.'],
            ['INSUFFICIENT_SAMPLE'],
            [
              `≥ ${thresholds.minTrustedFeedbackPerDevicePreset} feedback TRUSTED por device×preset`,
              `≥ ${thresholds.minGenerationsPerDevicePreset} generaciones por device×preset`,
            ],
          ),
        ],
        0,
      );
    }
    if (snapshot.goNoGo.decision === 'GO_INTERNAL_UI_EXPERIMENT') {
      return result(
        snapshot,
        [
          noChange(
            snapshot,
            [
              'Evidencia buena y diferencias legacy-vs-v6 esperadas: NO se recomienda cambio de calibración.',
              'Decisión de UI experimental sigue siendo HUMANA.',
            ],
            [],
            [],
          ),
        ],
        0,
      );
    }
    // Any other NO_GO_MORE_DATA cause (e.g. low feedback coverage) → need more data.
    if (snapshot.goNoGo.decision !== 'NO_GO_FIX_ENGINE') {
      return result(
        snapshot,
        [
          noChange(
            snapshot,
            ['Evidencia insuficiente para una propuesta accionable; recolectar más datos.'],
            ['INSUFFICIENT_SAMPLE'],
            ['Aumentar muestra y cobertura de evidencia hasta cumplir los umbrales.'],
          ),
        ],
        0,
      );
    }
  }

  // ── Actionable: NO_GO_FIX_ENGINE OR structural BLOCKING with sufficient evidence. ──
  const proposals: AresV6CalibrationProposal[] = [];

  // Concrete, located proposals from high-risk comparison rows (skip fallback-only rows).
  const actionableRows = snapshot.highRiskRows.filter((row) => !row.fallbackPpi);
  for (const row of actionableRows) {
    const isDangerous = row.expectedness === 'DANGEROUS';
    proposals.push(
      makeProposal({
        index: proposals.length + 1,
        createdAt: snapshot.generatedAt,
        status: 'PENDING_HUMAN_REVIEW',
        proposalType: isDangerous ? 'CONFIDENCE_RULE_ADJUSTMENT' : 'PRESET_BIAS_ADJUSTMENT',
        target: { presetId: row.presetId, fixtureId: row.fixtureId, ppiBand: String(row.ppi) },
        riskLevel: isDangerous ? 'HIGH' : 'MEDIUM',
        rationale: [
          `Fila ${row.fixtureId}/${row.presetId} marcada ${row.expectedness}.`,
          ...row.rationale,
          'Requiere validación HUMANA + A/B; sin auto-aplicar.',
        ],
        requiredEvidence: [
          `≥ ${thresholds.minTrustedFeedbackPerDevicePreset} feedback TRUSTED para ${row.fixtureId}/${row.presetId}`,
          'Validación A/B en laboratorio antes de cualquier cambio.',
        ],
        evidenceSummary: { ...baseEvidence(snapshot), expectedness: row.expectedness, rowRationale: row.rationale },
        suggestedDelta: null,
      }),
    );
  }

  // Aggregate engine-quality signal (low rating / worse outcome) → one preset-bias review proposal.
  if (
    input.averageRating < thresholds.minAverageRatingForGo ||
    input.worseOutcomeRate > thresholds.maxWorseOutcomeRate
  ) {
    proposals.push(
      makeProposal({
        index: proposals.length + 1,
        createdAt: snapshot.generatedAt,
        status: 'PENDING_HUMAN_REVIEW',
        proposalType: 'PRESET_BIAS_ADJUSTMENT',
        target: {},
        riskLevel: 'MEDIUM',
        rationale: [
          `Rating promedio (${input.averageRating}) y/o WORSE rate (${input.worseOutcomeRate}) fuera de umbral.`,
          'Síntoma agregado repetido: abrir revisión HUMANA de sesgo de preset; sin auto-aplicar.',
        ],
        requiredEvidence: [
          'Segmentar feedback por device×preset×arma antes de proponer deltas concretos.',
          'Confirmar que el síntoma se repite con muestra TRUSTED suficiente.',
        ],
        evidenceSummary: baseEvidence(snapshot),
        suggestedDelta: null,
      }),
    );
  }

  // If FIX_ENGINE but nothing concrete surfaced (e.g. only highOrLabVerified low), emit a confidence-rule review.
  if (proposals.length === 0) {
    proposals.push(
      makeProposal({
        index: 1,
        createdAt: snapshot.generatedAt,
        status: 'PENDING_HUMAN_REVIEW',
        proposalType: 'CONFIDENCE_RULE_ADJUSTMENT',
        target: {},
        riskLevel: 'MEDIUM',
        rationale: [
          `Confianza HIGH/LAB_VERIFIED (${input.highOrLabVerifiedRate}) por debajo del umbral.`,
          'Revisar reglas de confianza / cobertura de fixtures; sin auto-aplicar.',
        ],
        requiredEvidence: ['Ampliar fixtures LAB_VERIFIED y re-medir la distribución de confianza.'],
        evidenceSummary: baseEvidence(snapshot),
        suggestedDelta: null,
      }),
    );
  }

  const truncated = Math.max(0, proposals.length - maxProposals);
  return result(snapshot, proposals.slice(0, maxProposals), truncated);
}
