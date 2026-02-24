import type { UserTier } from '@prisma/client';

export interface TierConfig {
  key: UserTier;
  name: string;
  nameEs: string;
  priceMxn: number;
  priceLabel: string;
  color: string;
  icon: string;
  features: Record<string, boolean | number>;
}

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  FREE: {
    key: 'FREE',
    name: 'Free',
    nameEs: 'Gratis',
    priceMxn: 0,
    priceLabel: 'Gratis',
    color: '#64748b',
    icon: '🎮',
    features: {
      generateSensitivity: true,
      styleBalanced: true,
      styleAggressive: false,
      styleSniper: false,
      gyroscope: false,
      compareDevices: false,
      exportImage: false,
      maxFavorites: 3,
      maxHistory: 10,
      maxSearchesPerDay: 5,
      noAds: false,
      vipThemes: false,
      tournaments: false,
      prioritySupport: false,
      earlyAccess: false,
      academyFull: false,
    },
  },
  PREMIUM: {
    key: 'PREMIUM',
    name: 'Premium',
    nameEs: 'Premium',
    priceMxn: 49,
    priceLabel: '$49 MXN/mes',
    color: '#f59e0b',
    icon: '⭐',
    features: {
      generateSensitivity: true,
      styleBalanced: true,
      styleAggressive: true,
      styleSniper: true,
      gyroscope: true,
      compareDevices: true,
      exportImage: true,
      maxFavorites: 9999,
      maxHistory: 9999,
      maxSearchesPerDay: 9999,
      noAds: false,
      vipThemes: false,
      tournaments: false,
      prioritySupport: false,
      earlyAccess: false,
      academyFull: true,
    },
  },
  VIP: {
    key: 'VIP',
    name: 'VIP',
    nameEs: 'VIP',
    priceMxn: 99,
    priceLabel: '$99 MXN/mes',
    color: '#a855f7',
    icon: '👑',
    features: {
      generateSensitivity: true,
      styleBalanced: true,
      styleAggressive: true,
      styleSniper: true,
      gyroscope: true,
      compareDevices: true,
      exportImage: true,
      maxFavorites: 9999,
      maxHistory: 9999,
      maxSearchesPerDay: 9999,
      noAds: true,
      vipThemes: true,
      tournaments: true,
      prioritySupport: true,
      earlyAccess: true,
      academyFull: true,
    },
  },
};

export function getTierConfig(tier: UserTier): TierConfig {
  return TIER_CONFIGS[tier];
}
