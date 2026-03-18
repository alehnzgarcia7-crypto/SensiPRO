// ============================================================
// HEADSHOT FINGER ENGINE v4.2
// Applies finger-count-based adjustments ON TOP of the v4.0
// headshot sensitivity base. Consumed exclusively by Headshot Mode.
//
// v4.2: Added playstyle-aware fire button sizing.
//       Fire button = base[fingers][screen] + styleOffset[playstyle]
// ============================================================

import {
  FIRE_BUTTON_STYLE_OFFSET,
  FIRE_BUTTON_MIN,
  FIRE_BUTTON_MAX,
  FIRE_BUTTON_SCREEN_THRESHOLDS,
} from '@ares/config';

import { FINGER_PROFILES, type FingerCount, type FingerProfile } from './finger-profiles';
import { WEAPON_CATEGORIES, type WeaponCategory } from './weapon-categories';
import type { SensitivityOutput } from './types';

// --- TYPES ---

export interface GyroscopeFingerValues {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
}

export interface FireButtonRecommendation {
  size: number;
  transparency: number;
  positionEs: string;
  dragTipEs: string;
}

export interface WeaponAdjustmentRow {
  category: WeaponCategory;
  nameEs: string;
  icon: string;
  modifier: string;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
}

export interface HeadshotFingerResult {
  // Core sensitivity adjusted for fingers
  sensitivity: SensitivityOutput & { gyroscope: GyroscopeFingerValues | null };

  // Weapon-specific adjustments (table for UI)
  weaponAdjustments: WeaponAdjustmentRow[];

  // Fire button recommendation
  fireButton: FireButtonRecommendation;

  // Finger profile data (for UI)
  fingerProfile: FingerProfile;

  // Metadata
  meta: {
    engineVersion: string;
    fingersUsed: FingerCount;
    taperingUsed: number;
    gyroscopeEnabled: boolean;
    playstyle: FireButtonPlaystyle;
  };
}

// --- CLAMP UTILITY ---

function clamp(value: number, min: number = 1, max: number = 200): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

// --- MAIN HEADSHOT FINGER-ADJUSTED FUNCTION ---

export type FireButtonPlaystyle = 'AGGRESSIVE' | 'BALANCED' | 'SNIPER';

export function calculateHeadshotFingerMode(
  baseSensitivity: SensitivityOutput,
  fingers: FingerCount,
  deviceHz: number = 60,
  screenSizeInches: number = 6.5,
  playstyle: FireButtonPlaystyle = 'BALANCED',
): HeadshotFingerResult {
  const profile = FINGER_PROFILES[fingers];

  // 1. Apply finger multipliers to base sensitivity
  const adjusted: SensitivityOutput = {
    general: clamp(baseSensitivity.general * profile.multipliers.general),
    redPoint: clamp(baseSensitivity.redPoint * profile.multipliers.redPoint),
    scope2x: clamp(baseSensitivity.scope2x * profile.multipliers.scope2x),
    scope4x: clamp(baseSensitivity.scope4x * profile.multipliers.scope4x),
    sniperScope: clamp(baseSensitivity.sniperScope * profile.multipliers.sniperScope),
    freeView: clamp(baseSensitivity.freeView * profile.multipliers.freeView),
  };

  // 2. Enforce cascade: General ≥ RedPoint ≥ Scope2x ≥ Scope4x (AWM y freeView independientes)
  adjusted.redPoint = Math.min(adjusted.redPoint, adjusted.general);
  adjusted.scope2x = Math.min(adjusted.scope2x, adjusted.redPoint);
  adjusted.scope4x = Math.min(adjusted.scope4x, adjusted.scope2x);

  // 4. Calculate gyroscope
  let gyroscope: GyroscopeFingerValues | null = null;
  if (profile.gyroscope.enabled) {
    const { min, max } = profile.gyroscope.range;
    let gyroBase = Math.round((min + max) / 2);

    // Hz adjustment
    if (deviceHz >= 120) gyroBase += 5;
    else if (deviceHz >= 90) gyroBase += 3;

    // Apply finger gyro multiplier
    gyroBase = Math.round(gyroBase * profile.multipliers.gyroscope);

    // Gyroscope tapering is -10 (softer than screen)
    const gyroTaper = -10;
    gyroscope = {
      general: clamp(gyroBase, 1, 100),
      redPoint: clamp(gyroBase + gyroTaper, 1, 100),
      scope2x: clamp(gyroBase + gyroTaper * 2, 1, 100),
      scope4x: clamp(gyroBase + gyroTaper * 3, 1, 100),
      sniperScope: clamp(gyroBase + gyroTaper * 4, 1, 100),
    };
  }

  // 5. Calculate weapon adjustments table
  const weaponAdjustments: WeaponAdjustmentRow[] = Object.values(WEAPON_CATEGORIES).map((cat) => ({
    category: cat.id,
    nameEs: cat.nameEs,
    icon: cat.icon,
    modifier: cat.modifierLabel,
    redPoint: clamp(adjusted.redPoint * cat.sensitivityModifier),
    scope2x: clamp(adjusted.scope2x * cat.sensitivityModifier),
    scope4x: clamp(adjusted.scope4x * cat.sensitivityModifier),
    sniperScope: clamp(adjusted.sniperScope * cat.sensitivityModifier),
  }));

  // 6. Calculate fire button recommendation (playstyle-aware v4.2)
  let screenCat: 'small' | 'medium' | 'large' | 'xlarge';
  if (screenSizeInches < FIRE_BUTTON_SCREEN_THRESHOLDS.SMALL) screenCat = 'small';
  else if (screenSizeInches <= FIRE_BUTTON_SCREEN_THRESHOLDS.MEDIUM) screenCat = 'medium';
  else if (screenSizeInches <= FIRE_BUTTON_SCREEN_THRESHOLDS.LARGE) screenCat = 'large';
  else screenCat = 'xlarge';

  const baseSize = profile.fireButton.sizeByScreen[screenCat];
  const styleOffset = FIRE_BUTTON_STYLE_OFFSET[playstyle] ?? 0;
  const clampedSize = Math.max(FIRE_BUTTON_MIN, Math.min(FIRE_BUTTON_MAX, baseSize + styleOffset));

  const fireButton: FireButtonRecommendation = {
    size: clampedSize,
    transparency: profile.fireButton.transparency,
    positionEs: profile.fireButton.positionEs,
    dragTipEs: profile.fireButton.dragTipEs,
  };

  return {
    sensitivity: { ...adjusted, gyroscope },
    weaponAdjustments,
    fireButton,
    fingerProfile: profile,
    meta: {
      engineVersion: '5.0-headshot',
      fingersUsed: fingers,
      taperingUsed: profile.tapering,
      gyroscopeEnabled: profile.gyroscope.enabled,
      playstyle,
    },
  };
}
