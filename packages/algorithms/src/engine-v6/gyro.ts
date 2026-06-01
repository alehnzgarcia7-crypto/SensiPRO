import { clamp, clampGyro } from './math';
import { getAresV6Preset } from './presets';
import type {
  AresV6GenerationInput,
  AresV6GyroscopeVector,
  AresV6SensitivityVector,
} from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Gyroscope
//
// Gyro is derived from the *final* touch sensitivity and modulated by the
// preset gyro bias, refresh rate, finger count, panel quality and weapon
// category. Free Fire gyro sliders use the 1-100 scale.
// ═══════════════════════════════════════════════════════════════

const PREMIUM_PANELS: readonly string[] = ['AMOLED', 'OLED', 'LTPO'];

const GYRO_FREE_VIEW_MIN = 5;
const GYRO_FREE_VIEW_MAX = 55;

function weaponGyroBias(input: AresV6GenerationInput): number {
  switch (input.player.primaryWeaponCategory) {
    case 'SNIPER':
    case 'MARKSMAN':
      return 2; // gyro shines for long-range recoil control
    case 'SHOTGUN':
    case 'SMG':
    case 'PISTOL':
      return -1; // close-range fights lean less on the sensor
    default:
      return 0;
  }
}

/**
 * Build the gyroscope vector, or null when the player does not use gyro.
 * Every value is clamped into the gyro range so it can never escape 1-100.
 */
export function buildGyroscope(
  input: AresV6GenerationInput,
  sensitivity: AresV6SensitivityVector,
): AresV6GyroscopeVector | null {
  if (!input.player.usesGyroscope) return null;

  const preset = getAresV6Preset(input.presetId);
  const sharedBias = preset.gyroBias;
  const hardwareBias = input.device.screenHz >= 120 ? 2 : input.device.screenHz <= 60 ? -2 : 0;
  const fingerBias = input.player.fingers >= 4 ? 4 : input.player.fingers === 3 ? 0 : -8;
  const panelBias = PREMIUM_PANELS.includes(input.device.panelType) ? 1 : 0;
  const weaponBias = weaponGyroBias(input);
  const scopeBias = sharedBias + panelBias + weaponBias;

  return {
    gyroGeneral: clampGyro(sensitivity.general * 0.18 + sharedBias + hardwareBias + fingerBias),
    gyroRedPoint: clampGyro(sensitivity.redPoint * 0.18 + sharedBias + fingerBias),
    gyroScope2x: clampGyro(sensitivity.scope2x * 0.18 + scopeBias),
    gyroScope4x: clampGyro(sensitivity.scope4x * 0.17 + scopeBias),
    gyroSniper: clampGyro(sensitivity.sniperScope * 0.16 + scopeBias),
    gyroFreeView: clamp(sensitivity.freeView * 0.12 + sharedBias, GYRO_FREE_VIEW_MIN, GYRO_FREE_VIEW_MAX),
  };
}
