'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#ff6a00', '#00c8ff', '#22c55e', '#a855f7', '#f59e0b'];

interface AnalyticsData {
  dailySearches: { date: string; count: number }[];
  topDevices: { brand: string; model: string; count: number }[];
  styleDistribution: { style: string; count: number }[];
  tierDistribution: { tier: string; count: number }[];
}

interface PieLabelProps {
  name: string;
  percent: number;
}

const TIER_COLORS: Record<string, string> = {
  VIP: '#a855f7',
  PREMIUM: '#f59e0b',
  FREE: '#64748b',
};

const TOOLTIP_STYLE = {
  background: '#0f1729',
  border: '1px solid #1e293b',
  borderRadius: 8,
};

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((res: { success: boolean; data: AnalyticsData }) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6">
        <Skeleton variant="card" className="h-80" />
        <div className="grid sm:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-60" />
          <Skeleton variant="card" className="h-60" />
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">No hay datos</p>;

  return (
    <div className="space-y-6">
      {/* Búsquedas por día — Line chart */}
      <Card variant="glow" className="p-6">
        <h3 className="font-display font-bold text-white mb-4">Búsquedas por Día (30 días)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailySearches}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="count" stroke="#ff6a00" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Top dispositivos — Bar chart horizontal */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-white mb-4">Top Dispositivos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topDevices.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis dataKey="model" type="category" stroke="#475569" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#00c8ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribución de estilos — Pie chart */}
        <Card className="p-6">
          <h3 className="font-display font-bold text-white mb-4">Distribución de Estilos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.styleDistribution}
                dataKey="count"
                nameKey="style"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }: PieLabelProps) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.styleDistribution.map((_, i) => (
                  <Cell key={`style-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Distribución de tiers — Bar chart */}
      <Card className="p-6">
        <h3 className="font-display font-bold text-white mb-4">Distribución de Tiers</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.tierDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="tier" stroke="#475569" />
            <YAxis stroke="#475569" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.tierDistribution.map((entry, i) => (
                <Cell key={`tier-${i}`} fill={TIER_COLORS[entry.tier] ?? '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
