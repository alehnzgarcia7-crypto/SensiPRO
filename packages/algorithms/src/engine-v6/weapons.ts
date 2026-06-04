import { ARES_V6_WEAPON_CALIBRATION_RULES, type WeaponCalibrationRule } from './research-matrix';
import type {
  AresV6FireButtonRecommendation,
  AresV6SensitivityVector,
  AresV6WeaponCategory,
} from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Weapon Lab
//
// The Phase 0 research matrix (ARES_V6_WEAPON_CALIBRATION_RULES) is the
// source of truth for the five categories it covers. The three remaining
// categories (AR_FAST, MARKSMAN, SPECIAL) resolve to conservative, clearly
// documented fallbacks so the engine never silently no-ops a weapon.
// ═══════════════════════════════════════════════════════════════

type AresV6DragZone = AresV6FireButtonRecommendation['dragZone'];

const WEAPON_FALLBACK_RULES: Partial<Record<AresV6WeaponCategory, WeaponCalibrationRule>> = {
  AR_FAST: {
    category: 'AR_FAST',
    role: 'Close/mid spray and burst',
    sensitivityBias: { general: 2, redPoint: 2, scope2x: 2, scope4x: -2 },
    fireButtonDelta: 1,
    preferredDrag: 'VERTICAL',
    trainingFocus: 'Ráfagas cortas y tracking a media distancia.',
  },
  MARKSMAN: {
    category: 'MARKSMAN',
    role: 'Mid/long precision DMR',
    sensitivityBias: { general: -3, scope2x: -2, scope4x: -4, sniperScope: -4 },
    fireButtonDelta: -2,
    preferredDrag: 'DIRECTIONAL',
    trainingFocus: 'Tiros precisos a media-larga distancia con reset entre disparos.',
  },
  SPECIAL: {
    category: 'SPECIAL',
    role: 'Situational / launcher',
    sensitivityBias: {},
    fireButtonDelta: 0,
    preferredDrag: 'VERTICAL',
    trainingFocus: 'Uso situacional; el arma especial no depende de sensibilidad fina.',
  },
};

const WEAPON_RISK_NOTES: Record<AresV6WeaponCategory, string> = {
  SHOTGUN: 'Escopeta de un tiro: el timing del drag pesa más que la sensibilidad cruda.',
  SMG: 'La SMG premia el tracking lateral; no infles de más el Punto Rojo.',
  AR_FAST: 'Rifles rápidos: controla la ráfaga, evita spamear el gatillo.',
  AR_HEAVY: 'Rifles pesados: el recoil vertical exige bajar 4x y disparar en ráfagas.',
  MARKSMAN: 'DMR: prioriza precisión sobre velocidad y protege 4x/AWM.',
  SNIPER: 'Sniper: mantén AWM por debajo del 4x para evitar el sobre-arrastre.',
  PISTOL: 'Pistola: arma de reacción; entrena el one-tap pecho-cabeza.',
  SPECIAL: 'Arma especial: uso situacional, no recalibres toda la sensibilidad por ella.',
};

/**
 * Resolve the calibration rule for a weapon category. Returns the research
 * matrix rule first, then a safe fallback, then null when no category is set.
 */
export function resolveWeaponRule(category?: AresV6WeaponCategory): WeaponCalibrationRule | null {
  if (!category) return null;
  const matrixRule = ARES_V6_WEAPON_CALIBRATION_RULES.find((rule) => rule.category === category);
  if (matrixRule) return matrixRule;
  return WEAPON_FALLBACK_RULES[category] ?? null;
}

export function getWeaponDelta(category?: AresV6WeaponCategory): Partial<AresV6SensitivityVector> {
  return resolveWeaponRule(category)?.sensitivityBias ?? {};
}

export function getWeaponFireButtonDelta(category?: AresV6WeaponCategory): number {
  return resolveWeaponRule(category)?.fireButtonDelta ?? 0;
}

export function getWeaponPreferredDrag(category?: AresV6WeaponCategory): AresV6DragZone {
  return resolveWeaponRule(category)?.preferredDrag ?? 'VERTICAL';
}

export function getWeaponTrainingFocus(category?: AresV6WeaponCategory): string {
  return (
    resolveWeaponRule(category)?.trainingFocus ??
    'Entrena con tu arma principal en training antes de jugar ranked.'
  );
}

export function getWeaponRiskNotes(category?: AresV6WeaponCategory): readonly string[] {
  if (!category) return [];
  return [WEAPON_RISK_NOTES[category]];
}
