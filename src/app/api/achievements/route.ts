import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { auth } from '@/lib/auth';
import { checkAndUnlockAchievements } from '@/lib/achievements/achievement-checker';
import { ACHIEVEMENTS } from '@/lib/achievements/achievement-definitions';

/**
 * GET /api/achievements
 * Retorna todos los logros con estado de desbloqueo del usuario autenticado.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Inicia sesión para ver logros' } },
        { status: 401 },
      );
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: {
        achievement: { select: { key: true } },
        unlockedAt: true,
      },
    });

    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievement.key, ua.unlockedAt]),
    );

    const data = ACHIEVEMENTS.map((a) => ({
      key: a.key,
      name: a.name,
      nameEs: a.nameEs,
      description: a.description,
      icon: a.icon,
      category: a.category,
      tier: a.tier,
      points: a.points,
      unlocked: unlockedMap.has(a.key),
      unlockedAt: unlockedMap.get(a.key) ?? null,
    }));

    const totalPoints = data
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: ACHIEVEMENTS.length,
        unlocked: unlockedMap.size,
        totalPoints,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/achievements
 * Ejecuta verificación de logros para el usuario autenticado.
 * Retorna logros recién desbloqueados.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Inicia sesión' } },
        { status: 401 },
      );
    }

    const newlyUnlocked = await checkAndUnlockAchievements(session.user.id);

    if (newlyUnlocked.length > 0) {
      logger.info('Achievements check completed', {
        userId: session.user.id,
        newlyUnlocked: newlyUnlocked.map((a) => a.key),
        count: newlyUnlocked.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: newlyUnlocked.map((a) => ({
        key: a.key,
        name: a.name,
        nameEs: a.nameEs,
        description: a.description,
        icon: a.icon,
        tier: a.tier,
        points: a.points,
      })),
      meta: { newlyUnlocked: newlyUnlocked.length },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
