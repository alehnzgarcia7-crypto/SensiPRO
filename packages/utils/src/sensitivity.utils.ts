import type { SensitivityStyle } from '@prisma/client';

export function formatSensitivity(value: number): string {
  return Math.round(value).toString();
}

export function clampValue(value: number, min = 1, max = 100): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

export function getStyleColor(style: SensitivityStyle): string {
  const colors: Record<SensitivityStyle, string> = {
    AGGRESSIVE: '#ef4444',
    BALANCED: '#3b82f6',
    SNIPER: '#22c55e',
  };
  return colors[style];
}

export function getStyleLabel(style: SensitivityStyle): string {
  const labels: Record<SensitivityStyle, string> = {
    AGGRESSIVE: 'Agresivo',
    BALANCED: 'Balanceado',
    SNIPER: 'Francotirador',
  };
  return labels[style];
}

export function getStyleIcon(style: SensitivityStyle): string {
  const icons: Record<SensitivityStyle, string> = {
    AGGRESSIVE: '⚔️',
    BALANCED: '🎯',
    SNIPER: '🔭',
  };
  return icons[style];
}

export function getStyleDescription(style: SensitivityStyle): string {
  const descriptions: Record<SensitivityStyle, string> = {
    AGGRESSIVE: 'Para jugadores rush. Sensibilidades altas para movimientos rápidos.',
    BALANCED: 'Equilibrio perfecto. Ideal para la mayoría de jugadores.',
    SNIPER: 'Para francotiradores. Prioriza precisión con scopes.',
  };
  return descriptions[style];
}
