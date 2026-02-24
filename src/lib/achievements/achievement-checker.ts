// Motor de verificación y desbloqueo de logros
// Verifica stats del usuario contra las condiciones de cada logro
// y crea UserAchievement records para los que cumpla

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';

import { ACHIEVEMENTS, type AchievementDef } from './achievement-definitions';

interface UserStats {
  totalSearches: number;
  totalFavorites: number;
  totalShares: number;
  referralCount: number;
  tier: string;
  createdAt: Date;
  sharedConfigCount: number;
  totalUpvotesReceived: number;
}

// Mapea tier de usuario a nivel numérico para comparación
const TIER_LEVEL: Record<string, number> = {
  FREE: 0,
  PREMIUM: 1,
  VIP: 2,
};

// Fecha límite para early adopter (primer mes desde launch)
const EARLY_ADOPTER_DEADLINE = new Date('2026-04-01T00:00:00Z');

function evaluateCondition(
  achievement: AchievementDef,
  stats: UserStats,
): boolean {
  switch (achievement.condition.type) {
    case 'searches':
      return stats.totalSearches >= achievement.condition.value;

    case 'favorites':
      return stats.totalFavorites >= achievement.condition.value;

    case 'shares':
      return stats.totalShares >= achievement.condition.value;

    case 'referrals':
      return stats.referralCount >= achievement.condition.value;

    case 'tier':
      return (TIER_LEVEL[stats.tier] ?? 0) >= achievement.condition.value;

    case 'config_shared':
      return stats.sharedConfigCount >= achievement.condition.value;

    case 'upvotes_received':
      return stats.totalUpvotesReceived >= achievement.condition.value;

    case 'night_search': {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 5 && stats.totalSearches >= 1;
    }

    case 'early_adopter':
      return stats.createdAt < EARLY_ADOPTER_DEADLINE;

    // Estos se verifican con lógica especial fuera del checker básico
    case 'all_styles':
    case 'comparisons':
    case 'exports':
    case 'comments':
    case 'tournament_join':
    case 'guides_read':
      return false;

    default:
      return false;
  }
}

/**
 * Verifica y desbloquea automáticamente todos los logros que el usuario ha ganado.
 * Retorna array de logros recién desbloqueados (para notificaciones/animación).
 */
export async function checkAndUnlockAchievements(userId: string): Promise<AchievementDef[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalSearches: true,
      totalFavorites: true,
      totalShares: true,
      referralCount: true,
      tier: true,
      createdAt: true,
      achievements: {
        select: { achievement: { select: { key: true } } },
      },
      sharedConfigs: {
        select: { id: true, votes: true },
      },
    },
  });

  if (!user) return [];

  // Calcular stats extendidos
  const totalUpvotesReceived = user.sharedConfigs.reduce(
    (sum, config) => sum + Math.max(0, config.votes),
    0,
  );

  const stats: UserStats = {
    totalSearches: user.totalSearches,
    totalFavorites: user.totalFavorites,
    totalShares: user.totalShares,
    referralCount: user.referralCount,
    tier: user.tier,
    createdAt: user.createdAt,
    sharedConfigCount: user.sharedConfigs.length,
    totalUpvotesReceived,
  };

  const unlockedKeys = new Set(
    user.achievements.map((ua) => ua.achievement.key),
  );

  const newlyUnlocked: AchievementDef[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Saltear si ya está desbloqueado
    if (unlockedKeys.has(achievement.key)) continue;

    const earned = evaluateCondition(achievement, stats);
    if (!earned) continue;

    // Buscar el Achievement record en DB por key
    const dbAchievement = await prisma.achievement.findUnique({
      where: { key: achievement.key },
      select: { id: true },
    });

    if (!dbAchievement) {
      logger.warn('Achievement not found in DB, skipping', { key: achievement.key });
      continue;
    }

    // Crear UserAchievement con el achievementId (FK)
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: dbAchievement.id,
      },
    });

    newlyUnlocked.push(achievement);

    logger.info('Achievement unlocked', {
      userId,
      achievementKey: achievement.key,
      achievementName: achievement.nameEs,
      tier: achievement.tier,
      points: achievement.points,
    });
  }

  return newlyUnlocked;
}

/**
 * Desbloquea un logro específico por key (para logros basados en acciones puntuales).
 * Útil para: ALL_STYLES, COMPARE_FIRST, TOURNAMENT_JOIN, GUIDE_READER, etc.
 */
export async function unlockSpecificAchievement(
  userId: string,
  achievementKey: string,
): Promise<AchievementDef | null> {
  const def = ACHIEVEMENTS.find((a) => a.key === achievementKey);
  if (!def) return null;

  const dbAchievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
    select: { id: true },
  });

  if (!dbAchievement) return null;

  // Verificar si ya está desbloqueado
  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: dbAchievement.id,
      },
    },
  });

  if (existing) return null;

  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: dbAchievement.id,
    },
  });

  logger.info('Specific achievement unlocked', {
    userId,
    achievementKey,
    achievementName: def.nameEs,
  });

  return def;
}
