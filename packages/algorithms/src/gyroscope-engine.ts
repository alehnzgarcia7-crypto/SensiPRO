import {
  GYRO_BASE_FACTOR,
  GYRO_PANEL_BONUS,
  GYRO_GAMING_BONUS,
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
} from '@ares/config';

import type { SensitivityOutput, GyroscopeOutput, DeviceSpecs } from './types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v1.0
// ═══════════════════════════════════════════════════════════
//
// FÓRMULA:
//   gyroValue = sensitivityValue × GYRO_BASE_FACTOR (0.50)
//             + panelBonus (AMOLED/OLED = +5%)
//             + gamingBonus (GAMING tier = +8%)
//             + fieldAdjustment (varies per scope type)
//
// FIELD ADJUSTMENTS:
//   gyroGeneral:   +2  (necesita algo más de sensibilidad)
//   gyroRedPoint:  +0  (neutral)
//   gyroScope2x:   -1  (ligeramente más estable)
//   gyroScope4x:   -3  (requiere más estabilidad)
//   gyroSniper:    -5  (máxima estabilidad para sniper)
//   gyroFreeView:  +3  (más libertad de movimiento)
//
// NOTA: Giroscopio es feature PREMIUM. Los valores se calculan
// siempre pero solo se muestran a usuarios Premium/VIP.

const FIELD_ADJUSTMENTS: Record<keyof GyroscopeOutput, number> = {
  gyroGeneral:   2,
  gyroRedPoint:  0,
  gyroScope2x:  -1,
  gyroScope4x:  -3,
  gyroSniper:   -5,
  gyroFreeView:  3,
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
      SENSITIVITY_MAX,
    );
  }

  return result as GyroscopeOutput;
}
