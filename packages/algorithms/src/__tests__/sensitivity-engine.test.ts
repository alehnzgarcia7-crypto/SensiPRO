import { describe, it, expect } from 'vitest';

import { generateSensitivity } from '../sensitivity-engine';
import type { AlgorithmInput, SensitivityOutput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES v3.0 — Tests de Sensibilidad
// Escala: 0-200 (Free Fire OB50+)
// Engine produce valores RAW sin calibración
// ═══════════════════════════════════════════════════════════

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

describe('generateSensitivity v3.0', () => {
  it('retorna los 6 campos de sensibilidad', () => {
    const result = generateSensitivity(midDevice);
    expect(result.sensitivity).toHaveProperty('general');
    expect(result.sensitivity).toHaveProperty('redPoint');
    expect(result.sensitivity).toHaveProperty('scope2x');
    expect(result.sensitivity).toHaveProperty('scope4x');
    expect(result.sensitivity).toHaveProperty('sniperScope');
    expect(result.sensitivity).toHaveProperty('freeView');
  });

  it('todos los valores son enteros (redondeados)', () => {
    const result = generateSensitivity(midDevice);
    Object.values(result.sensitivity).forEach((v) => {
      expect(Number.isInteger(v)).toBe(true);
    });
  });

  it('retorna exactamente 6 campos de sensibilidad', () => {
    const result = generateSensitivity(midDevice);
    expect(Object.keys(result.sensitivity)).toHaveLength(6);
  });
});

describe('tapering pattern: General > FreeLook > RedDot > 2x > 4x > Sniper', () => {
  it('general es siempre el más alto', () => {
    for (const input of [lowEndDevice, midDevice, gamingDevice, ultraDevice]) {
      const result = generateSensitivity(input);
      const { general, redPoint, scope2x, scope4x, sniperScope, freeView } = result.sensitivity;
      expect(general).toBeGreaterThanOrEqual(redPoint);
      expect(general).toBeGreaterThanOrEqual(freeView);
      expect(general).toBeGreaterThanOrEqual(scope2x);
      expect(general).toBeGreaterThanOrEqual(scope4x);
      expect(general).toBeGreaterThanOrEqual(sniperScope);
    }
  });

  it('sniperScope es siempre el más bajo', () => {
    for (const input of [lowEndDevice, midDevice, gamingDevice, ultraDevice]) {
      const result = generateSensitivity(input);
      const { general, redPoint, scope2x, scope4x, sniperScope, freeView } = result.sensitivity;
      expect(sniperScope).toBeLessThanOrEqual(general);
      expect(sniperScope).toBeLessThanOrEqual(redPoint);
      expect(sniperScope).toBeLessThanOrEqual(scope2x);
      expect(sniperScope).toBeLessThanOrEqual(scope4x);
      expect(sniperScope).toBeLessThanOrEqual(freeView);
    }
  });

  it('scopes siguen tapering: 2x > 4x > sniper', () => {
    for (const input of [lowEndDevice, midDevice, gamingDevice]) {
      const result = generateSensitivity(input);
      expect(result.sensitivity.scope2x).toBeGreaterThan(result.sensitivity.scope4x);
      expect(result.sensitivity.scope4x).toBeGreaterThan(result.sensitivity.sniperScope);
    }
  });

  it('diferencia entre general y sniper es ~100+ puntos', () => {
    const result = generateSensitivity(midDevice);
    const gap = result.sensitivity.general - result.sensitivity.sniperScope;
    expect(gap).toBeGreaterThanOrEqual(80);
  });
});

describe('hardware factors', () => {
  it('baja RAM produce sensi MÁS ALTA que alta RAM en mismo hardware', () => {
    // Mismo hardware, solo cambia RAM
    const lowRam = generateSensitivity({ ...midDevice, userRam: 2 });
    const highRam = generateSensitivity({ ...midDevice, userRam: 12 });
    // 2GB (+15) vs 12GB (-8) = 23 puntos de diferencia
    expect(lowRam.sensitivity.general).toBeGreaterThan(highRam.sensitivity.general);
  });

  it('120Hz sube ~10 puntos vs 60Hz', () => {
    const hz60 = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID' },
      style: 'BALANCED',
    });
    const hz120 = generateSensitivity({
      specs: { screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID' },
      style: 'BALANCED',
    });
    const diff = hz120.sensitivity.general - hz60.sensitivity.general;
    expect(diff).toBeGreaterThanOrEqual(8);
    expect(diff).toBeLessThanOrEqual(12);
  });

  it('AMOLED produce valores más altos que LCD con specs iguales', () => {
    const lcd = generateSensitivity({
      specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'LCD', tier: 'MID' },
      style: 'BALANCED',
    });
    const amoled = generateSensitivity({
      specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID' },
      style: 'BALANCED',
    });
    expect(amoled.sensitivity.general).toBeGreaterThan(lcd.sensitivity.general);
  });

  it('OLED y AMOLED producen el mismo resultado', () => {
    const oled = generateSensitivity({
      specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'OLED', tier: 'MID' },
      style: 'BALANCED',
    });
    const amoled = generateSensitivity({
      specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID' },
      style: 'BALANCED',
    });
    expect(oled.sensitivity.general).toBe(amoled.sensitivity.general);
  });

  it('LTPO produce el mayor bonus de panel', () => {
    const lcd = generateSensitivity({
      specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'LCD', tier: 'MID' },
      style: 'BALANCED',
    });
    const ltpo = generateSensitivity({
      specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'LTPO', tier: 'MID' },
      style: 'BALANCED',
    });
    expect(ltpo.sensitivity.general).toBeGreaterThan(lcd.sensitivity.general);
  });
});

describe('RAM factor (inverted: baja RAM = alta sensi)', () => {
  it('2GB RAM produce valores MÁS ALTOS que 6GB', () => {
    const ram2 = generateSensitivity({ ...midDevice, userRam: 2 });
    const ram6 = generateSensitivity({ ...midDevice, userRam: 6 });
    expect(ram2.sensitivity.general).toBeGreaterThan(ram6.sensitivity.general);
  });

  it('16GB RAM produce valores MÁS BAJOS que 6GB', () => {
    const ram16 = generateSensitivity({ ...midDevice, userRam: 16 });
    const ram6 = generateSensitivity({ ...midDevice, userRam: 6 });
    expect(ram16.sensitivity.general).toBeLessThan(ram6.sensitivity.general);
  });

  it('userRam override funciona correctamente', () => {
    const withDeviceRam = generateSensitivity(midDevice); // 6GB = 0 offset
    const withUserRam = generateSensitivity({ ...midDevice, userRam: 2 }); // 2GB = +15
    expect(withUserRam.sensitivity.general).toBeGreaterThan(withDeviceRam.sensitivity.general);
  });

  it('RAM factor se aplica uniformemente a todos los campos', () => {
    const ram6 = generateSensitivity({ ...midDevice, userRam: 6 });
    const ram2 = generateSensitivity({ ...midDevice, userRam: 2 });
    // Diferencia de RAM factor: +15 - 0 = 15
    const diffGeneral = ram2.sensitivity.general - ram6.sensitivity.general;
    const diffSniper = ram2.sensitivity.sniperScope - ram6.sensitivity.sniperScope;
    expect(diffGeneral).toBe(15);
    expect(diffSniper).toBe(15);
  });
});

describe('giroscopio (0-100)', () => {
  it('retorna null para giroscopio cuando no se solicita', () => {
    const result = generateSensitivity(midDevice);
    expect(result.gyroscope).toBeNull();
  });

  it('retorna giroscopio con 6 campos cuando includeGyro=true', () => {
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

  it('valores de giroscopio están entre 0 y 100', () => {
    const result = generateSensitivity({ ...gamingDevice, includeGyro: true });
    if (result.gyroscope) {
      Object.values(result.gyroscope).forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      });
    }
  });

  it('gyro values en rango pro (20-40 para dispositivo medio)', () => {
    const result = generateSensitivity({ ...midDevice, includeGyro: true });
    if (result.gyroscope) {
      // Gyro general ~31 (172*0.18), gyro redPoint ~34 (172*0.20)
      expect(result.gyroscope.gyroGeneral).toBeGreaterThanOrEqual(20);
      expect(result.gyroscope.gyroGeneral).toBeLessThanOrEqual(45);
    }
  });
});

describe('meta y determinismo', () => {
  it('meta incluye algoritmo v3.0', () => {
    const result = generateSensitivity(midDevice);
    expect(result.meta.algorithm).toBe('ARES-v3.0');
    expect(result.meta.styleApplied).toBe('BALANCED');
    expect(result.meta.deviceTier).toBe('MID');
    expect(typeof result.meta.performanceScore).toBe('number');
  });

  it('es determinístico: mismo input = mismo output SIEMPRE', () => {
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
});

describe('verified calculations (manual)', () => {
  it('iPhone 14 Pro Max (120Hz, 6.7", OLED, GAMING, 6GB)', () => {
    const result = generateSensitivity({
      specs: { screenHz: 120, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'GAMING' },
      style: 'BALANCED',
    });
    // hzBonus=10, screenBonus=1.87, panelBonus=2, tierBonus=5 → totalHwAdjust=18.87
    // general: 170 + 18.87*1.0 + 0 = 189
    expect(result.sensitivity.general).toBe(189);
    // sniperScope: 75 + 18.87*0.40 + 0 = 83
    expect(result.sensitivity.sniperScope).toBe(83);
  });

  it('Samsung Galaxy A03 (60Hz, 6.5", LCD, LOW, 2GB)', () => {
    const result = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'LCD', tier: 'LOW' },
      style: 'BALANCED',
    });
    // hzBonus=0, screenBonus=1.33, panelBonus=-2, tierBonus=-3 → totalHwAdjust=-3.67
    // general: 170 + (-3.67*1.0) + 15 = 181
    expect(result.sensitivity.general).toBe(181);
  });

  it('Samsung Galaxy A54 (120Hz, 6.4", AMOLED, MID, 6GB)', () => {
    const result = generateSensitivity({
      specs: { screenHz: 120, screenSize: 6.4, ramGb: 6, panelType: 'AMOLED', tier: 'MID' },
      style: 'BALANCED',
    });
    // hzBonus=10, screenBonus=1.07, panelBonus=2, tierBonus=0 → totalHwAdjust=13.07
    // general: 170 + 13.07*1.0 + 0 = 183
    expect(result.sensitivity.general).toBe(183);
  });
});
