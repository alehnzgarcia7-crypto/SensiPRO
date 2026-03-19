import type { UserTier } from '@prisma/client';

import { TIER_CONFIGS } from './tier-config';

export type FeatureKey = keyof typeof TIER_CONFIGS.FREE.features;

/**
 * Check if a tier has access to a specific feature
 */
export function hasFeature(tier: UserTier, feature: FeatureKey): boolean {
  const config = TIER_CONFIGS[tier];
  const value = config.features[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}

/**
 * Get numeric limit for a feature (e.g. maxFavorites)
 */
export function getFeatureLimit(tier: UserTier, feature: FeatureKey): number {
  const config = TIER_CONFIGS[tier];
  const value = config.features[feature];
  return typeof value === 'number' ? value : (value ? 9999 : 0);
}

/**
 * Check if user can access based on tier hierarchy
 */
export function canAccessTier(userTier: UserTier, requiredTier: UserTier): boolean {
  const levels: Record<UserTier, number> = { FREE: 0, PREMIUM: 1, VIP: 2 };
  return levels[userTier] >= levels[requiredTier];
}

/**
 * Get the minimum tier required for a feature
 */
export function getMinimumTier(feature: FeatureKey): UserTier {
  if (hasFeature('FREE', feature)) return 'FREE';
  if (hasFeature('PREMIUM', feature)) return 'PREMIUM';
  return 'VIP';
}

/**
 * Get list of features user gains by upgrading
 */
export function getUpgradeFeatures(currentTier: UserTier, targetTier: UserTier): string[] {
  const current = TIER_CONFIGS[currentTier].features;
  const target = TIER_CONFIGS[targetTier].features;
  const gains: string[] = [];

  const labels: Record<string, string> = {
    styleAggressive: 'Estilo Agresivo',
    styleSniper: 'Estilo Francotirador',
    gyroscope: 'Giroscopio',
    compareDevices: 'Comparador de dispositivos',
    exportImage: 'Exportar imagen',
    noAds: 'Sin anuncios',
    vipThemes: 'Temas VIP exclusivos',
    tournaments: 'Torneos VIP',
    prioritySupport: 'Soporte prioritario',
    earlyAccess: 'Acceso anticipado',
    academyFull: 'Academia PRO',
  };

  for (const [key, label] of Object.entries(labels)) {
    const curVal = current[key];
    const tarVal = target[key];
    if (!curVal && tarVal) gains.push(label);
  }

  return gains;
}
