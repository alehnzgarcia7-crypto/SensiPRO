import { describe, it, expect } from 'vitest';

import { hasFeature, getFeatureLimit, canAccessTier, getMinimumTier, getUpgradeFeatures } from '../feature-gate';

describe('hasFeature', () => {
  it('FREE has generateSensitivity', () => {
    expect(hasFeature('FREE', 'generateSensitivity')).toBe(true);
  });
  it('FREE does NOT have gyroscope', () => {
    expect(hasFeature('FREE', 'gyroscope')).toBe(false);
  });
  it('PREMIUM has gyroscope', () => {
    expect(hasFeature('PREMIUM', 'gyroscope')).toBe(true);
  });
  it('VIP has noAds', () => {
    expect(hasFeature('VIP', 'noAds')).toBe(true);
  });
  it('PREMIUM does NOT have noAds', () => {
    expect(hasFeature('PREMIUM', 'noAds')).toBe(false);
  });
});

describe('getFeatureLimit', () => {
  it('FREE maxFavorites is 3', () => {
    expect(getFeatureLimit('FREE', 'maxFavorites')).toBe(3);
  });
  it('PREMIUM maxFavorites is 9999', () => {
    expect(getFeatureLimit('PREMIUM', 'maxFavorites')).toBe(9999);
  });
  it('FREE maxSearchesPerDay is 5', () => {
    expect(getFeatureLimit('FREE', 'maxSearchesPerDay')).toBe(5);
  });
  it('VIP maxHistory is 9999', () => {
    expect(getFeatureLimit('VIP', 'maxHistory')).toBe(9999);
  });
});

describe('canAccessTier', () => {
  it('VIP can access PREMIUM content', () => {
    expect(canAccessTier('VIP', 'PREMIUM')).toBe(true);
  });
  it('FREE cannot access PREMIUM', () => {
    expect(canAccessTier('FREE', 'PREMIUM')).toBe(false);
  });
  it('PREMIUM can access FREE content', () => {
    expect(canAccessTier('PREMIUM', 'FREE')).toBe(true);
  });
  it('FREE can access FREE content', () => {
    expect(canAccessTier('FREE', 'FREE')).toBe(true);
  });
  it('PREMIUM cannot access VIP', () => {
    expect(canAccessTier('PREMIUM', 'VIP')).toBe(false);
  });
});

describe('getMinimumTier', () => {
  it('gyroscope minimum is PREMIUM', () => {
    expect(getMinimumTier('gyroscope')).toBe('PREMIUM');
  });
  it('noAds minimum is VIP', () => {
    expect(getMinimumTier('noAds')).toBe('VIP');
  });
  it('generateSensitivity minimum is FREE', () => {
    expect(getMinimumTier('generateSensitivity')).toBe('FREE');
  });
  it('tournaments minimum is VIP', () => {
    expect(getMinimumTier('tournaments')).toBe('VIP');
  });
});

describe('getUpgradeFeatures', () => {
  it('FREE→PREMIUM gains multiple features', () => {
    const gains = getUpgradeFeatures('FREE', 'PREMIUM');
    expect(gains).toContain('Giroscopio');
    expect(gains).toContain('Estilo Agresivo');
    expect(gains).toContain('Estilo Francotirador');
    expect(gains).toContain('Comparador de dispositivos');
    expect(gains).toContain('Exportar imagen');
    expect(gains).toContain('Academia completa');
    expect(gains).not.toContain('Sin anuncios');
  });
  it('PREMIUM→VIP gains VIP-only features', () => {
    const gains = getUpgradeFeatures('PREMIUM', 'VIP');
    expect(gains).toContain('Sin anuncios');
    expect(gains).toContain('Temas VIP exclusivos');
    expect(gains).toContain('Torneos VIP');
    expect(gains).toContain('Soporte prioritario');
    expect(gains).not.toContain('Giroscopio');
  });
  it('FREE→VIP gains everything', () => {
    const gains = getUpgradeFeatures('FREE', 'VIP');
    expect(gains.length).toBeGreaterThanOrEqual(10);
  });
});
