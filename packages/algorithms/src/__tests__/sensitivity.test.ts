import { describe, it, expect } from 'vitest';

import { generateSensitivity } from '../sensitivity-engine';
import { getStyleMultipliers, getAllStyles } from '../style-system';
import type { AlgorithmInput, SensitivityOutput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES-804 — Tests de Sensibilidad Comprensivos
// Cubre: edge cases, hardware factors, style interactions
// ═══════════════════════════════════════════════════════════

const baseDevice: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'IPS', tier: 'MID' },
  style: 'BALANCED',
};

const ultraHighEnd: AlgorithmInput = {
  specs: { screenHz: 144, screenSize: 6.8, ramGb: 16, panelType: 'LTPO', tier: 'GAMING' },
  style: 'AGGRESSIVE',
};

const extremeLowEnd: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 5.0, ramGb: 2, panelType: 'LCD', tier: 'LOW' },
  style: 'BALANCED',
};

describe('generateSensitivity — campos y rangos', () => {
  it('retorna todas las keys de sensibilidad requeridas', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.sensitivity).toHaveProperty('general');
    expect(result.sensitivity).toHaveProperty('redPoint');
    expect(result.sensitivity).toHaveProperty('scope2x');
    expect(result.sensitivity).toHaveProperty('scope4x');
    expect(result.sensitivity).toHaveProperty('sniperScope');
    expect(result.sensitivity).toHaveProperty('freeView');
  });

  it('todos los valores están entre 1-100 para device base', () => {
    const result = generateSensitivity(baseDevice);
    Object.values(result.sensitivity).forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('todos los valores clampeados para device ultra high-end AGGRESSIVE', () => {
    const result = generateSensitivity(ultraHighEnd);
    Object.values(result.sensitivity).forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('todos los valores clampeados para extreme low-end', () => {
    const result = generateSensitivity(extremeLowEnd);
    Object.values(result.sensitivity).forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('retorna exactamente 6 campos de sensibilidad', () => {
    const result = generateSensitivity(baseDevice);
    expect(Object.keys(result.sensitivity)).toHaveLength(6);
  });

  it('todos los valores son enteros (redondeados)', () => {
    const result = generateSensitivity(baseDevice);
    Object.values(result.sensitivity).forEach((val) => {
      expect(Number.isInteger(val)).toBe(true);
    });
  });
});

describe('generateSensitivity — estilos de juego', () => {
  it('AGGRESSIVE tiene mayor general que SNIPER', () => {
    const aggressive = generateSensitivity({ ...baseDevice, style: 'AGGRESSIVE' });
    const sniper = generateSensitivity({ ...baseDevice, style: 'SNIPER' });
    expect(aggressive.sensitivity.general).toBeGreaterThan(sniper.sensitivity.general);
  });

  it('SNIPER tiene mayor sniperScope que AGGRESSIVE', () => {
    const sniper = generateSensitivity({ ...baseDevice, style: 'SNIPER' });
    const aggressive = generateSensitivity({ ...baseDevice, style: 'AGGRESSIVE' });
    expect(sniper.sensitivity.sniperScope).toBeGreaterThan(aggressive.sensitivity.sniperScope);
  });

  it('SNIPER tiene mayor scope4x que AGGRESSIVE', () => {
    const sniper = generateSensitivity({ ...baseDevice, style: 'SNIPER' });
    const aggressive = generateSensitivity({ ...baseDevice, style: 'AGGRESSIVE' });
    expect(sniper.sensitivity.scope4x).toBeGreaterThan(aggressive.sensitivity.scope4x);
  });

  it('BALANCED general está entre AGGRESSIVE y SNIPER', () => {
    const aggressive = generateSensitivity({ ...baseDevice, style: 'AGGRESSIVE' });
    const balanced = generateSensitivity({ ...baseDevice, style: 'BALANCED' });
    const sniper = generateSensitivity({ ...baseDevice, style: 'SNIPER' });
    expect(balanced.sensitivity.general).toBeLessThanOrEqual(aggressive.sensitivity.general);
    expect(balanced.sensitivity.general).toBeGreaterThanOrEqual(sniper.sensitivity.general);
  });

  it('los 3 estilos producen output válido para el mismo dispositivo', () => {
    const styles = getAllStyles();
    expect(styles).toHaveLength(3);
    styles.forEach((style) => {
      const result = generateSensitivity({ ...baseDevice, style });
      expect(result.sensitivity.general).toBeGreaterThanOrEqual(1);
      expect(result.sensitivity.general).toBeLessThanOrEqual(100);
    });
  });
});

describe('generateSensitivity — factores de hardware', () => {
  it('mayor Hz produce valores diferentes que menor Hz', () => {
    const lowHz = generateSensitivity({ specs: { ...baseDevice.specs, screenHz: 60 }, style: 'BALANCED' });
    const highHz = generateSensitivity({ specs: { ...baseDevice.specs, screenHz: 120 }, style: 'BALANCED' });
    const diffs = (Object.keys(lowHz.sensitivity) as Array<keyof SensitivityOutput>).filter(
      (k) => lowHz.sensitivity[k] !== highHz.sensitivity[k],
    );
    expect(diffs.length).toBeGreaterThan(0);
  });

  it('144Hz produce valores mayores o iguales que 60Hz', () => {
    const hz60 = generateSensitivity({ specs: { ...baseDevice.specs, screenHz: 60 }, style: 'BALANCED' });
    const hz144 = generateSensitivity({ specs: { ...baseDevice.specs, screenHz: 144 }, style: 'BALANCED' });
    // freeView tiene peso de Hz=18, debe ser claramente mayor
    expect(hz144.sensitivity.freeView).toBeGreaterThanOrEqual(hz60.sensitivity.freeView);
  });

  it('GAMING tier produce valores más altos que LOW tier', () => {
    const low = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 3, panelType: 'LCD', tier: 'LOW' },
      style: 'BALANCED',
    });
    const gaming = generateSensitivity({
      specs: { screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING' },
      style: 'BALANCED',
    });
    expect(gaming.sensitivity.general).toBeGreaterThan(low.sensitivity.general);
  });

  it('16GB RAM produce valores más altos que 2GB RAM', () => {
    const lowRam = generateSensitivity({ specs: { ...baseDevice.specs, ramGb: 2 }, style: 'BALANCED' });
    const highRam = generateSensitivity({ specs: { ...baseDevice.specs, ramGb: 16 }, style: 'BALANCED' });
    expect(highRam.sensitivity.general).toBeGreaterThan(lowRam.sensitivity.general);
  });

  it('AMOLED produce valores más altos que LCD con specs iguales', () => {
    const lcd = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'LCD' }, style: 'BALANCED' });
    const amoled = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'AMOLED' }, style: 'BALANCED' });
    expect(amoled.sensitivity.general).toBeGreaterThan(lcd.sensitivity.general);
  });

  it('LTPO produce el mayor bonus de panel', () => {
    const lcd = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'LCD' }, style: 'BALANCED' });
    const ltpo = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'LTPO' }, style: 'BALANCED' });
    expect(ltpo.sensitivity.general).toBeGreaterThan(lcd.sensitivity.general);
  });

  it('OLED y AMOLED producen el mismo bonus', () => {
    const oled = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'OLED' }, style: 'BALANCED' });
    const amoled = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'AMOLED' }, style: 'BALANCED' });
    expect(oled.sensitivity.general).toBe(amoled.sensitivity.general);
  });
});

describe('generateSensitivity — giroscopio', () => {
  it('retorna null para giroscopio cuando no se solicita', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.gyroscope).toBeNull();
  });

  it('retorna giroscopio con 6 campos cuando includeGyro=true', () => {
    const result = generateSensitivity({ ...baseDevice, includeGyro: true });
    expect(result.gyroscope).not.toBeNull();
    if (result.gyroscope) {
      expect(result.gyroscope).toHaveProperty('gyroGeneral');
      expect(result.gyroscope).toHaveProperty('gyroRedPoint');
      expect(result.gyroscope).toHaveProperty('gyroScope2x');
      expect(result.gyroscope).toHaveProperty('gyroScope4x');
      expect(result.gyroscope).toHaveProperty('gyroSniper');
      expect(result.gyroscope).toHaveProperty('gyroFreeView');
    }
  });

  it('valores de giroscopio son menores que sensibilidad normal (~50%)', () => {
    const result = generateSensitivity({ ...baseDevice, includeGyro: true });
    if (result.gyroscope) {
      expect(result.gyroscope.gyroGeneral).toBeLessThan(result.sensitivity.general);
      expect(result.gyroscope.gyroRedPoint).toBeLessThan(result.sensitivity.redPoint);
    }
  });

  it('giroscopio valores entre 1 y 100', () => {
    const result = generateSensitivity({ ...ultraHighEnd, includeGyro: true });
    if (result.gyroscope) {
      Object.values(result.gyroscope).forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(100);
      });
    }
  });
});

describe('generateSensitivity — meta y determinismo', () => {
  it('meta incluye todos los campos requeridos', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.meta.algorithm).toBe('ARES-v1.0');
    expect(result.meta.styleApplied).toBe('BALANCED');
    expect(result.meta.deviceTier).toBe('MID');
    expect(typeof result.meta.performanceScore).toBe('number');
  });

  it('es determinístico: mismo input = mismo output SIEMPRE', () => {
    const result1 = generateSensitivity(baseDevice);
    const result2 = generateSensitivity(baseDevice);
    expect(result1.sensitivity).toEqual(result2.sensitivity);
    expect(result1.gyroscope).toEqual(result2.gyroscope);
    expect(result1.meta.performanceScore).toBe(result2.meta.performanceScore);
  });

  it('performance score es mayor para gaming que para low-end', () => {
    const gaming = generateSensitivity({
      specs: { screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING' },
      style: 'BALANCED',
    });
    const low = generateSensitivity(extremeLowEnd);
    expect(gaming.meta.performanceScore).toBeGreaterThan(low.meta.performanceScore);
  });
});

describe('getStyleMultipliers', () => {
  it('BALANCED tiene todos los multiplicadores en 1.0', () => {
    const balanced = getStyleMultipliers('BALANCED');
    Object.values(balanced).forEach((val) => {
      expect(val).toBe(1.0);
    });
  });

  it('AGGRESSIVE general > 1.0 y sniperScope < 1.0', () => {
    const aggressive = getStyleMultipliers('AGGRESSIVE');
    expect(aggressive.general).toBeGreaterThan(1.0);
    expect(aggressive.sniperScope).toBeLessThan(1.0);
  });

  it('SNIPER sniperScope > 1.0 y general < 1.0', () => {
    const sniper = getStyleMultipliers('SNIPER');
    expect(sniper.sniperScope).toBeGreaterThan(1.0);
    expect(sniper.general).toBeLessThan(1.0);
  });

  it('cada estilo retorna exactamente 6 multiplicadores', () => {
    const styles = getAllStyles();
    styles.forEach((style) => {
      const multipliers = getStyleMultipliers(style);
      expect(Object.keys(multipliers)).toHaveLength(6);
    });
  });
});
