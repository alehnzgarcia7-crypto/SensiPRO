import { describe, it, expect } from 'vitest';

import { canAccess, isFeatureAvailable, getTierLabel, getTierColor } from '../tier.utils';

describe('canAccess', () => {
  it('FREE no puede acceder a PREMIUM', () => {
    expect(canAccess('FREE', 'PREMIUM')).toBe(false);
  });

  it('FREE no puede acceder a VIP', () => {
    expect(canAccess('FREE', 'VIP')).toBe(false);
  });

  it('PREMIUM puede acceder a PREMIUM', () => {
    expect(canAccess('PREMIUM', 'PREMIUM')).toBe(true);
  });

  it('PREMIUM no puede acceder a VIP', () => {
    expect(canAccess('PREMIUM', 'VIP')).toBe(false);
  });

  it('VIP puede acceder a todo', () => {
    expect(canAccess('VIP', 'FREE')).toBe(true);
    expect(canAccess('VIP', 'PREMIUM')).toBe(true);
    expect(canAccess('VIP', 'VIP')).toBe(true);
  });

  it('todos pueden acceder a FREE', () => {
    expect(canAccess('FREE', 'FREE')).toBe(true);
    expect(canAccess('PREMIUM', 'FREE')).toBe(true);
  });
});

describe('isFeatureAvailable', () => {
  it('FREE puede generar balanceado', () => {
    expect(isFeatureAvailable('FREE', 'generate_balanced')).toBe(true);
  });

  it('FREE no puede usar giroscopio', () => {
    expect(isFeatureAvailable('FREE', 'gyroscope')).toBe(false);
  });

  it('PREMIUM puede usar giroscopio', () => {
    expect(isFeatureAvailable('PREMIUM', 'gyroscope')).toBe(true);
  });

  it('PREMIUM no puede acceder a torneos VIP', () => {
    expect(isFeatureAvailable('PREMIUM', 'vip_tournaments')).toBe(false);
  });

  it('VIP tiene acceso a todas las features', () => {
    expect(isFeatureAvailable('VIP', 'gyroscope')).toBe(true);
    expect(isFeatureAvailable('VIP', 'vip_tournaments')).toBe(true);
    expect(isFeatureAvailable('VIP', 'no_ads')).toBe(true);
  });

  it('feature inexistente retorna false', () => {
    expect(isFeatureAvailable('VIP', 'nonexistent_feature')).toBe(false);
  });
});

describe('getTierLabel', () => {
  it('retorna labels correctos', () => {
    expect(getTierLabel('FREE')).toBe('Gratis');
    expect(getTierLabel('PREMIUM')).toContain('Premium');
    expect(getTierLabel('VIP')).toContain('VIP');
  });
});

describe('getTierColor', () => {
  it('retorna colores hex válidos', () => {
    expect(getTierColor('FREE')).toMatch(/^#[0-9a-f]{6}$/);
    expect(getTierColor('PREMIUM')).toMatch(/^#[0-9a-f]{6}$/);
    expect(getTierColor('VIP')).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('cada tier tiene un color diferente', () => {
    const free = getTierColor('FREE');
    const premium = getTierColor('PREMIUM');
    const vip = getTierColor('VIP');
    expect(free).not.toBe(premium);
    expect(premium).not.toBe(vip);
    expect(free).not.toBe(vip);
  });
});
