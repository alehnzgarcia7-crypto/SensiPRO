import { ARES_V6_SYMPTOM_TUNING_RULES } from './research-matrix';
import type {
  AresV6GenerationInput,
  AresV6PresetId,
  AresV6Symptom,
  AresV6TuningStep,
} from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Tuning Wizard
//
// Symptoms NEVER mutate the base output. They become at most three guided
// tuning steps, each with an adjustment, an instruction and a test protocol,
// plus an optional preset to fall back to if the symptom persists.
// ═══════════════════════════════════════════════════════════════

const MAX_TUNING_STEPS = 3;

const SYMPTOM_PRESET_FALLBACK: Partial<Record<AresV6Symptom, AresV6PresetId>> = {
  DEVICE_LAGS: 'LOW_END_STABLE',
  PHONE_HEATS_UP: 'LOW_END_STABLE',
  SCOPE_4X_UNCONTROLLABLE: 'AR_RECOIL_CONTROL',
  RECOIL_TOO_HIGH: 'AR_RECOIL_CONTROL',
  AWM_OVERSHOOTS: 'SNIPER_AWM',
  AWM_TOO_SLOW: 'SNIPER_AWM',
  AIM_SHAKES: 'GYRO_LIGHT',
};

/** Build one guided tuning step for a single symptom. */
export function getTuningStepForSymptom(symptom: AresV6Symptom): AresV6TuningStep {
  const rule = ARES_V6_SYMPTOM_TUNING_RULES.find((item) => item.symptom === symptom);
  const presetFallback = SYMPTOM_PRESET_FALLBACK[symptom];

  if (!rule) {
    return {
      symptom,
      adjustment: presetFallback ? { presetFallback } : {},
      instruction: 'Síntoma registrado. Requiere laboratorio adicional antes de automatizar el ajuste.',
      testProtocol: 'Juega 3 partidas y registra si mejoró, empeoró o quedó igual.',
    };
  }

  return {
    symptom,
    adjustment: presetFallback ? { ...rule.delta, presetFallback } : { ...rule.delta },
    instruction: `Aplica este ajuste solo si el síntoma persiste tras probar el preset base: ${rule.warning}`,
    testProtocol: rule.testProtocol,
  };
}

/** Build the first (max 3) tuning steps from the player's reported symptoms. */
export function buildTuningSteps(input: AresV6GenerationInput): readonly AresV6TuningStep[] {
  const symptoms = input.player.symptoms ?? [];
  return symptoms.slice(0, MAX_TUNING_STEPS).map(getTuningStepForSymptom);
}
