import { describe, it, expect } from 'vitest';

import {
  STYLE_PROFILES,
  getRecommendedStyle,
  getStyleProfile,
  getAllStyleProfiles,
} from '../style-profiles';
import type { StyleProfile } from '../style-profiles';
import type { SensitivityStyle, DeviceTier } from '@prisma/client';

const ALL_STYLES: SensitivityStyle[] = ['AGGRESSIVE', 'BALANCED', 'SNIPER'];
const ALL_TIERS: DeviceTier[] = ['LOW', 'MID', 'HIGH', 'ULTRA', 'GAMING'];

describe('STYLE_PROFILES', () => {
  it('contiene exactamente 3 estilos', () => {
    expect(Object.keys(STYLE_PROFILES)).toHaveLength(3);
    expect(Object.keys(STYLE_PROFILES)).toEqual(
      expect.arrayContaining(ALL_STYLES),
    );
  });

  it.each(ALL_STYLES)('perfil %s tiene todos los campos requeridos', (style) => {
    const profile: StyleProfile = STYLE_PROFILES[style];

    expect(profile.key).toBe(style);
    expect(profile.name).toBeTruthy();
    expect(profile.nameEs).toBeTruthy();
    expect(profile.icon).toBeTruthy();
    expect(profile.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(profile.description).toBeTruthy();
    expect(profile.playstyle).toBeTruthy();
    expect(profile.strengths.length).toBeGreaterThanOrEqual(3);
    expect(profile.weaknesses.length).toBeGreaterThanOrEqual(2);
    expect(profile.recommendedFor.length).toBeGreaterThanOrEqual(3);
    expect(profile.tipShort).toBeTruthy();
    expect(profile.tipDetailed).toBeTruthy();
  });

  it('cada perfil tiene un color HEX distinto', () => {
    const colors = Object.values(STYLE_PROFILES).map((p) => p.color);
    const unique = new Set(colors);
    expect(unique.size).toBe(3);
  });
});

describe('getStyleProfile', () => {
  it.each(ALL_STYLES)('retorna el perfil correcto para %s', (style) => {
    const profile = getStyleProfile(style);
    expect(profile.key).toBe(style);
    expect(profile).toBe(STYLE_PROFILES[style]);
  });
});

describe('getAllStyleProfiles', () => {
  it('retorna un array con los 3 perfiles', () => {
    const profiles = getAllStyleProfiles();
    expect(profiles).toHaveLength(3);
    const keys = profiles.map((p) => p.key);
    expect(keys).toEqual(expect.arrayContaining(ALL_STYLES));
  });
});

describe('getRecommendedStyle', () => {
  it('recomienda AGGRESSIVE para GAMING', () => {
    expect(getRecommendedStyle('GAMING')).toBe('AGGRESSIVE');
  });

  it('recomienda BALANCED para ULTRA', () => {
    expect(getRecommendedStyle('ULTRA')).toBe('BALANCED');
  });

  it('recomienda BALANCED para HIGH', () => {
    expect(getRecommendedStyle('HIGH')).toBe('BALANCED');
  });

  it('recomienda BALANCED para MID', () => {
    expect(getRecommendedStyle('MID')).toBe('BALANCED');
  });

  it('recomienda SNIPER para LOW', () => {
    expect(getRecommendedStyle('LOW')).toBe('SNIPER');
  });

  it('todos los tiers retornan un estilo válido', () => {
    for (const tier of ALL_TIERS) {
      const style = getRecommendedStyle(tier);
      expect(ALL_STYLES).toContain(style);
    }
  });
});
