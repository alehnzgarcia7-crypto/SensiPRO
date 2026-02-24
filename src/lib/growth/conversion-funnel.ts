import { prisma } from '@ares/database';

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export async function getConversionFunnel(): Promise<FunnelStage[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [searches, signups, firstSearch, firstFavorite, premium, vip] = await Promise.all([
    prisma.searchHistory.count({ where: { searchedAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, totalSearches: { gte: 1 } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, totalFavorites: { gte: 1 } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, tier: 'PREMIUM' } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, tier: 'VIP' } }),
  ]);

  const base = Math.max(searches, signups, 1);

  return [
    { stage: 'Búsquedas (anónimas)', count: searches, percentage: 100 },
    { stage: 'Registro', count: signups, percentage: Math.round((signups / base) * 100) },
    { stage: 'Primera búsqueda', count: firstSearch, percentage: Math.round((firstSearch / base) * 100) },
    { stage: 'Primer favorito', count: firstFavorite, percentage: Math.round((firstFavorite / base) * 100) },
    { stage: 'Premium', count: premium, percentage: Math.round((premium / base) * 100) },
    { stage: 'VIP', count: vip, percentage: Math.round((vip / base) * 100) },
  ];
}
