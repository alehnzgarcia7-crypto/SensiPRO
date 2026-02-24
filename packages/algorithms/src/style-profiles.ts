import type { SensitivityStyle, DeviceTier } from '@prisma/client';

// ═══════════════════════════════════════════════════════════
// ARES STYLE PROFILES v1.0
// ═══════════════════════════════════════════════════════════
//
// Perfiles detallados de cada estilo de juego con metadata
// para UI, recomendaciones, tips y matching por tier.
//
// Los multiplicadores numéricos viven en style-system.ts.
// Este módulo contiene la información descriptiva y lógica
// de recomendación por tipo de dispositivo.

export interface StyleProfile {
  key: SensitivityStyle;
  name: string;
  nameEs: string;
  icon: string;
  color: string;
  description: string;
  playstyle: string;
  strengths: string[];
  weaknesses: string[];
  recommendedFor: string[];
  tipShort: string;
  tipDetailed: string;
}

export const STYLE_PROFILES: Record<SensitivityStyle, StyleProfile> = {
  AGGRESSIVE: {
    key: 'AGGRESSIVE',
    name: 'Aggressive',
    nameEs: 'Agresivo',
    icon: '\u2694\uFE0F',
    color: '#ef4444',
    description: 'Para jugadores rush que buscan dominar en combate cercano',
    playstyle: 'Rush / CQB (Close Quarter Battle)',
    strengths: [
      'Giros de 180\u00B0 ultra r\u00E1pidos',
      'Aim tracking superior en movimiento',
      'Dominio en combate cercano y medio',
      'Reacci\u00F3n inmediata a flanqueos',
    ],
    weaknesses: [
      'Menos precisi\u00F3n en scopes altos',
      'Puede ser dif\u00EDcil de controlar para principiantes',
      'No ideal para posiciones est\u00E1ticas',
    ],
    recommendedFor: [
      'Jugadores agresivos / rushers',
      'SMG y shotgun mains',
      'Jugadores con experiencia',
      'Dispositivos HIGH y GAMING',
    ],
    tipShort: 'Ideal para rushear. Giros r\u00E1pidos, aim agresivo.',
    tipDetailed: 'Esta configuraci\u00F3n prioriza velocidad de giro y tracking. Practica en modo entrenamiento antes de usarla en ranked. Funciona mejor con SMGs como MP40 y Thompson.',
  },
  BALANCED: {
    key: 'BALANCED',
    name: 'Balanced',
    nameEs: 'Balanceado',
    icon: '\uD83C\uDFAF',
    color: '#3b82f6',
    description: 'El equilibrio perfecto para la mayor\u00EDa de jugadores',
    playstyle: 'Vers\u00E1til / All-around',
    strengths: [
      'Funciona bien en todas las distancias',
      'F\u00E1cil de adaptar para cualquier arma',
      'Buena precisi\u00F3n sin sacrificar velocidad',
      'Ideal para aprender y mejorar',
    ],
    weaknesses: [
      'No es el mejor en ning\u00FAn extremo',
      'Jugadores muy agresivos pueden sentirlo lento',
      'Snipers dedicados preferir\u00E1n m\u00E1s estabilidad',
    ],
    recommendedFor: [
      'La mayor\u00EDa de jugadores',
      'Jugadores que usan m\u00FAltiples armas',
      'Principiantes y nivel intermedio',
      'Todos los dispositivos',
    ],
    tipShort: 'Perfecto para empezar. Funciona con todo.',
    tipDetailed: 'La configuraci\u00F3n m\u00E1s segura y vers\u00E1til. Si no sabes cu\u00E1l elegir, esta es tu opci\u00F3n. Funciona bien con ARs como M4A1, AK, y SCAR.',
  },
  SNIPER: {
    key: 'SNIPER',
    name: 'Sniper',
    nameEs: 'Francotirador',
    icon: '\uD83D\uDD2D',
    color: '#22c55e',
    description: 'M\u00E1xima precisi\u00F3n para francotiradores dedicados',
    playstyle: 'Long range / Camping estrat\u00E9gico',
    strengths: [
      'Precisi\u00F3n milim\u00E9trica con scopes',
      'Estabilidad superior para headshots',
      'Dominio absoluto a larga distancia',
      'Control fino para micro-ajustes',
    ],
    weaknesses: [
      'Giros lentos \u2014 vulnerable a flanqueos',
      'Combate cercano desventajoso',
      'Requiere buena posici\u00F3n de juego',
    ],
    recommendedFor: [
      'Snipers dedicados',
      'AWM y Kar98k mains',
      'Jugadores pacientes y estrat\u00E9gicos',
      'Dispositivos MID+ (necesita buen panel)',
    ],
    tipShort: 'Para snipers. M\u00E1xima precisi\u00F3n en scopes.',
    tipDetailed: 'Configuraci\u00F3n optimizada para largo alcance. Los scopes 4x y sniper tienen valores m\u00E1s altos para micro-ajustes precisos. Practica flick shots en entrenamiento.',
  },
};

/**
 * Recomienda el estilo basándose en el tier del dispositivo.
 * - GAMING: AGGRESSIVE (pueden manejar sensibilidad alta)
 * - ULTRA/HIGH: BALANCED (buena opción segura)
 * - MID: BALANCED (la mayoría de jugadores)
 * - LOW: SNIPER (valores más bajos y estables)
 */
export function getRecommendedStyle(deviceTier: DeviceTier): SensitivityStyle {
  switch (deviceTier) {
    case 'GAMING':
      return 'AGGRESSIVE';
    case 'ULTRA':
      return 'BALANCED';
    case 'HIGH':
      return 'BALANCED';
    case 'MID':
      return 'BALANCED';
    case 'LOW':
      return 'SNIPER';
    default:
      return 'BALANCED';
  }
}

export function getStyleProfile(style: SensitivityStyle): StyleProfile {
  return STYLE_PROFILES[style];
}

export function getAllStyleProfiles(): StyleProfile[] {
  return Object.values(STYLE_PROFILES);
}
