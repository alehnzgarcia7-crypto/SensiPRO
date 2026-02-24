export { generateSensitivity } from './sensitivity-engine';
export { generateGyroscope } from './gyroscope-engine';
export { getStyleMultipliers, getAllStyles } from './style-system';
export { analyzeDeviceSpecs, calculatePerformanceScore } from './device-analyzer';
export {
  STYLE_PROFILES,
  getRecommendedStyle,
  getStyleProfile,
  getAllStyleProfiles,
} from './style-profiles';
export type { StyleProfile } from './style-profiles';
export type {
  AlgorithmInput,
  AlgorithmOutput,
  SensitivityOutput,
  GyroscopeOutput,
  StyleMultipliers,
  DeviceSpecs,
  SpecWeights,
} from './types';
