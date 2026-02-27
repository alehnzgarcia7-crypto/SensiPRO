
import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/auth.middleware';

// Interfaces para resultados de raw queries
interface DailySearchRow {
  date: Date;
  count: number;
}

interface TopDeviceRow {
  brand: string;
  model: string;
  count: number;
}

export async function GET() {
  try {
    await requireRole('ADMIN');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [dailySearchesRaw, topDevices, styleDistribution, tierDistribution] = await Promise.all([
      // Búsquedas por día (últimos 30 días)
      prisma.$queryRaw<DailySearchRow[]>`
        SELECT DATE(searched_at) as date, COUNT(*)::int as count
        FROM search_history
        WHERE searched_at >= ${thirtyDaysAgo}
        GROUP BY DATE(searched_at)
        ORDER BY date ASC
      `,
      // Top 10 dispositivos más buscados
      prisma.$queryRaw<TopDeviceRow[]>`
        SELECT d.brand, d.model, COUNT(*)::int as count
        FROM search_history sh
        JOIN devices d ON d.id = sh.device_id
        WHERE sh.searched_at >= ${thirtyDaysAgo}
        GROUP BY d.brand, d.model
        ORDER BY count DESC
        LIMIT 10
      `,
      // Distribución de estilos
      prisma.searchHistory.groupBy({
        by: ['style'],
        where: { searchedAt: { gte: thirtyDaysAgo } },
        _count: { style: true },
      }),
      // Distribución de tiers de usuarios
      prisma.user.groupBy({
        by: ['tier'],
        _count: { tier: true },
      }),
    ]);

    // Formatear fechas a string ISO para el frontend
    const dailySearches = dailySearchesRaw.map((row) => ({
      date: new Date(row.date).toISOString().split('T')[0],
      count: row.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        dailySearches,
        topDevices,
        styleDistribution: styleDistribution.map((s) => ({
          style: s.style,
          count: s._count.style,
        })),
        tierDistribution: tierDistribution.map((t) => ({
          tier: t.tier,
          count: t._count.tier,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
