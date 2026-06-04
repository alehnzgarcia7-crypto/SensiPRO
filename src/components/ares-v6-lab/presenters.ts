
import type { AresV6ProposalBlockedReason, AresV6ProposalType } from '@/lib/ares-v6/calibration-proposals';
import type { AresV6StructuralRiskDecision } from '@/lib/ares-v6/evidence-snapshot';
import type { AresV6GoNoGoCategory, AresV6GoNoGoDecision } from '@/lib/ares-v6/evidence-thresholds';
import type { AresV6Expectedness } from '@/lib/ares-v6/legacy-vs-v6-comparator';
import type {
  AresV6GyroscopeVector,
  AresV6SensitivityVector,
} from '@ares/algorithms/engine-v6';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Presentation logic (Fase 3E) — PURE, CLIENT-SAFE
//
// No JSX, no DOM, no server imports — only type-only imports from the contracts.
// Maps engine/evidence enums to semantic tones + Spanish labels and shapes the
// sensitivity/gyro bars. Fully unit-testable in the node test environment, which
// is how the component logic is proven (the repo has no jsdom).
// ═══════════════════════════════════════════════════════════════

/** Semantic color buckets the components map to Tailwind classes. */
export type AresV6Tone = 'ok' | 'info' | 'warn' | 'danger' | 'neutral';

// Free Fire (and ARES v6) sensitivity sliders run on a 1–200 scale.
export const ARES_V6_SENSITIVITY_MAX = 200;

// ── Tone → class helpers (dark lab theme) ────────────────────────

const TONE_BADGE: Record<AresV6Tone, string> = {
  ok: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30',
  info: 'text-[#00c8ff] bg-[#00c8ff]/10 border border-[#00c8ff]/30',
  warn: 'text-amber-300 bg-amber-500/10 border border-amber-500/30',
  danger: 'text-red-300 bg-red-500/10 border border-red-500/40',
  neutral: 'text-slate-300 bg-white/5 border border-white/10',
};

const TONE_BAR: Record<AresV6Tone, string> = {
  ok: 'bg-emerald-400',
  info: 'bg-[#00c8ff]',
  warn: 'bg-amber-400',
  danger: 'bg-red-400',
  neutral: 'bg-slate-400',
};

const TONE_DOT: Record<AresV6Tone, string> = {
  ok: 'bg-emerald-400',
  info: 'bg-[#00c8ff]',
  warn: 'bg-amber-400',
  danger: 'bg-red-400',
  neutral: 'bg-slate-500',
};

const TONE_TEXT: Record<AresV6Tone, string> = {
  ok: 'text-emerald-300',
  info: 'text-[#00c8ff]',
  warn: 'text-amber-300',
  danger: 'text-red-300',
  neutral: 'text-slate-300',
};

export function toneBadgeClass(tone: AresV6Tone): string {
  return TONE_BADGE[tone];
}
export function toneBarClass(tone: AresV6Tone): string {
  return TONE_BAR[tone];
}
export function toneDotClass(tone: AresV6Tone): string {
  return TONE_DOT[tone];
}
export function toneTextClass(tone: AresV6Tone): string {
  return TONE_TEXT[tone];
}

// ── GO/NO-GO ─────────────────────────────────────────────────────

const GO_NO_GO_TONE: Record<AresV6GoNoGoDecision, AresV6Tone> = {
  GO_INTERNAL_UI_EXPERIMENT: 'ok',
  NO_GO_MORE_DATA: 'warn',
  NO_GO_FIX_ENGINE: 'danger',
  NO_GO_INFRA: 'danger',
};

const GO_NO_GO_LABEL: Record<AresV6GoNoGoDecision, string> = {
  GO_INTERNAL_UI_EXPERIMENT: 'GO · UI interna',
  NO_GO_MORE_DATA: 'NO-GO · Más datos',
  NO_GO_FIX_ENGINE: 'NO-GO · Revisar motor',
  NO_GO_INFRA: 'NO-GO · Infra',
};

export function goNoGoTone(decision: AresV6GoNoGoDecision): AresV6Tone {
  return GO_NO_GO_TONE[decision];
}
export function goNoGoLabel(decision: AresV6GoNoGoDecision): string {
  return GO_NO_GO_LABEL[decision];
}
export function isGoDecision(decision: AresV6GoNoGoDecision): boolean {
  return decision === 'GO_INTERNAL_UI_EXPERIMENT';
}

const GO_NO_GO_CATEGORY_LABEL: Record<AresV6GoNoGoCategory, string> = {
  INFRA: 'Infraestructura',
  MORE_DATA: 'Más datos',
  FIX_ENGINE: 'Revisar motor',
};
export function goNoGoCategoryLabel(category: AresV6GoNoGoCategory): string {
  return GO_NO_GO_CATEGORY_LABEL[category];
}

// ── Structural risk ──────────────────────────────────────────────

const RISK_TONE: Record<AresV6StructuralRiskDecision, AresV6Tone> = {
  CLEAR: 'ok',
  REVIEW_REQUIRED: 'warn',
  BLOCKING: 'danger',
};

const RISK_LABEL: Record<AresV6StructuralRiskDecision, string> = {
  CLEAR: 'Sin riesgo estructural',
  REVIEW_REQUIRED: 'Revisión requerida',
  BLOCKING: 'Bloqueante',
};

export function structuralRiskTone(decision: AresV6StructuralRiskDecision): AresV6Tone {
  return RISK_TONE[decision];
}
export function structuralRiskLabel(decision: AresV6StructuralRiskDecision): string {
  return RISK_LABEL[decision];
}
export function isBlockingRisk(decision: AresV6StructuralRiskDecision): boolean {
  return decision === 'BLOCKING';
}

// ── Expectedness (comparison rows) ───────────────────────────────

const EXPECTEDNESS_TONE: Record<AresV6Expectedness, AresV6Tone> = {
  EXPECTED: 'ok',
  NEEDS_REVIEW: 'warn',
  DANGEROUS: 'danger',
};
const EXPECTEDNESS_LABEL: Record<AresV6Expectedness, string> = {
  EXPECTED: 'Esperado',
  NEEDS_REVIEW: 'Revisar',
  DANGEROUS: 'Peligroso',
};
export function expectednessTone(value: AresV6Expectedness): AresV6Tone {
  return EXPECTEDNESS_TONE[value];
}
export function expectednessLabel(value: AresV6Expectedness): string {
  return EXPECTEDNESS_LABEL[value];
}

// ── Proposal status / type / blocked reason ──────────────────────

export type AresV6ProposalStatusValue = 'DRAFT' | 'PENDING_HUMAN_REVIEW' | 'APPROVED' | 'REJECTED';

const PROPOSAL_STATUS_TONE: Record<AresV6ProposalStatusValue, AresV6Tone> = {
  DRAFT: 'neutral',
  PENDING_HUMAN_REVIEW: 'warn',
  APPROVED: 'ok',
  REJECTED: 'danger',
};
const PROPOSAL_STATUS_LABEL: Record<AresV6ProposalStatusValue, string> = {
  DRAFT: 'Borrador',
  PENDING_HUMAN_REVIEW: 'Pendiente · revisión humana',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};
export function proposalStatusTone(status: AresV6ProposalStatusValue): AresV6Tone {
  return PROPOSAL_STATUS_TONE[status];
}
export function proposalStatusLabel(status: AresV6ProposalStatusValue): string {
  return PROPOSAL_STATUS_LABEL[status];
}

const PROPOSAL_TYPE_LABEL: Record<AresV6ProposalType, string> = {
  PPI_BAND_ADJUSTMENT: 'Ajuste de banda PPI',
  PRESET_BIAS_ADJUSTMENT: 'Ajuste de sesgo de preset',
  WEAPON_BIAS_ADJUSTMENT: 'Ajuste de sesgo de arma',
  HUD_BUTTON_ADJUSTMENT: 'Ajuste de botón HUD',
  CONFIDENCE_RULE_ADJUSTMENT: 'Ajuste de regla de confianza',
  NO_CHANGE_RECOMMENDED: 'Sin cambios recomendados',
};
export function proposalTypeLabel(type: AresV6ProposalType): string {
  return PROPOSAL_TYPE_LABEL[type];
}

const BLOCKED_REASON_LABEL: Record<AresV6ProposalBlockedReason, string> = {
  INFRA_UNHEALTHY: 'Infraestructura no saludable',
  INSUFFICIENT_SAMPLE: 'Muestra insuficiente',
  SUSPICIOUS_FEEDBACK_DOMINANT: 'Feedback sospechoso dominante',
  FALLBACK_PPI_DOMINANT: 'PPI fallback dominante',
  STRUCTURAL_RISK_REVIEW_REQUIRED: 'Riesgo estructural requiere revisión',
  EVIDENCE_COVERAGE_INSUFFICIENT: 'Cobertura de evidencia insuficiente',
};
export function blockedReasonLabel(reason: AresV6ProposalBlockedReason): string {
  return BLOCKED_REASON_LABEL[reason];
}

// ── Generic LOW/MEDIUM/HIGH + SAFE/ADVANCED risk levels ──────────

export type AresV6RiskLevelValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'SAFE' | 'ADVANCED';
const RISK_LEVEL_TONE: Record<AresV6RiskLevelValue, AresV6Tone> = {
  LOW: 'ok',
  SAFE: 'ok',
  MEDIUM: 'warn',
  HIGH: 'danger',
  ADVANCED: 'danger',
};
export function riskLevelTone(level: AresV6RiskLevelValue): AresV6Tone {
  return RISK_LEVEL_TONE[level];
}

// ── Confidence grade + validation status ─────────────────────────

export type AresV6ConfidenceGradeValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'LAB_VERIFIED';
const CONFIDENCE_TONE: Record<AresV6ConfidenceGradeValue, AresV6Tone> = {
  LOW: 'danger',
  MEDIUM: 'warn',
  HIGH: 'ok',
  LAB_VERIFIED: 'info',
};
const CONFIDENCE_LABEL: Record<AresV6ConfidenceGradeValue, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  LAB_VERIFIED: 'Verificada en laboratorio',
};
export function confidenceTone(grade: AresV6ConfidenceGradeValue): AresV6Tone {
  return CONFIDENCE_TONE[grade];
}
export function confidenceLabel(grade: AresV6ConfidenceGradeValue): string {
  return CONFIDENCE_LABEL[grade];
}

export type AresV6ValidationStatusValue = 'RESEARCH_BACKED' | 'NEEDS_LAB_DATA' | 'EXPERIMENTAL';
const VALIDATION_TONE: Record<AresV6ValidationStatusValue, AresV6Tone> = {
  RESEARCH_BACKED: 'ok',
  NEEDS_LAB_DATA: 'warn',
  EXPERIMENTAL: 'danger',
};
const VALIDATION_LABEL: Record<AresV6ValidationStatusValue, string> = {
  RESEARCH_BACKED: 'Respaldado por investigación',
  NEEDS_LAB_DATA: 'Necesita datos de laboratorio',
  EXPERIMENTAL: 'Experimental',
};
export function validationTone(status: AresV6ValidationStatusValue): AresV6Tone {
  return VALIDATION_TONE[status];
}
export function validationLabel(status: AresV6ValidationStatusValue): string {
  return VALIDATION_LABEL[status];
}

// ── Formatters ───────────────────────────────────────────────────

/** Clamp to a 0..100 bar width (never negative, never overflowing the track). */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

/** Format a 0..1 rate as a percent string, e.g. 0.8 → "80%". */
export function formatRate(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

/** Format a coverage fraction with its covered/total counts: "80% (4/5)". */
export function formatCoverage(fraction: number, covered: number, total: number): string {
  return `${formatRate(fraction)} (${covered}/${total})`;
}

/** Bar width (0..100) for a 1–200 sensitivity value. */
export function sensitivityBarPercent(value: number, max = ARES_V6_SENSITIVITY_MAX): number {
  if (max <= 0) return 0;
  return clampPercent((value / max) * 100);
}

// ── Sensitivity / gyro bar rows ──────────────────────────────────

export interface AresV6SliderRow {
  key: string;
  label: string;
  value: number;
  barPercent: number;
}

const SENSITIVITY_LABELS: Array<{ key: keyof AresV6SensitivityVector; label: string }> = [
  { key: 'general', label: 'General' },
  { key: 'redPoint', label: 'Punto Rojo' },
  { key: 'scope2x', label: 'Mira 2x' },
  { key: 'scope4x', label: 'Mira 4x' },
  { key: 'sniperScope', label: 'Mira Francotirador' },
  { key: 'freeView', label: 'Vista Libre' },
];

export function buildSensitivityRows(vector: AresV6SensitivityVector): AresV6SliderRow[] {
  return SENSITIVITY_LABELS.map(({ key, label }) => {
    const value = vector[key];
    return { key, label, value, barPercent: sensitivityBarPercent(value) };
  });
}

const GYRO_LABELS: Array<{ key: keyof AresV6GyroscopeVector; label: string }> = [
  { key: 'gyroGeneral', label: 'Gyro General' },
  { key: 'gyroRedPoint', label: 'Gyro Punto Rojo' },
  { key: 'gyroScope2x', label: 'Gyro Mira 2x' },
  { key: 'gyroScope4x', label: 'Gyro Mira 4x' },
  { key: 'gyroSniper', label: 'Gyro Francotirador' },
  { key: 'gyroFreeView', label: 'Gyro Vista Libre' },
];

export function buildGyroRows(gyro: AresV6GyroscopeVector | null): AresV6SliderRow[] {
  if (!gyro) return [];
  return GYRO_LABELS.map(({ key, label }) => {
    const value = gyro[key];
    return { key, label, value, barPercent: sensitivityBarPercent(value) };
  });
}
