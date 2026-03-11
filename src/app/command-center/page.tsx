import { prisma } from '@ares/database';

import { ActivityFeed } from './components/activity-feed';
import { DashboardCharts } from './components/dashboard-charts';
import { DashboardMetrics } from './components/dashboard-metrics';

interface DashboardStats {
  totalUsers: number;
  usersToday: number;
  usersDelta: number;
  totalSensitivities: number;
  sensitivityToday: number;
  premiumUsers: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueProjection: number;
  conversionRate: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastWeekSameDay = new Date(todayStart.getTime() - 7 * 86400000);
  const lastWeekSameDayEnd = new Date(lastWeekSameDay.getTime() + 86400000);

  const [
    totalUsers,
    usersToday,
    usersLastWeekSameDay,
    totalSensitivities,
    sensitivityToday,
    premiumUsers,
    totalRevenueResult,
    revenueMonthResult,
    paywallShownCount,
    paymentCompletedCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({
      where: { createdAt: { gte: lastWeekSameDay, lt: lastWeekSameDayEnd } },
    }),
    prisma.searchHistory.count(),
    prisma.searchHistory.count({ where: { searchedAt: { gte: todayStart } } }),
    prisma.premiumLicense.count({ where: { isActive: true } }),
    prisma.premiumLicense.aggregate({
      where: { isActive: true },
      _sum: { amountPaid: true },
    }),
    prisma.premiumLicense.aggregate({
      where: { isActive: true, createdAt: { gte: monthStart } },
      _sum: { amountPaid: true },
    }),
    prisma.analyticsEvent.count({ where: { eventType: 'PAYWALL_SHOWN' } }),
    prisma.analyticsEvent.count({ where: { eventType: 'PAYMENT_COMPLETED' } }),
  ]);

  const totalRevenue = totalRevenueResult._sum.amountPaid ?? 0;
  const revenueThisMonth = revenueMonthResult._sum.amountPaid ?? 0;

  // Proyección lineal al cierre del mes
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const revenueProjection = dayOfMonth > 0 ? Math.round((revenueThisMonth / dayOfMonth) * daysInMonth) : 0;

  // Delta: usersToday vs same day last week
  const usersDelta = usersLastWeekSameDay > 0
    ? ((usersToday - usersLastWeekSameDay) / usersLastWeekSameDay) * 100
    : usersToday > 0 ? 100 : 0;

  const conversionRate = paywallShownCount > 0
    ? (paymentCompletedCount / paywallShownCount) * 100
    : 0;

  return {
    totalUsers,
    usersToday,
    usersDelta,
    totalSensitivities,
    sensitivityToday,
    premiumUsers,
    totalRevenue,
    revenueThisMonth,
    revenueProjection,
    conversionRate,
  };
}

export default async function CommandCenterPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-mono tracking-tight">
          Command Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Panel de operaciones en tiempo real — SensiPRO
        </p>
      </div>

      {/* Hero Metrics */}
      <DashboardMetrics stats={stats} />

      {/* Charts */}
      <DashboardCharts />

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FunnelSection />
        </div>
        <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Actividad en Tiempo Real</h3>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

async function FunnelSection() {
  const [pageViews, sensiGenerated, paywallShown, paywallClicked, paymentStarted, paymentCompleted] =
    await Promise.all([
      prisma.analyticsEvent.count({ where: { eventType: 'PAGE_VIEW' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'SENSI_GENERATED' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'PAYWALL_SHOWN' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'PAYWALL_CLICKED' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'PAYMENT_STARTED' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'PAYMENT_COMPLETED' } }),
    ]);

  const steps = [
    { label: 'Visitantes', value: pageViews, color: 'bg-slate-500' },
    { label: 'Generaron Sensi', value: sensiGenerated, color: 'bg-cyan-500' },
    { label: 'Vieron Paywall', value: paywallShown, color: 'bg-purple-500' },
    { label: 'Click Desbloquear', value: paywallClicked, color: 'bg-amber-500' },
    { label: 'Iniciaron Pago', value: paymentStarted, color: 'bg-blue-500' },
    { label: 'Completaron Pago', value: paymentCompleted, color: 'bg-emerald-500' },
  ];

  const maxVal = Math.max(pageViews, 1);

  return (
    <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Funnel de Conversión</h3>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const pct = (step.value / maxVal) * 100;
          const prev = i > 0 ? steps[i - 1] : undefined;
          const dropoff = prev && prev.value > 0
            ? (((prev.value - step.value) / prev.value) * 100).toFixed(1)
            : null;

          return (
            <div key={step.label} className="flex items-center gap-4">
              <div className="w-36 text-xs text-slate-400 flex-shrink-0">{step.label}</div>
              <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full ${step.color} rounded-lg transition-all duration-1000`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/70">
                  {step.value.toLocaleString('es-MX')}
                </span>
              </div>
              {dropoff && (
                <span className="text-[10px] text-red-400 w-14 text-right flex-shrink-0">
                  -{dropoff}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
