import {
  GYRO_MIN,
  GYRO_MAX,
} from '@ares/config';

import type { SensitivityOutput, GyroscopeOutput } from './types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v3.0
// ═══════════════════════════════════════════════════════════
//
// RANGO: 0-100 (giroscopio en Free Fire, pros usan 20-40)
//
// FÓRMULA:
//   gyroValue = sensitivityValue × GYRO_FACTOR[field]
//   clamped a [0, 100]
//
// FACTORES por campo:
//   Los factores convierten escala 0-200 → rango gyro ~20-40
//   Miras con más zoom (scope) reciben factor MÁS ALTO porque
//   el gyro es más útil para estabilizar miras de largo alcance.
//   FreeView recibe factor BAJO porque gyro general es menos crítico.
//
// NOTA: Giroscopio es feature PREMIUM. Los valores se calculan
// siempre pero solo se muestran a usuarios Premium/VIP.

// Factores de conversión sensitivity → gyroscope por campo
const GYRO_FACTOR: Record<keyof GyroscopeOutput, { sensField: keyof SensitivityOutput; factor: number }> = {
  gyroGeneral:     { sensField: 'general',     factor: 0.18 },
  gyroRedPoint:    { sensField: 'redPoint',    factor: 0.20 },
  gyroScope2x:     { sensField: 'scope2x',     factor: 0.22 },
  gyroScope4x:     { sensField: 'scope4x',     factor: 0.25 },
  gyroSniper:      { sensField: 'sniperScope',  factor: 0.35 },
  gyroFreeView:    { sensField: 'freeView',    factor: 0.15 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function generateGyroscope(sensitivity: SensitivityOutput): GyroscopeOutput {
  const result = {} as GyroscopeOutput;

  for (const [gyroField, config] of Object.entries(GYRO_FACTOR)) {
    const key = gyroField as keyof GyroscopeOutput;
    const sensValue = sensitivity[config.sensField];
    result[key] = clamp(sensValue * config.factor, GYRO_MIN, GYRO_MAX);
  }

  return result;
}
