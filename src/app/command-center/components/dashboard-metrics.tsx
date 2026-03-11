'use client';

import {
  Users,
  UserPlus,
  Crosshair,
  Crown,
  DollarSign,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';

import { MetricCard } from './metric-card';

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

export function DashboardMetrics({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Usuarios Totales"
        value={stats.totalUsers}
        icon={Users}
        accentColor="cyan"
      />
      <MetricCard
        label="Usuarios Hoy"
        value={stats.usersToday}
        icon={UserPlus}
        delta={stats.usersDelta}
        deltaLabel="vs semana pasada"
        accentColor="green"
      />
      <MetricCard
        label="Sensibilidades (Total)"
        value={stats.totalSensitivities}
        icon={Crosshair}
        accentColor="purple"
      />
      <MetricCard
        label="Sensibilidades Hoy"
        value={stats.sensitivityToday}
        icon={Zap}
        accentColor="yellow"
      />
      <MetricCard
        label="Usuarios Premium"
        value={stats.premiumUsers}
        icon={Crown}
        accentColor="yellow"
      />
      <MetricCard
        label="Ingresos Totales"
        value={stats.totalRevenue}
        format="currency"
        icon={DollarSign}
        accentColor="green"
      />
      <MetricCard
        label="Ingresos Este Mes"
        value={stats.revenueThisMonth}
        format="currency"
        icon={TrendingUp}
        accentColor="cyan"
      />
      <MetricCard
        label="Conversión"
        value={stats.conversionRate}
        format="percent"
        icon={Target}
        accentColor="red"
      />
    </div>
  );
}
