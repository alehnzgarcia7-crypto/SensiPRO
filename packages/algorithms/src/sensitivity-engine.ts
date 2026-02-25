import {
  BASE_SENSITIVITY,
  RAM_FACTORS,
} from '@ares/config';

import type { AlgorithmInput, AlgorithmOutput, SensitivityOutput } from './types';
import { calculatePerformanceScore } from './device-analyzer';
import { generateGyroscope } from './gyroscope-engine';

// ═══════════════════════════════════════════════════════════════
// ARES SENSITIVITY ENGINE v3.0
// ═══════════════════════════════════════════════════════════════
//
// RANGO: 0-200 (escala Free Fire desde OB50)
//
// FÓRMULA CORE (por campo):
//   rawValue = BASE[field]
//     + (totalHwAdjust × FIELD_HW_WEIGHT[field])
//     + ramFactor
//
// El engine produce valores RAW sin calibración.
// La calibración (ALTA/MEDIA/BAJA) y DPI se aplican en calibration-engine.
//
// HARDWARE ADJUST (reducidos para rangos realistas de pro players):
//   hzBonus:     ((Hz - 60) / 60) × 5   → 60Hz=0, 90Hz=+2.5, 120Hz=+5, 144Hz=+7
//   screenBonus: ((screenSize - 6.0) / 1.5) × 2  → 6.0"=0, 6.5"=+0.67, 6.7"=+0.93
//   panelBonus:  LTPO=+2, AMOLED=+1, OLED=+1, IPS=0, LCD=-1
//   tierBonus:   GAMING=+3, ULTRA=+2, HIGH=+1, MID=0, LOW=-2
//
// RAM FACTOR (uniforme a todos los campos, reducido para rangos realistas):
//   2GB=+8, 3GB=+5, 4GB=+3, 6GB=0, 8GB=-2, 12GB=-4, 16GB=-5
//   Más RAM = menos sensi necesaria (hardware más responsivo)

// Bonus por tipo de panel (reducido para rangos realistas)
const PANEL_BONUS: Record<string, number> = {
  LTPO:   2,
  AMOLED: 1,
  OLED:   1,
  IPS:    0,
  LCD:   -1,
};

// Bonus por tier del dispositivo (reducido para rangos realistas)
const TIER_BONUS: Record<string, number> = {
  GAMING: 3,
  ULTRA:  2,
  HIGH:   1,
  MID:    0,
  LOW:   -2,
};

// Qué porcentaje del hardware bonus recibe cada campo
// General recibe 100%, Sniper recibe menos porque necesita estabilidad
const FIELD_HW_WEIGHT: Record<keyof SensitivityOutput, number> = {
  general:     1.0,
  redPoint:    0.90,
  scope2x:     0.80,
  scope4x:     0.65,
  sniperScope: 0.40,
  freeView:    0.85,
};

const SENSITIVITY_FIELDS: (keyof SensitivityOutput)[] = [
  'general', 'redPoint', 'scope2x', 'scope4x', 'sniperScope', 'freeView',
];

export function generateSensitivity(input: AlgorithmInput): AlgorithmOutput {
  const { specs, style, includeGyro, userRam } = input;

  // Usar userRam si viene, sino el RAM del device
  const ram = userRam ?? specs.ramGb;

  // 1. Hz bonus (respecto a 60Hz base, factor ×5 para rangos realistas)
  // 60Hz=0, 90Hz=+2.5, 120Hz=+5, 144Hz=+7
  const hzBonus = ((specs.screenHz - 60) / 60) * 5;

  // 2. Screen bonus (pantallas más grandes = ligeramente más sensi, factor ×2)
  // 5.0"=-1.3, 6.0"=0, 6.5"=+0.67, 6.7"=+0.93, 7.0"=+1.3
  const screenBonus = ((specs.screenSize - 6.0) / 1.5) * 2;

  // 3. Panel y Tier
  const panelBonus = PANEL_BONUS[specs.panelType] ?? 0;
  const tierBonus = TIER_BONUS[specs.tier] ?? 0;

  // 4. Total hardware adjustment
  const totalHwAdjust = hzBonus + screenBonus + panelBonus + tierBonus;

  // 5. RAM factor (positivo para baja RAM, negativo para alta)
  const ramFactor = RAM_FACTORS[ram] ?? 0;

  // 6. Aplicar a cada campo con peso diferenciado
  const sensitivity = {} as SensitivityOutput;

  for (const field of SENSITIVITY_FIELDS) {
    const base = BASE_SENSITIVITY[field];
    const hwContribution = totalHwAdjust * FIELD_HW_WEIGHT[field];
    sensitivity[field] = Math.round(base + hwContribution + ramFactor);
    // NO clamp aquí — se hace en calibration-engine para respetar 0-200
  }

  // Calcular giroscopio opcionalmente (feature Premium)
  const gyroscope = includeGyro ? generateGyroscope(sensitivity) : null;

  return {
    sensitivity,
    gyroscope,
    meta: {
      performanceScore: calculatePerformanceScore(specs),
      styleApplied: style,
      deviceTier: specs.tier,
      algorithm: 'ARES-v3.0',
    },
  };
}
