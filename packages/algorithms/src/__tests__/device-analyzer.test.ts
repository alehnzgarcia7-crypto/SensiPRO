import { describe, it, expect } from 'vitest';

import {
  calculatePerformanceScore,
  autoDetectTier,
  analyzeDeviceSpecs,
} from '../device-analyzer';
import type { DeviceSpecs } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES-104 Device Specs Analyzer Tests
// ═══════════════════════════════════════════════════════════

const GAMING_DEVICE: DeviceSpecs = {
  screenHz: 120,
  screenSize: 6.7,
  ramGb: 12,
  panelType: 'AMOLED',
  tier: 'GAMING',
};

const MID_DEVICE: DeviceSpecs = {
  screenHz: 90,
  screenSize: 6.5,
  ramGb: 6,
  panelType: 'IPS',
  tier: 'MID',
};

const LOW_DEVICE: DeviceSpecs = {
  screenHz: 60,
  screenSize: 6.5,
  ramGb: 2,
  panelType: 'LCD',
  tier: 'LOW',
};

const ULTRA_DEVICE: DeviceSpecs = {
  screenHz: 144,
  screenSize: 6.8,
  ramGb: 16,
  panelType: 'LTPO',
  tier: 'GAMING',
};

// ── calculatePerformanceScore ─────────────────────────────

describe('calculatePerformanceScore', () => {
  it('gaming AMOLED device scores 80+', () => {
    const score = calculatePerformanceScore(GAMING_DEVICE);
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('low LCD device scores below 30', () => {
    const score = calculatePerformanceScore(LOW_DEVICE);
    expect(score).toBeLessThan(30);
  });

  it('score is always between 0 and 100', () => {
    const score = calculatePerformanceScore(MID_DEVICE);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('max specs device does not exceed 100', () => {
    const score = calculatePerformanceScore(ULTRA_DEVICE);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('GAMING + AMOLED/OLED gets combo bonus', () => {
    const withAmoled = calculatePerformanceScore({
      ...GAMING_DEVICE,
      panelType: 'AMOLED',
    });
    const withLcd = calculatePerformanceScore({
      ...GAMING_DEVICE,
      panelType: 'LCD',
    });
    // AMOLED score (20) + combo (5) vs LCD score (5) → net +20
    expect(withAmoled).toBeGreaterThan(withLcd);
  });

  it('higher Hz gives higher score', () => {
    const hz60 = calculatePerformanceScore({ ...MID_DEVICE, screenHz: 60 });
    const hz120 = calculatePerformanceScore({ ...MID_DEVICE, screenHz: 120 });
    expect(hz120).toBeGreaterThan(hz60);
  });

  it('higher RAM gives higher score', () => {
    const ram2 = calculatePerformanceScore({ ...MID_DEVICE, ramGb: 2 });
    const ram12 = calculatePerformanceScore({ ...MID_DEVICE, ramGb: 12 });
    expect(ram12).toBeGreaterThan(ram2);
  });
});

// ── autoDetectTier ────────────────────────────────────────

describe('autoDetectTier', () => {
  it('detects GAMING for 120Hz + 8GB + AMOLED', () => {
    expect(
      autoDetectTier({ screenHz: 120, screenSize: 6.7, ramGb: 8, panelType: 'AMOLED' }),
    ).toBe('GAMING');
  });

  it('detects GAMING for 144Hz + 12GB + LTPO', () => {
    expect(
      autoDetectTier({ screenHz: 144, screenSize: 6.8, ramGb: 12, panelType: 'LTPO' }),
    ).toBe('GAMING');
  });

  it('detects ULTRA for 120Hz + 8GB + IPS (no premium panel)', () => {
    expect(
      autoDetectTier({ screenHz: 120, screenSize: 6.5, ramGb: 8, panelType: 'IPS' }),
    ).toBe('ULTRA');
  });

  it('detects HIGH for 90Hz + 6GB + AMOLED', () => {
    expect(
      autoDetectTier({ screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED' }),
    ).toBe('HIGH');
  });

  it('detects MID for 60Hz + 4GB + LCD', () => {
    expect(
      autoDetectTier({ screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'LCD' }),
    ).toBe('MID');
  });

  it('detects LOW for 60Hz + 2GB', () => {
    expect(
      autoDetectTier({ screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD' }),
    ).toBe('LOW');
  });
});

// ── analyzeDeviceSpecs ────────────────────────────────────

describe('analyzeDeviceSpecs', () => {
  it('gaming device gets Excelente rating', () => {
    const analysis = analyzeDeviceSpecs(GAMING_DEVICE);
    expect(analysis.rating).toBe('Excelente');
    expect(analysis.strengths.length).toBeGreaterThan(0);
    expect(analysis.gamingVerdict).toContain('GAMING');
    expect(analysis.summary).toContain('Excelente');
  });

  it('low end device gets Básico rating', () => {
    const analysis = analyzeDeviceSpecs(LOW_DEVICE);
    expect(analysis.rating).toBe('Básico');
    expect(analysis.limitations.length).toBeGreaterThan(0);
    expect(analysis.gamingVerdict).toContain('limitaciones');
  });

  it('mid device gets Bueno or Muy Bueno rating', () => {
    const analysis = analyzeDeviceSpecs(MID_DEVICE);
    expect(['Bueno', 'Muy Bueno']).toContain(analysis.rating);
  });

  it('returns tier from specs', () => {
    const analysis = analyzeDeviceSpecs(GAMING_DEVICE);
    expect(analysis.tier).toBe('GAMING');
  });

  it('summary includes Hz, RAM, and panel type', () => {
    const analysis = analyzeDeviceSpecs(GAMING_DEVICE);
    expect(analysis.summary).toContain('120Hz');
    expect(analysis.summary).toContain('12GB');
    expect(analysis.summary).toContain('AMOLED');
  });

  it('large screen is listed as strength', () => {
    const analysis = analyzeDeviceSpecs({ ...MID_DEVICE, screenSize: 6.8 });
    const hasScreenStrength = analysis.strengths.some((s) => s.includes('6.8"'));
    expect(hasScreenStrength).toBe(true);
  });

  it('small screen is listed as limitation', () => {
    const analysis = analyzeDeviceSpecs({ ...MID_DEVICE, screenSize: 5.0 });
    const hasScreenLimit = analysis.limitations.some((s) => s.includes('5"'));
    expect(hasScreenLimit).toBe(true);
  });

  it('low RAM is listed as limitation', () => {
    const analysis = analyzeDeviceSpecs(LOW_DEVICE);
    const hasRamLimit = analysis.limitations.some((s) => s.includes('RAM'));
    expect(hasRamLimit).toBe(true);
  });
});
