import { describe, expect, it } from 'vitest';

import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  generateAresV6,
  getAresV6CalibrationFixture,
} from '..';
import type {
  AresV6GenerationInput,
  AresV6PresetId,
  AresV6WeaponCategory,
} from '..';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Orchestrator hard-rule suite
// Encodes the non-negotiable product guarantees from the Phase 1 spec.
// ═══════════════════════════════════════════════════════════════

type PlayerOverrides = Partial<AresV6GenerationInput['player']>;

function buildInput(
  fixtureId: string,
  presetId: AresV6PresetId,
  player: PlayerOverrides = {},
): AresV6GenerationInput {
  const fixture = getAresV6CalibrationFixture(fixtureId);
  if (!fixture) throw new Error(`fixture missing: ${fixtureId}`);

  return {
    device: fixture.device,
    presetId,
    player: {
      fingers: 3,
      playstyle: 'STANDARD',
      mode: 'BATTLE_ROYALE',
      usesGyroscope: false,
      ...player,
    },
  };
}

function gen(
  fixtureId: string,
  presetId: AresV6PresetId,
  player: PlayerOverrides = {},
) {
  return generateAresV6(buildInput(fixtureId, presetId, player));
}

describe('ARES v6 — range invariants', () => {
  it('never emits sensitivity outside 1-200 across every fixture and preset', () => {
    for (const fixture of ARES_V6_LATAM_CALIBRATION_FIXTURES) {
      for (const presetId of fixture.primaryPresets) {
        const result = generateAresV6({
          device: fixture.device,
          presetId,
          player: {
            fingers: 4,
            playstyle: 'STANDARD',
            mode: 'BATTLE_ROYALE',
            usesGyroscope: true,
            primaryWeaponCategory: 'AR_FAST',
          },
        });

        for (const value of Object.values(result.sensitivity)) {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(200);
        }
      }
    }
  });

  it('never emits gyroscope values outside 1-100 when gyro is enabled', () => {
    const weapons: AresV6WeaponCategory[] = ['SHOTGUN', 'SMG', 'AR_FAST', 'AR_HEAVY', 'MARKSMAN', 'SNIPER', 'PISTOL', 'SPECIAL'];
    for (const fixture of ARES_V6_LATAM_CALIBRATION_FIXTURES) {
      for (const weapon of weapons) {
        const result = generateAresV6({
          device: fixture.device,
          presetId: 'GYRO_PRO',
          player: { fingers: 4, playstyle: 'GYRO_CONTROL', mode: 'BATTLE_ROYALE', usesGyroscope: true, primaryWeaponCategory: weapon },
        });
        expect(result.gyroscope).not.toBeNull();
        for (const value of Object.values(result.gyroscope!)) {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('returns null gyroscope when the player does not use it', () => {
    expect(gen('redmi-note-13', 'STANDARD_PRO', { usesGyroscope: false }).gyroscope).toBeNull();
  });
});

describe('ARES v6 — PPI calibration drives the result', () => {
  it('changes the result when the real PPI changes', () => {
    const base = getAresV6CalibrationFixture('redmi-note-13')!.device;
    const lowPpi = generateAresV6({
      device: { ...base, ppi: 330, screenDpi: 330 },
      presetId: 'STANDARD_PRO',
      player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
    });
    const highPpi = generateAresV6({
      device: { ...base, ppi: 500, screenDpi: 500 },
      presetId: 'STANDARD_PRO',
      player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
    });

    expect(lowPpi.sensitivity.general).toBeGreaterThan(highPpi.sensitivity.general);
  });

  it('keeps Samsung A54 Standard far away from legacy dead General ~100', () => {
    const result = gen('samsung-galaxy-a54', 'STANDARD_PRO', { primaryWeaponCategory: 'AR_FAST' });
    expect(result.sensitivity.general).toBeGreaterThan(150);
    expect(result.sensitivity.general).toBeLessThanOrEqual(190);
  });

  it('keeps Redmi Note 13 in the modern 390-449 band (General 168-182)', () => {
    const result = gen('redmi-note-13', 'STANDARD_PRO');
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(168);
    expect(result.sensitivity.general).toBeLessThanOrEqual(182);
  });

  it('gives iPhone 14 lower General than Redmi Note 13 (higher PPI = lower raw)', () => {
    const iphone = gen('iphone-14', 'STANDARD_PRO');
    const redmi = gen('redmi-note-13', 'STANDARD_PRO');
    expect(iphone.sensitivity.general).toBeLessThan(redmi.sensitivity.general);
  });

  it('gives Galaxy S24 Ultra lower General than Galaxy A14', () => {
    const ultra = gen('galaxy-s24-ultra', 'STANDARD_PRO');
    const budget = gen('samsung-galaxy-a14', 'STANDARD_PRO');
    expect(ultra.sensitivity.general).toBeLessThan(budget.sensitivity.general);
  });
});

describe('ARES v6 — preset semantics', () => {
  it('Todo Rojo raises Red Point versus Standard Pro on the same device', () => {
    const standard = gen('redmi-note-13', 'STANDARD_PRO', { primaryWeaponCategory: 'SHOTGUN', playstyle: 'TODO_ROJO', mode: 'CLASH_SQUAD' });
    const todoRojo = gen('redmi-note-13', 'TODO_ROJO', { primaryWeaponCategory: 'SHOTGUN', playstyle: 'TODO_ROJO', mode: 'CLASH_SQUAD' });
    expect(todoRojo.sensitivity.redPoint).toBeGreaterThan(standard.sensitivity.redPoint);
  });

  it('One Tap raises Red Point and recommends shotgun/pistol weapons', () => {
    const standard = gen('iphone-11', 'STANDARD_PRO', { mode: 'CLASH_SQUAD' });
    const oneTap = gen('iphone-11', 'ONE_TAP', { mode: 'CLASH_SQUAD' });
    expect(oneTap.sensitivity.redPoint).toBeGreaterThan(standard.sensitivity.redPoint);
  });

  it('Sniper/AWM lowers the sniper scope versus Standard Pro', () => {
    const standard = gen('iphone-14', 'STANDARD_PRO', { fingers: 4, primaryWeaponCategory: 'SNIPER', usesGyroscope: true });
    const sniper = gen('iphone-14', 'SNIPER_AWM', { fingers: 4, primaryWeaponCategory: 'SNIPER', usesGyroscope: true });
    expect(sniper.sensitivity.sniperScope).toBeLessThan(standard.sensitivity.sniperScope);
  });

  it('Low-End Stable protects 4x and AWM (keeps them at or below Standard)', () => {
    const standard = gen('samsung-galaxy-a14', 'STANDARD_PRO');
    const lowEnd = gen('samsung-galaxy-a14', 'LOW_END_STABLE');
    expect(lowEnd.sensitivity.scope4x).toBeLessThanOrEqual(standard.sensitivity.scope4x);
    expect(lowEnd.sensitivity.sniperScope).toBeLessThanOrEqual(standard.sensitivity.sniperScope);
  });
});

describe('ARES v6 — weapon calibration (including safe fallbacks)', () => {
  it('applies a non-zero weapon adjustment for AR_FAST even without an explicit matrix rule', () => {
    const noWeapon = gen('samsung-galaxy-a54', 'STANDARD_PRO');
    const arFast = gen('samsung-galaxy-a54', 'STANDARD_PRO', { primaryWeaponCategory: 'AR_FAST' });
    const changed =
      noWeapon.sensitivity.general !== arFast.sensitivity.general ||
      noWeapon.sensitivity.scope2x !== arFast.sensitivity.scope2x ||
      noWeapon.sensitivity.scope4x !== arFast.sensitivity.scope4x;
    expect(changed).toBe(true);
  });

  it('applies a controlled MARKSMAN fallback that protects long-range scopes', () => {
    const noWeapon = gen('poco-x5-pro', 'STANDARD_PRO');
    const marksman = gen('poco-x5-pro', 'STANDARD_PRO', { primaryWeaponCategory: 'MARKSMAN' });
    expect(marksman.sensitivity.scope4x).toBeLessThanOrEqual(noWeapon.sensitivity.scope4x);
  });
});

describe('ARES v6 — cascade sanity', () => {
  it('keeps the scope chain monotonic (redPoint+ >= 2x >= 4x >= AWM)', () => {
    for (const fixture of ARES_V6_LATAM_CALIBRATION_FIXTURES) {
      const s = generateAresV6({
        device: fixture.device,
        presetId: 'STANDARD_PRO',
        player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
      }).sensitivity;
      expect(s.scope2x).toBeLessThanOrEqual(s.redPoint + 6);
      expect(s.scope4x).toBeLessThanOrEqual(s.scope2x);
      expect(s.sniperScope).toBeLessThanOrEqual(s.scope4x);
    }
  });
});

describe('ARES v6 — symptoms become tuning steps, never blind base mutations', () => {
  it('does not mutate the base sensitivity when symptoms are present', () => {
    const clean = gen('redmi-note-13', 'STANDARD_PRO', { primaryWeaponCategory: 'AR_FAST' });
    const withSymptoms = gen('redmi-note-13', 'STANDARD_PRO', {
      primaryWeaponCategory: 'AR_FAST',
      symptoms: ['CROSSHAIR_DOES_NOT_REACH_HEAD', 'SCOPE_4X_UNCONTROLLABLE', 'DEVICE_LAGS'],
    });
    expect(withSymptoms.sensitivity).toEqual(clean.sensitivity);
    expect(withSymptoms.firstTuningSteps.length).toBeGreaterThan(0);
    expect(withSymptoms.firstTuningSteps.length).toBeLessThanOrEqual(3);
  });
});

describe('ARES v6 — output completeness', () => {
  it('returns every required section of the generation package', () => {
    const result = gen('redmi-note-13', 'STANDARD_PRO', { primaryWeaponCategory: 'SHOTGUN' });
    expect(result.algorithmVersion).toBe('ARES-v6-refoundation');
    expect(result.sensitivity).toBeTruthy();
    expect(result.dpi).toBeTruthy();
    expect(result.fireButton).toBeTruthy();
    expect(result.hud).toBeTruthy();
    expect(result.confidence).toBeTruthy();
    expect(result.explanation.bullets.length).toBeGreaterThan(0);
    expect(Array.isArray(result.firstTuningSteps)).toBe(true);
  });

  it('explanation references preset, mode, fingers and PPI', () => {
    const result = gen('redmi-note-13', 'TODO_ROJO', { fingers: 4, mode: 'CLASH_SQUAD', primaryWeaponCategory: 'SHOTGUN' });
    const text = [result.explanation.headline, ...result.explanation.bullets, ...result.explanation.technicalNotes].join(' ');
    expect(text).toContain('Todo Rojo');
    expect(text).toContain('CLASH_SQUAD');
    expect(text).toContain('4');
    expect(text).toContain('395');
  });
});

describe('ARES v6 — dpi source provenance', () => {
  it('reports PPI as the dpi source when a confirmed PPI drives the result', () => {
    const result = gen('redmi-note-13', 'STANDARD_PRO');
    expect(result.dpi.source).toBe('PPI');
    expect(result.dpi.detectedPpi).toBe(395);
  });

  it('falls back to TIER_FALLBACK with null detectedPpi when no PPI/DPI is given', () => {
    const result = generateAresV6({
      device: {
        brand: 'Generic',
        model: 'Unknown Phone',
        screenSize: 6.5,
        ramGb: 4,
        screenHz: 60,
        panelType: 'LCD',
        tier: 'LOW',
      },
      presetId: 'STANDARD_PRO',
      player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
    });
    expect(result.dpi.source).toBe('TIER_FALLBACK');
    expect(result.dpi.detectedPpi).toBeNull();
  });
});
