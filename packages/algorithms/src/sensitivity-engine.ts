import {
  BASE_SENSITIVITY,
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
  RAM_FACTORS,
} from '@ares/config';

import type { AlgorithmInput, AlgorithmOutput, SensitivityOutput } from './types';
import { getStyleMultipliers } from './style-system';
import { calculatePerformanceScore } from './device-analyzer';
import { generateGyroscope } from './gyroscope-engine';

// ═══════════════════════════════════════════════════════════════
// ARES SENSITIVITY ENGINE v2.0
// ═══════════════════════════════════════════════════════════════
//
// RANGO: 60-190 (valores reales de Free Fire)
//
// FÓRMULA CORE (por campo):
//   rawValue = BASE[field]
//     + (hzFactor × weights[0])
//     + (screenFactor × weights[1])
//     + ramOffset
//     + panelBonus
//     + tierBonus
//
//   styledValue = rawValue × styleMultiplier[field]
//   finalValue = clamp(round(styledValue), 60, 190)
//
// FACTORES:
//   hzFactor:     (deviceHz - 60) / 120 → normalizado 0-1
//   screenFactor: (6.5 - deviceSize) / 2.0 → pantalla más chica = más sensible
//   ramOffset:    RAM_FACTORS[ramGb] directamente (-15 a +10)
//   panelBonus:   LTPO=+6, AMOLED=+5, OLED=+5, IPS=+2, LCD=0
//   tierBonus:    GAMING=+12, ULTRA=+9, HIGH=+6, MID=+2, LOW=-4

// Pesos por campo de sensibilidad: [hz, screen]
const FIELD_WEIGHTS: Record<keyof SensitivityOutput, [number, number]> = {
  general:     [20, 12],
  redPoint:    [16, 15],
  scope2x:     [14, 18],
  scope4x:     [10, 20],
  sniperScope: [8,  22],
  freeView:    [24, 8],
};

// Bonus por tipo de panel
const PANEL_BONUS: Record<string, number> = {
  LTPO:   6,
  AMOLED: 5,
  OLED:   5,
  IPS:    2,
  LCD:    0,
};

// Bonus por tier del dispositivo
const TIER_BONUS: Record<string, number> = {
  GAMING: 12,
  ULTRA:  9,
  HIGH:   6,
  MID:    2,
  LOW:   -4,
};

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

/** Obtiene el offset de RAM, fallback a 0 si la RAM no está en el mapa */
function getRamOffset(ramGb: number): number {
  return RAM_FACTORS[ramGb] ?? 0;
}

function calculateField(
  base: number,
  hzFactor: number,
  screenFactor: number,
  ramOffset: number,
  panelBonus: number,
  tierBonus: number,
  weights: [number, number],
  styleMultiplier: number,
): number {
  const raw = base
    + (hzFactor * weights[0])
    + (screenFactor * weights[1])
    + ramOffset
    + panelBonus
    + tierBonus;

  return clamp(raw * styleMultiplier, SENSITIVITY_MIN, SENSITIVITY_MAX);
}

export function generateSensitivity(input: AlgorithmInput): AlgorithmOutput {
  const { specs, style, includeGyro, userRam } = input;

  // Usar userRam si viene, sino el RAM del device
  const effectiveRam = userRam ?? specs.ramGb;

  // Calcular factores
  const hzFactor = Math.max(0, Math.min(1, (specs.screenHz - 60) / 120));
  const screenFactor = Math.max(-0.5, Math.min(1, (6.5 - specs.screenSize) / 2.0));
  const ramOffset = getRamOffset(effectiveRam);
  const panelBonus = PANEL_BONUS[specs.panelType] ?? 0;
  const tierBonus = TIER_BONUS[specs.tier] ?? 0;

  // Obtener multiplicadores del estilo de juego
  const multipliers = getStyleMultipliers(style);

  // Calcular cada campo de sensibilidad
  const sensitivity: SensitivityOutput = {
    general: calculateField(
      BASE_SENSITIVITY.general, hzFactor, screenFactor, ramOffset,
      panelBonus, tierBonus, FIELD_WEIGHTS.general, multipliers.general,
    ),
    redPoint: calculateField(
      BASE_SENSITIVITY.redPoint, hzFactor, screenFactor, ramOffset,
      panelBonus, tierBonus, FIELD_WEIGHTS.redPoint, multipliers.redPoint,
    ),
    scope2x: calculateField(
      BASE_SENSITIVITY.scope2x, hzFactor, screenFactor, ramOffset,
      panelBonus, tierBonus, FIELD_WEIGHTS.scope2x, multipliers.scope2x,
    ),
    scope4x: calculateField(
      BASE_SENSITIVITY.scope4x, hzFactor, screenFactor, ramOffset,
      panelBonus, tierBonus, FIELD_WEIGHTS.scope4x, multipliers.scope4x,
    ),
    sniperScope: calculateField(
      BASE_SENSITIVITY.sniperScope, hzFactor, screenFactor, ramOffset,
      panelBonus, tierBonus, FIELD_WEIGHTS.sniperScope, multipliers.sniperScope,
    ),
    freeView: calculateField(
      BASE_SENSITIVITY.freeView, hzFactor, screenFactor, ramOffset,
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
      algorithm: 'ARES-v2.0',
    },
  };
}
