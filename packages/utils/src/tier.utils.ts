import type { UserTier } from '@prisma/client';

export function canAccess(userTier: UserTier, requiredTier: UserTier): boolean {
  const tierLevel: Record<UserTier, number> = {
    FREE: 0,
    PREMIUM: 1,
    VIP: 2,
  };
  return tierLevel[userTier] >= tierLevel[requiredTier];
}

export function isFeatureAvailable(
  userTier: UserTier,
  feature: string,
): boolean {
  const freeFeatures = ['generate_balanced', 'search_basic', 'favorites_3', 'history_10'];
  const premiumFeatures = [...freeFeatures, 'generate_all_styles', 'gyroscope', 'compare', 'export', 'favorites_unlimited', 'history_unlimited', 'search_unlimited', 'academy_15'];
  const vipFeatures = [...premiumFeatures, 'no_ads', 'vip_tournaments', 'vip_themes', 'academy_all', 'priority_support', 'vip_badge'];

  const featureMap: Record<UserTier, string[]> = {
    FREE: freeFeatures,
    PREMIUM: premiumFeatures,
    VIP: vipFeatures,
  };

  return featureMap[userTier].includes(feature);
}

export function getTierLabel(tier: UserTier): string {
  const labels: Record<UserTier, string> = {
    FREE: 'Gratis',
    PREMIUM: 'Premium ⭐',
    VIP: 'VIP 👑',
  };
  return labels[tier];
}

export function getTierColor(tier: UserTier): string {
  const colors: Record<UserTier, string> = {
    FREE: '#94a3b8',
    PREMIUM: '#f59e0b',
    VIP: '#a855f7',
  };
  return colors[tier];
}
