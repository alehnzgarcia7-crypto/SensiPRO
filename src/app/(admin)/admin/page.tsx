import Link from 'next/link';

import { prisma } from '@ares/database';
import { Card } from '@/components/ui/card';
import { AdminKpiCard } from '@/components/admin/admin-kpi-card';

interface DashboardKpis {
  totalUsers: number;
  newUsersWeek: number;
  paidUsers: number;
  conversionRate: string;
  mrr: number;
  totalSearches: number;
  searchesWeek: number;
  totalRevenue: number;
  revenueMonth: number;
}

async function getDashboardKpis(): Promise<DashboardKpis> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const [
    totalUsers,
    newUsersWeek,
    premiumCount,
    vipCount,
    totalSearches,
    searchesWeek,
    totalRevenue,
    revenueMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { tier: 'PREMIUM' } }),
    prisma.user.count({ where: { tier: 'VIP' } }),
    prisma.searchHistory.count(),
    prisma.searchHistory.count({ where: { searchedAt: { gte: sevenDaysAgo } } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
  ]);

  const paidUsers = premiumCount + vipCount;
  const conversionRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0';
  const mrr = premiumCount * 49 + vipCount * 99;

  return {
    totalUsers,
    newUsersWeek,
    paidUsers,
    conversionRate,
    mrr,
    totalSearches,
    searchesWeek,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    revenueMonth: revenueMonth._sum.amount ?? 0,
  };
}

interface QuickAction {
  href: string;
  label: string;
}

const quickActions: QuickAction[] = [
  { href: '/admin/content?action=new-guide', label: 'Nueva Guía' },
  { href: '/admin/users?action=generate-codes', label: 'Generar Códigos' },
  { href: '/admin/content?action=new-tournament', label: 'Crear Torneo' },
  { href: '/admin/analytics', label: 'Ver Analytics' },
  { href: '/admin/support', label: 'Ver Tickets' },
  { href: '/admin/ab-tests?action=new', label: 'Nuevo A/B Test' },
];

export default async function AdminDashboardPage() {
  const kpis = await getDashboardKpis();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Dashboard</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminKpiCard
          label="Usuarios Totales"
          value={kpis.totalUsers}
          sublabel={`+${kpis.newUsersWeek} esta semana`}
          color="fire"
        />
        <AdminKpiCard
          label="MRR"
          value={`$${kpis.mrr.toLocaleString()}`}
          sublabel="MXN/mes"
          color="gradient"
        />
        <AdminKpiCard
          label="Conversión"
          value={`${kpis.conversionRate}%`}
          sublabel={`${kpis.paidUsers} pagando`}
          color="ice"
        />
        <AdminKpiCard
          label="Búsquedas"
          value={kpis.totalSearches}
          sublabel={`+${kpis.searchesWeek} esta semana`}
          color="fire"
        />
      </div>

      {/* Quick actions */}
      <h2 className="font-display font-bold text-white mb-3">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="p-4 text-center hover:border-fire-500/20 transition-colors min-h-[44px]">
              <p className="text-sm font-ui font-semibold text-white">{action.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
