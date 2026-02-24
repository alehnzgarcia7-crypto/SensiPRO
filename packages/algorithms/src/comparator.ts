import type { SensitivityStyle } from '@prisma/client';

import { generateSensitivity } from './sensitivity-engine';
import { calculatePerformanceScore, analyzeDeviceSpecs } from './device-analyzer';
import type { DeviceSpecs, SensitivityOutput, GyroscopeOutput } from './types';

// ═══════════════════════════════════════════════════════════
// ARES DEVICE COMPARATOR v1.0
// ═══════════════════════════════════════════════════════════
//
// Compara 2 dispositivos side-by-side:
//   - Specs diff (Hz, pantalla, RAM, performance score)
//   - Sensitivity diff (6 campos por estilo)
//   - Gyroscope diff (6 campos, Premium only)
//   - Overall winner + verdict textual
//
// Feature PREMIUM — requiere tier PREMIUM o superior.

export interface DeviceForComparison {
  id: string;
  brand: string;
  model: string;
  slug: string;
  specs: DeviceSpecs;
}

export interface ComparisonField {
  label: string;
  valueA: number;
  valueB: number;
  winner: 'A' | 'B' | 'TIE';
  diff: number;
  diffPercent: number;
}

export interface ComparisonResult {
  deviceA: {
    info: DeviceForComparison;
    sensitivity: SensitivityOutput;
    gyroscope: GyroscopeOutput | null;
    performanceScore: number;
    rating: string;
  };
  deviceB: {
    info: DeviceForComparison;
    sensitivity: SensitivityOutput;
    gyroscope: GyroscopeOutput | null;
    performanceScore: number;
    rating: string;
  };
  style: SensitivityStyle;
  specsDiff: ComparisonField[];
  sensitivityDiff: ComparisonField[];
  gyroDiff: ComparisonField[] | null;
  overallWinner: 'A' | 'B' | 'TIE';
  verdict: string;
}

function getWinner(a: number, b: number): 'A' | 'B' | 'TIE' {
  if (a > b) return 'A';
  if (b > a) return 'B';
  return 'TIE';
}

function makeField(label: string, a: number, b: number): ComparisonField {
  const diff = Math.abs(a - b);
  const max = Math.max(a, b, 1);
  return {
    label,
    valueA: a,
    valueB: b,
    winner: getWinner(a, b),
    diff,
    diffPercent: Math.round((diff / max) * 100),
  };
}

export function compareDevices(
  deviceA: DeviceForComparison,
  deviceB: DeviceForComparison,
  style: SensitivityStyle,
  includeGyro = false,
): ComparisonResult {
  // Generar sensibilidades para ambos dispositivos
  const resultA = generateSensitivity({ specs: deviceA.specs, style, includeGyro });
  const resultB = generateSensitivity({ specs: deviceB.specs, style, includeGyro });

  // Analizar specs de cada dispositivo
  const analysisA = analyzeDeviceSpecs(deviceA.specs);
  const analysisB = analyzeDeviceSpecs(deviceB.specs);

  // Comparar specs de hardware
  const specsDiff: ComparisonField[] = [
    makeField('Refresh Rate (Hz)', deviceA.specs.screenHz, deviceB.specs.screenHz),
    makeField('Pantalla (pulgadas)', deviceA.specs.screenSize, deviceB.specs.screenSize),
    makeField('RAM (GB)', deviceA.specs.ramGb, deviceB.specs.ramGb),
    makeField('Performance Score', analysisA.performanceScore, analysisB.performanceScore),
  ];

  // Comparar valores de sensibilidad
  const sensitivityDiff: ComparisonField[] = [
    makeField('General', resultA.sensitivity.general, resultB.sensitivity.general),
    makeField('Punto Rojo', resultA.sensitivity.redPoint, resultB.sensitivity.redPoint),
    makeField('Mira 2x', resultA.sensitivity.scope2x, resultB.sensitivity.scope2x),
    makeField('Mira 4x', resultA.sensitivity.scope4x, resultB.sensitivity.scope4x),
    makeField('Mira Sniper', resultA.sensitivity.sniperScope, resultB.sensitivity.sniperScope),
    makeField('Vista Libre', resultA.sensitivity.freeView, resultB.sensitivity.freeView),
  ];

  // Comparar giroscopio (si se solicitó y ambos tienen datos)
  let gyroDiff: ComparisonField[] | null = null;
  if (includeGyro && resultA.gyroscope && resultB.gyroscope) {
    gyroDiff = [
      makeField('Gyro General', resultA.gyroscope.gyroGeneral, resultB.gyroscope.gyroGeneral),
      makeField('Gyro Punto Rojo', resultA.gyroscope.gyroRedPoint, resultB.gyroscope.gyroRedPoint),
      makeField('Gyro 2x', resultA.gyroscope.gyroScope2x, resultB.gyroscope.gyroScope2x),
      makeField('Gyro 4x', resultA.gyroscope.gyroScope4x, resultB.gyroscope.gyroScope4x),
      makeField('Gyro Sniper', resultA.gyroscope.gyroSniper, resultB.gyroscope.gyroSniper),
      makeField('Gyro Vista Libre', resultA.gyroscope.gyroFreeView, resultB.gyroscope.gyroFreeView),
    ];
  }

  // Ganador global basado en performance score
  const overallWinner = getWinner(analysisA.performanceScore, analysisB.performanceScore);

  // Generar veredicto textual
  const winnerDevice = overallWinner === 'A' ? deviceA : overallWinner === 'B' ? deviceB : null;
  const loserDevice = overallWinner === 'A' ? deviceB : overallWinner === 'B' ? deviceA : null;
  const scoreDiff = Math.abs(analysisA.performanceScore - analysisB.performanceScore);

  let verdict: string;
  if (overallWinner === 'TIE') {
    verdict = `${deviceA.brand} ${deviceA.model} y ${deviceB.brand} ${deviceB.model} son prácticamente iguales para Free Fire. Elige el que prefieras.`;
  } else if (scoreDiff > 30) {
    verdict = `${winnerDevice!.brand} ${winnerDevice!.model} es significativamente superior para Free Fire. La diferencia de ${scoreDiff} puntos se nota mucho en gameplay.`;
  } else if (scoreDiff > 15) {
    verdict = `${winnerDevice!.brand} ${winnerDevice!.model} tiene ventaja notable sobre ${loserDevice!.brand} ${loserDevice!.model} (+${scoreDiff} pts).`;
  } else {
    verdict = `${winnerDevice!.brand} ${winnerDevice!.model} tiene una ligera ventaja (+${scoreDiff} pts), pero ambos son buenos para Free Fire.`;
  }

  return {
    deviceA: {
      info: deviceA,
      sensitivity: resultA.sensitivity,
      gyroscope: resultA.gyroscope,
      performanceScore: analysisA.performanceScore,
      rating: analysisA.rating,
    },
    deviceB: {
      info: deviceB,
      sensitivity: resultB.sensitivity,
      gyroscope: resultB.gyroscope,
      performanceScore: analysisB.performanceScore,
      rating: analysisB.rating,
    },
    style,
    specsDiff,
    sensitivityDiff,
    gyroDiff,
    overallWinner,
    verdict,
  };
}
