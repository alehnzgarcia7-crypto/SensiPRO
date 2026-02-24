import type { DeviceSpecs } from './types';
import type { DeviceTier, PanelType } from '@prisma/client';

// ═══════════════════════════════════════════════════════════
// ARES DEVICE SPECS ANALYZER v2.0
// ═══════════════════════════════════════════════════════════
//
// Performance Score (0-100):
//   hzScore     = (Hz - 30) / 120 * 30 pts     (max 30)
//   ramScore    = (RAM - 1) / 15 * 25 pts       (max 25)
//   panelScore  = LTPO=25, AMOLED=20, OLED=20, IPS=10, LCD=5
//   tierScore   = GAMING=20, ULTRA=18, HIGH=15, MID=10, LOW=5
//
//   Total = hzScore + ramScore + panelScore + tierScore (max 100)
//   Bonus: GAMING + AMOLED/OLED combo = +5

const PANEL_SCORES: Record<PanelType, number> = {
  LTPO: 25,
  AMOLED: 20,
  OLED: 20,
  IPS: 10,
  LCD: 5,
};

const TIER_SCORES: Record<DeviceTier, number> = {
  GAMING: 20,
  ULTRA: 18,
  HIGH: 15,
  MID: 10,
  LOW: 5,
};

export function calculatePerformanceScore(specs: DeviceSpecs): number {
  const hzScore = Math.min(30, Math.max(0, ((specs.screenHz - 30) / 120) * 30));
  const ramScore = Math.min(25, Math.max(0, ((specs.ramGb - 1) / 15) * 25));
  const panelScore = PANEL_SCORES[specs.panelType] ?? 5;
  const tierScore = TIER_SCORES[specs.tier] ?? 5;

  // Bonus para combo GAMING + AMOLED/OLED
  const comboBonus =
    specs.tier === 'GAMING' && (specs.panelType === 'AMOLED' || specs.panelType === 'OLED')
      ? 5
      : 0;

  return Math.min(100, Math.round(hzScore + ramScore + panelScore + tierScore + comboBonus));
}

/**
 * Auto-detecta tier basado en specs cuando no se proporciona.
 */
export function autoDetectTier(specs: Omit<DeviceSpecs, 'tier'>): DeviceTier {
  const { screenHz, ramGb, panelType } = specs;
  const isPremiumPanel = panelType === 'AMOLED' || panelType === 'OLED' || panelType === 'LTPO';

  if (screenHz >= 120 && ramGb >= 8 && isPremiumPanel) {
    return 'GAMING';
  }
  if (screenHz >= 120 && ramGb >= 8) {
    return 'ULTRA';
  }
  if (screenHz >= 90 && ramGb >= 6 && isPremiumPanel) {
    return 'HIGH';
  }
  if (screenHz >= 60 && ramGb >= 4) {
    return 'MID';
  }
  return 'LOW';
}

export interface DeviceAnalysis {
  performanceScore: number;
  tier: DeviceTier;
  rating: 'Excelente' | 'Muy Bueno' | 'Bueno' | 'Básico';
  summary: string;
  strengths: string[];
  limitations: string[];
  gamingVerdict: string;
}

export function analyzeDeviceSpecs(specs: DeviceSpecs): DeviceAnalysis {
  const score = calculatePerformanceScore(specs);

  let rating: DeviceAnalysis['rating'];
  let gamingVerdict: string;

  if (score >= 80) {
    rating = 'Excelente';
    gamingVerdict =
      'Dispositivo GAMING de élite. Puedes usar cualquier sensibilidad sin problemas. Ideal para ranked competitivo.';
  } else if (score >= 60) {
    rating = 'Muy Bueno';
    gamingVerdict =
      'Excelente para Free Fire. Soporta sensibilidades altas y giroscopio sin lag.';
  } else if (score >= 40) {
    rating = 'Bueno';
    gamingVerdict =
      'Funciona bien para Free Fire. Usa sensibilidades medias para mejor experiencia.';
  } else {
    rating = 'Básico';
    gamingVerdict =
      'Puede correr Free Fire pero con limitaciones. Usa sensibilidades bajas (estilo Sniper) para mayor estabilidad.';
  }

  const strengths: string[] = [];
  const limitations: string[] = [];

  // Hz
  if (specs.screenHz >= 120) {
    strengths.push(`Pantalla ${specs.screenHz}Hz — ultra fluida`);
  } else if (specs.screenHz >= 90) {
    strengths.push(`Pantalla ${specs.screenHz}Hz — buena fluidez`);
  } else {
    limitations.push(`Pantalla ${specs.screenHz}Hz — limitada`);
  }

  // RAM
  if (specs.ramGb >= 8) {
    strengths.push(`${specs.ramGb}GB RAM — sin problemas de memoria`);
  } else if (specs.ramGb >= 4) {
    strengths.push(`${specs.ramGb}GB RAM — suficiente para Free Fire`);
  } else {
    limitations.push(`${specs.ramGb}GB RAM — puede tener lag en partidas largas`);
  }

  // Panel
  if (specs.panelType === 'AMOLED' || specs.panelType === 'OLED' || specs.panelType === 'LTPO') {
    strengths.push(`Panel ${specs.panelType} — colores vibrantes, mejor respuesta táctil`);
  } else {
    limitations.push(`Panel ${specs.panelType} — respuesta táctil estándar`);
  }

  // Screen
  if (specs.screenSize >= 6.5) {
    strengths.push(`Pantalla ${specs.screenSize}" — excelente visibilidad de enemigos`);
  } else if (specs.screenSize < 5.5) {
    limitations.push(`Pantalla ${specs.screenSize}" — campo visual reducido`);
  }

  const summary = `${rating} para gaming (${score}/100). ${specs.screenHz}Hz, ${specs.ramGb}GB RAM, ${specs.panelType}.`;

  return {
    performanceScore: score,
    tier: specs.tier,
    rating,
    summary,
    strengths,
    limitations,
    gamingVerdict,
  };
}
