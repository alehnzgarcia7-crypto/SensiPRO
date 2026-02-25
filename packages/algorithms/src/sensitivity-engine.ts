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
// HARDWARE ADJUST:
//   hzBonus:     ((Hz - 60) / 60) × 10  → 60Hz=0, 90Hz=+5, 120Hz=+10, 144Hz=+14
//   screenBonus: ((screenSize - 6.0) / 1.5) × 4  → pantalla más grande = más sensi
//   panelBonus:  LTPO=+3, AMOLED=+2, OLED=+2, IPS=0, LCD=-2
//   tierBonus:   GAMING=+5, ULTRA=+4, HIGH=+2, MID=0, LOW=-3
//
// RAM FACTOR (uniforme a todos los campos):
//   2GB=+15, 3GB=+10, 4GB=+5, 6GB=0, 8GB=-5, 12GB=-8, 16GB=-10
//   Más RAM = menos sensi necesaria (hardware más responsivo)

// Bonus por tipo de panel
const PANEL_BONUS: Record<string, number> = {
  LTPO:   3,
  AMOLED: 2,
  OLED:   2,
  IPS:    0,
  LCD:   -2,
};

// Bonus por tier del dispositivo
const TIER_BONUS: Record<string, number> = {
  GAMING: 5,
  ULTRA:  4,
  HIGH:   2,
  MID:    0,
  LOW:   -3,
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

  // 1. Hz bonus (respecto a 60Hz base)
  // 60Hz=0, 90Hz=+5, 120Hz=+10, 144Hz=+14
  const hzBonus = ((specs.screenHz - 60) / 60) * 10;

  // 2. Screen bonus (pantallas más grandes = ligeramente más sensi por más área de toque)
  // 5.0"=-2.7, 6.0"=0, 6.5"=+1.3, 6.7"=+1.9, 7.0"=+2.7
  const screenBonus = ((specs.screenSize - 6.0) / 1.5) * 4;

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
