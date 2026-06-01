import { describe, expect, it } from 'vitest';

import { ARES_V6_PRESETS, getAresV6Preset, getAresV6PresetsByCategory } from '..';
import type { AresV6PresetId } from '..';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Preset taxonomy integrity
// ═══════════════════════════════════════════════════════════════

const ALL_PRESET_IDS: readonly AresV6PresetId[] = ARES_V6_PRESETS.map((preset) => preset.id);

describe('ARES v6 — preset catalogue', () => {
  it('exposes the full taxonomy with unique ids', () => {
    expect(ARES_V6_PRESETS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(ALL_PRESET_IDS).size).toBe(ARES_V6_PRESETS.length);
  });

  it('keeps every preset structurally complete', () => {
    for (const preset of ARES_V6_PRESETS) {
      expect(preset.publicName.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
      expect(preset.intendedFor.length).toBeGreaterThan(0);
      expect(preset.recommendedModes.length).toBeGreaterThan(0);
      expect(preset.recommendedWeapons.length).toBeGreaterThan(0);
      expect(['SAFE', 'MEDIUM', 'ADVANCED']).toContain(preset.riskLevel);
      expect(['RESEARCH_BACKED', 'NEEDS_LAB_DATA', 'EXPERIMENTAL']).toContain(preset.validationStatus);
    }
  });

  it('treats Standard Pro as the neutral baseline (all biases zero)', () => {
    const standard = getAresV6Preset('STANDARD_PRO');
    expect(Object.values(standard.sensitivityBias).every((value) => value === 0)).toBe(true);
    expect(standard.fireButtonBias).toBe(0);
    expect(standard.gyroBias).toBe(0);
  });
});

describe('ARES v6 — preset bias semantics', () => {
  it('gives every headshot-priority preset a positive Red Point bias above Standard', () => {
    const standard = getAresV6Preset('STANDARD_PRO');
    for (const id of ['TODO_ROJO', 'X_METHOD', 'ONE_TAP'] as const) {
      expect(getAresV6Preset(id).sensitivityBias.redPoint).toBeGreaterThan(standard.sensitivityBias.redPoint);
    }
  });

  it('makes One Tap recommend shotgun and pistol weapons', () => {
    const oneTap = getAresV6Preset('ONE_TAP');
    expect(oneTap.recommendedWeapons).toContain('SHOTGUN');
    expect(oneTap.recommendedWeapons).toContain('PISTOL');
  });

  it('gives Sniper/AWM the most negative sniper-scope bias of the core presets', () => {
    const sniper = getAresV6Preset('SNIPER_AWM');
    expect(sniper.sensitivityBias.sniperScope).toBeLessThan(0);
    expect(sniper.sensitivityBias.sniperScope).toBeLessThan(getAresV6Preset('STANDARD_PRO').sensitivityBias.sniperScope);
  });

  it('makes Low-End Stable pull 4x and AWM down (protecting control)', () => {
    const lowEnd = getAresV6Preset('LOW_END_STABLE');
    expect(lowEnd.sensitivityBias.scope4x).toBeLessThan(0);
    expect(lowEnd.sensitivityBias.sniperScope).toBeLessThan(0);
  });
});

describe('ARES v6 — preset lookup helpers', () => {
  it('returns presets filtered by category', () => {
    const gyro = getAresV6PresetsByCategory('GYRO');
    expect(gyro.length).toBeGreaterThan(0);
    expect(gyro.every((preset) => preset.category === 'GYRO')).toBe(true);
  });

  it('throws a descriptive error for an unknown preset id', () => {
    expect(() => getAresV6Preset('NOT_A_PRESET' as AresV6PresetId)).toThrow(/preset not found/i);
  });
});
