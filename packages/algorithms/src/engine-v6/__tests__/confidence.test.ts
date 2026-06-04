import { describe, expect, it } from 'vitest';

import { generateAresV6, getAresV6CalibrationFixture } from '..';
import type { AresV6DeviceSignal, AresV6GenerationInput } from '..';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Confidence scoring guarantees
// ═══════════════════════════════════════════════════════════════

const PLAYER: AresV6GenerationInput['player'] = {
  fingers: 3,
  playstyle: 'STANDARD',
  mode: 'BATTLE_ROYALE',
  usesGyroscope: false,
  primaryWeaponCategory: 'AR_FAST',
};

function generateWithDevice(device: AresV6DeviceSignal): ReturnType<typeof generateAresV6> {
  return generateAresV6({ device, presetId: 'STANDARD_PRO', player: PLAYER });
}

describe('ARES v6 — confidence scoring', () => {
  it('lowers confidence when PPI falls back to a tier default', () => {
    const known = getAresV6CalibrationFixture('redmi-note-13')!.device;
    const unknown: AresV6DeviceSignal = {
      brand: 'Generic',
      model: 'Unknown Phone',
      screenSize: 6.5,
      ramGb: 4,
      screenHz: 60,
      panelType: 'LCD',
      tier: 'LOW',
    };

    const withPpi = generateWithDevice(known);
    const fallback = generateWithDevice(unknown);

    expect(fallback.confidence.score).toBeLessThan(withPpi.confidence.score);
    expect(fallback.confidence.warnings.length).toBeGreaterThan(0);
  });

  it('never grades a tier-fallback generation as LAB_VERIFIED', () => {
    const unknown: AresV6DeviceSignal = {
      brand: 'Generic',
      model: 'Unknown Phone',
      screenSize: 6.5,
      ramGb: 4,
      screenHz: 90,
      panelType: 'LCD',
      tier: 'MID',
    };
    expect(generateWithDevice(unknown).confidence.grade).not.toBe('LAB_VERIFIED');
  });

  it('never grades a screenDpi-only (no confirmed PPI) generation as LAB_VERIFIED', () => {
    const screenDpiOnly: AresV6DeviceSignal = {
      brand: 'Mystery',
      model: 'DPI Only',
      screenSize: 6.5,
      ramGb: 8,
      screenHz: 120,
      panelType: 'AMOLED',
      tier: 'HIGH',
      screenDpi: 400,
      chipset: 'Some Chipset',
      releaseYear: 2024,
      thermalState: 'NORMAL',
    };
    expect(generateWithDevice(screenDpiOnly).confidence.grade).not.toBe('LAB_VERIFIED');
  });

  it('lists the missing signals that lowered the score', () => {
    const sparse: AresV6DeviceSignal = {
      brand: 'Sparse',
      model: 'Few Signals',
      screenSize: 6.4,
      ramGb: 6,
      screenHz: 120,
      panelType: 'AMOLED',
      tier: 'MID',
      ppi: 400,
    };
    const result = generateAresV6({
      device: sparse,
      presetId: 'STANDARD_PRO',
      player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
    });

    expect(result.confidence.missingSignals).toContain('releaseYear');
    expect(result.confidence.missingSignals).toContain('chipset');
    expect(result.confidence.missingSignals).toContain('primaryWeaponCategory');
  });

  it('flags high ping and unstable thermals as warnings without breaking range', () => {
    const base = getAresV6CalibrationFixture('samsung-galaxy-a54')!.device;
    const result = generateWithDevice({ ...base, pingMs: 180, thermalState: 'THROTTLING' });
    expect(result.confidence.warnings.length).toBeGreaterThanOrEqual(2);
    expect(result.confidence.score).toBeGreaterThanOrEqual(0);
    expect(result.confidence.score).toBeLessThanOrEqual(100);
  });

  it('awards LAB_VERIFIED to a fully-specified P0 fixture with confirmed PPI', () => {
    const fixture = getAresV6CalibrationFixture('samsung-galaxy-a54')!.device;
    const result = generateAresV6({
      device: { ...fixture, thermalState: 'NORMAL' },
      presetId: 'STANDARD_PRO',
      player: PLAYER,
    });
    expect(result.confidence.grade).toBe('LAB_VERIFIED');
  });

  it('denies LAB_VERIFIED when a manual PPI is far from the fixture PPI', () => {
    const fixture = getAresV6CalibrationFixture('samsung-galaxy-a54')!.device;
    // Real A54 PPI is 401; a manual 431 is >15 away from the calibrated value.
    const result = generateAresV6({
      device: { ...fixture, ppi: 431, thermalState: 'NORMAL' },
      presetId: 'STANDARD_PRO',
      player: PLAYER,
    });
    expect(result.confidence.grade).not.toBe('LAB_VERIFIED');
  });

  it('still reaches LAB_VERIFIED when a manual PPI is within tolerance of the fixture', () => {
    const fixture = getAresV6CalibrationFixture('samsung-galaxy-a54')!.device;
    // 401 → 410 is within the 15-PPI tolerance.
    const result = generateAresV6({
      device: { ...fixture, ppi: 410, thermalState: 'NORMAL' },
      presetId: 'STANDARD_PRO',
      player: PLAYER,
    });
    expect(result.confidence.grade).toBe('LAB_VERIFIED');
  });
});
