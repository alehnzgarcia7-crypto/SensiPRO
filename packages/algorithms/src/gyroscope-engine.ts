import {
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
  GYRO_BASE_FACTOR,
  GYRO_PANEL_BONUS,
  GYRO_GAMING_BONUS,
} from '@ares/config';

import type { SensitivityOutput, GyroscopeOutput, DeviceSpecs } from './types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v1.0
// ═══════════════════════════════════════════════════════════
//
// El giroscopio es una feature PREMIUM que calcula valores
// complementarios para jugadores que usan gyro en Free Fire.
//
// FÓRMULA:
//   gyroBase = sensitivityValue × GYRO_BASE_FACTOR (50%)
//   panelBonus = AMOLED/OLED ? GYRO_PANEL_BONUS (+5%) : 0
//   gamingBonus = GAMING tier ? GYRO_GAMING_BONUS (+8%) : 0
//   gyroFinal = clamp(round(gyroBase × (1 + panelBonus + gamingBonus)), 1, 100)

// Paneles que reciben bonus de giroscopio (mejor respuesta táctil)
const GYRO_PANEL_TYPES = new Set(['AMOLED', 'OLED', 'LTPO']);

// Tiers que reciben bonus de giroscopio (mejor hardware)
const GYRO_TIER_TYPES = new Set(['GAMING', 'ULTRA']);

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function calculateGyroValue(
  sensitivityValue: number,
  panelBonus: number,
  tierBonus: number,
): number {
  const gyroBase = sensitivityValue * GYRO_BASE_FACTOR;
  const multiplier = 1 + panelBonus + tierBonus;
  return clamp(gyroBase * multiplier, SENSITIVITY_MIN, SENSITIVITY_MAX);
}

export function generateGyroscope(
  sensitivity: SensitivityOutput,
  specs: DeviceSpecs,
): GyroscopeOutput {
  const panelBonus = GYRO_PANEL_TYPES.has(specs.panelType) ? GYRO_PANEL_BONUS : 0;
  const tierBonus = GYRO_TIER_TYPES.has(specs.tier) ? GYRO_GAMING_BONUS : 0;

  return {
    gyroGeneral:  calculateGyroValue(sensitivity.general, panelBonus, tierBonus),
    gyroRedPoint: calculateGyroValue(sensitivity.redPoint, panelBonus, tierBonus),
    gyroScope2x:  calculateGyroValue(sensitivity.scope2x, panelBonus, tierBonus),
    gyroScope4x:  calculateGyroValue(sensitivity.scope4x, panelBonus, tierBonus),
    gyroSniper:   calculateGyroValue(sensitivity.sniperScope, panelBonus, tierBonus),
    gyroFreeView: calculateGyroValue(sensitivity.freeView, panelBonus, tierBonus),
  };
}
