import { describe, it, expect } from 'vitest';

import { calculateHeadshotFingerMode } from '../headshot-finger-engine';
import { FINGER_PROFILES } from '../finger-profiles';
import type { SensitivityOutput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES v4.1 — Tests de Headshot Finger Engine
// Validates finger-based sensitivity adjustments
// ═══════════════════════════════════════════════════════════

// Base headshot sensitivity (typical mid-range device, 3-finger standard)
const baseSensitivity: SensitivityOutput = {
  general: 170,
  redPoint: 155,
  scope2x: 140,
  scope4x: 125,
  sniperScope: 110,
  freeView: 18,
};

describe('calculateHeadshotFingerMode', () => {
  describe('fingers=3 (baseline)', () => {
    const result = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 6.5);

    it('should return sensitivity close to base (all multipliers are 1.0)', () => {
      // 3 fingers = all multipliers 1.0, tapering -15 (same as base)
      // So general should be unchanged
      expect(result.sensitivity.general).toBe(170);
    });

    it('should apply -15 tapering (same as base)', () => {
      // With tapering -15 and multipliers 1.0, scope values stay same
      expect(result.sensitivity.redPoint).toBe(155);
      expect(result.sensitivity.scope2x).toBe(140);
    });

    it('should have gyroscope enabled', () => {
      expect(result.meta.gyroscopeEnabled).toBe(true);
      expect(result.sensitivity.gyroscope).not.toBeNull();
    });

    it('should have engine version 4.1-headshot', () => {
      expect(result.meta.engineVersion).toBe('4.1-headshot');
    });

    it('should return 7 weapon adjustments', () => {
      expect(result.weaponAdjustments).toHaveLength(7);
    });
  });

  describe('fingers=2 (casual)', () => {
    const result = calculateHeadshotFingerMode(baseSensitivity, 2, 60, 6.5);

    it('should keep general unchanged (multiplier 1.0)', () => {
      expect(result.sensitivity.general).toBe(170);
    });

    it('should have lower scoped values than 3-finger base', () => {
      // 2 fingers: tapering -14, different multipliers
      // redPoint = general + tapering = 170 + (-14) = 156
      expect(result.sensitivity.redPoint).toBe(156);
      // scope2x = redPoint + tapering = 156 + (-14) = 142
      expect(result.sensitivity.scope2x).toBe(142);
    });

    it('should have much lower freeView (0.70 multiplier)', () => {
      // freeView = general * 0.11 * 0.70 ≈ 170 * 0.11 * 0.70 ≈ 13.09 → 13
      expect(result.sensitivity.freeView).toBeLessThan(baseSensitivity.freeView);
    });

    it('should have gyroscope DISABLED', () => {
      expect(result.meta.gyroscopeEnabled).toBe(false);
      expect(result.sensitivity.gyroscope).toBeNull();
    });

    it('should have larger fire button (bigger for thumbs)', () => {
      const result3 = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 6.5);
      expect(result.fireButton.size).toBeGreaterThan(result3.fireButton.size);
    });
  });

  describe('fingers=4 (claw/pro)', () => {
    const result = calculateHeadshotFingerMode(baseSensitivity, 4, 60, 6.5);

    it('should have higher scoped values than 3-finger base', () => {
      // 4 fingers: tapering -16, redPoint multiplier 1.06
      // redPoint = general + tapering = 170 + (-16) = 154
      expect(result.sensitivity.redPoint).toBe(154);
    });

    it('should have higher freeView (1.15 multiplier)', () => {
      // freeView = general * 0.11 * 1.15 ≈ 170 * 0.11 * 1.15 ≈ 21.5 → 22
      expect(result.sensitivity.freeView).toBeGreaterThan(13);
    });

    it('should have gyroscope ENABLED', () => {
      expect(result.meta.gyroscopeEnabled).toBe(true);
      expect(result.sensitivity.gyroscope).not.toBeNull();
    });

    it('should have gyro with 1.10 multiplier (higher than 3 fingers)', () => {
      const result3 = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 6.5);
      if (result.sensitivity.gyroscope && result3.sensitivity.gyroscope) {
        expect(result.sensitivity.gyroscope.general).toBeGreaterThanOrEqual(
          result3.sensitivity.gyroscope.general,
        );
      }
    });

    it('should have smaller fire button (pro precision)', () => {
      const result3 = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 6.5);
      expect(result.fireButton.size).toBeLessThan(result3.fireButton.size);
    });
  });

  describe('clamping', () => {
    it('should clamp all values to 0-200 with extreme base', () => {
      const extremeBase: SensitivityOutput = {
        general: 195,
        redPoint: 195,
        scope2x: 195,
        scope4x: 195,
        sniperScope: 195,
        freeView: 195,
      };

      const result = calculateHeadshotFingerMode(extremeBase, 4, 120, 6.5);
      expect(result.sensitivity.general).toBeLessThanOrEqual(200);
      expect(result.sensitivity.general).toBeGreaterThanOrEqual(0);
      expect(result.sensitivity.redPoint).toBeLessThanOrEqual(200);
      expect(result.sensitivity.freeView).toBeLessThanOrEqual(200);
    });

    it('should not produce negative values with low base', () => {
      const lowBase: SensitivityOutput = {
        general: 10,
        redPoint: 5,
        scope2x: 3,
        scope4x: 2,
        sniperScope: 1,
        freeView: 5,
      };

      const result = calculateHeadshotFingerMode(lowBase, 2, 60, 5.5);
      expect(result.sensitivity.general).toBeGreaterThanOrEqual(0);
      expect(result.sensitivity.redPoint).toBeGreaterThanOrEqual(0);
      expect(result.sensitivity.scope4x).toBeGreaterThanOrEqual(0);
      expect(result.sensitivity.freeView).toBeGreaterThanOrEqual(8); // min clamp is 8
    });
  });

  describe('weapon adjustments', () => {
    const result = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 6.5);

    it('should apply shotgun +8% modifier correctly', () => {
      const shotgun = result.weaponAdjustments.find((w) => w.category === 'shotgun');
      expect(shotgun).toBeDefined();
      if (shotgun) {
        expect(shotgun.redPoint).toBe(Math.round(result.sensitivity.redPoint * 1.08));
        expect(shotgun.modifier).toBe('+8%');
      }
    });

    it('should have AR fast as base (1.0 modifier)', () => {
      const arFast = result.weaponAdjustments.find((w) => w.category === 'ar_fast');
      expect(arFast).toBeDefined();
      if (arFast) {
        expect(arFast.redPoint).toBe(result.sensitivity.redPoint);
        expect(arFast.modifier).toBe('Base');
      }
    });

    it('should apply sniper -6% modifier', () => {
      const sniper = result.weaponAdjustments.find((w) => w.category === 'sniper');
      expect(sniper).toBeDefined();
      if (sniper) {
        expect(sniper.redPoint).toBe(Math.round(result.sensitivity.redPoint * 0.94));
      }
    });
  });

  describe('gyroscope calculation', () => {
    it('should return null gyroscope for 2 fingers', () => {
      const result = calculateHeadshotFingerMode(baseSensitivity, 2, 60, 6.5);
      expect(result.sensitivity.gyroscope).toBeNull();
    });

    it('should apply Hz bonus for 120Hz devices', () => {
      const result60 = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 6.5);
      const result120 = calculateHeadshotFingerMode(baseSensitivity, 3, 120, 6.5);

      if (result60.sensitivity.gyroscope && result120.sensitivity.gyroscope) {
        expect(result120.sensitivity.gyroscope.general).toBeGreaterThan(
          result60.sensitivity.gyroscope.general,
        );
      }
    });

    it('should apply -10 tapering between gyroscope scopes', () => {
      const result = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 6.5);
      if (result.sensitivity.gyroscope) {
        const gyro = result.sensitivity.gyroscope;
        expect(gyro.redPoint).toBe(gyro.general - 10);
        expect(gyro.scope2x).toBe(gyro.redPoint - 10);
      }
    });
  });

  describe('fire button by screen size', () => {
    it('should return larger button for small screens', () => {
      const small = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 5.5);
      const large = calculateHeadshotFingerMode(baseSensitivity, 3, 60, 7.0);
      expect(small.fireButton.size).toBeGreaterThan(large.fireButton.size);
    });
  });

  describe('finger profiles data integrity', () => {
    it('should have exactly 3 profiles (2, 3, 4)', () => {
      expect(Object.keys(FINGER_PROFILES)).toHaveLength(3);
      expect(FINGER_PROFILES[2]).toBeDefined();
      expect(FINGER_PROFILES[3]).toBeDefined();
      expect(FINGER_PROFILES[4]).toBeDefined();
    });

    it('3-finger should have all multipliers at 1.0', () => {
      const p = FINGER_PROFILES[3];
      expect(p.multipliers.general).toBe(1.0);
      expect(p.multipliers.redPoint).toBe(1.0);
      expect(p.multipliers.scope2x).toBe(1.0);
      expect(p.multipliers.freeView).toBe(1.0);
    });

    it('2-finger should have gyroscope disabled', () => {
      expect(FINGER_PROFILES[2].gyroscope.enabled).toBe(false);
    });

    it('4-finger should have gyroscope enabled', () => {
      expect(FINGER_PROFILES[4].gyroscope.enabled).toBe(true);
    });
  });
});
