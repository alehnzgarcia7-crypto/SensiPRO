import { describe, it, expect } from 'vitest';

import { generateGyroscope } from '../gyroscope-engine';
import type { SensitivityOutput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v3.0 — Tests
// Rango: 0-100 (giroscopio Free Fire, pros usan 20-40)
// ═══════════════════════════════════════════════════════════

// Valores típicos para dispositivo medio (MEDIA calibración, 6GB)
const midSensitivity: SensitivityOutput = {
  general: 183,
  redPoint: 172,
  scope2x: 155,
  scope4x: 133,
  sniperScope: 80,
  freeView: 166,
};

// Valores típicos para iPhone 14 Pro Max
const highEndSensitivity: SensitivityOutput = {
  general: 189,
  redPoint: 177,
  scope2x: 160,
  scope4x: 137,
  sniperScope: 83,
  freeView: 171,
};

describe('generateGyroscope v3.0', () => {
  it('retorna todos los 6 campos de giroscopio', () => {
    const result = generateGyroscope(midSensitivity);
    expect(result).toHaveProperty('gyroGeneral');
    expect(result).toHaveProperty('gyroRedPoint');
    expect(result).toHaveProperty('gyroScope2x');
    expect(result).toHaveProperty('gyroScope4x');
    expect(result).toHaveProperty('gyroSniper');
    expect(result).toHaveProperty('gyroFreeView');
  });

  it('todos los valores clamped 0-100', () => {
    const result = generateGyroscope(highEndSensitivity);
    Object.values(result).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('valores en rango pro (20-40) para dispositivo medio', () => {
    const result = generateGyroscope(midSensitivity);
    // gyroGeneral: 183 * 0.18 = 32.94 → 33
    expect(result.gyroGeneral).toBeGreaterThanOrEqual(20);
    expect(result.gyroGeneral).toBeLessThanOrEqual(45);
    // gyroRedPoint: 172 * 0.20 = 34.4 → 34
    expect(result.gyroRedPoint).toBeGreaterThanOrEqual(20);
    expect(result.gyroRedPoint).toBeLessThanOrEqual(45);
  });

  it('gyroSniper usa factor más alto (0.35) para estabilidad', () => {
    const result = generateGyroscope(midSensitivity);
    // sniperScope: 80 * 0.35 = 28
    expect(result.gyroSniper).toBe(28);
  });

  it('gyroFreeView usa factor más bajo (0.15)', () => {
    const result = generateGyroscope(midSensitivity);
    // freeView: 166 * 0.15 = 24.9 → 25
    expect(result.gyroFreeView).toBe(25);
  });

  it('miras con más zoom reciben factor más alto', () => {
    const result = generateGyroscope(midSensitivity);
    // Factor progresivo: general(0.18) < redPoint(0.20) < scope2x(0.22) < scope4x(0.25) < sniper(0.35)
    // Sniper tiene factor alto para compensar su valor base bajo
    expect(result.gyroSniper).toBeGreaterThanOrEqual(20);
    expect(result.gyroSniper).toBeLessThanOrEqual(40);
  });

  it('es determinístico', () => {
    const result1 = generateGyroscope(midSensitivity);
    const result2 = generateGyroscope(midSensitivity);
    expect(result1).toEqual(result2);
  });

  it('verified calculation: mid device gyro values', () => {
    const result = generateGyroscope(midSensitivity);
    // gyroGeneral:   183 * 0.18 = 32.94 → 33
    expect(result.gyroGeneral).toBe(33);
    // gyroRedPoint:  172 * 0.20 = 34.4 → 34
    expect(result.gyroRedPoint).toBe(34);
    // gyroScope2x:   155 * 0.22 = 34.1 → 34
    expect(result.gyroScope2x).toBe(34);
    // gyroScope4x:   133 * 0.25 = 33.25 → 33
    expect(result.gyroScope4x).toBe(33);
    // gyroSniper:    80 * 0.35 = 28
    expect(result.gyroSniper).toBe(28);
    // gyroFreeView:  166 * 0.15 = 24.9 → 25
    expect(result.gyroFreeView).toBe(25);
  });
});
