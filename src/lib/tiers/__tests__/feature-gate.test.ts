import { describe, it, expect } from 'vitest';

import { hasFeature, getFeatureLimit, canAccessTier, getMinimumTier, getUpgradeFeatures } from '../feature-gate';

// ═══════════════════════════════════════════════════════════
// ARES-804 — Tests de Feature Gate Comprensivos
// Cubre: hasFeature, getFeatureLimit, canAccessTier,
//        getMinimumTier, getUpgradeFeatures
// ═══════════════════════════════════════════════════════════

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
  it('PREMIUM has compareDevices', () => {
    expect(hasFeature('PREMIUM', 'compareDevices')).toBe(true);
  });
  it('VIP has noAds', () => {
    expect(hasFeature('VIP', 'noAds')).toBe(true);
  });
  it('PREMIUM does NOT have noAds', () => {
    expect(hasFeature('PREMIUM', 'noAds')).toBe(false);
  });
  it('VIP has all PREMIUM features', () => {
    expect(hasFeature('VIP', 'gyroscope')).toBe(true);
    expect(hasFeature('VIP', 'compareDevices')).toBe(true);
    expect(hasFeature('VIP', 'exportImage')).toBe(true);
    expect(hasFeature('VIP', 'academyFull')).toBe(true);
  });
  it('FREE does NOT have styleAggressive', () => {
    expect(hasFeature('FREE', 'styleAggressive')).toBe(false);
  });
  it('FREE does NOT have compareDevices', () => {
    expect(hasFeature('FREE', 'compareDevices')).toBe(false);
  });
  it('FREE has styleBalanced', () => {
    expect(hasFeature('FREE', 'styleBalanced')).toBe(true);
  });
  it('PREMIUM does NOT have tournaments', () => {
    expect(hasFeature('PREMIUM', 'tournaments')).toBe(false);
  });
  it('VIP has tournaments', () => {
    expect(hasFeature('VIP', 'tournaments')).toBe(true);
  });
  it('PREMIUM has styleAggressive and styleSniper', () => {
    expect(hasFeature('PREMIUM', 'styleAggressive')).toBe(true);
    expect(hasFeature('PREMIUM', 'styleSniper')).toBe(true);
  });
});

describe('getFeatureLimit', () => {
  it('FREE maxFavorites is 3', () => {
    expect(getFeatureLimit('FREE', 'maxFavorites')).toBe(3);
  });
  it('PREMIUM maxFavorites is 9999', () => {
    expect(getFeatureLimit('PREMIUM', 'maxFavorites')).toBe(9999);
  });
  it('FREE maxSearchesPerDay is unlimited', () => {
    expect(getFeatureLimit('FREE', 'maxSearchesPerDay')).toBe(9999);
  });
  it('VIP maxHistory is 9999', () => {
    expect(getFeatureLimit('VIP', 'maxHistory')).toBe(9999);
  });
  it('VIP maxSearchesPerDay is 9999', () => {
    expect(getFeatureLimit('VIP', 'maxSearchesPerDay')).toBe(9999);
  });
  it('FREE maxHistory is 10', () => {
    expect(getFeatureLimit('FREE', 'maxHistory')).toBe(10);
  });
  it('PREMIUM maxHistory is 9999', () => {
    expect(getFeatureLimit('PREMIUM', 'maxHistory')).toBe(9999);
  });
  it('PREMIUM maxSearchesPerDay is 9999', () => {
    expect(getFeatureLimit('PREMIUM', 'maxSearchesPerDay')).toBe(9999);
  });
});

describe('canAccessTier', () => {
  it('VIP can access PREMIUM content', () => {
    expect(canAccessTier('VIP', 'PREMIUM')).toBe(true);
  });
  it('VIP can access FREE content', () => {
    expect(canAccessTier('VIP', 'FREE')).toBe(true);
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
  it('same tier has access — PREMIUM=PREMIUM', () => {
    expect(canAccessTier('PREMIUM', 'PREMIUM')).toBe(true);
  });
  it('same tier has access — VIP=VIP', () => {
    expect(canAccessTier('VIP', 'VIP')).toBe(true);
  });
  it('FREE cannot access VIP', () => {
    expect(canAccessTier('FREE', 'VIP')).toBe(false);
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
  it('exportImage minimum is PREMIUM', () => {
    expect(getMinimumTier('exportImage')).toBe('PREMIUM');
  });
  it('vipThemes minimum is VIP', () => {
    expect(getMinimumTier('vipThemes')).toBe('VIP');
  });
  it('compareDevices minimum is PREMIUM', () => {
    expect(getMinimumTier('compareDevices')).toBe('PREMIUM');
  });
  it('styleBalanced minimum is FREE', () => {
    expect(getMinimumTier('styleBalanced')).toBe('FREE');
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
  it('same tier returns empty array', () => {
    const gains = getUpgradeFeatures('PREMIUM', 'PREMIUM');
    expect(gains).toHaveLength(0);
  });
  it('downgrade returns empty array', () => {
    const gains = getUpgradeFeatures('VIP', 'FREE');
    expect(gains).toHaveLength(0);
  });
  it('FREE→PREMIUM does NOT include VIP features', () => {
    const gains = getUpgradeFeatures('FREE', 'PREMIUM');
    expect(gains).not.toContain('Torneos VIP');
    expect(gains).not.toContain('Soporte prioritario');
  });
});
