import type { AlgorithmInput, AlgorithmOutput } from '@ares/algorithms';
import { describe, expect, it, vi } from 'vitest';

import { getAresV6CalibrationFixture } from '@ares/algorithms/engine-v6';

import {
  buildLegacyDeviceSpecs,
  generateLegacyComparableForFixture,
  mapAresV6PresetToLegacyStyle,
  normalizeAresV6Output,
  normalizeLegacyOutput,
} from '../legacy-output-adapter';

const a14 = getAresV6CalibrationFixture('samsung-galaxy-a14')!;

function legacyStub(general: number): (input: AlgorithmInput) => Pick<AlgorithmOutput, 'sensitivity'> {
  return () => ({
    sensitivity: { general, redPoint: 94, scope2x: 89, scope4x: 79, sniperScope: 59, freeView: 67 },
  });
}

describe('mapAresV6PresetToLegacyStyle', () => {
  it('maps the documented presets to legacy styles', () => {
    expect(mapAresV6PresetToLegacyStyle('STANDARD_PRO')).toMatchObject({ mapped: true, legacyStyle: 'BALANCED' });
    expect(mapAresV6PresetToLegacyStyle('TODO_ROJO')).toMatchObject({ mapped: true, legacyStyle: 'AGGRESSIVE' });
    expect(mapAresV6PresetToLegacyStyle('SNIPER_AWM')).toMatchObject({ mapped: true, legacyStyle: 'SNIPER' });
    expect(mapAresV6PresetToLegacyStyle('LOW_END_STABLE')).toMatchObject({ mapped: true, legacyStyle: 'BALANCED' });
  });

  it('marks v6-only presets as NO_LEGACY_EQUIVALENT', () => {
    for (const preset of ['GYRO_LIGHT', 'GYRO_PRO', 'FOUR_FINGER_PRO', 'CUSTOM_LAB'] as const) {
      const mapping = mapAresV6PresetToLegacyStyle(preset);
      expect(mapping.mapped).toBe(false);
      if (!mapping.mapped) expect(mapping.reason).toBe('NO_LEGACY_EQUIVALENT');
    }
  });
});

describe('normalizers', () => {
  it('normalizes a legacy output and tags the source', () => {
    const out = normalizeLegacyOutput({ general: 99, redPoint: 94, scope2x: 89, scope4x: 79, sniperScope: 59, freeView: 67 });
    expect(out).toEqual({ general: 99, redPoint: 94, scope2x: 89, scope4x: 79, sniperScope: 59, freeView: 67, source: 'LEGACY' });
  });

  it('normalizes a v6 vector and tags the source', () => {
    const out = normalizeAresV6Output({ general: 183, redPoint: 167, scope2x: 161, scope4x: 142, sniperScope: 117, freeView: 80 });
    expect(out.source).toBe('ARES_V6');
    expect(out.general).toBe(183);
  });
});

describe('buildLegacyDeviceSpecs', () => {
  it('passes the device density as screenDpi so legacy uses real PPI (not tier fallback)', () => {
    const specs = buildLegacyDeviceSpecs(a14.device);
    expect(specs.screenDpi).toBe(a14.device.screenDpi ?? a14.device.ppi);
    expect(specs.panelType).toBe(a14.device.panelType);
    expect(specs.tier).toBe(a14.device.tier);
  });
});

describe('generateLegacyComparableForFixture', () => {
  it('uses the mapped legacy style and includeGyro=false (injected generator)', () => {
    const generate = vi.fn(legacyStub(99));
    const out = generateLegacyComparableForFixture(a14, 'STANDARD_PRO', { generate });
    expect(out).not.toBeNull();
    expect(out?.source).toBe('LEGACY');
    expect(generate).toHaveBeenCalledTimes(1);
    const arg = generate.mock.calls[0]?.[0];
    expect(arg?.style).toBe('BALANCED');
    expect(arg?.includeGyro).toBe(false);
  });

  it('returns null for a preset with NO_LEGACY_EQUIVALENT', () => {
    const generate = vi.fn(legacyStub(99));
    expect(generateLegacyComparableForFixture(a14, 'GYRO_PRO', { generate })).toBeNull();
    expect(generate).not.toHaveBeenCalled();
  });

  it('reads the real frozen legacy engine deterministically (no mutation)', () => {
    const first = generateLegacyComparableForFixture(a14, 'STANDARD_PRO');
    const second = generateLegacyComparableForFixture(a14, 'STANDARD_PRO');
    expect(first).toEqual(second);
    expect(first?.general).toBeGreaterThan(0);
  });
});
