// Configuracion de temas visuales ARES
// 5 temas: 1 FREE (Fire & Ice), 1 PREMIUM (Gold), 3 VIP (Neon Purple, Blood Red, Matrix Green)

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  gradient: string;
}

export interface ThemeConfig {
  key: string;
  name: string;
  nameEs: string;
  tier: 'FREE' | 'PREMIUM' | 'VIP';
  colors: ThemeColors;
  preview: string; // CSS gradient para preview swatch
}

export const THEMES: ThemeConfig[] = [
  {
    key: 'default',
    name: 'Fire & Ice',
    nameEs: 'Fuego y Hielo',
    tier: 'FREE',
    colors: {
      primary: '#ff6a00',
      secondary: '#00c8ff',
      accent: '#ff6a00',
      glow: 'rgba(255,106,0,0.3)',
      gradient: 'linear-gradient(135deg, #ff6a00, #00c8ff)',
    },
    preview: 'linear-gradient(135deg, #ff6a00, #00c8ff)',
  },
  {
    key: 'neon-purple',
    name: 'Neon Purple',
    nameEs: 'Neón Púrpura',
    tier: 'VIP',
    colors: {
      primary: '#a855f7',
      secondary: '#ec4899',
      accent: '#a855f7',
      glow: 'rgba(168,85,247,0.3)',
      gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    },
    preview: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
  {
    key: 'blood-red',
    name: 'Blood Red',
    nameEs: 'Rojo Sangre',
    tier: 'VIP',
    colors: {
      primary: '#ef4444',
      secondary: '#f97316',
      accent: '#ef4444',
      glow: 'rgba(239,68,68,0.3)',
      gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    },
    preview: 'linear-gradient(135deg, #ef4444, #f97316)',
  },
  {
    key: 'matrix-green',
    name: 'Matrix Green',
    nameEs: 'Matrix Verde',
    tier: 'VIP',
    colors: {
      primary: '#22c55e',
      secondary: '#14b8a6',
      accent: '#22c55e',
      glow: 'rgba(34,197,94,0.3)',
      gradient: 'linear-gradient(135deg, #22c55e, #14b8a6)',
    },
    preview: 'linear-gradient(135deg, #22c55e, #14b8a6)',
  },
  {
    key: 'gold-premium',
    name: 'Gold Premium',
    nameEs: 'Oro Premium',
    tier: 'PREMIUM',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#f59e0b',
      glow: 'rgba(245,158,11,0.3)',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
    preview: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
];

const TIER_LEVEL: Record<'FREE' | 'PREMIUM' | 'VIP', number> = {
  FREE: 0,
  PREMIUM: 1,
  VIP: 2,
};

// Tema default (Fire & Ice) — siempre existe como primer elemento
const DEFAULT_THEME: ThemeConfig = THEMES[0] as ThemeConfig;

export function getTheme(key: string): ThemeConfig {
  return THEMES.find((t) => t.key === key) ?? DEFAULT_THEME;
}

export function getAvailableThemes(tier: 'FREE' | 'PREMIUM' | 'VIP'): ThemeConfig[] {
  return THEMES.filter((t) => TIER_LEVEL[t.tier] <= TIER_LEVEL[tier]);
}
