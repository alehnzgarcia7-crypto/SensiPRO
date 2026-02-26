import { describe, it, expect } from 'vitest';

import { generateSensitivity } from '../sensitivity-engine';
import { getStyleMultipliers, getAllStyles } from '../style-system';
import { generateCalibration, generateAllCalibrations } from '../calibration-engine';
import type { AlgorithmInput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES v4.0 — Tests Comprensivos (Forensic Calibration)
// Escala sensibilidad: 1-200 (Free Fire)
// Escala giroscopio: 0-100
// DPI como driver principal, tapering -15 fijo
// ═══════════════════════════════════════════════════════════

const baseDevice: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 6.5, ramGb: 4, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
  style: 'BALANCED',
};

const ultraHighEnd: AlgorithmInput = {
  specs: { screenHz: 144, screenSize: 6.8, ramGb: 16, panelType: 'LTPO', tier: 'GAMING', screenDpi: 460 },
  style: 'AGGRESSIVE',
};

const extremeLowEnd: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 5.0, ramGb: 2, panelType: 'LCD', tier: 'LOW', screenDpi: 270 },
  style: 'BALANCED',
};

describe('generateSensitivity v4.0 — campos y rangos (1-200)', () => {
  it('retorna todas las keys de sensibilidad requeridas', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.sensitivity).toHaveProperty('general');
    expect(result.sensitivity).toHaveProperty('redPoint');
    expect(result.sensitivity).toHaveProperty('scope2x');
    expect(result.sensitivity).toHaveProperty('scope4x');
    expect(result.sensitivity).toHaveProperty('sniperScope');
    expect(result.sensitivity).toHaveProperty('freeView');
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

  it('valores están en rango válido 1-200', () => {
    for (const input of [baseDevice, ultraHighEnd, extremeLowEnd]) {
      const result = generateSensitivity(input);
      Object.values(result.sensitivity).forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(200);
      });
    }
  });
});

describe('generateSensitivity v4.0 — tapering pattern', () => {
  it('general es el más alto de los scopes (freeView independiente)', () => {
    for (const input of [baseDevice, extremeLowEnd]) {
      const result = generateSensitivity(input);
      const { general, redPoint, scope2x, scope4x, sniperScope } = result.sensitivity;
      expect(general).toBeGreaterThanOrEqual(redPoint);
      expect(general).toBeGreaterThanOrEqual(scope2x);
      expect(general).toBeGreaterThanOrEqual(scope4x);
      expect(general).toBeGreaterThanOrEqual(sniperScope);
    }
  });

  it('sniperScope es el más bajo de los scopes', () => {
    for (const input of [baseDevice, extremeLowEnd]) {
      const result = generateSensitivity(input);
      const { general, redPoint, scope2x, scope4x, sniperScope } = result.sensitivity;
      expect(sniperScope).toBeLessThanOrEqual(general);
      expect(sniperScope).toBeLessThanOrEqual(redPoint);
      expect(sniperScope).toBeLessThanOrEqual(scope2x);
      expect(sniperScope).toBeLessThanOrEqual(scope4x);
    }
  });

  it('scopes en orden descendente: 2x > 4x > sniper', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.sensitivity.scope2x).toBeGreaterThan(result.sensitivity.scope4x);
    expect(result.sensitivity.scope4x).toBeGreaterThan(result.sensitivity.sniperScope);
  });

  it('tapering fijo de -15 entre scopes (BALANCED)', () => {
    const result = generateSensitivity(baseDevice);
    const { general, redPoint, scope2x, scope4x, sniperScope } = result.sensitivity;
    expect(general - redPoint).toBe(15);
    expect(redPoint - scope2x).toBe(15);
    expect(scope2x - scope4x).toBe(15);
    expect(scope4x - sniperScope).toBe(15);
  });

  it('diferencia general-sniper = 60 puntos (4 × 15) en BALANCED', () => {
    const result = generateSensitivity(baseDevice);
    const gap = result.sensitivity.general - result.sensitivity.sniperScope;
    expect(gap).toBe(60);
  });

  it('freeView es independiente del tapering (rango 12-25)', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.sensitivity.freeView).toBeGreaterThanOrEqual(12);
    expect(result.sensitivity.freeView).toBeLessThanOrEqual(25);
  });
});

describe('generateSensitivity v4.0 — DPI y factores', () => {
  it('DPI es el driver principal: DPI bajo → sensi alta', () => {
    const lowDpi = generateSensitivity({
      specs: { ...baseDevice.specs, screenDpi: 270 },
      style: 'BALANCED',
    });
    const highDpi = generateSensitivity({
      specs: { ...baseDevice.specs, screenDpi: 460 },
      style: 'BALANCED',
    });
    expect(lowDpi.sensitivity.general).toBeGreaterThan(highDpi.sensitivity.general);
  });

  it('baja RAM produce sensi MÁS ALTA que alta RAM', () => {
    const lowRam = generateSensitivity({ ...baseDevice, userRam: 2 });
    const highRam = generateSensitivity({ ...baseDevice, userRam: 12 });
    expect(lowRam.sensitivity.general).toBeGreaterThan(highRam.sensitivity.general);
  });

  it('60Hz produce valores MÁS ALTOS que 120Hz (60Hz compensa con boost)', () => {
    const hz60 = generateSensitivity({ specs: { ...baseDevice.specs, screenHz: 60 }, style: 'BALANCED' });
    const hz120 = generateSensitivity({ specs: { ...baseDevice.specs, screenHz: 120 }, style: 'BALANCED' });
    expect(hz60.sensitivity.general).toBeGreaterThan(hz120.sensitivity.general);
  });

  it('pantalla grande produce valores MÁS BAJOS', () => {
    const small = generateSensitivity({ specs: { ...baseDevice.specs, screenSize: 5.0 }, style: 'BALANCED' });
    const big = generateSensitivity({ specs: { ...baseDevice.specs, screenSize: 7.0 }, style: 'BALANCED' });
    expect(small.sensitivity.general).toBeGreaterThan(big.sensitivity.general);
  });

  it('RAM adjustment es uniforme a todos los scopes (no a freeView)', () => {
    const ram6 = generateSensitivity({ ...baseDevice, userRam: 6 });
    const ram2 = generateSensitivity({ ...baseDevice, userRam: 2 });
    const diffGeneral = ram2.sensitivity.general - ram6.sensitivity.general;
    const diffSniper = ram2.sensitivity.sniperScope - ram6.sensitivity.sniperScope;
    expect(diffGeneral).toBe(5); // 2GB=+5, 6GB=0
    expect(diffSniper).toBe(5);  // Misma diff, el tapering se aplica sobre el base
  });
});

describe('generateSensitivity v4.0 — giroscopio (0-100)', () => {
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

  it('valores de giroscopio son menores que sensibilidad normal', () => {
    const result = generateSensitivity({ ...baseDevice, includeGyro: true });
    if (result.gyroscope) {
      expect(result.gyroscope.gyroGeneral).toBeLessThan(result.sensitivity.general);
      expect(result.gyroscope.gyroRedPoint).toBeLessThan(result.sensitivity.redPoint);
    }
  });

  it('giroscopio valores entre 0 y 100', () => {
    const result = generateSensitivity({ ...ultraHighEnd, includeGyro: true });
    if (result.gyroscope) {
      Object.values(result.gyroscope).forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      });
    }
  });
});

describe('generateSensitivity v4.0 — meta y determinismo', () => {
  it('meta incluye algoritmo v4.0', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.meta.algorithm).toBe('ARES-v4.0-forensic');
    expect(result.meta.styleApplied).toBe('BALANCED');
    expect(result.meta.deviceTier).toBe('MID');
    expect(typeof result.meta.performanceScore).toBe('number');
  });

  it('metadata forense incluye DPI y ajustes', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.metadata.algorithmVersion).toBe('4.0-forensic');
    expect(result.metadata.effectiveDpi).toBe(395);
    expect(typeof result.metadata.generalBase).toBe('number');
    expect(typeof result.metadata.tapering).toBe('number');
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
      specs: { screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', screenDpi: 460 },
      style: 'BALANCED',
    });
    const low = generateSensitivity(extremeLowEnd);
    expect(gaming.meta.performanceScore).toBeGreaterThan(low.meta.performanceScore);
  });
});

describe('calibration engine — 6 combinaciones (sobre v4.0)', () => {
  it('ALTA produce valores más altos que MEDIA que produce más altos que BAJA', () => {
    const alta = generateCalibration({
      specs: baseDevice.specs, style: 'BALANCED', calibration: 'ALTA', dpiMode: false,
    });
    const media = generateCalibration({
      specs: baseDevice.specs, style: 'BALANCED', calibration: 'MEDIA', dpiMode: false,
    });
    const baja = generateCalibration({
      specs: baseDevice.specs, style: 'BALANCED', calibration: 'BAJA', dpiMode: false,
    });
    expect(alta.sensitivity.general).toBeGreaterThan(media.sensitivity.general);
    expect(media.sensitivity.general).toBeGreaterThan(baja.sensitivity.general);
  });

  it('CON DPI resta 12 puntos uniformemente', () => {
    const sinDpi = generateCalibration({
      specs: baseDevice.specs, style: 'BALANCED', calibration: 'MEDIA', dpiMode: false,
    });
    const conDpi = generateCalibration({
      specs: baseDevice.specs, style: 'BALANCED', calibration: 'MEDIA', dpiMode: true,
    });
    expect(sinDpi.sensitivity.general - conDpi.sensitivity.general).toBe(12);
    expect(sinDpi.sensitivity.sniperScope - conDpi.sensitivity.sniperScope).toBe(12);
  });

  it('genera 6 combinaciones correctas', () => {
    const result = generateAllCalibrations(baseDevice.specs, 'BALANCED', false);
    expect(result.combinations).toHaveLength(6);

    const combos = result.combinations.map((c) => `${c.calibration}-${c.dpiMode}`);
    expect(combos).toContain('BAJA-false');
    expect(combos).toContain('BAJA-true');
    expect(combos).toContain('MEDIA-false');
    expect(combos).toContain('MEDIA-true');
    expect(combos).toContain('ALTA-false');
    expect(combos).toContain('ALTA-true');
  });

  it('todos los valores calibrados están entre 1 y 200', () => {
    const result = generateAllCalibrations(ultraHighEnd.specs, 'AGGRESSIVE', false);
    result.combinations.forEach((combo) => {
      Object.values(combo.sensitivity).forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(200);
      });
    });
  });

  it('calibración pasa userRam correctamente', () => {
    const result6gb = generateAllCalibrations(baseDevice.specs, 'BALANCED', false, 6);
    const result2gb = generateAllCalibrations(baseDevice.specs, 'BALANCED', false, 2);
    const media6 = result6gb.combinations.find((c) => c.calibration === 'MEDIA' && !c.dpiMode);
    const media2 = result2gb.combinations.find((c) => c.calibration === 'MEDIA' && !c.dpiMode);
    // 2GB RAM debe dar valores más altos (compensa lag)
    expect(media2!.sensitivity.general).toBeGreaterThan(media6!.sensitivity.general);
  });
});

describe('getStyleMultipliers (style-system)', () => {
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
