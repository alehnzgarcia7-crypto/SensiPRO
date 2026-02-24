import type { SensitivityStyle } from '@prisma/client';

import type { StyleMultipliers } from './types';

// ═══════════════════════════════════════════════════════════
// ESTILOS DE JUEGO
// ═══════════════════════════════════════════════════════════
//
// AGGRESSIVE (Agresivo / Rush):
//   - Sensibilidad general ALTA para giros rápidos
//   - Red point ALTO para aim rápido
//   - Scopes más bajos (no prioriza largo alcance)
//   - Free view ALTO para awareness situacional
//
// BALANCED (Balanceado):
//   - Todos los valores en rango medio-alto
//   - Ideal para la mayoría de jugadores
//   - Buen balance entre near y far combat
//
// SNIPER (Francotirador):
//   - General y red point BAJOS (movimientos lentos, precisos)
//   - Scopes 4x y sniper ALTOS (prioriza largo alcance)
//   - Free view BAJO (posiciones estáticas)

const STYLE_MULTIPLIERS: Record<SensitivityStyle, StyleMultipliers> = {
  AGGRESSIVE: {
    general:     1.20,  // +20% — giros rápidos
    redPoint:    1.15,  // +15% — aim agresivo
    scope2x:     0.95,  // -5%  — menos prioridad
    scope4x:     0.85,  // -15% — no es el foco
    sniperScope: 0.80,  // -20% — sniper no es su estilo
    freeView:    1.18,  // +18% — awareness máximo
  },
  BALANCED: {
    general:     1.00,  // neutral
    redPoint:    1.00,  // neutral
    scope2x:     1.00,  // neutral
    scope4x:     1.00,  // neutral
    sniperScope: 1.00,  // neutral
    freeView:    1.00,  // neutral
  },
  SNIPER: {
    general:     0.85,  // -15% — movimientos lentos
    redPoint:    0.90,  // -10% — menos agresivo
    scope2x:     1.08,  // +8%  — algo más
    scope4x:     1.18,  // +18% — largo alcance
    sniperScope: 1.25,  // +25% — máxima precisión sniper
    freeView:    0.82,  // -18% — posiciones estáticas
  },
};

export function getStyleMultipliers(style: SensitivityStyle): StyleMultipliers {
  return STYLE_MULTIPLIERS[style];
}

export function getAllStyles(): SensitivityStyle[] {
  return ['AGGRESSIVE', 'BALANCED', 'SNIPER'];
}
