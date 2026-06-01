import { clamp } from './math';
import { getAresV6Preset } from './presets';
import type {
  AresV6FireButtonRecommendation,
  AresV6FingerCount,
  AresV6GenerationInput,
} from './types';
import { getWeaponFireButtonDelta, getWeaponPreferredDrag } from './weapons';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Fire button
//
// Size is driven by finger count and screen size, then nudged by the preset
// and weapon. Fewer fingers → bigger button (the thumb does more). Symptom
// adjustments (too big / too small) are handled as tuning steps, never as a
// blind change to this base.
// ═══════════════════════════════════════════════════════════════

const FIRE_BUTTON_MIN = 35;
const FIRE_BUTTON_MAX = 80;

type ScreenCategory = 'small' | 'medium' | 'large' | 'xlarge';

const FIRE_BUTTON_BASE: Record<AresV6FingerCount, Record<ScreenCategory, number>> = {
  2: { small: 70, medium: 65, large: 60, xlarge: 55 },
  3: { small: 60, medium: 55, large: 52, xlarge: 48 },
  4: { small: 55, medium: 50, large: 48, xlarge: 44 },
  5: { small: 50, medium: 46, large: 43, xlarge: 40 },
};

function screenCategory(screenSize: number): ScreenCategory {
  if (screenSize < 6.0) return 'small';
  if (screenSize <= 6.5) return 'medium';
  if (screenSize <= 6.8) return 'large';
  return 'xlarge';
}

export function getFireButtonBase(fingers: AresV6FingerCount, screenSize: number): number {
  return FIRE_BUTTON_BASE[fingers][screenCategory(screenSize)];
}

export function getDragZone(
  category?: AresV6GenerationInput['player']['primaryWeaponCategory'],
): AresV6FireButtonRecommendation['dragZone'] {
  return getWeaponPreferredDrag(category);
}

export function buildFireButton(input: AresV6GenerationInput): AresV6FireButtonRecommendation {
  const preset = getAresV6Preset(input.presetId);
  const fingers = input.player.fingers;
  const base = getFireButtonBase(fingers, input.device.screenSize);
  const weaponDelta = getWeaponFireButtonDelta(input.player.primaryWeaponCategory);
  const sizePercent = clamp(base + preset.fireButtonBias + weaponDelta, FIRE_BUTTON_MIN, FIRE_BUTTON_MAX);

  const placement: AresV6FireButtonRecommendation['placement'] =
    fingers >= 4 ? 'TOP_RIGHT' : fingers === 3 ? 'MID_RIGHT' : 'LOW_RIGHT';
  const opacityPercent = fingers >= 4 ? 50 : fingers === 3 ? 55 : 60;

  return {
    sizePercent,
    opacityPercent,
    recommendedFinger: fingers,
    placement,
    dragZone: getDragZone(input.player.primaryWeaponCategory),
    explanation: `Botón calculado para ${fingers} dedos, pantalla ${input.device.screenSize}" y preset ${preset.publicName}.`,
  };
}
