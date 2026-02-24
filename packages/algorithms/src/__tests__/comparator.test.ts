import { describe, it, expect } from 'vitest';

import { compareDevices } from '../comparator';
import type { DeviceForComparison } from '../comparator';

const s24Ultra: DeviceForComparison = {
  id: 'a',
  brand: 'Samsung',
  model: 'Galaxy S24 Ultra',
  slug: 'samsung-galaxy-s24-ultra',
  specs: { screenHz: 120, screenSize: 6.8, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING' },
};

const a14: DeviceForComparison = {
  id: 'b',
  brand: 'Samsung',
  model: 'Galaxy A14',
  slug: 'samsung-galaxy-a14',
  specs: { screenHz: 90, screenSize: 6.6, ramGb: 4, panelType: 'LCD', tier: 'LOW' },
};

describe('compareDevices', () => {
  it('returns complete comparison structure', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED');
    expect(result.deviceA.info.brand).toBe('Samsung');
    expect(result.deviceB.info.brand).toBe('Samsung');
    expect(result.specsDiff.length).toBeGreaterThan(0);
    expect(result.sensitivityDiff.length).toBe(6);
    expect(result.overallWinner).toBeDefined();
    expect(result.verdict).toBeDefined();
  });

  it('S24 Ultra wins over A14', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED');
    expect(result.overallWinner).toBe('A');
    expect(result.deviceA.performanceScore).toBeGreaterThan(result.deviceB.performanceScore);
  });

  it('same device comparison shows TIE', () => {
    const result = compareDevices(s24Ultra, { ...s24Ultra, id: 'c' }, 'BALANCED');
    expect(result.overallWinner).toBe('TIE');
  });

  it('includes gyro when requested', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED', true);
    expect(result.gyroDiff).not.toBeNull();
    expect(result.gyroDiff!.length).toBe(6);
  });

  it('verdict mentions the winner', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED');
    expect(result.verdict).toContain('S24 Ultra');
  });

  it('gyroDiff is null when not requested', () => {
    const result = compareDevices(s24Ultra, a14, 'AGGRESSIVE');
    expect(result.gyroDiff).toBeNull();
  });

  it('specsDiff contains 4 fields', () => {
    const result = compareDevices(s24Ultra, a14, 'SNIPER');
    expect(result.specsDiff.length).toBe(4);
    const labels = result.specsDiff.map((f) => f.label);
    expect(labels).toContain('Refresh Rate (Hz)');
    expect(labels).toContain('RAM (GB)');
    expect(labels).toContain('Performance Score');
  });

  it('each comparison field has valid diff values', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED');
    for (const field of result.sensitivityDiff) {
      expect(field.diff).toBeGreaterThanOrEqual(0);
      expect(field.diffPercent).toBeGreaterThanOrEqual(0);
      expect(field.diffPercent).toBeLessThanOrEqual(100);
      expect(['A', 'B', 'TIE']).toContain(field.winner);
    }
  });

  it('style is included in the result', () => {
    const result = compareDevices(s24Ultra, a14, 'AGGRESSIVE');
    expect(result.style).toBe('AGGRESSIVE');
  });

  it('works with all 3 styles', () => {
    const styles = ['AGGRESSIVE', 'BALANCED', 'SNIPER'] as const;
    for (const style of styles) {
      const result = compareDevices(s24Ultra, a14, style);
      expect(result.style).toBe(style);
      expect(result.sensitivityDiff.length).toBe(6);
    }
  });

  it('gyro values differ between high-end and low-end devices', () => {
    const result = compareDevices(s24Ultra, a14, 'BALANCED', true);
    expect(result.gyroDiff).not.toBeNull();
    // S24 Ultra tiene AMOLED + GAMING bonus, sus gyro values deben ser mayores
    const gyroGeneral = result.gyroDiff!.find((f) => f.label === 'Gyro General');
    expect(gyroGeneral).toBeDefined();
    expect(gyroGeneral!.winner).toBe('A');
  });
});
