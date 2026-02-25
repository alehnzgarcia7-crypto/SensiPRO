import type { CalibrationLevel } from '@prisma/client';

import {
  CALIBRATION_OFFSETS,
  DPI_OFFSET,
  DPI_FORMULA_FACTOR,
  DPI_FORMULA_BASE,
  DPI_MIN,
  DPI_MAX,
  DPI_PRECISION_BONUS,
  BUTTON_SIZE_MAP,
  HUD_THRESHOLD_SMALL,
  HUD_THRESHOLD_LARGE,
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
} from '@ares/config';

import type {
  DeviceSpecs,
  SensitivityOutput,
  CalibrationResult,
  HudRecommendation,
  HudOption,
  GenerateAllOutput,
  CalibrationInput,
} from './types';
import { generateSensitivity } from './sensitivity-engine';
import { generateGyroscope } from './gyroscope-engine';
import { calculatePerformanceScore } from './device-analyzer';

// ═══════════════════════════════════════════════════════════════
// ARES CALIBRATION ENGINE v3.0
// ═══════════════════════════════════════════════════════════════
//
// Genera 6 combinaciones: BAJA×sinDPI, BAJA×conDPI,
//                         MEDIA×sinDPI, MEDIA×conDPI,
//                         ALTA×sinDPI, ALTA×conDPI
//
// BAJA:  offset -25 (precisión/defensivo)
// MEDIA: offset  0  (balanceado)
// ALTA:  offset +15 (agresivo/rush)
//
// DPI: resta 12 puntos uniformemente (pantalla más densa)
// Clamp global: 0-200

const CALIBRATION_LEVELS: CalibrationLevel[] = ['BAJA', 'MEDIA', 'ALTA'];
const DPI_MODES = [false, true] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

/** Aplica offset de calibración + clamp al rango 0-200 */
function applyCalibratedSensitivity(
  baseSensitivity: SensitivityOutput,
  calibration: CalibrationLevel,
): SensitivityOutput {
  const offset = CALIBRATION_OFFSETS[calibration];

  return {
    general: clamp(baseSensitivity.general + offset, SENSITIVITY_MIN, SENSITIVITY_MAX),
    redPoint: clamp(baseSensitivity.redPoint + offset, SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope2x: clamp(baseSensitivity.scope2x + offset, SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope4x: clamp(baseSensitivity.scope4x + offset, SENSITIVITY_MIN, SENSITIVITY_MAX),
    sniperScope: clamp(baseSensitivity.sniperScope + offset, SENSITIVITY_MIN, SENSITIVITY_MAX),
    freeView: clamp(baseSensitivity.freeView + offset, SENSITIVITY_MIN, SENSITIVITY_MAX),
  };
}

/** Reduce sensibilidad cuando DPI está activo (resta uniforme, clamp 0-200) */
function applyDpiReduction(sensitivity: SensitivityOutput): SensitivityOutput {
  return {
    general: clamp(sensitivity.general - DPI_OFFSET, SENSITIVITY_MIN, SENSITIVITY_MAX),
    redPoint: clamp(sensitivity.redPoint - DPI_OFFSET, SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope2x: clamp(sensitivity.scope2x - DPI_OFFSET, SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope4x: clamp(sensitivity.scope4x - DPI_OFFSET, SENSITIVITY_MIN, SENSITIVITY_MAX),
    sniperScope: clamp(sensitivity.sniperScope - DPI_OFFSET, SENSITIVITY_MIN, SENSITIVITY_MAX),
    freeView: clamp(sensitivity.freeView - DPI_OFFSET, SENSITIVITY_MIN, SENSITIVITY_MAX),
  };
}

/** Calcula DPI óptimo basado en PPI y screenSize del dispositivo */
export function calculateDpi(specs: DeviceSpecs): number {
  const ppi = specs.ppi ?? 400;
  const rawDpi = Math.round((ppi / specs.screenSize) * DPI_FORMULA_FACTOR + DPI_FORMULA_BASE);
  return clamp(rawDpi, DPI_MIN, DPI_MAX);
}

/** Calcula tamaño de botón recomendado basado en screenSize */
export function calculateButtonSize(screenSize: number): number {
  const entry = BUTTON_SIZE_MAP.find((e) => screenSize < e.maxScreen);
  return entry?.sizeMm ?? 54;
}

/** Calcula precision score para rango 0-200 (inverso: más sensi = menos precisión) */
export function calculatePrecisionScore(sensitivity: SensitivityOutput, dpiMode = false): number {
  // Normalizar general de rango 0-200 a 0-1, luego invertir
  const normalized = sensitivity.general / SENSITIVITY_MAX;
  const base = 100 - normalized * 80;
  const bonus = dpiMode ? DPI_PRECISION_BONUS : 0;
  return clamp(base + bonus, 0, 100);
}

/** Genera recomendación de Custom HUD basado en screenSize */
export function generateHudRecommendation(screenSize: number): HudRecommendation {
  let recommended: 2 | 3 | 4 | 5;
  if (screenSize < HUD_THRESHOLD_SMALL) {
    recommended = 2;
  } else if (screenSize <= HUD_THRESHOLD_LARGE) {
    recommended = 3;
  } else {
    recommended = 4;
  }

  const options: HudOption[] = [
    {
      fingers: 2,
      description: 'Control clásico con dos pulgares. Simple y familiar.',
      pros: ['Fácil de aprender', 'Cómodo en pantallas chicas', 'Menos fatiga en sesiones largas'],
      cons: ['No puedes moverte y disparar al mismo tiempo', 'Reacción más lenta en CQB'],
      isRecommended: recommended === 2,
    },
    {
      fingers: 3,
      description: 'Pulgar izquierdo + pulgar derecho + índice derecho. Versátil.',
      pros: ['Movimiento + disparo simultáneo', 'Buena transición desde 2 dedos', 'Ideal para pantallas medianas'],
      cons: ['Curva de aprendizaje moderada', 'Puede ser incómodo sin soporte'],
      isRecommended: recommended === 3,
    },
    {
      fingers: 4,
      description: 'Estilo garra: 2 pulgares + 2 índices. Máximo control.',
      pros: ['Control total simultáneo', 'Ventaja competitiva real', 'Peek + disparo + movimiento a la vez'],
      cons: ['Curva de aprendizaje alta', 'Requiere pantalla grande (>6.4")', 'Puede causar fatiga en las manos'],
      isRecommended: recommended === 4,
    },
    {
      fingers: 5,
      description: 'Nivel élite: 2 pulgares + 2 índices + 1 medio. Control absoluto.',
      pros: ['Máximo multitasking posible', 'Dominio total del HUD', 'Ventaja en torneos competitivos'],
      cons: ['Curva de aprendizaje extrema', 'Requiere tablet o pantalla >6.5"', 'Fatiga rápida sin práctica constante'],
      isRecommended: false,
    },
  ];

  return { recommended, options };
}

/** Genera una sola combinación de calibración */
export function generateCalibration(input: CalibrationInput): CalibrationResult {
  const { specs, style, calibration, dpiMode, includeGyro, userRam } = input;

  // Generar sensibilidad base con el motor v3.0 (valores RAW)
  const baseResult = generateSensitivity({ specs, style, includeGyro, userRam });

  // Aplicar offset de calibración + clamp 0-200
  const calibratedSensitivity = applyCalibratedSensitivity(
    baseResult.sensitivity,
    calibration,
  );

  // Aplicar reducción DPI si está activo (resta uniforme, clamp 0-200)
  const finalSensitivity = dpiMode
    ? applyDpiReduction(calibratedSensitivity)
    : calibratedSensitivity;

  // Recalcular giroscopio sobre valores finales si aplica
  const finalGyro = includeGyro
    ? generateGyroscope(finalSensitivity)
    : null;

  const dpiValue = dpiMode ? calculateDpi(specs) : null;
  const buttonSize = calculateButtonSize(specs.screenSize);
  const precisionScore = calculatePrecisionScore(finalSensitivity, dpiMode);

  return {
    calibration,
    dpiMode,
    sensitivity: finalSensitivity,
    gyroscope: finalGyro,
    performanceScore: baseResult.meta.performanceScore,
    precisionScore,
    dpiValue,
    buttonSize,
  };
}

/** Genera las 6 combinaciones para un dispositivo + estilo */
export function generateAllCalibrations(
  specs: DeviceSpecs,
  style: CalibrationInput['style'],
  includeGyro: boolean,
  userRam?: number,
): GenerateAllOutput {
  const combinations: CalibrationResult[] = [];

  for (const calibration of CALIBRATION_LEVELS) {
    for (const dpiMode of DPI_MODES) {
      combinations.push(
        generateCalibration({ specs, style, calibration, dpiMode, includeGyro, userRam }),
      );
    }
  }

  const hudRecommendation = generateHudRecommendation(specs.screenSize);

  return {
    combinations,
    hudRecommendation,
    meta: {
      styleApplied: style,
      deviceTier: specs.tier,
      algorithm: 'ARES-v3.0-calibration',
    },
  };
}
