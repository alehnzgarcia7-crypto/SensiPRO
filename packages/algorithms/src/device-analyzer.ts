import type { DeviceSpecs } from './types';

// ═══════════════════════════════════════════════════════════
// ARES DEVICE ANALYZER v1.0
// ═══════════════════════════════════════════════════════════
//
// Analiza las specs de un dispositivo y genera un score
// de performance compuesto (0-100).
//
// Score ponderado:
//   Hz       → 30% del score total
//   RAM      → 25% del score total
//   Panel    → 20% del score total
//   Tier     → 15% del score total
//   Screen   → 10% del score total

// Normalización: (valor - min) / (max - min) → rango 0-1
const HZ_MIN = 30;
const HZ_MAX = 165;

const RAM_MIN = 1;
const RAM_MAX = 16;

const SCREEN_MIN = 4.0;
const SCREEN_MAX = 7.6;

// Panel type score (0-1)
const PANEL_SCORES: Record<string, number> = {
  LCD:    0.20,
  IPS:    0.40,
  AMOLED: 0.80,
  OLED:   0.85,
  LTPO:   1.00,
};

// Tier score (0-1)
const TIER_SCORES: Record<string, number> = {
  LOW:    0.15,
  MID:    0.40,
  HIGH:   0.65,
  ULTRA:  0.85,
  GAMING: 1.00,
};

// Pesos de cada componente en el score final
const WEIGHTS = {
  hz:     0.30,
  ram:    0.25,
  panel:  0.20,
  tier:   0.15,
  screen: 0.10,
} as const;

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function calculatePerformanceScore(specs: DeviceSpecs): number {
  const hzNorm = normalize(specs.screenHz, HZ_MIN, HZ_MAX);
  const ramNorm = normalize(specs.ramGb, RAM_MIN, RAM_MAX);
  const screenNorm = normalize(specs.screenSize, SCREEN_MIN, SCREEN_MAX);
  const panelNorm = PANEL_SCORES[specs.panelType] ?? 0.20;
  const tierNorm = TIER_SCORES[specs.tier] ?? 0.40;

  const weightedScore =
    hzNorm * WEIGHTS.hz +
    ramNorm * WEIGHTS.ram +
    panelNorm * WEIGHTS.panel +
    tierNorm * WEIGHTS.tier +
    screenNorm * WEIGHTS.screen;

  // Escala a 0-100 y redondea
  return Math.round(weightedScore * 100);
}

export function analyzeDeviceSpecs(specs: DeviceSpecs): {
  performanceScore: number;
  category: string;
  strengths: string[];
  weaknesses: string[];
} {
  const score = calculatePerformanceScore(specs);

  const category =
    score >= 80 ? 'Elite Gaming' :
    score >= 60 ? 'Alto Rendimiento' :
    score >= 40 ? 'Gama Media' :
    'Gama Baja';

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Analizar Hz
  if (specs.screenHz >= 120) {
    strengths.push('Pantalla de alta frecuencia ideal para gaming');
  } else if (specs.screenHz <= 60) {
    weaknesses.push('Frecuencia de pantalla baja puede limitar fluidez');
  }

  // Analizar RAM
  if (specs.ramGb >= 8) {
    strengths.push('RAM abundante para multitarea y gaming fluido');
  } else if (specs.ramGb <= 3) {
    weaknesses.push('RAM limitada puede causar cierres de app');
  }

  // Analizar panel
  if (specs.panelType === 'AMOLED' || specs.panelType === 'OLED' || specs.panelType === 'LTPO') {
    strengths.push('Panel premium con colores vibrantes y respuesta rápida');
  } else if (specs.panelType === 'LCD') {
    weaknesses.push('Panel LCD básico sin colores profundos');
  }

  // Analizar pantalla
  if (specs.screenSize >= 6.5) {
    strengths.push('Pantalla grande para mejor visibilidad de enemigos');
  } else if (specs.screenSize < 5.5) {
    weaknesses.push('Pantalla pequeña limita campo visual');
  }

  return { performanceScore: score, category, strengths, weaknesses };
}
