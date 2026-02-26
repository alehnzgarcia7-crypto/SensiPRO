import {
  GYRO_MIN,
  GYRO_MAX,
} from '@ares/config';

import type { SensitivityOutput, GyroscopeOutput } from './types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v4.0
// ═══════════════════════════════════════════════════════════
//
// RANGO: 0-100 (giroscopio en Free Fire, pros usan 20-40)
//
// FÓRMULA:
//   gyroValue = sensitivityValue × GYRO_FACTOR[field]
//   clamped a [0, 100]
//
// FACTORES v4.0 (recalibrados para sensitivity engine v4.0):
//   v4.0 produce valores en rango ~120-190 (vs v3.0's ~80-110)
//   Factores reducidos para mantener gyro en rango pro (20-40)
//
// FreeView: como v4.0 freeView es independiente y bajo (14-22),
//   gyroFreeView se calcula como fracción de gyroGeneral.
//
// NOTA: Giroscopio es feature PREMIUM. Los valores se calculan
// siempre pero solo se muestran a usuarios Premium/VIP.

// Factores de conversión sensitivity → gyroscope por campo
// Calibrados para v4.0: general ~175 → gyro ~30, sniperScope ~115 → gyro ~23
const GYRO_FACTOR: Record<keyof Omit<GyroscopeOutput, 'gyroFreeView'>, { sensField: keyof SensitivityOutput; factor: number }> = {
  gyroGeneral:  { sensField: 'general',      factor: 0.17 },
  gyroRedPoint: { sensField: 'redPoint',     factor: 0.19 },
  gyroScope2x:  { sensField: 'scope2x',      factor: 0.19 },
  gyroScope4x:  { sensField: 'scope4x',      factor: 0.20 },
  gyroSniper:   { sensField: 'sniperScope',   factor: 0.20 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function generateGyroscope(sensitivity: SensitivityOutput): GyroscopeOutput {
  const result = {} as GyroscopeOutput;

  for (const [gyroField, config] of Object.entries(GYRO_FACTOR)) {
    const key = gyroField as keyof Omit<GyroscopeOutput, 'gyroFreeView'>;
    const sensValue = sensitivity[config.sensField];
    result[key] = clamp(sensValue * config.factor, GYRO_MIN, GYRO_MAX);
  }

  // FreeView gyro: v4.0 freeView es bajo (14-22), así que derivamos
  // de gyroGeneral en vez de aplicar factor sobre freeView
  result.gyroFreeView = clamp(Math.round(result.gyroGeneral * 0.55), 5, 25);

  return result;
}
