export * from './types';
export {
  ARES_V6_PRESETS,
  getAresV6Preset,
  getAresV6PresetsByCategory,
} from './presets';
export {
  ARES_V6_PPI_CALIBRATION_BANDS,
  ARES_V6_DEVICE_SIGNAL_RULES,
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
  resolveEffectivePpi,
  calculateBaseSensitivityFromPpi,
  calculateConservativeBaseFromPpi,
} from './dpi-curve';
export type { AresV6EffectivePpiResult } from './dpi-curve';
export {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  getAresV6CalibrationFixture,
} from './fixtures';
export type { AresV6CalibrationFixture } from './fixtures';
