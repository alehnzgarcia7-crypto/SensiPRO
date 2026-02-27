import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


// Tipos válidos de leaderboard
type LeaderboardType = 'searches' | 'favorites' | 'shares' | 'achievements';

// Campo de orden directo en User model
const ORDER_FIELDS: Record<Exclude<LeaderboardType, 'achievements'>, string> = {
  searches: 'totalSearches',
  favorites: 'totalFavorites',
  shares: 'totalShares',
};

// Validación de query params con Zod
const querySchema = z.object({
  type: z.enum(['searches', 'favorites', 'shares', 'achievements']).default('searches'),
  period: z.enum(['all', 'weekly']).default('all'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({
      type: searchParams.get('type') ?? undefined,
      period: searchParams.get('period') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    const { type, period, limit } = parsed;

    // Filtro por periodo
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(period === 'weekly' ? { updatedAt: { gte: weekAgo } } : {}),
      },
      orderBy:
        type === 'achievements'
          ? { achievements: { _count: 'desc' } }
          : { [ORDER_FIELDS[type]]: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        tier: true,
        totalSearches: true,
        totalFavorites: true,
        totalShares: true,
        referralCount: true,
        _count: { select: { achievements: true } },
      },
    });

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      tier: u.tier,
      value:
        type === 'achievements'
          ? u._count.achievements
          : type === 'searches'
            ? u.totalSearches
            : type === 'favorites'
              ? u.totalFavorites
              : u.totalShares,
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard,
      meta: { type, period, total: leaderboard.length },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
