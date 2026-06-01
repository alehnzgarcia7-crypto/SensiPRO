// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Public API
//
// Re-exports the engine's public surface. Module-private helpers
// (screen categorisation, internal bias tables, etc.) are intentionally
// not exported.
// ═══════════════════════════════════════════════════════════════

export * from './types';

export { ARES_V6_PRESETS, getAresV6Preset, getAresV6PresetsByCategory } from './presets';

export {
  ARES_V6_DEFAULT_PPI_BAND,
  ARES_V6_DEVICE_SIGNAL_RULES,
  ARES_V6_PPI_CALIBRATION_BANDS,
  ARES_V6_SYMPTOM_TUNING_RULES,
  ARES_V6_WEAPON_CALIBRATION_RULES,
  getPpiCalibrationBand,
} from './research-matrix';
export type {
  PpiCalibrationBand,
  SignalAdjustmentRule,
  SymptomTuningRule,
  WeaponCalibrationRule,
} from './research-matrix';

export {
  calculateBaseSensitivityFromPpi,
  calculateConservativeBaseFromPpi,
  resolveEffectivePpi,
} from './dpi-curve';
export type { AresV6EffectivePpiResult } from './dpi-curve';

export {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  findAresV6FixtureForDevice,
  getAresV6CalibrationFixture,
  isAresV6FixtureDevice,
} from './fixtures';
export type { AresV6CalibrationFixture } from './fixtures';

// ── Phase 1 engine modules ──────────────────────────────────────

export {
  ARES_V6_GYRO_MAX,
  ARES_V6_GYRO_MIN,
  ARES_V6_SCOPE2X_OVER_REDPOINT,
  ARES_V6_SENSITIVITY_MAX,
  ARES_V6_SENSITIVITY_MIN,
  applyDelta,
  clamp,
  clampGyro,
  clampSensitivity,
  enforceScopeCascade,
  lerp,
  mergeDelta,
  round,
} from './math';
export type { AresV6SensitivityDelta } from './math';

export {
  ARES_V6_META_YEAR,
  buildDpiRecommendation,
  getDeviceAgeYears,
  getDeviceConfidencePenalty,
  getDeviceRiskNotes,
  getDeviceSignalDelta,
  resolveDeviceProfile,
} from './device-profile';
export type { AresV6DeviceProfile } from './device-profile';

export {
  applyPresetToSensitivity,
  applyWeaponToSensitivity,
  finalizeSensitivity,
  generateBaseSensitivity,
} from './sensitivity';

export {
  getWeaponDelta,
  getWeaponFireButtonDelta,
  getWeaponPreferredDrag,
  getWeaponRiskNotes,
  getWeaponTrainingFocus,
  resolveWeaponRule,
} from './weapons';

export { buildGyroscope } from './gyro';
export { buildFireButton, getDragZone, getFireButtonBase } from './fire-button';
export { buildHud } from './hud';
export { buildTuningSteps, getTuningStepForSymptom } from './tuning';
export { buildConfidence } from './confidence';
export { buildExplanation } from './explain';
export type { AresV6ExplanationContext } from './explain';

export { generateAresV6 } from './generate';
