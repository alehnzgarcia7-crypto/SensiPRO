import type { CalibrationLevel } from '@prisma/client';

import {
  CALIBRATION_MULTIPLIERS,
  DPI_FORMULA_FACTOR,
  DPI_FORMULA_BASE,
  DPI_MIN,
  DPI_MAX,
  DPI_REDUCTION_FACTOR,
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
// ARES CALIBRATION ENGINE v1.0
// ═══════════════════════════════════════════════════════════════
//
// Genera 6 combinaciones: BAJA×sinDPI, BAJA×conDPI,
//                         MEDIA×sinDPI, MEDIA×conDPI,
//                         ALTA×sinDPI, ALTA×conDPI

const CALIBRATION_LEVELS: CalibrationLevel[] = ['BAJA', 'MEDIA', 'ALTA'];
const DPI_MODES = [false, true] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

/** Aplica el multiplicador de calibración a todos los campos de sensibilidad */
function applyCalibratedSensitivity(
  baseSensitivity: SensitivityOutput,
  calibration: CalibrationLevel,
): SensitivityOutput {
  const multiplier = CALIBRATION_MULTIPLIERS[calibration];
  return {
    general: clamp(baseSensitivity.general * multiplier, SENSITIVITY_MIN, SENSITIVITY_MAX),
    redPoint: clamp(baseSensitivity.redPoint * multiplier, SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope2x: clamp(baseSensitivity.scope2x * multiplier, SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope4x: clamp(baseSensitivity.scope4x * multiplier, SENSITIVITY_MIN, SENSITIVITY_MAX),
    sniperScope: clamp(baseSensitivity.sniperScope * multiplier, SENSITIVITY_MIN, SENSITIVITY_MAX),
    freeView: clamp(baseSensitivity.freeView * multiplier, SENSITIVITY_MIN, SENSITIVITY_MAX),
  };
}

/** Reduce sensibilidad cuando DPI está activo (el DPI amplifica el input del touch) */
function applyDpiReduction(sensitivity: SensitivityOutput): SensitivityOutput {
  return {
    general: clamp(sensitivity.general * DPI_REDUCTION_FACTOR, SENSITIVITY_MIN, SENSITIVITY_MAX),
    redPoint: clamp(sensitivity.redPoint * DPI_REDUCTION_FACTOR, SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope2x: clamp(sensitivity.scope2x * DPI_REDUCTION_FACTOR, SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope4x: clamp(sensitivity.scope4x * DPI_REDUCTION_FACTOR, SENSITIVITY_MIN, SENSITIVITY_MAX),
    sniperScope: clamp(sensitivity.sniperScope * DPI_REDUCTION_FACTOR, SENSITIVITY_MIN, SENSITIVITY_MAX),
    freeView: clamp(sensitivity.freeView * DPI_REDUCTION_FACTOR, SENSITIVITY_MIN, SENSITIVITY_MAX),
  };
}

/** Calcula DPI óptimo basado en PPI y screenSize del dispositivo */
export function calculateDpi(specs: DeviceSpecs): number {
  const ppi = specs.ppi ?? 400; // Fallback razonable si no hay PPI
  const rawDpi = Math.round((ppi / specs.screenSize) * DPI_FORMULA_FACTOR + DPI_FORMULA_BASE);
  return clamp(rawDpi, DPI_MIN, DPI_MAX);
}

/** Calcula tamaño de botón recomendado basado en screenSize */
export function calculateButtonSize(screenSize: number): number {
  const entry = BUTTON_SIZE_MAP.find((e) => screenSize < e.maxScreen);
  return entry?.sizeMm ?? 54;
}

/** Calcula precision score (inverso de velocidad: más sensi = menos precisión, DPI da bonus) */
export function calculatePrecisionScore(sensitivity: SensitivityOutput, dpiMode = false): number {
  const base = 100 - sensitivity.general * 0.8;
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
      // 5 dedos nunca es auto-recomendado (solo para expertos)
      isRecommended: false,
    },
  ];

  return { recommended, options };
}

/** Genera una sola combinación de calibración */
export function generateCalibration(input: CalibrationInput): CalibrationResult {
  const { specs, style, calibration, dpiMode, includeGyro } = input;

  // Generar sensibilidad base con el motor existente
  const baseResult = generateSensitivity({ specs, style, includeGyro });

  // Aplicar multiplicador de calibración
  const calibratedSensitivity = applyCalibratedSensitivity(
    baseResult.sensitivity,
    calibration,
  );

  // Aplicar reducción DPI si está activo (DPI amplifica input → sensibilidad más baja)
  const finalSensitivity = dpiMode
    ? applyDpiReduction(calibratedSensitivity)
    : calibratedSensitivity;

  // Recalcular giroscopio sobre valores finales si aplica
  const finalGyro = baseResult.gyroscope
    ? generateGyroscope(finalSensitivity, specs)
    : null;

  const dpiValue = dpiMode ? calculateDpi(specs) : null;
  const buttonSize = calculateButtonSize(specs.screenSize);
  // CON DPI = más precisión (score más alto) porque valores más bajos = más control
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
): GenerateAllOutput {
  const combinations: CalibrationResult[] = [];

  for (const calibration of CALIBRATION_LEVELS) {
    for (const dpiMode of DPI_MODES) {
      combinations.push(
        generateCalibration({ specs, style, calibration, dpiMode, includeGyro }),
      );
    }
  }

  const hudRecommendation = generateHudRecommendation(specs.screenSize);
  const performanceScore = calculatePerformanceScore(specs);

  return {
    combinations,
    hudRecommendation,
    meta: {
      styleApplied: style,
      deviceTier: specs.tier,
      algorithm: 'ARES-v1.1-calibration',
    },
  };
}
