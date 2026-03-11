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

const PeriodSchema = z.enum(['today', 'week', 'month', 'all']).default('all');

function getPeriodStart(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'all':
      return null;
    default:
      return null;
  }
}

export async function GET(req: NextRequest) {
  const email = await verifyAccess(req);
  if (!email) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Acceso denegado' } }, { status: 401 });
  }

  try {
    const periodParam = req.nextUrl.searchParams.get('period') || 'all';
    const parsed = PeriodSchema.safeParse(periodParam);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'period debe ser today, week, month o all' } },
        { status: 400 },
      );
    }

    const period = parsed.data;
    const periodStart = getPeriodStart(period);

    const periodWhere = periodStart ? { createdAt: { gte: periodStart }, isActive: true } : { isActive: true };

    const [totalResult, periodResult, byMethodRaw, transactions, premiumCount] = await Promise.all([
      prisma.premiumLicense.aggregate({
        _sum: { amountPaid: true },
        where: { isActive: true },
      }),

      prisma.premiumLicense.aggregate({
        _sum: { amountPaid: true },
        where: periodWhere,
      }),

      prisma.premiumLicense.groupBy({
        by: ['paymentMethod'],
        _sum: { amountPaid: true },
        _count: { id: true },
        where: { isActive: true },
      }),

      prisma.premiumLicense.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          email: true,
          amountPaid: true,
          paymentMethod: true,
          paymentProvider: true,
          activatedAt: true,
          isActive: true,
          createdAt: true,
        },
      }),

      prisma.premiumLicense.count({ where: { isActive: true } }),
    ]);

    const byMethod = byMethodRaw.map(group => ({
      method: group.paymentMethod,
      total: group._sum.amountPaid ?? 0,
      count: group._count.id,
    }));

    const totalRevenue = totalResult._sum.amountPaid ?? 0;
    const arpu = premiumCount > 0 ? Math.round(totalRevenue / premiumCount) : 0;

    logger.info('Command center revenue fetched', { email, period });

    return NextResponse.json({
      success: true,
      data: {
        total: totalRevenue,
        periodTotal: periodResult._sum.amountPaid ?? 0,
        period,
        byMethod,
        transactions,
        arpu,
        premiumCount,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch revenue data', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener datos de revenue' } },
      { status: 500 },
    );
  }
}
