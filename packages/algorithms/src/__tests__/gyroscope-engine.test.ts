import { describe, it, expect } from 'vitest';

import { generateGyroscope } from '../gyroscope-engine';
import type { SensitivityOutput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v4.0 — Tests
// Rango: 0-100 (giroscopio Free Fire, pros usan 20-40)
// Factores recalibrados para sensitivity engine v4.0
// ═══════════════════════════════════════════════════════════

// Valores v4.0 para dispositivo medio (DPI 395, 4GB, 60Hz, 6.5")
const midSensitivity: SensitivityOutput = {
  general: 179,
  redPoint: 164,
  scope2x: 149,
  scope4x: 134,
  sniperScope: 119,
  freeView: 19,
};

// Valores v4.0 para Samsung A13 (DPI 270, 4GB, 60Hz, 6.6")
const lowEndSensitivity: SensitivityOutput = {
  general: 187,
  redPoint: 172,
  scope2x: 157,
  scope4x: 142,
  sniperScope: 127,
  freeView: 20,
};

describe('generateGyroscope v4.0', () => {
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
    const result = generateGyroscope(midSensitivity);
    Object.values(result).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('valores en rango razonable para dispositivo medio', () => {
    const result = generateGyroscope(midSensitivity);
    // gyroGeneral: 179 * 0.17 = 30.43 → 30
    expect(result.gyroGeneral).toBeGreaterThanOrEqual(20);
    expect(result.gyroGeneral).toBeLessThanOrEqual(45);
    // gyroRedPoint: 164 * 0.19 = 31.16 → 31
    expect(result.gyroRedPoint).toBeGreaterThanOrEqual(20);
    expect(result.gyroRedPoint).toBeLessThanOrEqual(45);
  });

  it('gyroFreeView derivado de gyroGeneral (no de freeView directo)', () => {
    const result = generateGyroscope(midSensitivity);
    // gyroFreeView = round(gyroGeneral * 0.55), clamped 5-25
    const expected = Math.round(result.gyroGeneral * 0.55);
    expect(result.gyroFreeView).toBe(Math.max(5, Math.min(25, expected)));
  });

  it('scopes con más zoom producen valores razonables', () => {
    const result = generateGyroscope(midSensitivity);
    // Los factores suben ligeramente para compensar valores base más bajos
    expect(result.gyroSniper).toBeGreaterThanOrEqual(15);
    expect(result.gyroSniper).toBeLessThanOrEqual(40);
  });

  it('es determinístico', () => {
    const result1 = generateGyroscope(midSensitivity);
    const result2 = generateGyroscope(midSensitivity);
    expect(result1).toEqual(result2);
  });

  it('verified calculation: mid device gyro values', () => {
    const result = generateGyroscope(midSensitivity);
    // gyroGeneral:   179 * 0.17 = 30.43 → 30
    expect(result.gyroGeneral).toBe(30);
    // gyroRedPoint:  164 * 0.19 = 31.16 → 31
    expect(result.gyroRedPoint).toBe(31);
    // gyroScope2x:   149 * 0.19 = 28.31 → 28
    expect(result.gyroScope2x).toBe(28);
    // gyroScope4x:   134 * 0.20 = 26.8 → 27
    expect(result.gyroScope4x).toBe(27);
    // gyroSniper:    119 * 0.20 = 23.8 → 24
    expect(result.gyroSniper).toBe(24);
    // gyroFreeView:  round(30 * 0.55) = round(16.5) = 17, clamped [5,25] → 17
    expect(result.gyroFreeView).toBe(17);
  });

  it('low-end device produces higher gyro (compensating lower response)', () => {
    const midResult = generateGyroscope(midSensitivity);
    const lowResult = generateGyroscope(lowEndSensitivity);
    // Low-end has higher sensitivity → higher gyro general
    expect(lowResult.gyroGeneral).toBeGreaterThanOrEqual(midResult.gyroGeneral);
  });
});
