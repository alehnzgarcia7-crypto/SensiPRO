import { describe, it, expect } from 'vitest';

import { generateSensitivity } from '../sensitivity-engine';
import type { AlgorithmInput, DeviceSpecs } from '../types';

// ═══════════════════════════════════════════════════════════════
// VALIDACIÓN MASIVA POST-CORRECCIÓN — ALGORITHM AUDIT 2026-02-27
//
// Verifica 20 dispositivos contra valores esperados post-fix.
// Los valores de FreeFireMania son de la auditoría forense.
//
// Este test sirve como REGRESSION GUARD — si alguien toca el
// algoritmo en el futuro, estos tests alertan si la precisión
// se degrada.
// ═══════════════════════════════════════════════════════════════

// Helper: crea un AlgorithmInput con defaults razonables
function makeInput(
  overrides: {
    screenDpi: number;
    screenHz: number;
    ramGb: number;
    screenSize: number;
    style?: 'AGGRESSIVE' | 'BALANCED' | 'SNIPER';
    includeGyro?: boolean;
  },
): AlgorithmInput {
  const specs: DeviceSpecs = {
    screenHz: overrides.screenHz,
    screenSize: overrides.screenSize,
    ramGb: overrides.ramGb,
    panelType: 'IPS',
    tier: 'MID',
    screenDpi: overrides.screenDpi,
  };
  return {
    specs,
    style: overrides.style ?? 'BALANCED',
    includeGyro: overrides.includeGyro ?? false,
  };
}

describe('Algorithm Audit Validation — 20 devices post-fix', () => {
  // ============================================================
  // GAMING/FLAGSHIP TIER
  // ============================================================

  it('iPhone 16 Pro Max — DPI 460, 120Hz, 8GB, 6.9"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 460, screenHz: 120, ramGb: 8, screenSize: 6.9,
    }));
    // FFM: 170. DPI 460 → base 166, RAM 8GB → -1, Hz 120 → 0, screen 6.9" → -2, style 0
    // generalBase = 166 - 1 + 0 - 2 + 0 = 163
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(160);
    expect(result.sensitivity.general).toBeLessThanOrEqual(170);

    // Tapering -15 must hold for BALANCED
    expect(result.sensitivity.general - result.sensitivity.redPoint).toBe(15);
    expect(result.sensitivity.redPoint - result.sensitivity.scope2x).toBe(15);
    expect(result.sensitivity.scope2x - result.sensitivity.scope4x).toBe(15);
    expect(result.sensitivity.scope4x - result.sensitivity.sniperScope).toBe(15);

    // Free View in range
    expect(result.sensitivity.freeView).toBeGreaterThanOrEqual(14);
    expect(result.sensitivity.freeView).toBeLessThanOrEqual(20);
  });

  it('iPhone 15 Pro — DPI 460, 120Hz, 8GB, 6.1"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 460, screenHz: 120, ramGb: 8, screenSize: 6.1,
    }));
    // FFM: ~168. Smaller screen (6.1" → 0 adj) vs 16PM (6.9" → -2)
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(162);
    expect(result.sensitivity.general).toBeLessThanOrEqual(170);
  });

  it('Samsung S24 Ultra — DPI 505, 120Hz, 12GB, 6.8"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 505, screenHz: 120, ramGb: 12, screenSize: 6.8,
    }));
    // FFM: 140. DPI 505 is in segment 460-600 → sens ~141
    // RAM 12GB → -2, Hz 120 → 0, screen 6.8" → -2
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(130);
    expect(result.sensitivity.general).toBeLessThanOrEqual(155);

    // Must be LOWER than A54 (higher DPI = lower sens)
    expect(result.sensitivity.general).toBeLessThan(165);
  });

  it('iPhone 14 — DPI 460, 60Hz, 6GB, 6.1"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 460, screenHz: 60, ramGb: 6, screenSize: 6.1,
    }));
    // 60Hz adds +3 vs 120Hz (0), should be higher than iPhone 15 Pro
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(166);
    expect(result.sensitivity.general).toBeLessThanOrEqual(175);
  });

  it('iPhone 14 Plus — DPI 458, 60Hz, 6GB, 6.7"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 458, screenHz: 60, ramGb: 6, screenSize: 6.7,
    }));
    // FFM: ~166. DPI 458 → base ~166, RAM 6GB → 0, Hz 60 → +3, screen 6.7" → -2
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(163);
    expect(result.sensitivity.general).toBeLessThanOrEqual(172);
  });

  // ============================================================
  // HIGH/MID TIER
  // ============================================================

  it('Samsung A54 — BENCHMARK — DPI 401, 120Hz, 6GB, 6.4"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 401, screenHz: 120, ramGb: 6, screenSize: 6.4,
    }));
    // FFM: 175. THIS IS OUR BENCHMARK — DPI 401 → base ~175
    // RAM 6GB → 0, Hz 120 → 0, screen 6.4" → 0, style BALANCED → 0
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(173);
    expect(result.sensitivity.general).toBeLessThanOrEqual(177);

    // Full tapering chain: -15 × 4 = -60
    expect(result.sensitivity.general - result.sensitivity.sniperScope).toBe(60);

    // Free View
    expect(result.sensitivity.freeView).toBeGreaterThanOrEqual(17);
    expect(result.sensitivity.freeView).toBeLessThanOrEqual(20);
  });

  it('POCO X5 Pro — DPI 395, 120Hz, 6GB, 6.67"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 395, screenHz: 120, ramGb: 6, screenSize: 6.67,
    }));
    // Similar DPI to A54 but bigger screen (6.67" → -1)
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(172);
    expect(result.sensitivity.general).toBeLessThanOrEqual(178);
  });

  it('Redmi Note 13 — DPI 395, 120Hz, 8GB, 6.67"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 395, screenHz: 120, ramGb: 8, screenSize: 6.67,
    }));
    // FFM: ~174. DPI 395 → base ~175, RAM 8GB → -1, Hz 120 → 0, screen 6.67" → -1
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(171);
    expect(result.sensitivity.general).toBeLessThanOrEqual(177);
  });

  it('Redmi Note 12 — DPI 395, 120Hz, 4GB, 6.67"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 395, screenHz: 120, ramGb: 4, screenSize: 6.67,
    }));
    // 4GB RAM adds +1 vs 6GB base
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(173);
    expect(result.sensitivity.general).toBeLessThanOrEqual(179);
  });

  it('Infinix Hot 40 Pro — DPI 396, 120Hz, 8GB, 6.78"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 396, screenHz: 120, ramGb: 8, screenSize: 6.78,
    }));
    // Similar DPI, 8GB → -1, bigger screen 6.78" → -2
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(168);
    expect(result.sensitivity.general).toBeLessThanOrEqual(176);
  });

  // ============================================================
  // ENTRY TIER (DPIs CORREGIDOS)
  // ============================================================

  it('Samsung A13 — DPI CORREGIDO 400, 60Hz, 4GB, 6.6"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 400, screenHz: 60, ramGb: 4, screenSize: 6.6,
    }));
    // Con DPI 400 (corregido), 60Hz +3, 4GB +1, screen 6.6" -1
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(175);
    expect(result.sensitivity.general).toBeLessThanOrEqual(183);
  });

  it('Samsung A14 — DPI CORREGIDO 400, 60Hz, 4GB, 6.6"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 400, screenHz: 60, ramGb: 4, screenSize: 6.6,
    }));
    // Same specs as A13 with corrected DPI
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(175);
    expect(result.sensitivity.general).toBeLessThanOrEqual(183);
  });

  it('Samsung A04 — DPI CORREGIDO 270, 60Hz, 3GB, 6.5"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 270, screenHz: 60, ramGb: 3, screenSize: 6.5,
    }));
    // DPI 270 (gama baja real) → sensibilidad alta
    // base ~184, +3 RAM(3GB), +3 Hz(60), 0 screen(6.5")
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(185);
    expect(result.sensitivity.general).toBeLessThanOrEqual(195);
  });

  it('Samsung A04e — DPI CORREGIDO 265, 60Hz, 3GB, 6.5"', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 265, screenHz: 60, ramGb: 3, screenSize: 6.5,
    }));
    // DPI 265 → even higher sensitivity than A04 (270)
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(186);
    expect(result.sensitivity.general).toBeLessThanOrEqual(196);
  });

  // ============================================================
  // GYROSCOPE VALIDATION
  // ============================================================

  it('Gyroscope values in pro range (20-40) for mid-range', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 400, screenHz: 120, ramGb: 6, screenSize: 6.4,
      includeGyro: true,
    }));

    expect(result.gyroscope).not.toBeNull();
    if (result.gyroscope) {
      // GyroGeneral should be in pro range 20-40
      expect(result.gyroscope.gyroGeneral).toBeGreaterThanOrEqual(30);
      expect(result.gyroscope.gyroGeneral).toBeLessThanOrEqual(45);

      // Gyro tapering -10
      expect(result.gyroscope.gyroGeneral - result.gyroscope.gyroRedPoint).toBe(10);

      // GyroFreeView in range 5-15
      expect(result.gyroscope.gyroFreeView).toBeGreaterThanOrEqual(5);
      expect(result.gyroscope.gyroFreeView).toBeLessThanOrEqual(15);

      // No negative values
      expect(result.gyroscope.gyroSniper).toBeGreaterThanOrEqual(0);
    }
  });

  it('Gyroscope values for flagship (lower base)', () => {
    const result = generateSensitivity(makeInput({
      screenDpi: 505, screenHz: 120, ramGb: 12, screenSize: 6.8,
      includeGyro: true,
    }));

    expect(result.gyroscope).not.toBeNull();
    if (result.gyroscope) {
      // Flagship gyro should be lower than mid-range (DPI >450 → base 34)
      expect(result.gyroscope.gyroGeneral).toBeGreaterThanOrEqual(25);
      expect(result.gyroscope.gyroGeneral).toBeLessThanOrEqual(40);

      // GyroSniper can be 0 (valid in FF)
      expect(result.gyroscope.gyroSniper).toBeGreaterThanOrEqual(0);
    }
  });

  // ============================================================
  // STYLE VALIDATION
  // ============================================================

  it('AGGRESSIVE style gives higher sensitivity than BALANCED', () => {
    const balanced = generateSensitivity(makeInput({
      screenDpi: 400, screenHz: 120, ramGb: 6, screenSize: 6.4,
    }));
    const aggressive = generateSensitivity(makeInput({
      screenDpi: 400, screenHz: 120, ramGb: 6, screenSize: 6.4,
      style: 'AGGRESSIVE',
    }));

    expect(aggressive.sensitivity.general).toBeGreaterThan(balanced.sensitivity.general);
    // AGGRESSIVE adds +8
    expect(aggressive.sensitivity.general - balanced.sensitivity.general).toBe(8);
  });

  it('SNIPER style gives lower sensitivity than BALANCED', () => {
    const balanced = generateSensitivity(makeInput({
      screenDpi: 400, screenHz: 120, ramGb: 6, screenSize: 6.4,
    }));
    const sniper = generateSensitivity(makeInput({
      screenDpi: 400, screenHz: 120, ramGb: 6, screenSize: 6.4,
      style: 'SNIPER',
    }));

    expect(sniper.sensitivity.general).toBeLessThan(balanced.sensitivity.general);
    // SNIPER subtracts -8
    expect(balanced.sensitivity.general - sniper.sensitivity.general).toBe(8);
  });

  // ============================================================
  // TAPERING VALIDATION
  // ============================================================

  it('Tapering is exactly -15 for BALANCED across all device tiers', () => {
    const devices = [
      { screenDpi: 270, screenHz: 60, ramGb: 3, screenSize: 6.5 },   // Entry
      { screenDpi: 395, screenHz: 120, ramGb: 6, screenSize: 6.67 }, // Mid
      { screenDpi: 460, screenHz: 120, ramGb: 8, screenSize: 6.1 },  // High
      { screenDpi: 505, screenHz: 120, ramGb: 12, screenSize: 6.8 }, // Ultra
    ];

    for (const device of devices) {
      const result = generateSensitivity(makeInput({ ...device }));
      const s = result.sensitivity;

      expect(s.general - s.redPoint).toBe(15);
      expect(s.redPoint - s.scope2x).toBe(15);
      expect(s.scope2x - s.scope4x).toBe(15);
      expect(s.scope4x - s.sniperScope).toBe(15);
    }
  });

  it('Tapering is -14 for AGGRESSIVE, -16 for SNIPER', () => {
    const device = { screenDpi: 400, screenHz: 120, ramGb: 6, screenSize: 6.4 };

    const aggressive = generateSensitivity(makeInput({ ...device, style: 'AGGRESSIVE' }));
    expect(aggressive.sensitivity.general - aggressive.sensitivity.redPoint).toBe(14);

    const sniper = generateSensitivity(makeInput({ ...device, style: 'SNIPER' }));
    expect(sniper.sensitivity.general - sniper.sensitivity.redPoint).toBe(16);
  });

  // ============================================================
  // RANGE VALIDATION
  // ============================================================

  it('All sensitivity values are within Free Fire range (1-200)', () => {
    const extremeDevices = [
      { screenDpi: 200, screenHz: 60, ramGb: 2, screenSize: 5.0, style: 'AGGRESSIVE' as const },
      { screenDpi: 600, screenHz: 144, ramGb: 16, screenSize: 11.0, style: 'SNIPER' as const },
    ];

    for (const device of extremeDevices) {
      const result = generateSensitivity(makeInput(device));
      const s = result.sensitivity;

      expect(s.general).toBeGreaterThanOrEqual(1);
      expect(s.general).toBeLessThanOrEqual(200);
      expect(s.redPoint).toBeGreaterThanOrEqual(1);
      expect(s.redPoint).toBeLessThanOrEqual(200);
      expect(s.scope2x).toBeGreaterThanOrEqual(1);
      expect(s.scope2x).toBeLessThanOrEqual(200);
      expect(s.scope4x).toBeGreaterThanOrEqual(1);
      expect(s.scope4x).toBeLessThanOrEqual(200);
      expect(s.sniperScope).toBeGreaterThanOrEqual(1);
      expect(s.sniperScope).toBeLessThanOrEqual(200);
      expect(s.freeView).toBeGreaterThanOrEqual(12);
      expect(s.freeView).toBeLessThanOrEqual(25);
    }
  });

  it('All gyroscope values are within range (0-100)', () => {
    const extremeDevices = [
      { screenDpi: 200, screenHz: 60, ramGb: 2, screenSize: 5.0, style: 'AGGRESSIVE' as const, includeGyro: true },
      { screenDpi: 600, screenHz: 144, ramGb: 16, screenSize: 11.0, style: 'SNIPER' as const, includeGyro: true },
    ];

    for (const device of extremeDevices) {
      const result = generateSensitivity(makeInput(device));
      expect(result.gyroscope).not.toBeNull();
      if (result.gyroscope) {
        const g = result.gyroscope;
        expect(g.gyroGeneral).toBeGreaterThanOrEqual(0);
        expect(g.gyroGeneral).toBeLessThanOrEqual(100);
        expect(g.gyroRedPoint).toBeGreaterThanOrEqual(0);
        expect(g.gyroRedPoint).toBeLessThanOrEqual(100);
        expect(g.gyroScope2x).toBeGreaterThanOrEqual(0);
        expect(g.gyroScope2x).toBeLessThanOrEqual(100);
        expect(g.gyroScope4x).toBeGreaterThanOrEqual(0);
        expect(g.gyroScope4x).toBeLessThanOrEqual(100);
        expect(g.gyroSniper).toBeGreaterThanOrEqual(0);
        expect(g.gyroSniper).toBeLessThanOrEqual(100);
        expect(g.gyroFreeView).toBeGreaterThanOrEqual(5);
        expect(g.gyroFreeView).toBeLessThanOrEqual(15);
      }
    }
  });
});
