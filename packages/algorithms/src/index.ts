export { generateSensitivity, estimateDpiFromDevice } from './sensitivity-engine';
export { generateGyroscope } from './gyroscope-engine';
export { getStyleMultipliers, getAllStyles } from './style-system';
export { analyzeDeviceSpecs, calculatePerformanceScore, autoDetectTier } from './device-analyzer';
export type { DeviceAnalysis } from './device-analyzer';
export { compareDevices } from './comparator';
export type { DeviceForComparison, ComparisonField, ComparisonResult } from './comparator';
export {
  STYLE_PROFILES,
  getRecommendedStyle,
  getStyleProfile,
  getAllStyleProfiles,
} from './style-profiles';
export type { StyleProfile } from './style-profiles';
export {
  generateCalibration,
  generateAllCalibrations,
  calculateDpi,
  calculateButtonSize,
  calculatePrecisionScore,
  generateHudRecommendation,
} from './calibration-engine';
export { generateHeadshotSensitivity, getWeaponAdjustedSensitivity } from './headshot-engine';
export type {
  AlgorithmInput,
  AlgorithmOutput,
  CalibrationInput,
  CalibrationResult,
  HudOption,
  HudRecommendation,
  GenerateAllOutput,
  SensitivityOutput,
  GyroscopeOutput,
  StyleMultipliers,
  DeviceSpecs,
  SpecWeights,
  ForensicMetadata,
  FireButtonResult,
  HeadshotResult,
} from './types';
