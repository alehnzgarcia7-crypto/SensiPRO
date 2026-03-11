'use client';

import { DollarSign, CreditCard, Banknote, Smartphone, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

import { cn } from '@/lib/cn';

import { ChartCard } from '../components/chart-card';
import { MetricCard } from '../components/metric-card';

interface RevenueData {
  total: number;
  periodTotal: number;
  byMethod: Array<{ method: string; total: number; count: number }>;
  transactions: Array<{
    id: string;
    email: string;
    amountPaid: number;
    paymentMethod: string;
    paymentProvider: string;
    activatedAt: string;
  }>;
  arpu: number;
  premiumCount: number;
}

type Period = 'today' | 'week' | 'month' | 'all';

const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mes' },
  { value: 'all', label: 'Todo' },
];

const METHOD_COLORS: Record<string, string> = {
  card: '#635BFF',
  oxxo: '#FFD740',
  mercadopago: '#00AEEF',
};

const METHOD_ICONS: Record<string, typeof CreditCard> = {
  card: CreditCard,
  oxxo: Banknote,
  mercadopago: Smartphone,
};

function formatCurrency(centavos: number): string {
  return `$${(centavos / 100).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
}

export default function RevenuePage() {
  const [period, setPeriod] = useState<Period>('month');
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/command-center/revenue?period=${period}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-white font-mono">Revenue</h1></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-5 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const pieData = data.byMethod.map((m) => ({
    name: m.method === 'card' ? 'Stripe Card' : m.method === 'oxxo' ? 'OXXO' : 'MercadoPago',
    value: m.total / 100,
    count: m.count,
    color: METHOD_COLORS[m.method] || '#64748b',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono">Revenue</h1>
          <p className="text-sm text-slate-500 mt-1">Panel financiero en tiempo real</p>
        </div>
        <div className="flex items-center gap-1 bg-[#0d0d1a] rounded-lg p-1 border border-[#1a1a2e]">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                'px-3 py-2 rounded-md text-xs font-medium transition-all',
                period === opt.value
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ingresos Totales"
          value={data.total}
          format="currency"
          icon={DollarSign}
          accentColor="green"
        />
        <MetricCard
          label={`Ingresos (${PERIOD_OPTIONS.find((o) => o.value === period)?.label})`}
          value={data.periodTotal}
          format="currency"
          icon={TrendingUp}
          accentColor="cyan"
        />
        <MetricCard
          label="ARPU"
          value={data.arpu}
          format="currency"
          icon={DollarSign}
          accentColor="purple"
        />
        <MetricCard
          label="Usuarios Premium"
          value={data.premiumCount}
          icon={CreditCard}
          accentColor="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - By Method */}
        <ChartCard title="Desglose por Método" subtitle="Distribución de ingresos">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    const item = payload?.[0];
                    if (!active || !item) return null;
                    const d = item.payload as (typeof pieData)[0];
                    return (
                      <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-lg p-3 shadow-xl">
                        <p className="text-xs text-white font-medium">{d.name}</p>
                        <p className="text-xs text-cyan-400 font-mono">${d.value.toLocaleString('es-MX')}</p>
                        <p className="text-[10px] text-slate-500">{d.count} transacciones</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-slate-500 text-sm">
              Sin datos de pago aún
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-slate-400">{d.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Method Comparison Bar */}
        <ChartCard title="Transacciones por Método">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pieData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
              Sin datos
            </div>
          )}
        </ChartCard>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1a1a2e]">
          <h3 className="text-sm font-semibold text-white">Transacciones Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a2e]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase">Método</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500 text-sm">
                    No hay transacciones aún
                  </td>
                </tr>
              ) : (
                data.transactions.map((tx) => {
                  const MethodIcon = METHOD_ICONS[tx.paymentMethod] || CreditCard;
                  return (
                    <tr key={tx.id} className="border-b border-[#1a1a2e]/50 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-xs text-slate-300 font-mono">{tx.email}</td>
                      <td className="px-4 py-3 text-xs text-emerald-400 font-mono font-bold">
                        {formatCurrency(tx.amountPaid)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-400 capitalize">{tx.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 capitalize">{tx.paymentProvider}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(tx.activatedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
