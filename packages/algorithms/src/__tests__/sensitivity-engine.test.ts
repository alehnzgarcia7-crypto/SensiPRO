import { describe, it, expect } from 'vitest';

import { generateSensitivity, estimateDpiFromDevice } from '../sensitivity-engine';
import type { AlgorithmInput } from '../types';

// ═══════════════════════════════════════════════════════════
// ARES v4.0 — Tests de Sensibilidad (Forensic Calibration)
// Escala: 1-200 (Free Fire)
// Engine DPI-first con tapering -15 validado contra datos reales
// Updated 2026-02-27: Algorithm audit fix — DPI curve adjusted for flagships,
// screen size granularity improved, gyro base reduced to pro range.
// See ALGORITHM-AUDIT.md
// ═══════════════════════════════════════════════════════════

// Dispositivos de validación con DPI real
const samsungA13: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 6.6, ramGb: 4, panelType: 'IPS', tier: 'LOW', screenDpi: 270 },
  style: 'BALANCED',
};

const redmiNote13: AlgorithmInput = {
  specs: { screenHz: 120, screenSize: 6.67, ramGb: 8, panelType: 'AMOLED', tier: 'MID', screenDpi: 395 },
  style: 'BALANCED',
};

const iphone14Plus: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 6.7, ramGb: 6, panelType: 'OLED', tier: 'HIGH', screenDpi: 458 },
  style: 'BALANCED',
};

const iphone16ProMax: AlgorithmInput = {
  specs: { screenHz: 120, screenSize: 6.9, ramGb: 8, panelType: 'OLED', tier: 'GAMING', screenDpi: 460 },
  style: 'BALANCED',
};

const lowEndDevice: AlgorithmInput = {
  specs: { screenHz: 60, screenSize: 5.5, ramGb: 2, panelType: 'LCD', tier: 'LOW', screenDpi: 270 },
  style: 'BALANCED',
};

const midDevice: AlgorithmInput = {
  specs: { screenHz: 90, screenSize: 6.5, ramGb: 6, panelType: 'AMOLED', tier: 'MID', screenDpi: 395 },
  style: 'BALANCED',
};

const gamingDevice: AlgorithmInput = {
  specs: { screenHz: 120, screenSize: 6.7, ramGb: 12, panelType: 'AMOLED', tier: 'GAMING', screenDpi: 460 },
  style: 'BALANCED',
};

describe('generateSensitivity v4.0 — forensic calibration', () => {
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

  it('todos los valores están entre 1 y 200', () => {
    for (const input of [lowEndDevice, midDevice, gamingDevice, samsungA13, redmiNote13, iphone14Plus, iphone16ProMax]) {
      const result = generateSensitivity(input);
      const { freeView, ...scopes } = result.sensitivity;
      Object.values(scopes).forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(200);
      });
      // freeView tiene rango independiente ~12-25
      expect(freeView).toBeGreaterThanOrEqual(1);
      expect(freeView).toBeLessThanOrEqual(200);
    }
  });
});

describe('forensic validation — real device data (±5 puntos)', () => {
  it('Samsung A13: DPI 270, 4GB, 60Hz, 6.6" → General ~188', () => {
    const result = generateSensitivity(samsungA13);
    // DPI 270 → base ~185, +1 RAM(4GB), +3 Hz(60), -1 screen(6.6"), 0 style
    // generalBase = 185 + 1 + 3 - 1 + 0 = 188
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(186);
    expect(result.sensitivity.general).toBeLessThanOrEqual(190);
  });

  it('Samsung A13: tapering -15 correcto', () => {
    const result = generateSensitivity(samsungA13);
    const { general, redPoint, scope2x, scope4x, sniperScope } = result.sensitivity;
    expect(general - redPoint).toBe(15);
    expect(redPoint - scope2x).toBe(15);
    expect(scope2x - scope4x).toBe(15);
    expect(scope4x - sniperScope).toBe(15);
  });

  it('Redmi Note 13: DPI 395, 8GB, 120Hz, 6.67" → General ~173', () => {
    const result = generateSensitivity(redmiNote13);
    // DPI 395 → base ~175, -1 RAM(8GB), 0 Hz(120), -1 screen(6.67"), 0 style
    // generalBase = 175 - 1 + 0 - 1 + 0 = 173
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(171);
    expect(result.sensitivity.general).toBeLessThanOrEqual(175);
  });

  it('iPhone 14 Plus: DPI 458, 6GB, 60Hz, 6.7" → General ~167', () => {
    const result = generateSensitivity(iphone14Plus);
    // DPI 458 → base ~166 (seg 400-460), 0 RAM(6GB), +3 Hz(60), -2 screen(6.7"), 0 style
    // generalBase = 166 + 0 + 3 - 2 + 0 = 167
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(165);
    expect(result.sensitivity.general).toBeLessThanOrEqual(169);
  });

  it('iPhone 16 Pro Max: DPI 460, 8GB, 120Hz, 6.9" → General ~163', () => {
    const result = generateSensitivity(iphone16ProMax);
    // DPI 460 → base ~166 (seg 400-460 boundary), -1 RAM(8GB), 0 Hz(120), -2 screen(6.9"), 0 style
    // generalBase = 166 - 1 + 0 - 2 + 0 = 163
    expect(result.sensitivity.general).toBeGreaterThanOrEqual(161);
    expect(result.sensitivity.general).toBeLessThanOrEqual(165);
  });

  it('Free Look independiente, rango 14-22', () => {
    for (const input of [samsungA13, redmiNote13, iphone14Plus, iphone16ProMax]) {
      const result = generateSensitivity(input);
      expect(result.sensitivity.freeView).toBeGreaterThanOrEqual(12);
      expect(result.sensitivity.freeView).toBeLessThanOrEqual(25);
    }
  });
});

describe('tapering pattern: General > RedPoint > 2x > 4x > Sniper', () => {
  it('general es siempre el más alto (excluyendo freeView)', () => {
    for (const input of [lowEndDevice, midDevice, gamingDevice, samsungA13, redmiNote13]) {
      const result = generateSensitivity(input);
      const { general, redPoint, scope2x, scope4x, sniperScope } = result.sensitivity;
      expect(general).toBeGreaterThanOrEqual(redPoint);
      expect(general).toBeGreaterThanOrEqual(scope2x);
      expect(general).toBeGreaterThanOrEqual(scope4x);
      expect(general).toBeGreaterThanOrEqual(sniperScope);
    }
  });

  it('sniperScope es siempre el más bajo (excluyendo freeView)', () => {
    for (const input of [lowEndDevice, midDevice, gamingDevice]) {
      const result = generateSensitivity(input);
      const { general, redPoint, scope2x, scope4x, sniperScope } = result.sensitivity;
      expect(sniperScope).toBeLessThanOrEqual(general);
      expect(sniperScope).toBeLessThanOrEqual(redPoint);
      expect(sniperScope).toBeLessThanOrEqual(scope2x);
      expect(sniperScope).toBeLessThanOrEqual(scope4x);
    }
  });

  it('tapering fijo de -15 entre campos (BALANCED)', () => {
    const result = generateSensitivity(midDevice);
    const { general, redPoint, scope2x, scope4x, sniperScope } = result.sensitivity;
    expect(general - redPoint).toBe(15);
    expect(redPoint - scope2x).toBe(15);
    expect(scope2x - scope4x).toBe(15);
    expect(scope4x - sniperScope).toBe(15);
  });

  it('diferencia general-sniper = 60 puntos (4 × 15) en BALANCED', () => {
    const result = generateSensitivity(midDevice);
    const gap = result.sensitivity.general - result.sensitivity.sniperScope;
    expect(gap).toBe(60);
  });
});

describe('DPI como driver principal', () => {
  it('DPI bajo (270) produce sensibilidad MÁS ALTA que DPI alto (460)', () => {
    const lowDpi = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 270 },
      style: 'BALANCED',
    });
    const highDpi = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 460 },
      style: 'BALANCED',
    });
    expect(lowDpi.sensitivity.general).toBeGreaterThan(highDpi.sensitivity.general);
    // Diferencia DPI 270→460 = ~18 puntos
    const diff = lowDpi.sensitivity.general - highDpi.sensitivity.general;
    expect(diff).toBeGreaterThanOrEqual(15);
    expect(diff).toBeLessThanOrEqual(25);
  });

  it('customDpi override funciona correctamente', () => {
    const withDeviceDpi = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
    });
    const withCustomDpi = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
      customDpi: 270,
    });
    // customDpi 270 → higher sensitivity than device DPI 395
    expect(withCustomDpi.sensitivity.general).toBeGreaterThan(withDeviceDpi.sensitivity.general);
  });

  it('sin DPI usa fallback por tier', () => {
    const withDpi = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
    });
    const withoutDpi = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID' },
      style: 'BALANCED',
    });
    // MID tier fallback = 395, same as explicit DPI
    expect(withoutDpi.sensitivity.general).toBe(withDpi.sensitivity.general);
  });
});

describe('ajustes secundarios', () => {
  it('RAM es ajuste secundario (±5 máximo)', () => {
    const ram2 = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 2, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
    });
    const ram16 = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 16, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
    });
    const diff = ram2.sensitivity.general - ram16.sensitivity.general;
    // 2GB (+5) vs 16GB (-3) = 8 puntos de diferencia
    expect(diff).toBe(8);
  });

  it('Hz adjustment: 60Hz da +3, 120Hz da 0', () => {
    const hz60 = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
    });
    const hz120 = generateSensitivity({
      specs: { screenHz: 120, screenSize: 6.5, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
    });
    const diff = hz60.sensitivity.general - hz120.sensitivity.general;
    expect(diff).toBe(3); // +3 vs 0
  });

  it('screen size adjustment: 6.0"=0, 6.7"=-2, diff=2', () => {
    const small = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.0, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
    });
    const big = generateSensitivity({
      specs: { screenHz: 60, screenSize: 6.7, ramGb: 6, panelType: 'IPS', tier: 'MID', screenDpi: 395 },
      style: 'BALANCED',
    });
    const diff = small.sensitivity.general - big.sensitivity.general;
    expect(diff).toBe(2); // 0 vs -2 (6.7" is ≥6.7 and <7.0)
  });

  it('userRam override funciona correctamente', () => {
    const withDeviceRam = generateSensitivity({ ...midDevice }); // 6GB = 0 offset
    const withUserRam = generateSensitivity({ ...midDevice, userRam: 2 }); // 2GB = +5
    expect(withUserRam.sensitivity.general).toBeGreaterThan(withDeviceRam.sensitivity.general);
    expect(withUserRam.sensitivity.general - withDeviceRam.sensitivity.general).toBe(5);
  });
});

describe('estilos de juego', () => {
  it('AGGRESSIVE sube general en +8 pts', () => {
    const balanced = generateSensitivity({ ...midDevice, style: 'BALANCED' });
    const aggressive = generateSensitivity({ ...midDevice, style: 'AGGRESSIVE' });
    expect(aggressive.sensitivity.general - balanced.sensitivity.general).toBe(8);
  });

  it('SNIPER baja general en -8 pts', () => {
    const balanced = generateSensitivity({ ...midDevice, style: 'BALANCED' });
    const sniper = generateSensitivity({ ...midDevice, style: 'SNIPER' });
    expect(balanced.sensitivity.general - sniper.sensitivity.general).toBe(8);
  });

  it('AGGRESSIVE tiene tapering -14, SNIPER tiene tapering -16', () => {
    const aggressive = generateSensitivity({ ...midDevice, style: 'AGGRESSIVE' });
    const sniper = generateSensitivity({ ...midDevice, style: 'SNIPER' });
    const agTapering = aggressive.sensitivity.general - aggressive.sensitivity.redPoint;
    const snTapering = sniper.sensitivity.general - sniper.sensitivity.redPoint;
    expect(agTapering).toBe(14); // 15 - 1
    expect(snTapering).toBe(16); // 15 + 1
  });
});

describe('giroscopio (0-100)', () => {
  it('retorna null cuando no se solicita', () => {
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

  it('gyro tapering es -10 (más suave que touch)', () => {
    const result = generateSensitivity({ ...midDevice, includeGyro: true });
    if (result.gyroscope) {
      const gyroTapering = result.gyroscope.gyroGeneral - result.gyroscope.gyroRedPoint;
      expect(gyroTapering).toBe(10);
    }
  });
});

describe('metadata forense', () => {
  it('meta incluye algoritmo v4.0', () => {
    const result = generateSensitivity(midDevice);
    expect(result.meta.algorithm).toBe('ARES-v4.0-forensic');
    expect(result.meta.styleApplied).toBe('BALANCED');
    expect(result.meta.deviceTier).toBe('MID');
    expect(typeof result.meta.performanceScore).toBe('number');
  });

  it('metadata forense incluye DPI efectivo y ajustes', () => {
    const result = generateSensitivity(midDevice);
    expect(result.metadata.algorithmVersion).toBe('4.0-forensic');
    expect(result.metadata.effectiveDpi).toBe(395);
    expect(typeof result.metadata.generalBase).toBe('number');
    expect(typeof result.metadata.tapering).toBe('number');
    expect(result.metadata.adjustments).toHaveProperty('ram');
    expect(result.metadata.adjustments).toHaveProperty('hz');
    expect(result.metadata.adjustments).toHaveProperty('screen');
    expect(result.metadata.adjustments).toHaveProperty('style');
  });

  it('es determinístico: mismo input = mismo output SIEMPRE', () => {
    const result1 = generateSensitivity(gamingDevice);
    const result2 = generateSensitivity(gamingDevice);
    expect(result1.sensitivity).toEqual(result2.sensitivity);
    expect(result1.metadata).toEqual(result2.metadata);
  });

  it('performance score es mayor para gaming que para low-end', () => {
    const gaming = generateSensitivity(gamingDevice);
    const low = generateSensitivity(lowEndDevice);
    expect(gaming.meta.performanceScore).toBeGreaterThan(low.meta.performanceScore);
  });
});

describe('estimateDpiFromDevice', () => {
  it('retorna DPI conocido para Samsung A13', () => {
    // Updated 2026-02-27: A13 es FHD+ (2408×1080, 6.6") → DPI 400, no 270
    expect(estimateDpiFromDevice('Samsung', 'A13', 'LOW')).toBe(400);
  });

  it('retorna DPI conocido para iPhone 14 Plus', () => {
    expect(estimateDpiFromDevice('Apple', 'iPhone14Plus', 'HIGH')).toBe(458);
  });

  it('retorna DPI conocido para Redmi Note 13', () => {
    expect(estimateDpiFromDevice('Xiaomi', 'RedmiNote13', 'MID')).toBe(395);
  });

  it('fallback por tier cuando modelo no está en el diccionario', () => {
    expect(estimateDpiFromDevice('UnknownBrand', 'UnknownModel', 'LOW')).toBe(270);
    expect(estimateDpiFromDevice('UnknownBrand', 'UnknownModel', 'MID')).toBe(395);
    expect(estimateDpiFromDevice('UnknownBrand', 'UnknownModel', 'HIGH')).toBe(460);
    expect(estimateDpiFromDevice('UnknownBrand', 'UnknownModel', 'GAMING')).toBe(460);
  });
});
