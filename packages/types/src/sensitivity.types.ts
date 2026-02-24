import type { SensitivityStyle } from '@prisma/client';

export interface SensitivityValues {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

export interface GyroscopeValues {
  gyroGeneral: number;
  gyroRedPoint: number;
  gyroScope2x: number;
  gyroScope4x: number;
  gyroSniper: number;
  gyroFreeView: number;
}

export interface SensitivityResult {
  deviceId: string;
  deviceName: string;
  style: SensitivityStyle;
  sensitivity: SensitivityValues;
  gyroscope: GyroscopeValues | null;
}

export interface GenerateRequest {
  deviceId: string;
  style: SensitivityStyle;
  includeGyro?: boolean;
}

export interface CompareRequest {
  deviceIdA: string;
  deviceIdB: string;
  style: SensitivityStyle;
}

export interface CompareResult {
  deviceA: SensitivityResult;
  deviceB: SensitivityResult;
  winner: {
    general: 'A' | 'B' | 'TIE';
    overall: 'A' | 'B' | 'TIE';
  };
}
