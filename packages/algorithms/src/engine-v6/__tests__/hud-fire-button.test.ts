import { describe, expect, it } from 'vitest';

import { buildFireButton, buildHud, getAresV6CalibrationFixture, getFireButtonBase } from '..';
import type {
  AresV6DeviceSignal,
  AresV6FingerCount,
  AresV6GameMode,
  AresV6GenerationInput,
  AresV6Playstyle,
  AresV6WeaponCategory,
} from '..';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — HUD + fire button
// ═══════════════════════════════════════════════════════════════

const BASE_DEVICE = getAresV6CalibrationFixture('samsung-galaxy-a54')!.device;

function input(options: {
  fingers: AresV6FingerCount;
  screenSize?: number;
  mode?: AresV6GameMode;
  playstyle?: AresV6Playstyle;
  weapon?: AresV6WeaponCategory;
}): AresV6GenerationInput {
  const device: AresV6DeviceSignal = { ...BASE_DEVICE, screenSize: options.screenSize ?? BASE_DEVICE.screenSize };
  return {
    device,
    presetId: 'STANDARD_PRO',
    player: {
      fingers: options.fingers,
      playstyle: options.playstyle ?? 'STANDARD',
      mode: options.mode ?? 'BATTLE_ROYALE',
      usesGyroscope: false,
      primaryWeaponCategory: options.weapon,
    },
  };
}

describe('ARES v6 — fire button sizing', () => {
  it('makes a 2-finger button larger than a 4-finger button on the same screen', () => {
    expect(getFireButtonBase(2, 6.4)).toBeGreaterThan(getFireButtonBase(4, 6.4));

    const twoFinger = buildFireButton(input({ fingers: 2 }));
    const fourFinger = buildFireButton(input({ fingers: 4 }));
    expect(twoFinger.sizePercent).toBeGreaterThan(fourFinger.sizePercent);
  });

  it('keeps every button size within the 35-80 bounds', () => {
    const fingers: AresV6FingerCount[] = [2, 3, 4, 5];
    const sizes: number[] = [5.5, 6.1, 6.6, 6.9, 7.5];
    for (const f of fingers) {
      for (const screenSize of sizes) {
        const button = buildFireButton(input({ fingers: f, screenSize }));
        expect(button.sizePercent).toBeGreaterThanOrEqual(35);
        expect(button.sizePercent).toBeLessThanOrEqual(80);
        expect(button.recommendedFinger).toBe(f);
      }
    }
  });

  it('lowers the button as the screen grows for a fixed finger count', () => {
    expect(getFireButtonBase(3, 5.5)).toBeGreaterThan(getFireButtonBase(3, 6.9));
  });
});

describe('ARES v6 — HUD layout family', () => {
  it('recommends FOUR_FINGER for 4 fingers on a phone screen', () => {
    expect(buildHud(input({ fingers: 4, screenSize: 6.4 })).layoutFamily).toBe('FOUR_FINGER');
  });

  it('recommends TABLET for screens >= 7.2 regardless of finger count', () => {
    expect(buildHud(input({ fingers: 4, screenSize: 7.5 })).layoutFamily).toBe('TABLET');
    expect(buildHud(input({ fingers: 2, screenSize: 7.2 })).layoutFamily).toBe('TABLET');
  });

  it('maps the remaining finger counts to their families', () => {
    expect(buildHud(input({ fingers: 2, screenSize: 6.4 })).layoutFamily).toBe('TWO_FINGER');
    expect(buildHud(input({ fingers: 3, screenSize: 6.4 })).layoutFamily).toBe('THREE_FINGER');
    expect(buildHud(input({ fingers: 5, screenSize: 6.4 })).layoutFamily).toBe('FIVE_FINGER');
  });

  it('gives more priority buttons to 4 fingers than to 2 fingers', () => {
    const two = buildHud(input({ fingers: 2 })).priorityButtons.length;
    const four = buildHud(input({ fingers: 4 })).priorityButtons.length;
    expect(four).toBeGreaterThan(two);
  });
});

describe('ARES v6 — HUD priority by game mode and intent', () => {
  it('prioritises gloo wall and weapon swap in Clash Squad', () => {
    const buttons = buildHud(input({ fingers: 4, mode: 'CLASH_SQUAD' })).priorityButtons;
    expect(buttons).toContain('Gloo Wall');
    expect(buttons).toContain('Cambio de arma');
  });

  it('prioritises free look and minimap in Battle Royale', () => {
    const buttons = buildHud(input({ fingers: 4, mode: 'BATTLE_ROYALE' })).priorityButtons;
    expect(buttons).toContain('Vista Libre');
    expect(buttons).toContain('Minimapa');
  });

  it('surfaces scope/AWM control for sniper intent', () => {
    const buttons = buildHud(input({ fingers: 4, mode: 'BATTLE_ROYALE', playstyle: 'SNIPER', weapon: 'SNIPER' })).priorityButtons;
    expect(buttons).toContain('Mira / AWM');
  });

  it('surfaces gloo wall for shotgun one-tap intent', () => {
    const buttons = buildHud(input({ fingers: 4, mode: 'CLASH_SQUAD', playstyle: 'ONE_TAP', weapon: 'SHOTGUN' })).priorityButtons;
    expect(buttons).toContain('Gloo Wall');
  });
});
