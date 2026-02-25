import { describe, it, expect } from 'vitest';

import { generateSensitivity } from '../sensitivity-engine';
import type { AlgorithmInput } from '../types';

const lowEndDevice: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW' },
  style: 'BALANCED',
};

const midDevice: AlgorithmInput = {
  specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID' },
  style: 'BALANCED',
};

const gamingDevice: AlgorithmInput = {
  specs: { screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING' },
  style: 'BALANCED',
};

const ultraDevice: AlgorithmInput = {
  specs: { screenHz: 144, screenSize: 6.8, ramGb: 16, panelType: 'LTPO', tier: 'GAMING' },
  style: 'BALANCED',
};

describe('generateSensitivity v2.0', () => {
  it('retorna los 6 campos de sensibilidad', () => {
    const result = generateSensitivity(midDevice);
    expect(result.sensitivity).toHaveProperty('general');
    expect(result.sensitivity).toHaveProperty('redPoint');
    expect(result.sensitivity).toHaveProperty('scope2x');
    expect(result.sensitivity).toHaveProperty('scope4x');
    expect(result.sensitivity).toHaveProperty('sniperScope');
    expect(result.sensitivity).toHaveProperty('freeView');
  });

  it('todos los valores están entre 60 y 190', () => {
    const result = generateSensitivity(gamingDevice);
    const values = Object.values(result.sensitivity);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(60);
      expect(v).toBeLessThanOrEqual(190);
    });
  });

  it('valores clampeados para dispositivo ultra high-end', () => {
    const result = generateSensitivity({ ...ultraDevice, style: 'AGGRESSIVE' });
    const values = Object.values(result.sensitivity);
    values.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(60);
      expect(v).toBeLessThanOrEqual(190);
    });
  });

  it('dispositivo gaming produce valores más altos que low-end', () => {
    const gaming = generateSensitivity(gamingDevice);
    const low = generateSensitivity(lowEndDevice);
    expect(gaming.sensitivity.general).toBeGreaterThan(low.sensitivity.general);
    expect(gaming.sensitivity.freeView).toBeGreaterThan(low.sensitivity.freeView);
  });

  it('estilo agresivo produce mayor general que sniper', () => {
    const aggressive = generateSensitivity({ ...midDevice, style: 'AGGRESSIVE' });
    const sniper = generateSensitivity({ ...midDevice, style: 'SNIPER' });
    expect(aggressive.sensitivity.general).toBeGreaterThan(sniper.sensitivity.general);
  });

  it('estilo sniper produce mayor sniperScope que agresivo', () => {
    const sniper = generateSensitivity({ ...midDevice, style: 'SNIPER' });
    const aggressive = generateSensitivity({ ...midDevice, style: 'AGGRESSIVE' });
    expect(sniper.sensitivity.sniperScope).toBeGreaterThan(aggressive.sensitivity.sniperScope);
  });

  it('estilo balanceado no modifica valores (multiplier 1.0)', () => {
    const balanced = generateSensitivity(midDevice);
    const aggressive = generateSensitivity({ ...midDevice, style: 'AGGRESSIVE' });
    const sniper = generateSensitivity({ ...midDevice, style: 'SNIPER' });
    expect(balanced.sensitivity.general).toBeLessThanOrEqual(aggressive.sensitivity.general);
    expect(balanced.sensitivity.general).toBeGreaterThanOrEqual(sniper.sensitivity.general);
  });

  it('incluye meta información correcta (v2.0)', () => {
    const result = generateSensitivity(gamingDevice);
    expect(result.meta.algorithm).toBe('ARES-v2.0');
    expect(result.meta.styleApplied).toBe('BALANCED');
    expect(result.meta.deviceTier).toBe('GAMING');
    expect(result.meta.performanceScore).toBeGreaterThan(0);
  });

  it('retorna null para giroscopio cuando no se solicita', () => {
    const result = generateSensitivity(midDevice);
    expect(result.gyroscope).toBeNull();
  });

  it('retorna giroscopio cuando se solicita', () => {
    const result = generateSensitivity({ ...midDevice, includeGyro: true });
    expect(result.gyroscope).not.toBeNull();
    expect(result.gyroscope).toHaveProperty('gyroGeneral');
    expect(result.gyroscope).toHaveProperty('gyroRedPoint');
    expect(result.gyroscope).toHaveProperty('gyroScope2x');
    expect(result.gyroscope).toHaveProperty('gyroScope4x');
    expect(result.gyroscope).toHaveProperty('gyroSniper');
    expect(result.gyroscope).toHaveProperty('gyroFreeView');
  });

  it('valores de giroscopio son menores que sensibilidad normal', () => {
    const result = generateSensitivity({ ...gamingDevice, includeGyro: true });
    if (result.gyroscope) {
      expect(result.gyroscope.gyroGeneral).toBeLessThan(result.sensitivity.general);
      expect(result.gyroscope.gyroRedPoint).toBeLessThan(result.sensitivity.redPoint);
      expect(result.gyroscope.gyroFreeView).toBeLessThan(result.sensitivity.freeView);
    }
  });

  it('valores de giroscopio están entre 60 y 140', () => {
    const result = generateSensitivity({ ...gamingDevice, includeGyro: true });
    if (result.gyroscope) {
      const values = Object.values(result.gyroscope);
      values.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(60);
        expect(v).toBeLessThanOrEqual(140);
      });
    }
  });

  it('es determinístico: mismo input produce mismo output', () => {
    const result1 = generateSensitivity(gamingDevice);
    const result2 = generateSensitivity(gamingDevice);
    expect(result1.sensitivity).toEqual(result2.sensitivity);
    expect(result1.meta.performanceScore).toBe(result2.meta.performanceScore);
  });

  it('performance score es mayor para gaming que para low-end', () => {
    const gaming = generateSensitivity(gamingDevice);
    const low = generateSensitivity(lowEndDevice);
    expect(gaming.meta.performanceScore).toBeGreaterThan(low.meta.performanceScore);
  });

  it('freeView tiene peso de Hz alto, general medio, scope decrece', () => {
    const highHz: AlgorithmInput = {
      specs: { screenHz: 144, screenSize: 6.5, ramGb: 4, panelType: 'LCD', tier: 'MID' },
      style: 'BALANCED',
    };
    const result = generateSensitivity(highHz);
    expect(result.sensitivity.freeView).toBeGreaterThan(result.sensitivity.sniperScope);
  });

  it('pantalla AMOLED produce valores más altos que LCD', () => {
    const amoled: AlgorithmInput = {
      specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID' },
      style: 'BALANCED',
    };
    const lcd: AlgorithmInput = {
      specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'LCD', tier: 'MID' },
      style: 'BALANCED',
    };
    const resultAmoled = generateSensitivity(amoled);
    const resultLcd = generateSensitivity(lcd);
    expect(resultAmoled.sensitivity.general).toBeGreaterThan(resultLcd.sensitivity.general);
  });

  it('userRam override cambia el resultado', () => {
    const withDeviceRam = generateSensitivity(midDevice);
    const withUserRam = generateSensitivity({ ...midDevice, userRam: 2 });
    // 2GB RAM debería producir valores más bajos que 6GB
    expect(withUserRam.sensitivity.general).toBeLessThan(withDeviceRam.sensitivity.general);
  });

  it('userRam 16GB produce valores más altos que userRam 2GB', () => {
    const low = generateSensitivity({ ...midDevice, userRam: 2 });
    const high = generateSensitivity({ ...midDevice, userRam: 16 });
    expect(high.sensitivity.general).toBeGreaterThan(low.sensitivity.general);
  });
});
