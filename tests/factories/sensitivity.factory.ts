import type { SensitivityStyle } from '@prisma/client';
import type { SensitivityResult, SensitivityValues, GyroscopeValues } from '@ares/types';

let counter = 0;

export function createTestSensitivity(overrides?: Partial<SensitivityResult>): SensitivityResult {
  counter++;
  const defaultValues: SensitivityValues = {
    general: 55,
    redPoint: 50,
    scope2x: 45,
    scope4x: 40,
    sniperScope: 35,
    freeView: 60,
  };

  const defaultGyro: GyroscopeValues = {
    gyroGeneral: 28,
    gyroRedPoint: 25,
    gyroScope2x: 22,
    gyroScope4x: 20,
    gyroSniper: 18,
    gyroFreeView: 30,
  };

  return {
    deviceId: `device-${counter}`,
    deviceName: `Samsung Galaxy A${counter + 10}`,
    style: 'BALANCED' as SensitivityStyle,
    sensitivity: { ...defaultValues },
    gyroscope: { ...defaultGyro },
    ...overrides,
  };
}
