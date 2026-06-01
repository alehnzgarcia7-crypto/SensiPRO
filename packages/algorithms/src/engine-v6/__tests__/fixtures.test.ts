import { describe, expect, it } from 'vitest';

import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  generateAresV6,
  getAresV6CalibrationFixture,
} from '..';
import type { AresV6CalibrationFixture, AresV6GenerationInput } from '..';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — LATAM calibration fixtures
//
// These fixtures are the devices that must feel correct before v6 is allowed
// near production. Device signals may nudge a result a few points beyond the
// raw PPI band, so the per-fixture band check carries a documented tolerance.
// ═══════════════════════════════════════════════════════════════

const DEVICE_SIGNAL_TOLERANCE = 6;
const MODERN_GENERAL_FLOOR = 130;

// Typed against the widened interface so `ppi ?? screenDpi` is not narrowed to
// `never` by the `as const` literal fixture data.
function getFixturePpi(fixture: AresV6CalibrationFixture): number {
  return fixture.device.ppi ?? fixture.device.screenDpi ?? 0;
}

function standardInput(fixtureId: string): AresV6GenerationInput {
  const fixture = getAresV6CalibrationFixture(fixtureId);
  if (!fixture) throw new Error(`fixture missing: ${fixtureId}`);
  return {
    device: fixture.device,
    presetId: 'STANDARD_PRO',
    player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
  };
}

describe('ARES v6 — fixture metadata integrity', () => {
  it('covers every required P0/P1 device with confirmed PPI and at least one preset', () => {
    for (const fixture of ARES_V6_LATAM_CALIBRATION_FIXTURES) {
      expect(getFixturePpi(fixture)).toBeGreaterThan(0);
      expect(fixture.primaryPresets.length).toBeGreaterThan(0);
      expect(fixture.expectedStandardGeneralRange[0]).toBeLessThan(fixture.expectedStandardGeneralRange[1]);
    }
  });

  it('includes the mandatory P0 devices', () => {
    const ids = ARES_V6_LATAM_CALIBRATION_FIXTURES.filter((f) => f.priority === 'P0').map((f) => f.id);
    const mandatory = [
      'samsung-galaxy-a14',
      'samsung-galaxy-a15',
      'samsung-galaxy-a24',
      'samsung-galaxy-a54',
      'redmi-note-12',
      'redmi-note-13',
      'moto-g54',
      'iphone-11',
      'iphone-14',
    ];
    for (const required of mandatory) {
      expect(ids).toContain(required);
    }
    // Lock the P0 set so adding/removing a P0 device forces updating this list.
    expect(ids).toHaveLength(mandatory.length);
  });
});

describe('ARES v6 — every fixture produces a complete, in-band package', () => {
  for (const fixture of ARES_V6_LATAM_CALIBRATION_FIXTURES) {
    it(`${fixture.id} (Standard Pro) stays in its expected General band and is complete`, () => {
      const result = generateAresV6(standardInput(fixture.id));
      const [low, high] = fixture.expectedStandardGeneralRange;

      expect(result.sensitivity.general).toBeGreaterThanOrEqual(low - DEVICE_SIGNAL_TOLERANCE);
      expect(result.sensitivity.general).toBeLessThanOrEqual(high + DEVICE_SIGNAL_TOLERANCE);
      expect(result.sensitivity.general).toBeGreaterThan(MODERN_GENERAL_FLOOR);

      // Completeness of the package.
      expect(result.explanation.bullets.length).toBeGreaterThan(0);
      expect(result.fireButton.sizePercent).toBeGreaterThanOrEqual(35);
      expect(result.fireButton.sizePercent).toBeLessThanOrEqual(80);
      expect(result.hud.priorityButtons.length).toBeGreaterThan(0);
      expect(result.confidence.score).toBeGreaterThan(0);
    });
  }
});

describe('ARES v6 — every fixture preset path generates valid output', () => {
  for (const fixture of ARES_V6_LATAM_CALIBRATION_FIXTURES) {
    it(`${fixture.id} generates all of its primary presets within 1-200`, () => {
      for (const presetId of fixture.primaryPresets) {
        const result = generateAresV6({
          device: fixture.device,
          presetId,
          player: { fingers: 4, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false, primaryWeaponCategory: 'AR_FAST' },
        });
        for (const value of Object.values(result.sensitivity)) {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(200);
        }
      }
    });
  }
});

describe('ARES v6 — cross-device calibration ordering', () => {
  it('iPhone 11 lands in the low-density 320-359 band (General 185-200)', () => {
    const general = generateAresV6(standardInput('iphone-11')).sensitivity.general;
    expect(general).toBeGreaterThanOrEqual(185 - DEVICE_SIGNAL_TOLERANCE);
    expect(general).toBeLessThanOrEqual(200);
  });

  it('iPhone 14 outputs lower General than Redmi Note 13', () => {
    expect(generateAresV6(standardInput('iphone-14')).sensitivity.general)
      .toBeLessThan(generateAresV6(standardInput('redmi-note-13')).sensitivity.general);
  });

  it('Galaxy S24 Ultra outputs lower General than Galaxy A14', () => {
    expect(generateAresV6(standardInput('galaxy-s24-ultra')).sensitivity.general)
      .toBeLessThan(generateAresV6(standardInput('samsung-galaxy-a14')).sensitivity.general);
  });
});
