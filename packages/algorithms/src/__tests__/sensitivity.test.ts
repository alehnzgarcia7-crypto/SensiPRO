import { describe, it, expect } from 'vitest';

import { generateSensitivity } from '../sensitivity-engine';
import { getStyleMultipliers, getAllStyles } from '../style-system';
import { generateCalibration, generateAllCalibrations } from '../calibration-engine';
import type { AlgorithmInput, SensitivityOutput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES v3.0 — Tests Comprensivos
// Escala sensibilidad: 0-200 (Free Fire OB50+)
// Escala giroscopio: 0-100
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

describe('generateSensitivity — campos y rangos (0-200)', () => {
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

  it('valores RAW están en rango razonable (no clamped por engine)', () => {
    // Engine v3.0 produce valores RAW — el clamp se hace en calibration-engine
    const result = generateSensitivity(baseDevice);
    Object.values(result.sensitivity).forEach((val) => {
      expect(val).toBeGreaterThan(50);
      expect(val).toBeLessThan(220);
    });
  });
});

describe('generateSensitivity — tapering pattern', () => {
  it('general es siempre el más alto', () => {
    for (const input of [baseDevice, ultraHighEnd, extremeLowEnd]) {
      const result = generateSensitivity(input);
      const fields = Object.values(result.sensitivity);
      expect(result.sensitivity.general).toBe(Math.max(...fields));
    }
  });

  it('sniperScope es siempre el más bajo', () => {
    for (const input of [baseDevice, ultraHighEnd, extremeLowEnd]) {
      const result = generateSensitivity(input);
      const fields = Object.values(result.sensitivity);
      expect(result.sensitivity.sniperScope).toBe(Math.min(...fields));
    }
  });

  it('scopes en orden descendente: 2x > 4x > sniper', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.sensitivity.scope2x).toBeGreaterThan(result.sensitivity.scope4x);
    expect(result.sensitivity.scope4x).toBeGreaterThan(result.sensitivity.sniperScope);
  });

  it('diferencia general-sniper es ~90+ puntos (gradiente pronunciado)', () => {
    const result = generateSensitivity(baseDevice);
    const gap = result.sensitivity.general - result.sensitivity.sniperScope;
    expect(gap).toBeGreaterThanOrEqual(85);
  });
});

describe('generateSensitivity — factores de hardware', () => {
  it('baja RAM produce sensi MÁS ALTA que alta RAM en mismo hardware', () => {
    // Mismo hardware, solo cambia RAM — aísla el efecto de RAM
    const lowRam = generateSensitivity({ ...baseDevice, userRam: 2 });
    const highRam = generateSensitivity({ ...baseDevice, userRam: 12 });
    // 2GB (+15) vs 12GB (-8) = 23 puntos de diferencia
    expect(lowRam.sensitivity.general).toBeGreaterThan(highRam.sensitivity.general);
  });

  it('mayor Hz produce valores mayores para general', () => {
    const hz60 = generateSensitivity({ specs: { ...baseDevice.specs, screenHz: 60 }, style: 'BALANCED' });
    const hz144 = generateSensitivity({ specs: { ...baseDevice.specs, screenHz: 144 }, style: 'BALANCED' });
    expect(hz144.sensitivity.general).toBeGreaterThan(hz60.sensitivity.general);
  });

  it('AMOLED produce valores más altos que LCD con specs iguales', () => {
    const lcd = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'LCD' }, style: 'BALANCED' });
    const amoled = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'AMOLED' }, style: 'BALANCED' });
    expect(amoled.sensitivity.general).toBeGreaterThan(lcd.sensitivity.general);
  });

  it('OLED y AMOLED producen el mismo bonus', () => {
    const oled = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'OLED' }, style: 'BALANCED' });
    const amoled = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'AMOLED' }, style: 'BALANCED' });
    expect(oled.sensitivity.general).toBe(amoled.sensitivity.general);
  });

  it('LTPO produce el mayor bonus de panel', () => {
    const lcd = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'LCD' }, style: 'BALANCED' });
    const ltpo = generateSensitivity({ specs: { ...baseDevice.specs, panelType: 'LTPO' }, style: 'BALANCED' });
    expect(ltpo.sensitivity.general).toBeGreaterThan(lcd.sensitivity.general);
  });

  it('RAM factor uniforme: 2GB vs 6GB = +15 en todos los campos', () => {
    const ram6 = generateSensitivity({ ...baseDevice, userRam: 6 });
    const ram2 = generateSensitivity({ ...baseDevice, userRam: 2 });
    const diffGeneral = ram2.sensitivity.general - ram6.sensitivity.general;
    const diffSniper = ram2.sensitivity.sniperScope - ram6.sensitivity.sniperScope;
    expect(diffGeneral).toBe(15);
    expect(diffSniper).toBe(15);
  });
});

describe('generateSensitivity — giroscopio (0-100)', () => {
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

describe('generateSensitivity — meta y determinismo', () => {
  it('meta incluye todos los campos requeridos', () => {
    const result = generateSensitivity(baseDevice);
    expect(result.meta.algorithm).toBe('ARES-v3.0');
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

describe('calibration engine — 6 combinaciones', () => {
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

  it('todos los valores calibrados están entre 0 y 200', () => {
    const result = generateAllCalibrations(ultraHighEnd.specs, 'AGGRESSIVE', false);
    result.combinations.forEach((combo) => {
      Object.values(combo.sensitivity).forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(0);
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

describe('getStyleMultipliers (legacy, sin efecto en engine v3.0)', () => {
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
