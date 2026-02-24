import type { SensitivityStyle, PanelType, DeviceTier } from '@prisma/client';

export interface DeviceSpecs {
  screenHz: number;
  screenSize: number;
  ramGb: number;
  panelType: PanelType;
  tier: DeviceTier;
}

export interface AlgorithmInput {
  specs: DeviceSpecs;
  style: SensitivityStyle;
  includeGyro?: boolean;
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
