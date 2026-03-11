import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_EMAIL = 'alehnzgarcia7@gmail.com';

async function verifyAccess(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || token.email !== ADMIN_EMAIL) {
    return null;
  }
  return token.email;
}

export async function GET(req: NextRequest) {
  const email = await verifyAccess(req);
  if (!email) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Acceso denegado' } }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Mismo dia de la semana pasada para comparar
    const prevWeekDay = new Date(todayStart);
    prevWeekDay.setDate(prevWeekDay.getDate() - 7);
    const prevWeekDayEnd = new Date(prevWeekDay);
    prevWeekDayEnd.setDate(prevWeekDayEnd.getDate() + 1);

    const [
      totalUsers,
      usersToday,
      usersPrevWeek,
      totalSensitivities,
      sensitivityToday,
      premiumUsers,
      totalRevenueResult,
      revenueThisMonthResult,
      completedPayments,
      paywallShownCount,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      }),

      prisma.user.count({
        where: {
          createdAt: { gte: prevWeekDay, lt: prevWeekDayEnd },
        },
      }),

      prisma.searchHistory.count(),

      prisma.searchHistory.count({
        where: { searchedAt: { gte: todayStart } },
      }),

      prisma.premiumLicense.count({
        where: { isActive: true },
      }),

      prisma.premiumLicense.aggregate({
        _sum: { amountPaid: true },
        where: { isActive: true },
      }),

      prisma.premiumLicense.aggregate({
        _sum: { amountPaid: true },
        where: {
          isActive: true,
          createdAt: { gte: monthStart },
        },
      }),

      prisma.paymentAttempt.count({
        where: { status: 'completed' },
      }),

      prisma.analyticsEvent.count({
        where: { eventType: 'PAYWALL_SHOWN' },
      }),
    ]);

    const totalRevenue = totalRevenueResult._sum.amountPaid ?? 0;
    const revenueThisMonth = revenueThisMonthResult._sum.amountPaid ?? 0;
    const conversionRate = paywallShownCount > 0
      ? Math.round((completedPayments / paywallShownCount) * 10000) / 100
      : 0;

    logger.info('Command center stats fetched', { email });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        usersToday,
        usersPrevWeek,
        totalSensitivities,
        sensitivityToday,
        premiumUsers,
        totalRevenue,
        revenueThisMonth,
        conversionRate,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch command center stats', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener estadisticas' } },
      { status: 500 },
    );
  }
}
