import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  getRevenueAnalytics,
  getMonthlyRevenue,
  getConversionTrend,
} from '@/lib/analytics/revenue';

// ══════════════════════════════════════════════════════════
// Mock Prisma
// ══════════════════════════════════════════════════════════

const mockUserCount = vi.fn();
const mockPaymentCount = vi.fn();
const mockPaymentAggregate = vi.fn();
const mockPaymentGroupBy = vi.fn();
const mockActivationCodeCount = vi.fn();
const mockActivationCodeGroupBy = vi.fn();
const mockSubscriptionCount = vi.fn();

vi.mock('@ares/database', () => ({
  prisma: {
    user: {
      count: (...args: unknown[]) => mockUserCount(...args),
    },
    payment: {
      count: (...args: unknown[]) => mockPaymentCount(...args),
      aggregate: (...args: unknown[]) => mockPaymentAggregate(...args),
      groupBy: (...args: unknown[]) => mockPaymentGroupBy(...args),
    },
    activationCode: {
      count: (...args: unknown[]) => mockActivationCodeCount(...args),
      groupBy: (...args: unknown[]) => mockActivationCodeGroupBy(...args),
    },
    subscription: {
      count: (...args: unknown[]) => mockSubscriptionCount(...args),
    },
  },
}));

vi.mock('@ares/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ══════════════════════════════════════════════════════════
// getRevenueAnalytics
// ══════════════════════════════════════════════════════════

describe('getRevenueAnalytics', () => {
  function setupDefaultMocks(overrides?: {
    totalUsers?: number;
    premiumUsers?: number;
    vipUsers?: number;
    totalPayments?: number;
    last30Payments?: number;
    totalRevenue?: number;
    last30Revenue?: number;
    codesUsed?: number;
    codesTotal?: number;
  }) {
    const o = {
      totalUsers: 100,
      premiumUsers: 8,
      vipUsers: 2,
      totalPayments: 15,
      last30Payments: 5,
      totalRevenue: 98000,
      last30Revenue: 34000,
      codesUsed: 10,
      codesTotal: 25,
      ...overrides,
    };

    // Promise.all calls in order: userCount x3, paymentCount x2, paymentAggregate x2,
    // activationCodeCount x2, activationCodeGroupBy, paymentGroupBy, paymentGroupBy (daily)
    mockUserCount
      .mockResolvedValueOnce(o.totalUsers)     // total
      .mockResolvedValueOnce(o.premiumUsers)   // premium
      .mockResolvedValueOnce(o.vipUsers);      // vip

    mockPaymentCount
      .mockResolvedValueOnce(o.totalPayments)
      .mockResolvedValueOnce(o.last30Payments);

    mockPaymentAggregate
      .mockResolvedValueOnce({ _sum: { amount: o.totalRevenue } })
      .mockResolvedValueOnce({ _sum: { amount: o.last30Revenue } });

    mockActivationCodeCount
      .mockResolvedValueOnce(o.codesUsed)
      .mockResolvedValueOnce(o.codesTotal);

    mockActivationCodeGroupBy.mockResolvedValueOnce([
      { type: 'PREMIUM_30', status: 'USED', _count: { id: 5 } },
      { type: 'PREMIUM_30', status: 'AVAILABLE', _count: { id: 10 } },
      { type: 'VIP_30', status: 'USED', _count: { id: 5 } },
      { type: 'VIP_30', status: 'AVAILABLE', _count: { id: 5 } },
    ]);

    // paymentsByProvider
    mockPaymentGroupBy.mockResolvedValueOnce([
      { provider: 'MERCADOPAGO', _count: { id: 10 }, _sum: { amount: 70000 } },
      { provider: 'CODE', _count: { id: 5 }, _sum: { amount: 28000 } },
    ]);

    // dailyRevenue
    mockPaymentGroupBy.mockResolvedValueOnce([
      { createdAt: new Date('2026-02-20'), _sum: { amount: 9800 }, _count: { id: 2 } },
      { createdAt: new Date('2026-02-22'), _sum: { amount: 14700 }, _count: { id: 3 } },
    ]);
  }

  it('calcula overview con métricas correctas', async () => {
    setupDefaultMocks();

    const result = await getRevenueAnalytics();

    expect(result.overview.totalUsers).toBe(100);
    expect(result.overview.premiumUsers).toBe(8);
    expect(result.overview.vipUsers).toBe(2);
    expect(result.overview.paidUsers).toBe(10);
    expect(result.overview.conversionRate).toBe(10);
  });

  it('calcula MRR correctamente (Premium×4900 + VIP×9900)', async () => {
    setupDefaultMocks({ premiumUsers: 10, vipUsers: 5 });

    const result = await getRevenueAnalytics();

    // MRR = 10 × 4900 + 5 × 9900 = 49000 + 49500 = 98500
    expect(result.overview.mrr).toBe(98500);
    expect(result.overview.arr).toBe(98500 * 12);
  });

  it('calcula LTV como totalRevenue / paidUsers', async () => {
    setupDefaultMocks({
      totalRevenue: 200000,
      premiumUsers: 5,
      vipUsers: 5,
    });

    const result = await getRevenueAnalytics();

    // LTV = 200000 / 10 = 20000
    expect(result.overview.ltv).toBe(20000);
  });

  it('maneja 0 usuarios sin dividir por cero', async () => {
    setupDefaultMocks({
      totalUsers: 0,
      premiumUsers: 0,
      vipUsers: 0,
      totalRevenue: 0,
    });

    const result = await getRevenueAnalytics();

    expect(result.overview.conversionRate).toBe(0);
    expect(result.overview.ltv).toBe(0);
    expect(result.overview.mrr).toBe(0);
  });

  it('incluye revenue diario agrupado por fecha', async () => {
    setupDefaultMocks();

    const result = await getRevenueAnalytics();

    expect(result.revenue.dailyRevenue).toHaveLength(2);
    const firstDay = result.revenue.dailyRevenue[0];
    expect(firstDay).toBeDefined();
    expect(firstDay!.date).toBe('2026-02-20');
    expect(firstDay!.totalCentavos).toBe(9800);
    expect(firstDay!.count).toBe(2);
  });

  it('incluye métricas de códigos con desglose por tipo', async () => {
    setupDefaultMocks();

    const result = await getRevenueAnalytics();

    expect(result.codes.total).toBe(25);
    expect(result.codes.used).toBe(10);
    expect(result.codes.unused).toBe(15);
    expect(result.codes.usageRate).toBe(40);
    expect(result.codes.byType.length).toBeGreaterThan(0);
  });

  it('incluye pagos agrupados por proveedor', async () => {
    setupDefaultMocks();

    const result = await getRevenueAnalytics();

    expect(result.paymentsByProvider).toHaveLength(2);
    const mp = result.paymentsByProvider.find((p) => p.provider === 'MERCADOPAGO');
    expect(mp).toBeDefined();
    expect(mp!.count).toBe(10);
    expect(mp!.totalCentavos).toBe(70000);
  });

  it('incluye revenue últimos 30 días', async () => {
    setupDefaultMocks({ last30Revenue: 50000, last30Payments: 8 });

    const result = await getRevenueAnalytics();

    expect(result.revenue.last30DaysCentavos).toBe(50000);
    expect(result.revenue.last30DaysPayments).toBe(8);
  });

  it('maneja revenue null como 0', async () => {
    setupDefaultMocks();
    // Override aggregates to return null
    mockPaymentAggregate.mockReset();
    mockPaymentAggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });

    // Need to re-setup the other mocks that follow
    mockActivationCodeCount.mockReset();
    mockActivationCodeCount
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    mockActivationCodeGroupBy.mockReset();
    mockActivationCodeGroupBy.mockResolvedValueOnce([]);
    mockPaymentGroupBy.mockReset();
    mockPaymentGroupBy.mockResolvedValueOnce([]);
    mockPaymentGroupBy.mockResolvedValueOnce([]);

    const result = await getRevenueAnalytics();

    expect(result.revenue.totalRevenueCentavos).toBe(0);
    expect(result.revenue.last30DaysCentavos).toBe(0);
    expect(result.overview.ltv).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════
// getMonthlyRevenue
// ══════════════════════════════════════════════════════════

describe('getMonthlyRevenue', () => {
  it('calcula revenue mensual correctamente', async () => {
    mockPaymentAggregate.mockResolvedValueOnce({ _sum: { amount: 49000 } });
    mockPaymentCount.mockResolvedValueOnce(10);

    const result = await getMonthlyRevenue(2026, 2);

    expect(result.totalCentavos).toBe(49000);
    expect(result.paymentCount).toBe(10);
    expect(result.averagePayment).toBe(4900);
  });

  it('devuelve 0 para mes sin pagos', async () => {
    mockPaymentAggregate.mockResolvedValueOnce({ _sum: { amount: null } });
    mockPaymentCount.mockResolvedValueOnce(0);

    const result = await getMonthlyRevenue(2026, 1);

    expect(result.totalCentavos).toBe(0);
    expect(result.paymentCount).toBe(0);
    expect(result.averagePayment).toBe(0);
  });

  it('redondea average payment a entero', async () => {
    mockPaymentAggregate.mockResolvedValueOnce({ _sum: { amount: 10000 } });
    mockPaymentCount.mockResolvedValueOnce(3);

    const result = await getMonthlyRevenue(2026, 2);

    // 10000 / 3 = 3333.33 → 3333
    expect(result.averagePayment).toBe(3333);
  });
});

// ══════════════════════════════════════════════════════════
// getConversionTrend
// ══════════════════════════════════════════════════════════

describe('getConversionTrend', () => {
  it('devuelve 6 meses de datos de conversión', async () => {
    // 6 meses × 2 calls cada uno (userCount + subscriptionCount)
    for (let i = 0; i < 6; i++) {
      mockUserCount.mockResolvedValueOnce(100 + i * 10);
      mockSubscriptionCount.mockResolvedValueOnce(5 + i);
    }

    const result = await getConversionTrend();

    expect(result).toHaveLength(6);
    const first = result[0];
    expect(first).toBeDefined();
    expect(first!.month).toMatch(/^\d{4}-\d{2}$/);
    expect(first!.totalUsers).toBeGreaterThan(0);
    expect(typeof first!.rate).toBe('number');
  });

  it('maneja 0 usuarios sin error', async () => {
    for (let i = 0; i < 6; i++) {
      mockUserCount.mockResolvedValueOnce(0);
      mockSubscriptionCount.mockResolvedValueOnce(0);
    }

    const result = await getConversionTrend();

    expect(result).toHaveLength(6);
    for (const month of result) {
      expect(month.rate).toBe(0);
    }
  });

  it('calcula rate como porcentaje redondeado a 2 decimales', async () => {
    for (let i = 0; i < 6; i++) {
      mockUserCount.mockResolvedValueOnce(300);
      mockSubscriptionCount.mockResolvedValueOnce(7);
    }

    const result = await getConversionTrend();

    const first = result[0];
    expect(first).toBeDefined();
    // 7/300 = 2.3333... → 2.33
    expect(first!.rate).toBe(2.33);
  });
});
