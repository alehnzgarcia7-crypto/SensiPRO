import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const ADMIN_EMAIL = 'alehnzgarcia7@gmail.com';

async function verifyAccess(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || token.email !== ADMIN_EMAIL) {
    return null;
  }
  return token.email;
}

const RangeSchema = z.enum(['7d', '30d', '90d']).default('7d');

interface DailyCount {
  date: string;
  count: bigint;
}

interface DailyRevenue {
  date: string;
  amount: bigint;
  method: string;
}

export async function GET(req: NextRequest) {
  const email = await verifyAccess(req);
  if (!email) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Acceso denegado' } }, { status: 401 });
  }

  try {
    const rangeParam = req.nextUrl.searchParams.get('range') || '7d';
    const parsed = RangeSchema.safeParse(rangeParam);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'range debe ser 7d, 30d o 90d' } },
        { status: 400 },
      );
    }

    const range = parsed.data;
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 } as const;
    const days = daysMap[range] ?? 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [dailyUsersRaw, dailySensitivitiesRaw, dailyRevenueRaw] = await Promise.all([
      prisma.$queryRaw<DailyCount[]>`
        SELECT DATE(created_at)::text AS date, COUNT(*)::bigint AS count
        FROM users
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `,

      prisma.$queryRaw<DailyCount[]>`
        SELECT DATE(searched_at)::text AS date, COUNT(*)::bigint AS count
        FROM search_history
        WHERE searched_at >= ${startDate}
        GROUP BY DATE(searched_at)
        ORDER BY DATE(searched_at) ASC
      `,

      prisma.$queryRaw<DailyRevenue[]>`
        SELECT DATE(created_at)::text AS date, SUM(amount_paid)::bigint AS amount, payment_method AS method
        FROM premium_licenses
        WHERE created_at >= ${startDate} AND is_active = true
        GROUP BY DATE(created_at), payment_method
        ORDER BY DATE(created_at) ASC
      `,
    ]);

    const dailyUsers = dailyUsersRaw.map(row => ({
      date: row.date,
      count: Number(row.count),
    }));

    const dailySensitivities = dailySensitivitiesRaw.map(row => ({
      date: row.date,
      count: Number(row.count),
    }));

    const dailyRevenue = dailyRevenueRaw.map(row => ({
      date: row.date,
      amount: Number(row.amount),
      method: row.method,
    }));

    logger.info('Command center charts fetched', { email, range });

    return NextResponse.json({
      success: true,
      data: {
        dailyUsers,
        dailySensitivities,
        dailyRevenue,
        range,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch chart data', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener datos de charts' } },
      { status: 500 },
    );
  }
}
