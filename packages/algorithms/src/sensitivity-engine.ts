import {
  BASE_SENSITIVITY,
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
} from '@ares/config';

import type { AlgorithmInput, AlgorithmOutput, SensitivityOutput } from './types';
import { getStyleMultipliers } from './style-system';
import { calculatePerformanceScore } from './device-analyzer';
import { generateGyroscope } from './gyroscope-engine';

// ═══════════════════════════════════════════════════════════════
// ARES SENSITIVITY ENGINE v1.0
// ═══════════════════════════════════════════════════════════════
//
// FÓRMULA CORE:
//   Para cada campo (general, redPoint, scope2x, etc.):
//     rawValue = BASE + (hzFactor × W_hz) + (screenFactor × W_screen)
//                + (ramFactor × W_ram) + (panelBonus) + (tierBonus)
//     styledValue = rawValue × styleMultiplier[field]
//     finalValue = clamp(round(styledValue), 1, 100)
//
// FACTORES:
//   hzFactor:     (deviceHz - 60) / 120 → normalizado 0-1 (60Hz=0, 180Hz=1)
//   screenFactor: (6.7 - deviceSize) / 2.0 → pantalla más chica = más sensible
//   ramFactor:    (deviceRam - 3) / 13 → normalizado 0-1 (3GB=0, 16GB=1)
//   panelBonus:   AMOLED/OLED=+3, LTPO=+4, IPS=+1, LCD=0
//   tierBonus:    GAMING=+8, ULTRA=+6, HIGH=+4, MID=+1, LOW=-2
//
// PESOS por campo:
//   general:     hz=15, screen=10, ram=8
//   redPoint:    hz=12, screen=12, ram=6
//   scope2x:     hz=10, screen=14, ram=5
//   scope4x:     hz=8,  screen=16, ram=4
//   sniperScope: hz=6,  screen=18, ram=3
//   freeView:    hz=18, screen=6,  ram=10

// Pesos por campo de sensibilidad: [hz, screen, ram]
const FIELD_WEIGHTS: Record<keyof SensitivityOutput, [number, number, number]> = {
  general:     [15, 10, 8],
  redPoint:    [12, 12, 6],
  scope2x:     [10, 14, 5],
  scope4x:     [8,  16, 4],
  sniperScope: [6,  18, 3],
  freeView:    [18, 6,  10],
};

// Bonus por tipo de panel
const PANEL_BONUS: Record<string, number> = {
  LTPO:   4,
  AMOLED: 3,
  OLED:   3,
  IPS:    1,
  LCD:    0,
};

// Bonus por tier del dispositivo
const TIER_BONUS: Record<string, number> = {
  GAMING: 8,
  ULTRA:  6,
  HIGH:   4,
  MID:    1,
  LOW:   -2,
};

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function calculateField(
  base: number,
  hzFactor: number,
  screenFactor: number,
  ramFactor: number,
  panelBonus: number,
  tierBonus: number,
  weights: [number, number, number],
  styleMultiplier: number,
): number {
  const raw = base
    + (hzFactor * weights[0])
    + (screenFactor * weights[1])
    + (ramFactor * weights[2])
    + panelBonus
    + tierBonus;

  return clamp(raw * styleMultiplier, SENSITIVITY_MIN, SENSITIVITY_MAX);
}

export function generateSensitivity(input: AlgorithmInput): AlgorithmOutput {
  const { specs, style, includeGyro } = input;

  // Calcular factores normalizados (rango 0 a 1)
  const hzFactor = Math.max(0, Math.min(1, (specs.screenHz - 60) / 120));
  const screenFactor = Math.max(-0.5, Math.min(1, (6.7 - specs.screenSize) / 2.0));
  const ramFactor = Math.max(0, Math.min(1, (specs.ramGb - 3) / 13));

  const panelBonus = PANEL_BONUS[specs.panelType] ?? 0;
  const tierBonus = TIER_BONUS[specs.tier] ?? 0;

  // Obtener multiplicadores del estilo de juego
  const multipliers = getStyleMultipliers(style);

  // Calcular cada campo de sensibilidad
  const sensitivity: SensitivityOutput = {
    general: calculateField(
      BASE_SENSITIVITY.general, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.general, multipliers.general,
    ),
    redPoint: calculateField(
      BASE_SENSITIVITY.redPoint, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.redPoint, multipliers.redPoint,
    ),
    scope2x: calculateField(
      BASE_SENSITIVITY.scope2x, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.scope2x, multipliers.scope2x,
    ),
    scope4x: calculateField(
      BASE_SENSITIVITY.scope4x, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.scope4x, multipliers.scope4x,
    ),
    sniperScope: calculateField(
      BASE_SENSITIVITY.sniperScope, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.sniperScope, multipliers.sniperScope,
    ),
    freeView: calculateField(
      BASE_SENSITIVITY.freeView, hzFactor, screenFactor, ramFactor,
      panelBonus, tierBonus, FIELD_WEIGHTS.freeView, multipliers.freeView,
    ),
  };

  // Calcular giroscopio opcionalmente (feature Premium)
  const gyroscope = includeGyro ? generateGyroscope(sensitivity, specs) : null;

  return {
    sensitivity,
    gyroscope,
    meta: {
      performanceScore: calculatePerformanceScore(specs),
      styleApplied: style,
      deviceTier: specs.tier,
      algorithm: 'ARES-v1.0',
    },
  };
}
