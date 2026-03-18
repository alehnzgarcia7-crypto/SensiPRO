import {
  GYRO_MIN,
  GYRO_MAX,
} from '@ares/config';

import type { SensitivityOutput, GyroscopeOutput } from './types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v5.0
// ═══════════════════════════════════════════════════════════
//
// RANGO: 0-100 (giroscopio en Free Fire, pros usan 20-40)
//
// FÓRMULA:
//   gyroValue = sensitivityValue × GYRO_FACTOR[field]
//   clamped a [0, 100]
//
// FACTORES v5.0 (recalibrados para sensitivity engine v5.0):
//   v5.0 produce valores en rango ~70-150 (vs v4.0's ~120-190)
//   Factores aumentados proporcionalmente para mantener gyro en rango pro (20-40)
//
// FreeView: v5.0 freeView ahora está en escala 0-200 (antes 12-25),
//   así que gyroFreeView se calcula normalmente con su factor.
//
// NOTA: Giroscopio es feature PREMIUM. Los valores se calculan
// siempre pero solo se muestran a usuarios Premium/VIP.

// Factores de conversión sensitivity → gyroscope por campo
// Calibrados para v5.0: general ~100 → gyro ~30, sniperScope ~60 → gyro ~18
const GYRO_FACTOR: Record<keyof Omit<GyroscopeOutput, 'gyroFreeView'>, { sensField: keyof SensitivityOutput; factor: number }> = {
  gyroGeneral:  { sensField: 'general',      factor: 0.30 },
  gyroRedPoint: { sensField: 'redPoint',     factor: 0.32 },
  gyroScope2x:  { sensField: 'scope2x',      factor: 0.32 },
  gyroScope4x:  { sensField: 'scope4x',      factor: 0.34 },
  gyroSniper:   { sensField: 'sniperScope',   factor: 0.34 },
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

  // FreeView gyro: v5.0 freeView está en escala 0-200, aplicar factor directo
  result.gyroFreeView = clamp(Math.round(sensitivity.freeView * 0.30), 5, 50);

  return result;
}
