import type { SensitivityStyle, PanelType, DeviceTier, CalibrationLevel } from '@prisma/client';

export interface DeviceSpecs {
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: PanelType;
  tier: DeviceTier;
  ppi?: number;
}

export interface AlgorithmInput {
  specs: DeviceSpecs;
  style: SensitivityStyle;
  includeGyro?: boolean;
  userRam?: number;
}

export interface CalibrationInput {
  specs: DeviceSpecs;
  style: SensitivityStyle;
  calibration: CalibrationLevel;
  dpiMode: boolean;
  includeGyro?: boolean;
  userRam?: number;
}

export interface SensitivityOutput {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

export interface GyroscopeOutput {
  gyroGeneral: number;
  gyroRedPoint: number;
  gyroScope2x: number;
  gyroScope4x: number;
  gyroSniper: number;
  gyroFreeView: number;
}

export interface AlgorithmOutput {
  sensitivity: SensitivityOutput;
  gyroscope: GyroscopeOutput | null;
  meta: {
    performanceScore: number;
    styleApplied: SensitivityStyle;
    deviceTier: DeviceTier;
    algorithm: string;
  };
}

export interface CalibrationResult {
  calibration: CalibrationLevel;
  dpiMode: boolean;
  sensitivity: SensitivityOutput;
  gyroscope: GyroscopeOutput | null;
  performanceScore: number;
  precisionScore: number;
  dpiValue: number | null;
  buttonSize: number;
}

export interface HudOption {
  fingers: 2 | 3 | 4 | 5;
  description: string;
  pros: string[];
  cons: string[];
  isRecommended: boolean;
}

export interface HudRecommendation {
  recommended: 2 | 3 | 4 | 5;
  options: HudOption[];
}

export interface GenerateAllOutput {
  combinations: CalibrationResult[];
  hudRecommendation: HudRecommendation;
  meta: {
    styleApplied: SensitivityStyle;
    deviceTier: DeviceTier;
    algorithm: string;
  };
}

export interface StyleMultipliers {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

export interface SpecWeights {
  hz: number;
  screenSize: number;
  ram: number;
  panel: number;
  tier: number;
}

// ═══ HEADSHOT MODE ═══

export interface FireButtonResult {
  percentage: number;
  fingers: 2 | 3 | 4;
  positionTip: string;
}

export interface HeadshotResult {
  sensitivity: SensitivityOutput;
  gyroscope: GyroscopeOutput;
  normalSensitivity: SensitivityOutput;
  normalGyroscope: GyroscopeOutput;
  fireButton: FireButtonResult;
  headshotScore: number;
  recommendedDrag: string;
  crosshairTip: string;
}
