'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

import { ChartCard } from '../components/chart-card';

interface AnalyticsData {
  topDevices: Array<{ brand: string; model: string; count: number }>;
  topBrands: Array<{ brand: string; count: number }>;
  styleDistribution: Array<{ style: string; count: number }>;
  trafficSources: Array<{ source: string; count: number }>;
}

const STYLE_COLORS: Record<string, string> = {
  AGGRESSIVE: '#ef4444',
  BALANCED: '#3b82f6',
  SNIPER: '#22c55e',
};

const BRAND_COLORS = ['#00E5FF', '#635BFF', '#FFD740', '#00E676', '#FF5252', '#AB47BC', '#FF7043', '#26C6DA'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/command-center/analytics')
      .then((r) => r.json())
      .then((d) => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-white font-mono">Analytics</h1></div>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-6 h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const deviceData = data.topDevices.slice(0, 20).map((d) => ({
    name: `${d.brand} ${d.model}`.slice(0, 25),
    count: d.count,
  }));

  const brandPie = data.topBrands.slice(0, 8).map((b, i) => ({
    name: b.brand,
    value: b.count,
    color: BRAND_COLORS[i % BRAND_COLORS.length],
  }));

  const stylePie = data.styleDistribution.map((s) => ({
    name: s.style === 'AGGRESSIVE' ? 'Agresivo' : s.style === 'BALANCED' ? 'Balanceado' : 'Francotirador',
    value: s.count,
    color: STYLE_COLORS[s.style] || '#64748b',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Inteligencia de producto</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Devices */}
        <ChartCard title="Top Dispositivos Buscados" subtitle="Los más populares" className="lg:col-span-2">
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(400, deviceData.length * 28)}>
              <BarChart data={deviceData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={180}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    const item = payload?.[0];
                    if (!active || !item) return null;
                    return (
                      <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-lg p-3 shadow-xl">
                        <p className="text-xs text-white">{String(item.payload?.name ?? '')}</p>
                        <p className="text-xs text-cyan-400 font-mono">{Number(item.value).toLocaleString()} búsquedas</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" fill="#00E5FF" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
              Sin datos de búsqueda aún
            </div>
          )}
        </ChartCard>

        {/* Top Brands */}
        <ChartCard title="Marcas Más Buscadas" subtitle="Distribución por marca">
          {brandPie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={brandPie} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" stroke="none">
                    {brandPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      const item = payload?.[0];
                      if (!active || !item) return null;
                      const d = item.payload as (typeof brandPie)[0];
                      return (
                        <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-lg p-3 shadow-xl">
                          <p className="text-xs text-white">{d.name}</p>
                          <p className="text-xs text-cyan-400 font-mono">{d.value.toLocaleString()} búsquedas</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                {brandPie.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-slate-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-500 text-sm">Sin datos</div>
          )}
        </ChartCard>

        {/* Style Distribution */}
        <ChartCard title="Distribución de Estilos" subtitle="Playstyles seleccionados">
          {stylePie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stylePie} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" stroke="none">
                    {stylePie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      const item = payload?.[0];
                      if (!active || !item) return null;
                      const d = item.payload as (typeof stylePie)[0];
                      return (
                        <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-lg p-3 shadow-xl">
                          <p className="text-xs text-white">{d.name}</p>
                          <p className="text-xs text-cyan-400 font-mono">{d.value.toLocaleString()}</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-2">
                {stylePie.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[10px] text-slate-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-slate-500 text-sm">Sin datos</div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
