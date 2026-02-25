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
// Ajustados para bases ~95/85/70/55/35/80 → rangos gyro ~20-40 (pro player range)
// General 95×0.32=30 | RedPoint 85×0.35=30 | 2x 70×0.40=28 | 4x 55×0.45=25 | Sniper 35×0.63=22 | FreeView 80×0.27=22
const GYRO_FACTOR: Record<keyof GyroscopeOutput, { sensField: keyof SensitivityOutput; factor: number }> = {
  gyroGeneral:     { sensField: 'general',     factor: 0.32 },
  gyroRedPoint:    { sensField: 'redPoint',    factor: 0.35 },
  gyroScope2x:     { sensField: 'scope2x',     factor: 0.40 },
  gyroScope4x:     { sensField: 'scope4x',     factor: 0.45 },
  gyroSniper:      { sensField: 'sniperScope',  factor: 0.63 },
  gyroFreeView:    { sensField: 'freeView',    factor: 0.27 },
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
