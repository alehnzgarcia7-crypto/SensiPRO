import { describe, it, expect } from 'vitest';

import { generateGyroscope } from '../gyroscope-engine';
import type { SensitivityOutput, DeviceSpecs } from '../types';

// Valores de sensibilidad en el nuevo rango 60-190
const baseSensitivity: SensitivityOutput = {
  general: 155,
  redPoint: 145,
  scope2x: 130,
  scope4x: 115,
  sniperScope: 100,
  freeView: 165,
};

const amoledGaming: DeviceSpecs = {
  screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING',
};

const lcdLow: DeviceSpecs = {
  screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW',
};

describe('generateGyroscope v2.0', () => {
  it('returns all 6 gyro fields', () => {
    const result = generateGyroscope(baseSensitivity, amoledGaming);
    expect(result).toHaveProperty('gyroGeneral');
    expect(result).toHaveProperty('gyroRedPoint');
    expect(result).toHaveProperty('gyroScope2x');
    expect(result).toHaveProperty('gyroScope4x');
    expect(result).toHaveProperty('gyroSniper');
    expect(result).toHaveProperty('gyroFreeView');
  });

  it('gyro values use 0.35 base factor for LCD/LOW', () => {
    const result = generateGyroscope(baseSensitivity, lcdLow);
    // Base factor is 0.35, no bonuses for LCD/LOW
    // redPoint = 145 * 0.35 + 0 = 50.75 → clamped to 60 (min)
    expect(result.gyroRedPoint).toBe(60);
  });

  it('AMOLED/GAMING gets higher gyro values', () => {
    const gaming = generateGyroscope(baseSensitivity, amoledGaming);
    const low = generateGyroscope(baseSensitivity, lcdLow);
    expect(gaming.gyroGeneral).toBeGreaterThan(low.gyroGeneral);
  });

  it('all values clamped 60-140', () => {
    const result = generateGyroscope(baseSensitivity, amoledGaming);
    Object.values(result).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(60);
      expect(v).toBeLessThanOrEqual(140);
    });
  });

  it('sniper gyro is lowest due to -10 adjustment', () => {
    const result = generateGyroscope(baseSensitivity, lcdLow);
    expect(result.gyroSniper).toBeLessThanOrEqual(result.gyroGeneral);
  });

  it('freeView gyro benefits from +6 adjustment', () => {
    const result = generateGyroscope(baseSensitivity, amoledGaming);
    // freeView has highest base (165) + adjustment (+6) = should be high
    expect(result.gyroFreeView).toBeGreaterThanOrEqual(result.gyroScope4x);
  });
});
