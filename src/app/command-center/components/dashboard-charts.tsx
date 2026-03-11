'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend,
} from 'recharts';

import { ChartCard } from './chart-card';
import { RangeSelector } from './range-selector';

interface DailyData {
  date: string;
  count: number;
}

interface RevenueData {
  date: string;
  amount: number;
  method: string;
}

interface ChartData {
  dailyUsers: DailyData[];
  dailySensitivities: DailyData[];
  dailyRevenue: RevenueData[];
}

function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-mono" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString('es-MX')}
        </p>
      ))}
    </div>
  );
}

export function DashboardCharts() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/command-center/stats/charts?range=${range}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-6 h-80 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
            <div className="h-full bg-white/[0.02] rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Merge users + sensitivities for combined chart
  const combinedDaily = data.dailyUsers.map((u, i) => ({
    date: formatDate(u.date),
    usuarios: u.count,
    sensibilidades: data.dailySensitivities[i]?.count || 0,
  }));

  // Aggregate revenue by date
  const revenueByDate = new Map<string, { date: string; total: number; stripe: number; oxxo: number; mercadopago: number }>();
  for (const r of data.dailyRevenue) {
    const key = r.date;
    if (!revenueByDate.has(key)) {
      revenueByDate.set(key, { date: formatDate(key), total: 0, stripe: 0, oxxo: 0, mercadopago: 0 });
    }
    const entry = revenueByDate.get(key)!;
    const amount = r.amount / 100;
    entry.total += amount;
    const method = r.method?.toLowerCase() || 'stripe';
    if (method.includes('oxxo')) entry.oxxo += amount;
    else if (method.includes('mercado')) entry.mercadopago += amount;
    else entry.stripe += amount;
  }
  const revenueDaily = Array.from(revenueByDate.values());

  const rangeActions = <RangeSelector value={range} onChange={setRange} />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Usuarios & Sensibilidades" subtitle="Nuevos por día" actions={rangeActions}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={combinedDaily}>
            <defs>
              <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSensi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Area
              type="monotone"
              dataKey="usuarios"
              stroke="#00E5FF"
              fill="url(#colorUsuarios)"
              strokeWidth={2}
              name="Usuarios"
            />
            <Area
              type="monotone"
              dataKey="sensibilidades"
              stroke="#00E676"
              fill="url(#colorSensi)"
              strokeWidth={2}
              name="Sensibilidades"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ingresos por Día" subtitle="Desglose por método de pago">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueDaily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="stripe" stackId="revenue" fill="#635BFF" name="Stripe" radius={[0, 0, 0, 0]} />
            <Bar dataKey="oxxo" stackId="revenue" fill="#FFD740" name="OXXO" radius={[0, 0, 0, 0]} />
            <Bar dataKey="mercadopago" stackId="revenue" fill="#00AEEF" name="MercadoPago" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
