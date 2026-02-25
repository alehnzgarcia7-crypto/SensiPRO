import {
  HEADSHOT_SENSITIVITY_MODIFIERS,
  HEADSHOT_GYRO_MODIFIERS,
  FIRE_BUTTON_CONFIG,
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
  GYRO_MIN,
  GYRO_MAX,
} from '@ares/config';

import { generateSensitivity } from './sensitivity-engine';
import { generateGyroscope } from './gyroscope-engine';
import type { DeviceSpecs, SensitivityOutput, GyroscopeOutput, HeadshotResult, FireButtonResult } from './types';

// ═══════════════════════════════════════════════════════════════
// ARES HEADSHOT ENGINE v1.0
// ═══════════════════════════════════════════════════════════════
//
// Extiende el motor de sensibilidad base con modificadores
// específicos para tiro a la cabeza (drag headshot).
//
// FLUJO:
//   1. Generar sensibilidad base con BALANCED style
//   2. Aplicar multiplicadores headshot por campo
//   3. Generar giroscopio sobre valores headshot
//   4. Aplicar multiplicadores headshot de giroscopio
//   5. Calcular fire button, headshot score, drag recomendado

function clampSens(v: number): number {
  return Math.round(Math.max(SENSITIVITY_MIN, Math.min(SENSITIVITY_MAX, v)));
}

function clampGyro(v: number): number {
  return Math.round(Math.max(GYRO_MIN, Math.min(GYRO_MAX, v)));
}

function calculateFireButton(screenSize: number, userFingers?: 2 | 3 | 4): FireButtonResult {
  const config = screenSize < FIRE_BUTTON_CONFIG.SMALL_SCREEN.max
    ? FIRE_BUTTON_CONFIG.SMALL_SCREEN
    : screenSize <= FIRE_BUTTON_CONFIG.MEDIUM_SCREEN.max
      ? FIRE_BUTTON_CONFIG.MEDIUM_SCREEN
      : FIRE_BUTTON_CONFIG.LARGE_SCREEN;

  const autoFingers: 2 | 3 | 4 = screenSize < 5.8 ? 2 : screenSize <= 6.4 ? 3 : 4;
  const fingers = userFingers ?? autoFingers;

  const key = fingers === 2 ? 'twoFinger' : fingers === 3 ? 'threeFinger' : 'fourFinger';

  const positionTips: Record<2 | 3 | 4, string> = {
    2: 'Coloca el botón de disparo en la esquina inferior derecha, a la altura natural de tu pulgar',
    3: 'Botón de disparo derecho para pulgar, botón de scope arriba derecha para índice',
    4: 'Botones de disparo abajo (pulgares), scope y agacharse arriba (índices)',
  };

  return {
    percentage: config[key],
    fingers,
    positionTip: positionTips[fingers],
  };
}

function calculateHeadshotScore(specs: DeviceSpecs, sensitivity: SensitivityOutput): number {
  let score = 50;

  // Refresh rate: 120Hz+ = mejor para headshots
  if (specs.screenHz >= 120) score += 15;
  else if (specs.screenHz >= 90) score += 8;

  // Panel: AMOLED/OLED/LTPO mejor touch response
  if (specs.panelType === 'AMOLED' || specs.panelType === 'OLED' || specs.panelType === 'LTPO') score += 10;

  // Red Dot sensitivity en sweet spot (170-195) = +10
  if (sensitivity.redPoint >= 170 && sensitivity.redPoint <= 195) score += 10;
  else if (sensitivity.redPoint >= 150) score += 5;

  // General sensitivity alta pero no max = +5
  if (sensitivity.general >= 180 && sensitivity.general < 200) score += 5;

  // Screen size 6-6.7 = sweet spot para drag
  if (specs.screenSize >= 6.0 && specs.screenSize <= 6.7) score += 5;

  // Tier bonus
  if (specs.tier === 'GAMING' || specs.tier === 'ULTRA') score += 5;

  return Math.min(100, Math.max(0, score));
}

export function generateHeadshotSensitivity(
  specs: DeviceSpecs,
  userRam?: number,
  userFingers?: 2 | 3 | 4,
): HeadshotResult {
  // 1. Generar sensibilidad NORMAL (BALANCED, sin calibrar) para comparación
  const baseResult = generateSensitivity({ specs, style: 'BALANCED', userRam });
  const normalSens = baseResult.sensitivity;
  const normalGyro = generateGyroscope(normalSens);

  // 2. Aplicar modificadores headshot sobre la base normal
  const headshotSens: SensitivityOutput = {
    general: clampSens(normalSens.general * HEADSHOT_SENSITIVITY_MODIFIERS.general),
    redPoint: clampSens(normalSens.redPoint * HEADSHOT_SENSITIVITY_MODIFIERS.redPoint),
    scope2x: clampSens(normalSens.scope2x * HEADSHOT_SENSITIVITY_MODIFIERS.scope2x),
    scope4x: clampSens(normalSens.scope4x * HEADSHOT_SENSITIVITY_MODIFIERS.scope4x),
    sniperScope: clampSens(normalSens.sniperScope * HEADSHOT_SENSITIVITY_MODIFIERS.sniperScope),
    freeView: clampSens(normalSens.freeView * HEADSHOT_SENSITIVITY_MODIFIERS.freeView),
  };

  // 3. Giroscopio headshot: generar base sobre sensi headshot, luego aplicar mods
  const baseGyro = generateGyroscope(headshotSens);
  const headshotGyro: GyroscopeOutput = {
    gyroGeneral: clampGyro(baseGyro.gyroGeneral * HEADSHOT_GYRO_MODIFIERS.gyroGeneral),
    gyroRedPoint: clampGyro(baseGyro.gyroRedPoint * HEADSHOT_GYRO_MODIFIERS.gyroRedPoint),
    gyroScope2x: clampGyro(baseGyro.gyroScope2x * HEADSHOT_GYRO_MODIFIERS.gyroScope2x),
    gyroScope4x: clampGyro(baseGyro.gyroScope4x * HEADSHOT_GYRO_MODIFIERS.gyroScope4x),
    gyroSniper: clampGyro(baseGyro.gyroSniper * HEADSHOT_GYRO_MODIFIERS.gyroSniper),
    gyroFreeView: clampGyro(baseGyro.gyroFreeView * HEADSHOT_GYRO_MODIFIERS.gyroFreeView),
  };

  // 4. Fire button
  const fireButton = calculateFireButton(specs.screenSize, userFingers);

  // 5. Headshot score
  const headshotScore = calculateHeadshotScore(specs, headshotSens);

  // 6. Drag recomendado por screen size
  const recommendedDrag = specs.screenSize < 5.8 ? 'vertical' : 'rotation';

  return {
    sensitivity: headshotSens,
    gyroscope: headshotGyro,
    normalSensitivity: normalSens,
    normalGyroscope: normalGyro,
    fireButton,
    headshotScore,
    recommendedDrag,
    crosshairTip: 'Mantén el crosshair SIEMPRE a nivel de cabeza. Nunca apuntes al cuerpo.',
  };
}

/** Calcula sensibilidad ajustada POR ARMA específica */
export function getWeaponAdjustedSensitivity(
  baseSens: SensitivityOutput,
  weaponSensAdjust: Partial<Record<keyof SensitivityOutput, number>>,
): SensitivityOutput {
  return {
    general: clampSens(baseSens.general * (weaponSensAdjust.general ?? 1)),
    redPoint: clampSens(baseSens.redPoint * (weaponSensAdjust.redPoint ?? 1)),
    scope2x: clampSens(baseSens.scope2x * (weaponSensAdjust.scope2x ?? 1)),
    scope4x: clampSens(baseSens.scope4x * (weaponSensAdjust.scope4x ?? 1)),
    sniperScope: clampSens(baseSens.sniperScope * (weaponSensAdjust.sniperScope ?? 1)),
    freeView: clampSens(baseSens.freeView * (weaponSensAdjust.freeView ?? 1)),
  };
}
