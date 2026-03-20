import {
  SENSITIVITY_MIN,
  SENSITIVITY_MAX,
} from '@ares/config';

import type { AlgorithmInput, AlgorithmOutput, SensitivityOutput, GyroscopeOutput, ForensicMetadata } from './types';
import { calculatePerformanceScore } from './device-analyzer';
import { generateGyroscope } from './gyroscope-engine';

// ══════════════════════════════════════════════════════════════
// SENSITIVITY ENGINE v5.0 — PRO-CALIBRATED
// ══════════════════════════════════════════════════════════════
//
// Recalibración total basada en datos de fuentes de jugadores
// profesionales de Free Fire (freefiremania, esportzone, escharts,
// liquipedia, noping, ar-pay, item4gamer).
//
// RANGO: 1-200 (escala Free Fire post-OB43)
//
// PIPELINE:
//   1. DPI efectivo (screen DPI del hardware)
//   2. General base via interpolación lineal por segmentos (recalibrada)
//   3. Ajustes secundarios: RAM (±4), Hz (±3), screenSize (±4), style (±40/-20)
//   4. Ratios independientes por estilo para cada slider (reemplaza tapering lineal)
//   5. Free View como ratio de General en escala 0-200 (ya no fórmula separada)
//   6. Gyroscope con base independiente y tapering -10
//
// VALIDACIÓN (v5.0 vs rangos de pros):
//   Samsung A14 (DPI 400, 4GB, 90Hz, 6.6") AGGRESSIVE: General ~139 (pro: 140-150)
//   Moto G22 (DPI 270, 4GB, 90Hz, 6.5") BALANCED: General ~115 (pro ajustado por PPI)
//   iPhone 14 (DPI 460, 6GB, 60Hz, 6.1") SNIPER: General ~72 (pro: 70-85)

// Estilo de juego: boost al general (additive) — basado en centros de rangos de pros
// Pro AGGRESSIVE center: 145, Pro BALANCED center: 100, Pro SNIPER center: 78
// Differentials: AGG = +45 vs BAL, SNI = -22 vs BAL → redondeados a +40/-20
const STYLE_CONFIG = {
  AGGRESSIVE: { generalBoost: 40 },
  BALANCED:   { generalBoost: 0 },
  SNIPER:     { generalBoost: -20 },
} as const;

// Ratios por estilo: cada slider se calcula como general × ratio
// Derivados de promedios de jugadores profesionales
const STYLE_RATIOS = {
  AGGRESSIVE: {
    redPoint: 0.78,      // 140→109 (pro: 105-115)
    scope2x: 0.64,       // 140→90  (pro: 85-95)
    scope4x: 0.61,       // 140→85  (pro: 80-90)
    sniperScope: 1.07,   // 140→150 (pro: 145-155, quickscoping)
    freeView: 0.93,      // 140→130 (pro: 120-140)
  },
  BALANCED: {
    redPoint: 0.95,      // 100→95  (pro: 90-100)
    scope2x: 0.90,       // 100→90  (pro: 85-95)
    scope4x: 0.80,       // 100→80  (pro: 75-85)
    sniperScope: 0.60,   // 100→60  (pro: 55-65)
    freeView: 0.68,      // 100→68  (pro: 60-75)
  },
  SNIPER: {
    redPoint: 1.06,      // 80→85   (pro: 80-90, snipers need CQC backup)
    scope2x: 1.00,       // 80→80   (pro: 75-85)
    scope4x: 0.88,       // 80→70   (pro: 65-75)
    sniperScope: 0.59,   // 80→47   (pro: 40-55)
    freeView: 0.63,      // 80→50   (pro: 40-60)
  },
} as const;

// ── Helpers ──────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

/**
 * DPI efectivo: customDpi > screenDpi del device > estimación por tier
 */
function getEffectiveDpi(
  screenDpi: number | undefined,
  tier: string,
  customDpi?: number,
): number {
  if (customDpi && customDpi > 0) return customDpi;
  if (screenDpi && screenDpi > 0) return screenDpi;

  // Fallback por tier cuando no hay DPI conocido
  switch (tier.toUpperCase()) {
    case 'LOW': return 270;
    case 'MID': return 395;
    case 'HIGH': return 460;
    case 'ULTRA': return 460;
    case 'GAMING': return 460;
    default: return 395;
  }
}

/**
 * Calcula General base usando DPI (driver principal).
 * Interpolación lineal por segmentos calibrada contra datos de pros.
 *
 * v5.0: Recalibrada para que ~400 PPI (dispositivo más común en LATAM)
 * produzca base ~100, alineado con centro de rango BALANCED de pros (95-105).
 *
 * Curva: DPI bajo = sens alta, DPI alto = sens baja
 *   DPI 200 → 130
 *   DPI 280 → 115
 *   DPI 400 → 100
 *   DPI 460 → 88
 *   DPI 600 → 75
 */
function calculateGeneralBase(dpi: number): number {
  if (dpi <= 200) return 130;
  if (dpi >= 600) return 75;

  // Segmentos v5.0: calibrados para que base BALANCED caiga en rango de pros
  // 400 PPI (Samsung A14/A54, Redmi Note) → 100 → pro BALANCED: 95-105 ✅
  // 270 PPI (Moto G22, Tecno Spark) → ~115 → ajustado por PPI bajo ✅
  // 460 PPI (iPhone 14/15/16) → 88 → pro BALANCED con PPI alto ✅
  const segments = [
    { dpiMin: 200, dpiMax: 280, sensHigh: 130, sensLow: 115 },
    { dpiMin: 280, dpiMax: 400, sensHigh: 115, sensLow: 100 },
    { dpiMin: 400, dpiMax: 460, sensHigh: 100, sensLow: 88 },
    { dpiMin: 460, dpiMax: 600, sensHigh: 88, sensLow: 75 },
  ];

  for (const seg of segments) {
    if (dpi >= seg.dpiMin && dpi <= seg.dpiMax) {
      const ratio = (dpi - seg.dpiMin) / (seg.dpiMax - seg.dpiMin);
      return Math.round(seg.sensHigh - (seg.sensHigh - seg.sensLow) * ratio);
    }
  }

  return 100; // fallback — mid-range device
}

/**
 * Ajuste secundario por RAM (±4 máximo).
 * Menos RAM → FPS inestables → pixel skipping → sensibilidad más baja para control.
 * Más RAM → más estabilidad → puede usar sensibilidad ligeramente más alta.
 */
function ramAdjustment(ramGb: number): number {
  if (ramGb <= 2) return -4;
  if (ramGb <= 3) return -2;
  if (ramGb <= 4) return -1;
  if (ramGb <= 6) return 0;
  if (ramGb <= 8) return 1;
  if (ramGb <= 12) return 2;
  return 3;
}

/**
 * Ajuste por refresh rate.
 * Más Hz → más frames → puede bajar sensibilidad.
 */
function hzAdjustment(hz: number): number {
  if (hz <= 60) return 3;
  if (hz <= 90) return 1;
  if (hz <= 120) return 0;
  if (hz <= 144) return -1;
  return -2;
}

/**
 * Ajuste por tamaño de pantalla.
 * Pantalla grande → dedo recorre más → menos sensibilidad.
 */
// Granularidad mejorada 2026-02-27: nuevo punto de corte 6.5-6.7" (-1)
// y separación tablets ≥8.0" (-6). Ver ALGORITHM-AUDIT.md
function screenSizeAdjustment(inches: number): number {
  if (inches < 5.5) return 3;    // Compactos (iPhone SE, etc.)
  if (inches < 6.0) return 1;    // Pequeños (iPhone 13 mini, etc.)
  if (inches < 6.5) return 0;    // Estándar (Samsung A54, iPhone 15, etc.)
  if (inches < 6.7) return -1;   // Grandes (iPhone 15 Plus, POCO X5, etc.)
  if (inches < 7.0) return -2;   // Extra grandes (iPhone 16 Pro Max, etc.)
  if (inches < 8.0) return -4;   // Phablets
  return -6;                      // Tablets (iPad, Samsung Tab, etc.)
}

// Free View ahora se calcula como ratio de General en escala 0-200
// (eliminada la fórmula separada que producía valores 12-25)

/**
 * Giroscopio v5.0: valores conservadores basados en rango pro (20-40).
 * Base independiente de DPI, tapering -10 (más suave que touch).
 * El style boost se escala ×0.1 para mantener gyro en rango estrecho.
 */
function calculateForensicGyroscope(
  dpi: number,
  ramGb: number,
  style: keyof typeof STYLE_CONFIG,
): GyroscopeOutput {
  const styleConfig = STYLE_CONFIG[style];

  let gyroBase = dpi <= 300 ? 42 : dpi <= 450 ? 38 : 34;
  gyroBase += ramAdjustment(ramGb);
  // Escalar style boost ×0.1 para gyro (AGG: +4, BAL: 0, SNI: -2)
  gyroBase += Math.round(styleConfig.generalBoost * 0.1);

  const gyroTapering = 10;

  return {
    gyroGeneral: clamp(gyroBase, 0, 100),
    gyroRedPoint: clamp(gyroBase - gyroTapering, 0, 100),
    gyroScope2x: clamp(gyroBase - gyroTapering * 2, 0, 100),
    gyroScope4x: clamp(gyroBase - gyroTapering * 3, 0, 100),
    gyroSniper: clamp(gyroBase - gyroTapering * 4, 0, 100),
    gyroFreeView: clamp(Math.round(gyroBase * 0.35), 5, 15),
  };
}

// ══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ══════════════════════════════════════════════════════════════

export function generateSensitivity(input: AlgorithmInput): AlgorithmOutput {
  const { specs, style, includeGyro, userRam, userHz, customDpi } = input;
  const styleConfig = STYLE_CONFIG[style];
  const ratios = STYLE_RATIOS[style];

  // Usar userRam/userHz si vienen, sino los del device
  const ram = userRam ?? specs.ramGb;
  const hz = userHz ?? specs.screenHz;

  // 1. DPI efectivo (driver principal)
  const dpi = getEffectiveDpi(specs.screenDpi, specs.tier, customDpi);

  // 2. General base (interpolación por segmentos de DPI)
  let generalBase = calculateGeneralBase(dpi);

  // 3. Ajustes secundarios
  const ramAdj = ramAdjustment(ram);
  const hzAdj = hzAdjustment(hz);
  const screenAdj = screenSizeAdjustment(specs.screenSize);
  const styleAdj = styleConfig.generalBoost;

  generalBase += ramAdj + hzAdj + screenAdj + styleAdj;

  // 4. General clamped
  const general = clamp(generalBase, SENSITIVITY_MIN, SENSITIVITY_MAX);

  // 5. Ratios independientes por estilo (reemplaza tapering lineal)
  const sensitivity: SensitivityOutput = {
    general,
    redPoint: clamp(Math.round(general * ratios.redPoint), SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope2x: clamp(Math.round(general * ratios.scope2x), SENSITIVITY_MIN, SENSITIVITY_MAX),
    scope4x: clamp(Math.round(general * ratios.scope4x), SENSITIVITY_MIN, SENSITIVITY_MAX),
    sniperScope: clamp(Math.round(general * ratios.sniperScope), SENSITIVITY_MIN, SENSITIVITY_MAX),
    freeView: clamp(Math.round(general * ratios.freeView), SENSITIVITY_MIN, SENSITIVITY_MAX),
  };

  // 6. Giroscopio: usar cálculo forense v5.0 o el engine standalone
  const gyroscope = includeGyro
    ? calculateForensicGyroscope(dpi, ram, style)
    : null;

  // 7. Metadata (v5.0)
  const metadata: ForensicMetadata = {
    algorithmVersion: '5.0-pro-calibrated',
    effectiveDpi: dpi,
    generalBase,
    adjustments: { ram: ramAdj, hz: hzAdj, screen: screenAdj, style: styleAdj },
    tapering: 0, // v5.0 usa ratios por estilo, no tapering lineal
  };

  return {
    sensitivity,
    gyroscope,
    meta: {
      performanceScore: calculatePerformanceScore(specs),
      styleApplied: style,
      deviceTier: specs.tier,
      algorithm: 'ARES-v5.0-pro-calibrated',
    },
    metadata,
  };
}

// ══════════════════════════════════════════════════════════════
// UTILIDAD: Estimar DPI cuando no se tiene dato exacto
// ══════════════════════════════════════════════════════════════

export function estimateDpiFromDevice(
  brand: string,
  model: string,
  tier: string,
): number {
  const knownDpis: Record<string, number> = {
    // Samsung gama baja
    // DPIs corregidos 2026-02-27: A13/A14/A15 son FHD+, A04/A04e/A04s son HD+ 720p
    // Verificados contra GSMArena. Ver ALGORITHM-AUDIT.md
    'samsung_a03': 270, 'samsung_a04': 270, 'samsung_a04e': 265,
    'samsung_a04s': 270, 'samsung_a13': 400, 'samsung_a14': 400,
    'samsung_a15': 396, 'samsung_a24': 396, 'samsung_a25': 396,
    // Samsung gama media
    'samsung_a34': 393, 'samsung_a54': 401, 'samsung_a55': 401,
    'samsung_a73': 393, 'samsung_m14': 400, 'samsung_m34': 393,
    // Samsung gama alta
    'samsung_s21': 421, 'samsung_s22': 425, 'samsung_s23': 425,
    'samsung_s24': 416, 'samsung_s24ultra': 505,
    // Xiaomi gama baja
    'xiaomi_redmi12': 270, 'xiaomi_redmi13c': 270, 'xiaomi_redmi12c': 270,
    'xiaomi_pococ65': 270, 'xiaomi_pocom6': 270,
    // Xiaomi gama media
    'xiaomi_redminote12': 395, 'xiaomi_redminote13': 395,
    'xiaomi_redminote13pro': 411, 'xiaomi_redminote12pro': 395,
    'xiaomi_pocox5': 395, 'xiaomi_pocox6': 395,
    // Xiaomi gama alta
    'xiaomi_13': 460, 'xiaomi_14': 460, 'xiaomi_14ultra': 522,
    // iPhone
    'apple_iphone8': 326, 'apple_iphonese': 326, 'apple_iphonexr': 326,
    'apple_iphone11': 326, 'apple_iphone12': 460, 'apple_iphone12mini': 476,
    'apple_iphone12pro': 460, 'apple_iphone12promax': 458,
    'apple_iphone13': 460, 'apple_iphone13mini': 476,
    'apple_iphone13pro': 460, 'apple_iphone13promax': 458,
    'apple_iphone14': 460, 'apple_iphone14plus': 458,
    'apple_iphone14pro': 460, 'apple_iphone14promax': 460,
    'apple_iphone15': 460, 'apple_iphone15plus': 460,
    'apple_iphone15pro': 460, 'apple_iphone15promax': 460,
    'apple_iphone16': 460, 'apple_iphone16plus': 460,
    'apple_iphone16pro': 460, 'apple_iphone16promax': 460,
    // Motorola
    'motorola_motog24': 270, 'motorola_motog54': 401,
    'motorola_motog84': 409, 'motorola_edge40': 402,
    'motorola_edge50': 410,
    // Realme
    // GT Neo 5 DPI corregido 2026-02-27: 2772×1240, 6.74" → 451 PPI (GSMArena)
    'realme_c55': 270, 'realme_11': 395, 'realme_12pro': 410,
    'realme_gtneo5': 451,
    // OPPO
    'oppo_a78': 270, 'oppo_reno11': 410,
    // Tecno
    'tecno_spark20': 270, 'tecno_camon20': 395,
    // Infinix
    'infinix_hot40': 270, 'infinix_note30': 395,
    // Huawei
    'huawei_nova12': 422, 'huawei_p60': 460,
  };

  const key = `${brand.toLowerCase()}_${model.toLowerCase().replace(/[\s\-]+/g, '')}`;
  if (knownDpis[key]) return knownDpis[key];

  // Fallback por tier
  switch (tier.toUpperCase()) {
    case 'LOW': return 270;
    case 'MID': return 395;
    case 'HIGH': return 460;
    case 'ULTRA': return 460;
    case 'GAMING': return 460;
    default: return 395;
  }
}
