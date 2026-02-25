import {
  GYRO_BASE_FACTOR,
  GYRO_PANEL_BONUS,
  GYRO_GAMING_BONUS,
  SENSITIVITY_MIN,
  GYRO_MAX,
} from '@ares/config';

import type { SensitivityOutput, GyroscopeOutput, DeviceSpecs } from './types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v2.0
// ═══════════════════════════════════════════════════════════
//
// RANGO: 60-140 (giroscopio es más conservador que sensibilidad)
//
// FÓRMULA:
//   gyroValue = sensitivityValue × GYRO_BASE_FACTOR (0.35)
//             + panelBonus (AMOLED/OLED = +5%)
//             + gamingBonus (GAMING tier = +8%)
//             + fieldAdjustment
//
// FIELD ADJUSTMENTS (escalados para rango 60-190 → gyro 60-140):
//   gyroGeneral:   +4
//   gyroRedPoint:  +0
//   gyroScope2x:   -3
//   gyroScope4x:   -6
//   gyroSniper:    -10
//   gyroFreeView:  +6
//
// NOTA: Giroscopio es feature PREMIUM. Los valores se calculan
// siempre pero solo se muestran a usuarios Premium/VIP.

const FIELD_ADJUSTMENTS: Record<keyof GyroscopeOutput, number> = {
  gyroGeneral:   4,
  gyroRedPoint:  0,
  gyroScope2x:  -3,
  gyroScope4x:  -6,
  gyroSniper:  -10,
  gyroFreeView:  6,
};

// Map gyro fields to their sensitivity counterparts
const GYRO_TO_SENS: Record<keyof GyroscopeOutput, keyof SensitivityOutput> = {
  gyroGeneral:   'general',
  gyroRedPoint:  'redPoint',
  gyroScope2x:   'scope2x',
  gyroScope4x:   'scope4x',
  gyroSniper:    'sniperScope',
  gyroFreeView:  'freeView',
};

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function generateGyroscope(
  sensitivity: SensitivityOutput,
  specs: DeviceSpecs,
): GyroscopeOutput {
  // Calculate bonuses
  const panelBonus = (specs.panelType === 'AMOLED' || specs.panelType === 'OLED')
    ? GYRO_PANEL_BONUS
    : 0;

  const gamingBonus = specs.tier === 'GAMING' ? GYRO_GAMING_BONUS : 0;

  const totalFactor = GYRO_BASE_FACTOR + panelBonus + gamingBonus;

  const result: Partial<GyroscopeOutput> = {};

  for (const [gyroField, sensField] of Object.entries(GYRO_TO_SENS)) {
    const key = gyroField as keyof GyroscopeOutput;
    const baseValue = sensitivity[sensField];
    const adjustment = FIELD_ADJUSTMENTS[key];

    result[key] = clamp(
      baseValue * totalFactor + adjustment,
      SENSITIVITY_MIN,
      GYRO_MAX,
    );
  }

  return result as GyroscopeOutput;
}
