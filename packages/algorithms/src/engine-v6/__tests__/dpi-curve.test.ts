import { describe, expect, it } from 'vitest';

import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  calculateBaseSensitivityFromPpi,
  generateAresV6,
  resolveEffectivePpi,
} from '..';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Phase 0 Calibration Tests
// These tests lock the new direction before production migration.
// ═══════════════════════════════════════════════════════════════

describe('ARES v6 DPI curve', () => {
  it('keeps mainstream FHD+ devices in modern 1-200 ranges', () => {
    const sens = calculateBaseSensitivityFromPpi(401);

    expect(sens.general).toBeGreaterThanOrEqual(168);
    expect(sens.general).toBeLessThanOrEqual(182);
    expect(sens.redPoint).toBeGreaterThanOrEqual(153);
    expect(sens.redPoint).toBeLessThanOrEqual(167);
    expect(sens.sniperScope).toBeGreaterThanOrEqual(108);
    expect(sens.sniperScope).toBeLessThanOrEqual(122);
  });

  it('gives high-PPI iPhones lower raw sensitivity than mainstream Android FHD+', () => {
    const android = calculateBaseSensitivityFromPpi(401);
    const iphone = calculateBaseSensitivityFromPpi(460);

    expect(iphone.general).toBeLessThan(android.general);
    expect(iphone.redPoint).toBeLessThan(android.redPoint);
  });

  it('penalizes missing PPI with fallback confidence loss', () => {
    const result = resolveEffectivePpi({
      brand: 'Unknown',
      model: 'Unknown',
      screenSize: 6.5,
      ramGb: 4,
      screenHz: 60,
      panelType: 'LCD',
      tier: 'LOW',
    });

    expect(result.source).toBe('TIER_FALLBACK');
    expect(result.confidencePenalty).toBeGreaterThan(0);
    expect(result.warning).toBeTruthy();
  });
});

describe('ARES v6 generation scaffold', () => {
  it('does not output legacy-dead General ~100 for Samsung A54', () => {
    const fixture = ARES_V6_LATAM_CALIBRATION_FIXTURES.find((item) => item.id === 'samsung-galaxy-a54');
    expect(fixture).toBeDefined();

    const result = generateAresV6({
      device: fixture!.device,
      presetId: 'STANDARD_PRO',
      player: {
        fingers: 3,
        playstyle: 'STANDARD',
        mode: 'BATTLE_ROYALE',
        primaryWeaponCategory: 'AR_FAST',
        usesGyroscope: false,
      },
    });

    expect(result.sensitivity.general).toBeGreaterThan(145);
    expect(result.sensitivity.general).toBeLessThanOrEqual(190);
    expect(result.confidence.score).toBeGreaterThanOrEqual(75);
  });

  it('Todo Rojo raises red point versus Standard Pro on the same device', () => {
    const fixture = ARES_V6_LATAM_CALIBRATION_FIXTURES.find((item) => item.id === 'redmi-note-13');
    expect(fixture).toBeDefined();

    const baseInput = {
      device: fixture!.device,
      player: {
        fingers: 3 as const,
        playstyle: 'TODO_ROJO' as const,
        mode: 'CLASH_SQUAD' as const,
        primaryWeaponCategory: 'SHOTGUN' as const,
        usesGyroscope: false,
      },
    };

    const standard = generateAresV6({ ...baseInput, presetId: 'STANDARD_PRO' });
    const todoRojo = generateAresV6({ ...baseInput, presetId: 'TODO_ROJO' });

    expect(todoRojo.sensitivity.redPoint).toBeGreaterThan(standard.sensitivity.redPoint);
    expect(todoRojo.fireButton.sizePercent).toBeGreaterThanOrEqual(standard.fireButton.sizePercent);
  });

  it('Sniper/AWM lowers sniper scope versus Standard Pro', () => {
    const fixture = ARES_V6_LATAM_CALIBRATION_FIXTURES.find((item) => item.id === 'iphone-14');
    expect(fixture).toBeDefined();

    const baseInput = {
      device: fixture!.device,
      player: {
        fingers: 4 as const,
        playstyle: 'SNIPER' as const,
        mode: 'BATTLE_ROYALE' as const,
        primaryWeaponCategory: 'SNIPER' as const,
        usesGyroscope: true,
      },
    };

    const standard = generateAresV6({ ...baseInput, presetId: 'STANDARD_PRO' });
    const sniper = generateAresV6({ ...baseInput, presetId: 'SNIPER_AWM' });

    expect(sniper.sensitivity.sniperScope).toBeLessThan(standard.sensitivity.sniperScope);
    expect(sniper.gyroscope).not.toBeNull();
  });
});
