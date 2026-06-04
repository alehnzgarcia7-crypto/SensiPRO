import { describe, expect, it } from 'vitest';

import {
  normalizeAresV6Overrides,
  toAresV6DeviceSignal,
  toAresV6DeviceSignalWithOverrides,
  type AresV6AdaptableDevice,
} from '../device-adapter';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Device adapter
// ═══════════════════════════════════════════════════════════════

function sampleDevice(): AresV6AdaptableDevice {
  return {
    brand: 'Samsung',
    model: 'Galaxy A54',
    screenSize: 6.4,
    ramGb: 8,
    screenHz: 120,
    panelType: 'AMOLED',
    tier: 'HIGH',
    screenDpi: 401,
    chipset: 'Exynos 1380',
    releaseYear: 2023,
  };
}

describe('toAresV6DeviceSignal', () => {
  it('preserves screenDpi as both ppi and screenDpi', () => {
    const signal = toAresV6DeviceSignal(sampleDevice());
    expect(signal.ppi).toBe(401);
    expect(signal.screenDpi).toBe(401);
  });

  it('keeps the essential device fields', () => {
    const signal = toAresV6DeviceSignal(sampleDevice());
    expect(signal.brand).toBe('Samsung');
    expect(signal.model).toBe('Galaxy A54');
    expect(signal.screenSize).toBe(6.4);
    expect(signal.ramGb).toBe(8);
    expect(signal.screenHz).toBe(120);
    expect(signal.panelType).toBe('AMOLED');
    expect(signal.tier).toBe('HIGH');
    expect(signal.chipset).toBe('Exynos 1380');
    expect(signal.releaseYear).toBe(2023);
  });

  it('produces a valid signal without ppi when screenDpi is missing', () => {
    const signal = toAresV6DeviceSignal({ ...sampleDevice(), screenDpi: null });
    expect(signal.ppi).toBeUndefined();
    expect(signal.screenDpi).toBeUndefined();
    expect(signal.brand).toBe('Samsung');
    expect(signal.tier).toBe('HIGH');
  });
});

describe('toAresV6DeviceSignalWithOverrides', () => {
  it('lets an override ppi win over the DB screenDpi', () => {
    const signal = toAresV6DeviceSignalWithOverrides(sampleDevice(), { ppi: 450 });
    expect(signal.ppi).toBe(450);
    expect(signal.screenDpi).toBe(401);
  });

  it('applies ramGb and screenHz overrides', () => {
    const signal = toAresV6DeviceSignalWithOverrides(sampleDevice(), { ramGb: 12, screenHz: 90 });
    expect(signal.ramGb).toBe(12);
    expect(signal.screenHz).toBe(90);
  });

  it('carries through optional override-only signals', () => {
    const signal = toAresV6DeviceSignalWithOverrides(sampleDevice(), {
      client: 'FREE_FIRE_MAX',
      thermalState: 'HOT',
      pingMs: 90,
      hasScreenProtector: true,
      inputLagHint: 'HIGH',
    });
    expect(signal.client).toBe('FREE_FIRE_MAX');
    expect(signal.thermalState).toBe('HOT');
    expect(signal.pingMs).toBe(90);
    expect(signal.hasScreenProtector).toBe(true);
    expect(signal.inputLagHint).toBe('HIGH');
  });

  it('drops out-of-range numeric overrides (falls back to device values)', () => {
    const signal = toAresV6DeviceSignalWithOverrides(sampleDevice(), { ppi: 50, ramGb: 99, pingMs: 5000 });
    expect(signal.ppi).toBe(401); // 50 is below the 200 floor → dropped → screenDpi used
    expect(signal.ramGb).toBe(8); // 99 above the 32 ceiling → dropped → device value
    expect(signal.pingMs).toBeUndefined(); // 5000 above 999 → dropped
  });

  it('does not mutate the input device or overrides', () => {
    const device = sampleDevice();
    const deviceCopy = sampleDevice();
    const overrides = { ramGb: 12, ppi: 450 };
    const overridesCopy = { ramGb: 12, ppi: 450 };

    toAresV6DeviceSignalWithOverrides(device, overrides);

    expect(device).toEqual(deviceCopy);
    expect(overrides).toEqual(overridesCopy);
  });
});

describe('normalizeAresV6Overrides', () => {
  it('returns an empty object for undefined overrides', () => {
    expect(normalizeAresV6Overrides(undefined)).toEqual({});
  });

  it('keeps valid values and drops invalid ones', () => {
    const result = normalizeAresV6Overrides({ ramGb: 6, screenHz: 240, ppi: 700, pingMs: 1000 });
    expect(result.ramGb).toBe(6);
    expect(result.screenHz).toBe(240);
    expect(result.ppi).toBe(700);
    expect(result.pingMs).toBeUndefined(); // 1000 > 999
  });
});
