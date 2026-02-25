import { describe, it, expect } from 'vitest';

import { generateExportHtml, generateExportText } from '@/lib/export/generate-image';
import type { ExportData, ExportOptions } from '@/lib/export/generate-image';

// ═══════════════════════════════════════════════════════════════
// Tests para ARES-106 — Config Export
// ═══════════════════════════════════════════════════════════════

const mockData: ExportData = {
  deviceBrand: 'Samsung',
  deviceModel: 'Galaxy S24 Ultra',
  style: 'AGGRESSIVE',
  sensitivity: {
    general: 72,
    redPoint: 68,
    scope2x: 55,
    scope4x: 48,
    sniperScope: 42,
    freeView: 75,
  },
  gyroscope: {
    gyroGeneral: 38,
    gyroRedPoint: 35,
    gyroScope2x: 28,
    gyroScope4x: 24,
    gyroSniper: 21,
    gyroFreeView: 40,
  },
  performanceScore: 85,
};

const mockDataNoGyro: ExportData = {
  ...mockData,
  gyroscope: null,
};

// ─── generateExportText ──────────────────────────────

describe('generateExportText', () => {
  it('genera texto con nombre del dispositivo y estilo', () => {
    const text = generateExportText(mockData);
    expect(text).toContain('Samsung Galaxy S24 Ultra');
    expect(text).toContain('AGRESIVO');
  });

  it('incluye todos los valores de sensibilidad', () => {
    const text = generateExportText(mockData);
    expect(text).toContain('General: 72');
    expect(text).toContain('Punto Rojo: 68');
    expect(text).toContain('Mira 2x: 55');
    expect(text).toContain('Mira 4x: 48');
    expect(text).toContain('AWM: 42');
    expect(text).toContain('Vista Libre: 75');
  });

  it('incluye performance score', () => {
    const text = generateExportText(mockData);
    expect(text).toContain('Score: 85/100');
  });

  it('incluye valores de giroscopio cuando existen', () => {
    const text = generateExportText(mockData);
    expect(text).toContain('GIROSCOPIO');
    expect(text).toContain('General: 38');
    expect(text).toContain('Punto Rojo: 35');
  });

  it('omite giroscopio cuando no hay datos', () => {
    const text = generateExportText(mockDataNoGyro);
    expect(text).not.toContain('GIROSCOPIO');
  });

  it('incluye watermark de sensibilidadespro.com', () => {
    const text = generateExportText(mockData);
    expect(text).toContain('sensibilidadespro.com');
  });

  it('funciona con estilo BALANCED', () => {
    const balancedData: ExportData = { ...mockData, style: 'BALANCED' };
    const text = generateExportText(balancedData);
    expect(text).toContain('BALANCEADO');
  });

  it('funciona con estilo SNIPER', () => {
    const sniperData: ExportData = { ...mockData, style: 'SNIPER' };
    const text = generateExportText(sniperData);
    expect(text).toContain('FRANCOTIRADOR');
  });
});

// ─── generateExportHtml ──────────────────────────────

describe('generateExportHtml', () => {
  const squareOptions: ExportOptions = {
    format: 'square',
    includeGyro: false,
    includeWatermark: true,
  };

  const storyOptions: ExportOptions = {
    format: 'story',
    includeGyro: true,
    includeWatermark: true,
  };

  it('genera HTML con dimensiones square (1080x1080)', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).toContain('width:1080px');
    expect(html).toContain('height:1080px');
  });

  it('genera HTML con dimensiones story (1080x1920)', () => {
    const html = generateExportHtml(mockData, storyOptions);
    expect(html).toContain('width:1080px');
    expect(html).toContain('height:1920px');
  });

  it('incluye nombre del dispositivo en el HTML', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).toContain('Samsung Galaxy S24 Ultra');
  });

  it('incluye valores de sensibilidad en el HTML', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).toContain('72');
    expect(html).toContain('68');
    expect(html).toContain('General');
    expect(html).toContain('Punto Rojo');
  });

  it('incluye watermark cuando se solicita', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).toContain('sensibilidadespro.com');
  });

  it('omite watermark cuando no se solicita', () => {
    const noWatermark: ExportOptions = { ...squareOptions, includeWatermark: false };
    const html = generateExportHtml(mockData, noWatermark);
    expect(html).not.toContain('sensibilidadespro.com');
  });

  it('incluye giroscopio en story cuando se solicita', () => {
    const html = generateExportHtml(mockData, storyOptions);
    expect(html).toContain('GIROSCOPIO');
    expect(html).toContain('Gyro General');
    expect(html).toContain('38');
  });

  it('omite giroscopio cuando no se solicita', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).not.toContain('GIROSCOPIO');
  });

  it('usa colores rojos para estilo AGGRESSIVE', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).toContain('#ef4444');
  });

  it('usa colores azules para estilo BALANCED', () => {
    const balancedData: ExportData = { ...mockData, style: 'BALANCED' };
    const html = generateExportHtml(balancedData, squareOptions);
    expect(html).toContain('#3b82f6');
  });

  it('usa colores verdes para estilo SNIPER', () => {
    const sniperData: ExportData = { ...mockData, style: 'SNIPER' };
    const html = generateExportHtml(sniperData, squareOptions);
    expect(html).toContain('#22c55e');
  });

  it('incluye barras de progreso con porcentaje correcto', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).toContain('width:72%');
    expect(html).toContain('width:68%');
  });

  it('tiene fondo dark theme #050810', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).toContain('background:#050810');
  });

  it('incluye performance score', () => {
    const html = generateExportHtml(mockData, squareOptions);
    expect(html).toContain('Performance Score: 85/100');
  });
});
