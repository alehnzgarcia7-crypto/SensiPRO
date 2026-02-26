// ============================================================
// HEADSHOT FINGER ENGINE v4.1
// Applies finger-count-based adjustments ON TOP of the v4.0
// headshot sensitivity base. Consumed exclusively by Headshot Mode.
// ============================================================

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
  };
}

// --- CLAMP UTILITY ---

function clamp(value: number, min: number = 0, max: number = 200): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

// --- MAIN HEADSHOT FINGER-ADJUSTED FUNCTION ---

export function calculateHeadshotFingerMode(
  baseSensitivity: SensitivityOutput,
  fingers: FingerCount,
  deviceHz: number = 60,
  screenSizeInches: number = 6.5,
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

  // 2. Re-apply tapering if finger-specific tapering differs from base -15
  if (profile.tapering !== -15) {
    adjusted.redPoint = clamp(adjusted.general + profile.tapering);
    adjusted.scope2x = clamp(adjusted.redPoint + profile.tapering);
    adjusted.scope4x = clamp(adjusted.scope2x + profile.tapering);
    adjusted.sniperScope = clamp(adjusted.scope4x + profile.tapering);
  }

  // 3. Fix FreeLook using forensic formula
  // FreeLook should be in range 14-22 for 3 fingers, adjusted by finger multiplier
  const freeLookBase = Math.round(adjusted.general * 0.11);
  adjusted.freeView = clamp(Math.round(freeLookBase * profile.multipliers.freeView), 8, 50);

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
      general: clamp(gyroBase),
      redPoint: clamp(gyroBase + gyroTaper),
      scope2x: clamp(gyroBase + gyroTaper * 2),
      scope4x: clamp(gyroBase + gyroTaper * 3),
      sniperScope: clamp(gyroBase + gyroTaper * 4),
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

  // 6. Calculate fire button recommendation
  let screenCat: 'small' | 'medium' | 'large' | 'xlarge';
  if (screenSizeInches < 6.0) screenCat = 'small';
  else if (screenSizeInches <= 6.5) screenCat = 'medium';
  else if (screenSizeInches <= 6.8) screenCat = 'large';
  else screenCat = 'xlarge';

  const fireButton: FireButtonRecommendation = {
    size: profile.fireButton.sizeByScreen[screenCat],
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
      engineVersion: '4.1-headshot',
      fingersUsed: fingers,
      taperingUsed: profile.tapering,
      gyroscopeEnabled: profile.gyroscope.enabled,
    },
  };
}
