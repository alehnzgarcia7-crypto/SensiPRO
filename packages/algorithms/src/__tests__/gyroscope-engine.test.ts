import { describe, it, expect } from 'vitest';

import { generateGyroscope } from '../gyroscope-engine';
import type { SensitivityOutput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES GYROSCOPE ENGINE v4.0 — Tests
// Rango: 0-100 (giroscopio Free Fire, pros usan 20-40)
// Factores recalibrados para sensitivity engine v4.0
// Updated 2026-02-27: Input values adjusted for screen size granularity fix.
// See ALGORITHM-AUDIT.md
// ═══════════════════════════════════════════════════════════

// Valores v4.0 para dispositivo medio (DPI 395, 4GB, 60Hz, 6.5")
// Post-audit: screen 6.5" now gives -1 (was -2), so general goes from 179→178
const midSensitivity: SensitivityOutput = {
  general: 178,
  redPoint: 163,
  scope2x: 148,
  scope4x: 133,
  sniperScope: 118,
  freeView: 19,
};

// Valores v4.0 para Samsung A13 (DPI 270, 4GB, 60Hz, 6.6")
// Post-audit: screen 6.6" now gives -1 (was -2), so general goes from 187→188
const lowEndSensitivity: SensitivityOutput = {
  general: 188,
  redPoint: 173,
  scope2x: 158,
  scope4x: 143,
  sniperScope: 128,
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
    // gyroGeneral: 178 * 0.17 = 30.26 → 30
    expect(result.gyroGeneral).toBeGreaterThanOrEqual(20);
    expect(result.gyroGeneral).toBeLessThanOrEqual(45);
    // gyroRedPoint: 163 * 0.19 = 30.97 → 31
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
    // gyroGeneral:   178 * 0.17 = 30.26 → 30
    expect(result.gyroGeneral).toBe(30);
    // gyroRedPoint:  163 * 0.19 = 30.97 → 31
    expect(result.gyroRedPoint).toBe(31);
    // gyroScope2x:   148 * 0.19 = 28.12 → 28
    expect(result.gyroScope2x).toBe(28);
    // gyroScope4x:   133 * 0.20 = 26.6 → 27
    expect(result.gyroScope4x).toBe(27);
    // gyroSniper:    118 * 0.20 = 23.6 → 24
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
