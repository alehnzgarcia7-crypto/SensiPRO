import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { UserTier, PaymentProvider, CodeType } from '@prisma/client';

// ══════════════════════════════════════════════════════════
// Revenue Analytics Service
// MRR, conversión, LTV, revenue diario, métricas de códigos
// ══════════════════════════════════════════════════════════

/** Precios por tier en centavos MXN (pago único) */
const PRICE_CENTAVOS: Record<UserTier, number> = {
  FREE: 0,
  PREMIUM: 19900,
  VIP: 39900,
};

/** Resumen general de usuarios y conversión */
export interface RevenueOverview {
  totalUsers: number;
  premiumUsers: number;
  vipUsers: number;
  paidUsers: number;
  conversionRate: number;
  mrr: number;
  arr: number;
  ltv: number;
}

/** Métricas de revenue y pagos */
export interface RevenueMetrics {
  totalRevenueCentavos: number;
  last30DaysCentavos: number;
  totalPayments: number;
  last30DaysPayments: number;
  dailyRevenue: DailyRevenue[];
}

/** Revenue por día */
export interface DailyRevenue {
  date: string;
  totalCentavos: number;
  count: number;
}

/** Métricas de códigos de activación */
export interface CodeMetrics {
  total: number;
  used: number;
  unused: number;
  usageRate: number;
  byType: CodeTypeBreakdown[];
}

/** Desglose por tipo de código */
export interface CodeTypeBreakdown {
  type: CodeType;
  total: number;
  used: number;
}

/** Distribución por tier de pagos */
export interface PaymentsByProvider {
  provider: PaymentProvider | 'CODE';
  count: number;
  totalCentavos: number;
}

/** Resultado completo del dashboard de revenue */
export interface RevenueAnalytics {
  overview: RevenueOverview;
  revenue: RevenueMetrics;
  codes: CodeMetrics;
  paymentsByProvider: PaymentsByProvider[];
}

/**
 * Obtiene analytics completos de revenue para el admin dashboard.
 * Incluye MRR, conversión free→paid, LTV, daily revenue, y métricas de códigos.
 */
export async function getRevenueAnalytics(): Promise<RevenueAnalytics> {
  const startTime = Date.now();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  // Ejecutar todas las queries en paralelo
  const [
    totalUsers,
    premiumUsers,
    vipUsers,
    totalPayments,
    last30DaysPayments,
    totalRevenue,
    last30Revenue,
    codesUsed,
    codesTotal,
    codesByType,
    paymentsByProvider,
    dailyRevenueRaw,
  ] = await Promise.all([
    // Usuarios
    prisma.user.count(),
    prisma.user.count({ where: { tier: 'PREMIUM' } }),
    prisma.user.count({ where: { tier: 'VIP' } }),

    // Pagos totales
    prisma.payment.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.count({
      where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
    }),

    // Revenue total
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),

    // Códigos
    prisma.activationCode.count({ where: { status: 'USED' } }),
    prisma.activationCode.count(),

    // Desglose códigos por tipo
    prisma.activationCode.groupBy({
      by: ['type', 'status'],
      _count: { id: true },
    }),

    // Pagos por proveedor
    prisma.payment.groupBy({
      by: ['provider'],
      where: { status: 'COMPLETED' },
      _count: { id: true },
      _sum: { amount: true },
    }),

    // Revenue diario últimos 30 días
    prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Calcular métricas derivadas
  const paidUsers = premiumUsers + vipUsers;
  const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;
  const totalRevenueCentavos = totalRevenue._sum.amount ?? 0;
  const mrr = (premiumUsers * PRICE_CENTAVOS.PREMIUM) + (vipUsers * PRICE_CENTAVOS.VIP);
  const arr = mrr * 12;
  const ltv = paidUsers > 0 ? Math.round(totalRevenueCentavos / paidUsers) : 0;

  // Agregar daily revenue por fecha (groupBy devuelve timestamps exactos)
  const dailyMap = new Map<string, { totalCentavos: number; count: number }>();
  for (const row of dailyRevenueRaw) {
    const dateKey = row.createdAt.toISOString().slice(0, 10);
    const existing = dailyMap.get(dateKey);
    if (existing) {
      existing.totalCentavos += row._sum.amount ?? 0;
      existing.count += row._count.id;
    } else {
      dailyMap.set(dateKey, {
        totalCentavos: row._sum.amount ?? 0,
        count: row._count.id,
      });
    }
  }

  const dailyRevenue: DailyRevenue[] = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Desglose de códigos por tipo
  const codeTypeMap = new Map<CodeType, { total: number; used: number }>();
  for (const row of codesByType) {
    const existing = codeTypeMap.get(row.type) ?? { total: 0, used: 0 };
    existing.total += row._count.id;
    if (row.status === 'USED') {
      existing.used += row._count.id;
    }
    codeTypeMap.set(row.type, existing);
  }

  const byType: CodeTypeBreakdown[] = Array.from(codeTypeMap.entries())
    .map(([type, data]) => ({ type, ...data }));

  const codesUnused = codesTotal - codesUsed;
  const codeUsageRate = codesTotal > 0 ? (codesUsed / codesTotal) * 100 : 0;

  // Pagos por proveedor
  const providerMetrics: PaymentsByProvider[] = paymentsByProvider.map((row) => ({
    provider: row.provider,
    count: row._count.id,
    totalCentavos: row._sum.amount ?? 0,
  }));

  const result: RevenueAnalytics = {
    overview: {
      totalUsers,
      premiumUsers,
      vipUsers,
      paidUsers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      mrr,
      arr,
      ltv,
    },
    revenue: {
      totalRevenueCentavos,
      last30DaysCentavos: last30Revenue._sum.amount ?? 0,
      totalPayments,
      last30DaysPayments,
      dailyRevenue,
    },
    codes: {
      total: codesTotal,
      used: codesUsed,
      unused: codesUnused,
      usageRate: Math.round(codeUsageRate * 100) / 100,
      byType,
    },
    paymentsByProvider: providerMetrics,
  };

  logger.info('Revenue analytics calculated', {
    totalUsers,
    paidUsers,
    conversionRate: result.overview.conversionRate,
    mrrCentavos: mrr,
    responseTimeMs: Date.now() - startTime,
  });

  return result;
}

/**
 * Calcula el revenue de un mes específico (año/mes)
 */
export async function getMonthlyRevenue(year: number, month: number): Promise<{
  totalCentavos: number;
  paymentCount: number;
  averagePayment: number;
}> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const [aggregate, count] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lt: endDate },
      },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lt: endDate },
      },
    }),
  ]);

  const totalCentavos = aggregate._sum.amount ?? 0;

  return {
    totalCentavos,
    paymentCount: count,
    averagePayment: count > 0 ? Math.round(totalCentavos / count) : 0,
  };
}

/**
 * Obtiene tendencia de conversión: ratio paid/total por mes (últimos 6 meses)
 */
export async function getConversionTrend(): Promise<Array<{
  month: string;
  totalUsers: number;
  paidUsers: number;
  rate: number;
}>> {
  const now = new Date();
  const months: Array<{ month: string; totalUsers: number; paidUsers: number; rate: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const [total, paid] = await Promise.all([
      prisma.user.count({ where: { createdAt: { lt: nextDate } } }),
      prisma.subscription.count({
        where: {
          isActive: true,
          startDate: { lt: nextDate },
          endDate: { gte: date },
        },
      }),
    ]);

    months.push({
      month: monthKey,
      totalUsers: total,
      paidUsers: paid,
      rate: total > 0 ? Math.round((paid / total) * 10000) / 100 : 0,
    });
  }

  return months;
}
