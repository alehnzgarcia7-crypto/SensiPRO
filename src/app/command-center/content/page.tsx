'use client';

import { BookOpen, Eye, Crosshair, Gamepad2, Crown, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

import { MetricCard } from '../components/metric-card';

interface ContentMetrics {
  totalPageViews: number;
  generatorUses: number;
  headshotUses: number;
  academyViews: number;
  paywallShown: number;
  paywallClicked: number;
  paywallConversion: number;
  totalGuides: number;
  totalDevices: number;
  topPages: Array<{ path: string; views: number }>;
}

export default function ContentPage() {
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/command-center/content')
      .then((r) => r.json())
      .then((d) => { setMetrics(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-white font-mono">Content</h1></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono">Content</h1>
        <p className="text-sm text-slate-500 mt-1">Métricas de contenido y SEO</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Page Views" value={metrics.totalPageViews} icon={Eye} accentColor="cyan" />
        <MetricCard label="Generador (usos)" value={metrics.generatorUses} icon={Crosshair} accentColor="green" />
        <MetricCard label="Headshot Mode" value={metrics.headshotUses} icon={Gamepad2} accentColor="yellow" />
        <MetricCard label="Academia (vistas)" value={metrics.academyViews} icon={BookOpen} accentColor="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Paywall Shown" value={metrics.paywallShown} icon={Crown} accentColor="yellow" />
        <MetricCard label="Paywall Clicked" value={metrics.paywallClicked} icon={Crown} accentColor="green" />
        <MetricCard
          label="Paywall CTR"
          value={metrics.paywallConversion}
          format="percent"
          icon={Crown}
          accentColor="cyan"
        />
        <MetricCard label="Dispositivos Activos" value={metrics.totalDevices} icon={FileText} accentColor="purple" />
      </div>

      {/* Top Pages */}
      <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1a1a2e]">
          <h3 className="text-sm font-semibold text-white">Páginas Más Visitadas</h3>
        </div>
        <div className="divide-y divide-[#1a1a2e]/50">
          {metrics.topPages.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">
              Sin datos de page views aún. Los eventos se registrarán automáticamente.
            </div>
          ) : (
            metrics.topPages.map((page, i) => {
              const maxViews = metrics.topPages[0]?.views || 1;
              const pct = (page.views / maxViews) * 100;

              return (
                <div key={page.path} className="px-6 py-3 flex items-center gap-4 hover:bg-white/[0.01]">
                  <span className="text-xs text-slate-600 font-mono w-6">{i + 1}</span>
                  <span className="text-sm text-white font-mono flex-1 truncate">{page.path}</span>
                  <div className="w-40 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500/50 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-mono w-16 text-right">
                    {page.views.toLocaleString('es-MX')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Content inventory */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-5">
          <div className="text-xs text-slate-500 mb-1">Guías Publicadas</div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.totalGuides}</div>
        </div>
        <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-5">
          <div className="text-xs text-slate-500 mb-1">Dispositivos</div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.totalDevices}</div>
        </div>
        <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-5">
          <div className="text-xs text-slate-500 mb-1">Paywall CTR</div>
          <div className="text-2xl font-bold text-white font-mono">{metrics.paywallConversion.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
