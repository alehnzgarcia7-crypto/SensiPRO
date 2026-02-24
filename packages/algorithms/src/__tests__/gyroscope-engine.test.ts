import { describe, it, expect } from 'vitest';

import { generateGyroscope } from '../gyroscope-engine';
import type { SensitivityOutput, DeviceSpecs } from '../types';

const baseSensitivity: SensitivityOutput = {
  general: 60,
  redPoint: 55,
  scope2x: 50,
  scope4x: 45,
  sniperScope: 40,
  freeView: 65,
};

const amoledGaming: DeviceSpecs = {
  screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING',
};

const lcdLow: DeviceSpecs = {
  screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW',
};

describe('generateGyroscope', () => {
  it('returns all 6 gyro fields', () => {
    const result = generateGyroscope(baseSensitivity, amoledGaming);
    expect(result).toHaveProperty('gyroGeneral');
    expect(result).toHaveProperty('gyroRedPoint');
    expect(result).toHaveProperty('gyroScope2x');
    expect(result).toHaveProperty('gyroScope4x');
    expect(result).toHaveProperty('gyroSniper');
    expect(result).toHaveProperty('gyroFreeView');
  });

  it('gyro values are roughly 50% of sensitivity for LCD/LOW', () => {
    const result = generateGyroscope(baseSensitivity, lcdLow);
    // Base factor is 0.50, no bonuses for LCD/LOW
    // redPoint = 55 * 0.50 + 0 (adjustment) = 27.5 → round → 28
    expect(result.gyroRedPoint).toBe(28);
  });

  it('AMOLED/GAMING gets higher gyro values', () => {
    const gaming = generateGyroscope(baseSensitivity, amoledGaming);
    const low = generateGyroscope(baseSensitivity, lcdLow);
    expect(gaming.gyroGeneral).toBeGreaterThan(low.gyroGeneral);
  });

  it('all values clamped 1-100', () => {
    const result = generateGyroscope(baseSensitivity, amoledGaming);
    Object.values(result).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('sniper gyro is lowest due to -5 adjustment', () => {
    const result = generateGyroscope(baseSensitivity, lcdLow);
    expect(result.gyroSniper).toBeLessThan(result.gyroGeneral);
  });
});
