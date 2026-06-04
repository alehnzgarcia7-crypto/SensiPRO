import 'server-only';

import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  type AresV6PresetId,
} from '@ares/algorithms/engine-v6';

import type { AresV6StructuralRiskDecision } from './evidence-snapshot';
import { getDefaultAresV6EvidenceThresholds, type AresV6GoNoGoDecision } from './evidence-thresholds';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Human review session model (Fase 3F) — PURE
//
// Structures a controlled internal review session WITHOUT a new DB model: the
// session plan, findings, the recommended decision and the operator packet are
// JSON/Markdown artifacts. The system may RECOMMEND but never APPROVE — a final
// decision requires a human `decidedBy` + rationale, otherwise it stays DRAFT.
// No secrets ever enter a packet (sanitizer is belt-and-suspenders).
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_HUMAN_REVIEW_SCHEMA_VERSION = '3G';

/** Execution mode of a review session: real-http (preview persists) vs local dry-run. */
export type AresV6ReviewExecutionMode = 'real-http' | 'dry-run-local';

// ── Plan ─────────────────────────────────────────────────────────

export interface AresV6HumanReviewGoNoGoThresholds {
  minEvidenceFixtureCoverage: number;
  minFeedbackCoverageRate: number;
  requireStructuralRiskClear: boolean;
}

export interface AresV6HumanReviewSessionPlan {
  id: string;
  label: string;
  createdAt: string;
  operator: string;
  environment: string;
  commitSha: string | null;
  targetUrl: string | null;
  fixtures: string[];
  presets: AresV6PresetId[];
  requiredChecks: string[];
  goNoGoThresholds: AresV6HumanReviewGoNoGoThresholds;
  expectedArtifacts: string[];
}

const DEFAULT_PRESETS: AresV6PresetId[] = ['STANDARD_PRO', 'TODO_ROJO', 'CLASH_SQUAD', 'SNIPER_AWM'];

const REQUIRED_CHECKS = [
  'ui_readiness',
  'evidence_review',
  'structural_risk',
  'ui_smoke',
  'feedback_trusted',
  'deployment_protection',
];

const EXPECTED_ARTIFACTS = [
  'ares-v6-internal-lab-report.json',
  'ares-v6-evidence-summary.json',
  'ares-v6-evidence-report.md',
  'ares-v6-ui-smoke.json',
  'human-review-packet.json',
  'human-review-packet.md',
];

export function getDefaultAresV6ClosedBetaThresholds(): AresV6HumanReviewGoNoGoThresholds {
  const base = getDefaultAresV6EvidenceThresholds();
  return {
    minEvidenceFixtureCoverage: base.minFixtureCoverage,
    minFeedbackCoverageRate: base.minFeedbackCoverageRate,
    requireStructuralRiskClear: true,
  };
}

export interface AresV6HumanReviewPlanOverrides {
  id?: string;
  label?: string;
  createdAt?: string;
  operator?: string;
  environment?: string;
  commitSha?: string | null;
  targetUrl?: string | null;
  presets?: AresV6PresetId[];
}

/** Default plan: all 12 LATAM calibration fixtures + the core review presets. */
export function buildDefaultAresV6HumanReviewPlan(
  overrides: AresV6HumanReviewPlanOverrides = {},
): AresV6HumanReviewSessionPlan {
  const createdAt = overrides.createdAt ?? new Date(0).toISOString();
  return {
    id: overrides.id ?? `ares-v6-3f-${createdAt}`,
    label: overrides.label ?? 'ares-v6-3f-review',
    createdAt,
    operator: overrides.operator ?? 'unassigned',
    environment: overrides.environment ?? 'local',
    commitSha: overrides.commitSha ?? null,
    targetUrl: overrides.targetUrl ?? null,
    fixtures: ARES_V6_LATAM_CALIBRATION_FIXTURES.map((f) => f.id),
    presets: overrides.presets ?? DEFAULT_PRESETS,
    requiredChecks: [...REQUIRED_CHECKS],
    goNoGoThresholds: getDefaultAresV6ClosedBetaThresholds(),
    expectedArtifacts: [...EXPECTED_ARTIFACTS],
  };
}

// ── Inputs (parsed from artifacts) ───────────────────────────────

export interface AresV6ReviewHighRiskRow {
  fixtureId: string;
  presetId: string;
  expectedness: string;
  ppi: number;
  ppiSource: string;
  rationale: string[];
}

export interface AresV6ReviewEvidenceInput {
  mode: 'from-db' | 'fixtures-only';
  goNoGoDecision: AresV6GoNoGoDecision;
  structuralRisk: AresV6StructuralRiskDecision;
  evidenceFixtureCoverage: number;
  comparisonFixtureCoverage: number;
  totalFixtures: number;
  evidenceCoveredFixtures: number;
  feedbackCoverageRate: number;
  totalGenerations: number;
  totalTrustedFeedback: number;
  dangerousRows: number;
  needsReviewRows: number;
  highRiskSummaryRows: AresV6ReviewHighRiskRow[];
  recommendedNextActions: string[];
  proposalsCount: number | null;
}

export interface AresV6ReviewSmokeInput {
  ran: boolean;
  passed: boolean;
  checks?: number;
  failures?: string[];
}

export interface AresV6ReviewFeedbackInput {
  trustedCount: number;
  coverageRate: number;
}

export interface AresV6HumanReviewReadinessInput {
  evidence: AresV6ReviewEvidenceInput;
  smoke?: AresV6ReviewSmokeInput | null;
  feedback?: AresV6ReviewFeedbackInput | null;
  deploymentProtectionVerified?: boolean;
  uiReadinessPassed?: boolean;
  thresholds?: AresV6HumanReviewGoNoGoThresholds;
  /** real-http vs dry-run-local. A dry-run can NEVER reach a closed-beta recommendation. */
  executionMode?: AresV6ReviewExecutionMode;
}

// ── Decision ─────────────────────────────────────────────────────

export type AresV6HumanReviewDecisionValue =
  | 'GO_HIDDEN_UI_CONTINUE'
  | 'NO_GO_FIX_BLOCKERS'
  | 'NO_GO_MORE_EVIDENCE'
  | 'GO_PREPARE_CLOSED_BETA_DESIGN';

export interface AresV6HumanReviewReadinessResult {
  recommendedDecision: AresV6HumanReviewDecisionValue;
  closedBetaReady: boolean;
  blockers: string[];
  reasons: string[];
  unmetClosedBetaGates: string[];
}

/**
 * Compute the RECOMMENDED decision from the evidence/smoke/feedback inputs.
 * Precedence: blockers → more-evidence → closed-beta-ready → continue. This is a
 * recommendation only; the final decision is human (see the packet decision block).
 */
export function evaluateAresV6HumanReviewReadiness(
  input: AresV6HumanReviewReadinessInput,
): AresV6HumanReviewReadinessResult {
  const thresholds = input.thresholds ?? getDefaultAresV6ClosedBetaThresholds();
  const ev = input.evidence;
  const feedbackCoverage = input.feedback?.coverageRate ?? ev.feedbackCoverageRate;

  // 1. Hard blockers.
  const blockers: string[] = [];
  if (input.smoke && input.smoke.ran && !input.smoke.passed) {
    blockers.push('La prueba de humo de la UI falló.');
  }
  if (input.uiReadinessPassed === false) {
    blockers.push('La verificación de readiness de la UI falló (env/secrets/protección).');
  }
  if (ev.structuralRisk === 'BLOCKING') {
    blockers.push(`Riesgo estructural BLOCKING (${ev.dangerousRows} fila[s] DANGEROUS) — revisión humana obligatoria.`);
  }
  if (ev.goNoGoDecision === 'NO_GO_INFRA') {
    blockers.push('Infraestructura no saludable (NO_GO_INFRA) — estabilizar antes de juzgar el motor.');
  }
  if (ev.goNoGoDecision === 'NO_GO_FIX_ENGINE') {
    blockers.push('Calidad del motor bajo umbral (NO_GO_FIX_ENGINE) — revisión humana de calibración, sin auto-aplicar.');
  }
  if (blockers.length > 0) {
    return { recommendedDecision: 'NO_GO_FIX_BLOCKERS', closedBetaReady: false, blockers, reasons: [], unmetClosedBetaGates: [] };
  }

  // 2. More evidence needed.
  const reasons: string[] = [];
  if (ev.evidenceFixtureCoverage < thresholds.minEvidenceFixtureCoverage) {
    reasons.push(
      `Cobertura de EVIDENCIA real ${ev.evidenceFixtureCoverage} < ${thresholds.minEvidenceFixtureCoverage} (la comparación fixtures-only NO es evidencia).`,
    );
  }
  if (feedbackCoverage < thresholds.minFeedbackCoverageRate) {
    reasons.push(`Cobertura de feedback ${feedbackCoverage} < ${thresholds.minFeedbackCoverageRate}.`);
  }
  if (ev.goNoGoDecision === 'NO_GO_MORE_DATA') {
    reasons.push('GO/NO-GO = NO_GO_MORE_DATA: muestra insuficiente o sospechosa.');
  }
  if (ev.structuralRisk === 'REVIEW_REQUIRED') {
    reasons.push(`Riesgo estructural REVIEW_REQUIRED (${ev.needsReviewRows} fila[s] a revisar).`);
  }
  // A dry-run-local session has no real persisted evidence — it can never claim
  // closed-beta readiness, regardless of how good the (fixtures-only) numbers look.
  if (input.executionMode === 'dry-run-local') {
    reasons.push('Modo dry-run-local: la evidencia no es real (requiere modo http contra un preview que persista). No se puede recomendar closed-beta.');
  }
  if (reasons.length > 0) {
    return { recommendedDecision: 'NO_GO_MORE_EVIDENCE', closedBetaReady: false, blockers: [], reasons, unmetClosedBetaGates: [] };
  }

  // 3. Closed-beta readiness gates.
  const unmet: string[] = [];
  if (ev.goNoGoDecision !== 'GO_INTERNAL_UI_EXPERIMENT') unmet.push('GO/NO-GO no es GO_INTERNAL_UI_EXPERIMENT.');
  if (thresholds.requireStructuralRiskClear && ev.structuralRisk !== 'CLEAR') unmet.push('structuralRisk no es CLEAR.');
  if (ev.evidenceFixtureCoverage < thresholds.minEvidenceFixtureCoverage) unmet.push('evidenceFixtureCoverage por debajo del umbral.');
  if (feedbackCoverage < thresholds.minFeedbackCoverageRate) unmet.push('feedbackCoverage por debajo del umbral.');
  if (!input.smoke || !input.smoke.ran || !input.smoke.passed) unmet.push('Prueba de humo de la UI no ejecutada o no aprobada.');
  if (input.deploymentProtectionVerified !== true) unmet.push('Protección de deployment no verificada por un humano.');

  if (unmet.length === 0) {
    return {
      recommendedDecision: 'GO_PREPARE_CLOSED_BETA_DESIGN',
      closedBetaReady: true,
      blockers: [],
      reasons: [],
      unmetClosedBetaGates: [],
    };
  }

  return {
    recommendedDecision: 'GO_HIDDEN_UI_CONTINUE',
    closedBetaReady: false,
    blockers: [],
    reasons: [],
    unmetClosedBetaGates: unmet,
  };
}

// ── Findings ─────────────────────────────────────────────────────

export type AresV6HumanReviewSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKING';
export type AresV6HumanReviewArea = 'ENGINE' | 'UI' | 'EVIDENCE' | 'INFRA' | 'FEEDBACK' | 'SECURITY' | 'PRODUCT';

export interface AresV6HumanReviewFinding {
  id: string;
  severity: AresV6HumanReviewSeverity;
  area: AresV6HumanReviewArea;
  fixtureId?: string;
  presetId?: string;
  generationId?: string;
  title: string;
  detail: string;
  recommendedAction: string;
  blocksNextPhase: boolean;
}

/** Baseline findings derived from the evidence/smoke inputs. Humans add more. */
export function deriveAresV6HumanReviewFindings(
  input: AresV6HumanReviewReadinessInput,
): AresV6HumanReviewFinding[] {
  const ev = input.evidence;
  const findings: AresV6HumanReviewFinding[] = [];

  if (ev.mode === 'fixtures-only' || ev.evidenceFixtureCoverage === 0) {
    findings.push({
      id: 'finding-evidence-fixtures-only',
      severity: 'MEDIUM',
      area: 'EVIDENCE',
      title: 'Evidencia fixtures-only (sin generaciones reales persistidas)',
      detail: `mode=${ev.mode}, evidenceFixtureCoverage=${ev.evidenceFixtureCoverage}. La comparación fixtures-only no constituye evidencia real.`,
      recommendedAction: 'Ejecutar el lab en modo http contra un target que persista generaciones, luego re-evaluar.',
      blocksNextPhase: true,
    });
  }
  if (ev.structuralRisk === 'BLOCKING') {
    findings.push({
      id: 'finding-structural-blocking',
      severity: 'BLOCKING',
      area: 'ENGINE',
      title: `Riesgo estructural BLOCKING (${ev.dangerousRows} fila[s] DANGEROUS)`,
      detail: 'Cascada/relación de sliders inválida en una o más filas de comparación.',
      recommendedAction: 'Revisión humana obligatoria; sin auto-aplicar. Abrir propuesta para revisión.',
      blocksNextPhase: true,
    });
  } else if (ev.structuralRisk === 'REVIEW_REQUIRED') {
    findings.push({
      id: 'finding-structural-review',
      severity: 'MEDIUM',
      area: 'ENGINE',
      title: `Riesgo estructural REVIEW_REQUIRED (${ev.needsReviewRows} fila[s])`,
      detail: 'Filas NEEDS_REVIEW / PPI fallback / sin equivalente legacy.',
      recommendedAction: 'Revisar filas de alto riesgo antes de subir el bar de evidencia.',
      blocksNextPhase: false,
    });
  }
  if (input.smoke && input.smoke.ran && !input.smoke.passed) {
    findings.push({
      id: 'finding-ui-smoke-failed',
      severity: 'HIGH',
      area: 'UI',
      title: 'Prueba de humo de la UI falló',
      detail: (input.smoke.failures ?? []).join('; ') || 'Ver el reporte de la prueba de humo.',
      recommendedAction: 'Corregir la UI/ruta antes de continuar la sesión.',
      blocksNextPhase: true,
    });
  }
  if (input.deploymentProtectionVerified !== true) {
    findings.push({
      id: 'finding-deployment-protection',
      severity: 'HIGH',
      area: 'SECURITY',
      title: 'Protección de deployment no verificada',
      detail: 'El flag ALLOW_PRODUCTION es solo un acuse; la protección real (Vercel auth / password / trusted IPs) requiere verificación humana.',
      recommendedAction: 'Verificar la protección de deployment delante de /internal/ y registrarlo.',
      blocksNextPhase: true,
    });
  }
  return findings;
}

// ── Checklist ────────────────────────────────────────────────────

export type AresV6HumanReviewCheckStatus = 'PASS' | 'FAIL' | 'PENDING';

export interface AresV6HumanReviewChecklistItem {
  id: string;
  label: string;
  status: AresV6HumanReviewCheckStatus;
  auto: boolean;
}

export function buildAresV6HumanReviewChecklist(
  input: AresV6HumanReviewReadinessInput,
): AresV6HumanReviewChecklistItem[] {
  const thresholds = input.thresholds ?? getDefaultAresV6ClosedBetaThresholds();
  const ev = input.evidence;
  const feedbackCoverage = input.feedback?.coverageRate ?? ev.feedbackCoverageRate;
  const human = (id: string, label: string): AresV6HumanReviewChecklistItem => ({ id, label, status: 'PENDING', auto: false });
  const auto = (id: string, label: string, ok: boolean): AresV6HumanReviewChecklistItem => ({
    id,
    label,
    status: ok ? 'PASS' : 'FAIL',
    auto: true,
  });

  return [
    human('deployment_protection_verified', 'Protección de deployment verificada (Vercel auth/password/trusted IPs).'),
    human('route_hidden', '/internal/ares-v6 oculta: sin nav, sin sitemap, sin SEO.'),
    human('no_public_nav', 'Sin link público en navbar/footer/mobile-nav.'),
    human('no_apply_button', 'Sin botón de aplicar/aprobar/publicar propuestas.'),
    human('preview_works', 'El preview cambia al seleccionar fixture/preset (sin persistencia).'),
    auto(
      'evidence_coverage_sufficient',
      `evidenceFixtureCoverage ≥ ${thresholds.minEvidenceFixtureCoverage}`,
      ev.evidenceFixtureCoverage >= thresholds.minEvidenceFixtureCoverage,
    ),
    auto('structural_risk_clear', 'structuralRisk = CLEAR', ev.structuralRisk === 'CLEAR'),
    auto(
      'feedback_trusted_enough',
      `feedbackCoverage ≥ ${thresholds.minFeedbackCoverageRate}`,
      feedbackCoverage >= thresholds.minFeedbackCoverageRate,
    ),
    auto('ui_smoke_passed', 'Prueba de humo de la UI aprobada', Boolean(input.smoke?.ran && input.smoke?.passed)),
  ];
}

// ── Packet ───────────────────────────────────────────────────────

export interface AresV6HumanReviewDecisionBlock {
  status: 'DRAFT' | 'FINAL';
  recommendedDecision: AresV6HumanReviewDecisionValue;
  decision: AresV6HumanReviewDecisionValue | null;
  decidedBy: string;
  decidedAt: string;
  rationale: string[];
  requiredFollowUps: string[];
  acceptedRisks: string[];
  rejectedActions: string[];
  /** Why a human-supplied decision could NOT be FINALIZED (empty when it can). */
  finalizationBlockedReasons: string[];
}

export interface AresV6HumanReviewExecution {
  executionMode: AresV6ReviewExecutionMode;
  /** Redacted preview URL (scheme://host/path) — NEVER the raw value or a secret. */
  targetUrlRedacted: string | null;
  /** Human assertion that real deployment protection (Vercel auth/password/IPs) was verified. */
  deploymentProtectionVerified: boolean;
}

export interface AresV6HumanReviewPacket {
  schemaVersion: string;
  generatedAt: string;
  session: AresV6HumanReviewSessionPlan;
  execution: AresV6HumanReviewExecution;
  evidence: AresV6ReviewEvidenceInput;
  smoke: AresV6ReviewSmokeInput | null;
  feedback: AresV6ReviewFeedbackInput | null;
  readiness: AresV6HumanReviewReadinessResult;
  checklist: AresV6HumanReviewChecklistItem[];
  findings: AresV6HumanReviewFinding[];
  decision: AresV6HumanReviewDecisionBlock;
}

export interface AresV6HumanReviewHumanDecisionInput {
  decision?: AresV6HumanReviewDecisionValue | null;
  decidedBy?: string;
  decidedAt?: string;
  rationale?: string[];
  requiredFollowUps?: string[];
  acceptedRisks?: string[];
  rejectedActions?: string[];
}

export interface AresV6HumanReviewPacketInput {
  plan: AresV6HumanReviewSessionPlan;
  readinessInput: AresV6HumanReviewReadinessInput;
  generatedAt: string;
  extraFindings?: AresV6HumanReviewFinding[];
  human?: AresV6HumanReviewHumanDecisionInput;
  /** Redacted preview URL for the execution block (overrides plan.targetUrl). */
  targetUrlRedacted?: string | null;
}

/**
 * Why a human-supplied decision cannot be FINALIZED. A NO_GO can always be
 * recorded; a GO cannot be finalized over a hard blocker, and closed-beta needs
 * the full gate set (coverage, structuralRisk CLEAR, deployment protection, smoke).
 */
export function evaluateAresV6FinalizationBlockers(
  decisionValue: AresV6HumanReviewDecisionValue,
  ev: AresV6ReviewEvidenceInput,
  smoke: AresV6ReviewSmokeInput | null | undefined,
  deploymentProtectionVerified: boolean,
  thresholds: AresV6HumanReviewGoNoGoThresholds,
): string[] {
  const reasons: string[] = [];
  const isGo = decisionValue.startsWith('GO');
  const smokeFailed = Boolean(smoke?.ran && !smoke.passed);
  const smokePassed = Boolean(smoke?.ran && smoke.passed);

  if (isGo) {
    if (smokeFailed) reasons.push('No se puede FINALIZAR un GO con la prueba de humo de la UI en fallo.');
    if (ev.evidenceFixtureCoverage === 0) {
      reasons.push('No se puede FINALIZAR un GO con evidenceFixtureCoverage=0 (sin evidencia real).');
    }
    if (ev.structuralRisk === 'BLOCKING') reasons.push('No se puede FINALIZAR un GO con riesgo estructural BLOCKING.');
  }
  if (decisionValue === 'GO_PREPARE_CLOSED_BETA_DESIGN') {
    if (ev.evidenceFixtureCoverage < thresholds.minEvidenceFixtureCoverage) {
      reasons.push(`closed-beta: evidenceFixtureCoverage ${ev.evidenceFixtureCoverage} < ${thresholds.minEvidenceFixtureCoverage}.`);
    }
    if (thresholds.requireStructuralRiskClear && ev.structuralRisk !== 'CLEAR') {
      reasons.push('closed-beta: structuralRisk no es CLEAR.');
    }
    if (!deploymentProtectionVerified) reasons.push('closed-beta: protección de deployment no verificada por un humano.');
    if (!smokePassed) reasons.push('closed-beta: prueba de humo de la UI no ejecutada o no aprobada.');
  }
  return [...new Set(reasons)];
}

/**
 * Assemble the operator packet. The decision is FINAL only when a human supplied
 * `decidedBy` + `rationale`; otherwise it remains DRAFT with a recommendation.
 */
export function buildAresV6HumanReviewPacket(input: AresV6HumanReviewPacketInput): AresV6HumanReviewPacket {
  const readiness = evaluateAresV6HumanReviewReadiness(input.readinessInput);
  const findings = [...deriveAresV6HumanReviewFindings(input.readinessInput), ...(input.extraFindings ?? [])];
  const checklist = buildAresV6HumanReviewChecklist(input.readinessInput);

  const thresholds = input.readinessInput.thresholds ?? getDefaultAresV6ClosedBetaThresholds();
  const human = input.human ?? {};
  const decidedBy = (human.decidedBy ?? '').trim();
  const rationale = human.rationale ?? [];
  const hasHumanDecision = decidedBy.length > 0 && rationale.length > 0 && human.decision != null;

  // Even WITH a human signature, a decision cannot be FINAL if its gates aren't met
  // (you can record a NO_GO, but you cannot finalize a GO over a hard blocker, nor
  // closed-beta without coverage + CLEAR risk + deployment protection + smoke).
  const finalizationBlockedReasons =
    hasHumanDecision && human.decision
      ? evaluateAresV6FinalizationBlockers(
          human.decision,
          input.readinessInput.evidence,
          input.readinessInput.smoke,
          input.readinessInput.deploymentProtectionVerified ?? false,
          thresholds,
        )
      : [];

  const isFinal = hasHumanDecision && finalizationBlockedReasons.length === 0;

  const decision: AresV6HumanReviewDecisionBlock = {
    status: isFinal ? 'FINAL' : 'DRAFT',
    recommendedDecision: readiness.recommendedDecision,
    decision: isFinal ? (human.decision ?? null) : null,
    decidedBy,
    decidedAt: human.decidedAt ?? '',
    rationale,
    requiredFollowUps: human.requiredFollowUps ?? [],
    acceptedRisks: human.acceptedRisks ?? [],
    rejectedActions: human.rejectedActions ?? [],
    finalizationBlockedReasons,
  };

  const execution: AresV6HumanReviewExecution = {
    executionMode: input.readinessInput.executionMode ?? 'dry-run-local',
    targetUrlRedacted: input.targetUrlRedacted ?? input.plan.targetUrl ?? null,
    deploymentProtectionVerified: input.readinessInput.deploymentProtectionVerified ?? false,
  };

  return {
    schemaVersion: ARES_V6_HUMAN_REVIEW_SCHEMA_VERSION,
    generatedAt: input.generatedAt,
    session: input.plan,
    execution,
    evidence: input.readinessInput.evidence,
    smoke: input.readinessInput.smoke ?? null,
    feedback: input.readinessInput.feedback ?? null,
    readiness,
    checklist,
    findings,
    decision,
  };
}

// ── Sanitizer ────────────────────────────────────────────────────

const SECRET_KEY_RE = /token|secret|sha256|password|authorization|cookie|api[_-]?key/i;
const SECRET_VALUE_RE = /(^|\s)(bearer\s+\S+|[a-f0-9]{64})/i;
const REDACTED = '[redacted]';

function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return SECRET_VALUE_RE.test(value) ? REDACTED : value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SECRET_KEY_RE.test(key) ? REDACTED : sanitizeValue(val);
    }
    return out;
  }
  return value;
}

/** Defense-in-depth: redact any secret-looking key/value before writing a packet. */
export function sanitizeAresV6HumanReviewPacket(packet: AresV6HumanReviewPacket): AresV6HumanReviewPacket {
  return sanitizeValue(packet) as AresV6HumanReviewPacket;
}
