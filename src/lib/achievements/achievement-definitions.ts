// Definiciones de logros para ARES — gamificación completa
// Los keys deben coincidir con los seeded en Achievement table (run-seed.ts)

export type AchievementCategory = 'SEARCH' | 'SOCIAL' | 'PREMIUM' | 'SPECIAL';
export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'LEGENDARY';

export interface AchievementDef {
  key: string;
  name: string;
  nameEs: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  condition: {
    type: 'searches' | 'favorites' | 'shares' | 'referrals' | 'tier' | 'comments' | 'upvotes_received' | 'exports' | 'comparisons' | 'all_styles' | 'early_adopter' | 'night_search' | 'tournament_join' | 'guides_read' | 'config_shared';
    value: number;
  };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── SEARCH achievements ─────────────────────────────────────────
  {
    key: 'FIRST_SEARCH',
    name: 'First Search',
    nameEs: 'Primera Búsqueda',
    description: 'Genera tu primera sensibilidad',
    icon: '🎯',
    category: 'SEARCH',
    tier: 'BRONZE',
    points: 10,
    condition: { type: 'searches', value: 1 },
  },
  {
    key: 'SEARCHES_10',
    name: 'Getting Started',
    nameEs: 'Explorador',
    description: 'Genera 10 sensibilidades',
    icon: '🔍',
    category: 'SEARCH',
    tier: 'BRONZE',
    points: 25,
    condition: { type: 'searches', value: 10 },
  },
  {
    key: 'SEARCHES_50',
    name: 'Explorer',
    nameEs: 'Investigador',
    description: 'Genera 50 sensibilidades',
    icon: '🧭',
    category: 'SEARCH',
    tier: 'SILVER',
    points: 50,
    condition: { type: 'searches', value: 50 },
  },
  {
    key: 'SEARCHES_100',
    name: 'Veteran',
    nameEs: 'Científico',
    description: 'Genera 100 sensibilidades',
    icon: '⚔️',
    category: 'SEARCH',
    tier: 'SILVER',
    points: 100,
    condition: { type: 'searches', value: 100 },
  },
  {
    key: 'SEARCHES_500',
    name: 'Master',
    nameEs: 'Maestro',
    description: 'Genera 500 sensibilidades',
    icon: '🏆',
    category: 'SEARCH',
    tier: 'GOLD',
    points: 200,
    condition: { type: 'searches', value: 500 },
  },
  {
    key: 'SEARCHES_1000',
    name: 'Legend',
    nameEs: 'Leyenda',
    description: 'Genera 1000 sensibilidades',
    icon: '👑',
    category: 'SEARCH',
    tier: 'LEGENDARY',
    points: 500,
    condition: { type: 'searches', value: 1000 },
  },

  // ── SOCIAL achievements ─────────────────────────────────────────
  {
    key: 'FIRST_FAVORITE',
    name: 'Collector',
    nameEs: 'Coleccionista',
    description: 'Guarda tu primer favorito',
    icon: '❤️',
    category: 'SOCIAL',
    tier: 'BRONZE',
    points: 10,
    condition: { type: 'favorites', value: 1 },
  },
  {
    key: 'FAVORITES_10',
    name: 'Hoarder',
    nameEs: 'Archivista',
    description: 'Guarda 10 favoritos',
    icon: '💎',
    category: 'SOCIAL',
    tier: 'SILVER',
    points: 25,
    condition: { type: 'favorites', value: 10 },
  },
  {
    key: 'FIRST_SHARE',
    name: 'Sharer',
    nameEs: 'Difusor',
    description: 'Comparte tu primera config',
    icon: '📤',
    category: 'SOCIAL',
    tier: 'BRONZE',
    points: 15,
    condition: { type: 'shares', value: 1 },
  },
  {
    key: 'SHARES_10',
    name: 'Broadcaster',
    nameEs: 'Influencer',
    description: 'Comparte 10 configuraciones',
    icon: '📡',
    category: 'SOCIAL',
    tier: 'SILVER',
    points: 30,
    condition: { type: 'shares', value: 10 },
  },
  {
    key: 'REFERRAL_1',
    name: 'Recruiter',
    nameEs: 'Reclutador',
    description: 'Invita a tu primer amigo',
    icon: '👥',
    category: 'SOCIAL',
    tier: 'SILVER',
    points: 25,
    condition: { type: 'referrals', value: 1 },
  },
  {
    key: 'REFERRAL_5',
    name: 'Influencer',
    nameEs: 'Capitán',
    description: 'Invita a 5 amigos',
    icon: '🌟',
    category: 'SOCIAL',
    tier: 'GOLD',
    points: 75,
    condition: { type: 'referrals', value: 5 },
  },
  {
    key: 'REFERRAL_20',
    name: 'Ambassador',
    nameEs: 'Embajador',
    description: 'Invita a 20 amigos',
    icon: '🚀',
    category: 'SOCIAL',
    tier: 'LEGENDARY',
    points: 250,
    condition: { type: 'referrals', value: 20 },
  },
  {
    key: 'CONFIG_SHARED',
    name: 'Generous',
    nameEs: 'Generoso',
    description: 'Comparte una config en la comunidad',
    icon: '💬',
    category: 'SOCIAL',
    tier: 'BRONZE',
    points: 20,
    condition: { type: 'config_shared', value: 1 },
  },
  {
    key: 'POPULAR_CONFIG',
    name: 'Popular',
    nameEs: 'Popular',
    description: 'Tu config compartida recibe 10 upvotes',
    icon: '👍',
    category: 'SOCIAL',
    tier: 'SILVER',
    points: 50,
    condition: { type: 'upvotes_received', value: 10 },
  },

  // ── PREMIUM achievements ────────────────────────────────────────
  {
    key: 'PREMIUM_MEMBER',
    name: 'Upgrade',
    nameEs: 'Miembro Premium',
    description: 'Obtén una cuenta Premium',
    icon: '⭐',
    category: 'PREMIUM',
    tier: 'SILVER',
    points: 50,
    condition: { type: 'tier', value: 1 },
  },
  {
    key: 'VIP_MEMBER',
    name: 'VIP Status',
    nameEs: 'Élite VIP',
    description: 'Obtén una cuenta VIP',
    icon: '👑',
    category: 'PREMIUM',
    tier: 'GOLD',
    points: 100,
    condition: { type: 'tier', value: 2 },
  },
  {
    key: 'COMPARE_FIRST',
    name: 'Analyst',
    nameEs: 'Analista',
    description: 'Compara 2 dispositivos por primera vez',
    icon: '📊',
    category: 'PREMIUM',
    tier: 'BRONZE',
    points: 15,
    condition: { type: 'comparisons', value: 1 },
  },

  // ── SPECIAL achievements ────────────────────────────────────────
  {
    key: 'ALL_STYLES',
    name: 'Versatile',
    nameEs: 'Versátil',
    description: 'Prueba los 3 estilos de juego',
    icon: '🎭',
    category: 'SPECIAL',
    tier: 'SILVER',
    points: 20,
    condition: { type: 'all_styles', value: 1 },
  },
  {
    key: 'EARLY_ADOPTER',
    name: 'Early Adopter',
    nameEs: 'Early Adopter',
    description: 'Registrado en los primeros 30 días',
    icon: '🏅',
    category: 'SPECIAL',
    tier: 'GOLD',
    points: 50,
    condition: { type: 'early_adopter', value: 1 },
  },
  {
    key: 'NIGHT_OWL',
    name: 'Night Owl',
    nameEs: 'Búho Nocturno',
    description: 'Genera una sensibilidad entre 0-5 AM',
    icon: '🦉',
    category: 'SPECIAL',
    tier: 'BRONZE',
    points: 15,
    condition: { type: 'night_search', value: 1 },
  },
];

export function getAchievementDef(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}

export function getAchievementsByCategory(category: AchievementCategory): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getAchievementsByTier(tier: AchievementTier): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => a.tier === tier);
}
