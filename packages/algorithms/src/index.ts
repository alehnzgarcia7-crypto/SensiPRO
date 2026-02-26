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
export { calculateHeadshotFingerMode } from './headshot-finger-engine';
export type {
  GyroscopeFingerValues,
  FireButtonRecommendation,
  WeaponAdjustmentRow,
  HeadshotFingerResult,
} from './headshot-finger-engine';
export { FINGER_PROFILES, getFingerProfile } from './finger-profiles';
export type { FingerCount, FingerProfile } from './finger-profiles';
export {
  WEAPON_CATEGORIES,
  getWeaponCategory,
  getAllWeaponCategories,
  getMetaWeapons,
} from './weapon-categories';
export type { WeaponCategory, WeaponCategoryData } from './weapon-categories';
export {
  HUD_LAYOUTS,
  getHudLayout,
  getButtonsByFinger,
  getCriticalButtons,
} from './hud-layouts';
export type { HudButton, FingerRole, HudLayout } from './hud-layouts';
export {
  HEADSHOT_DRAG_TECHNIQUES,
  FINGER_TECHNIQUE_SETS,
  getDragTechniqueData,
  getFingerTechniques,
  getTechniquesForFingers,
} from './drag-techniques-data';
export type { DragType, DragTechniqueData, FingerTechniqueSet } from './drag-techniques-data';
export { TRAINING_PLANS, getTrainingPlan } from './training-plans';
export type { TrainingExercise, TrainingDay, TrainingPlanData } from './training-plans';
export { WEAPON_RECOMMENDATIONS, getWeaponRecommendation } from './weapon-tiers';
export type { WeaponTierEntry, WeaponTier, WeaponRecommendation } from './weapon-tiers';
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
