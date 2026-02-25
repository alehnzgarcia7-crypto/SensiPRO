'use client';

import { useState } from 'react';
import type { SensitivityStyle } from '@prisma/client';

import { Tabs } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface StyleComparisonProps {
  deviceId: string;
  currentStyle: SensitivityStyle;
}

interface StyleResult {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

const STYLE_TABS = [
  { key: 'AGGRESSIVE', label: '⚔️ Agresivo' },
  { key: 'BALANCED', label: '🎯 Balanceado' },
  { key: 'SNIPER', label: '🔭 Francotirador' },
];

const FIELDS = ['general', 'redPoint', 'scope2x', 'scope4x', 'sniperScope', 'freeView'] as const;
const FIELD_LABELS: Record<string, string> = {
  general: 'General',
  redPoint: 'Punto Rojo',
  scope2x: '2x',
  scope4x: '4x',
  sniperScope: 'AWM',
  freeView: 'Vista Libre',
};

export function StyleComparison({ deviceId, currentStyle }: StyleComparisonProps) {
  const [active, setActive] = useState<string>(currentStyle);
  const [results, setResults] = useState<Record<string, StyleResult>>({});
  const [loading, setLoading] = useState(false);

  const loadStyle = async (style: string) => {
    setActive(style);
    if (results[style]) return;

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, style, includeGyro: false }),
      });
      const data: { success: boolean; data?: { sensitivity: StyleResult } } = await res.json();
      if (data.success && data.data) {
        setResults((prev) => ({ ...prev, [style]: data.data!.sensitivity }));
      }
    } finally {
      setLoading(false);
    }
  };

  const current = results[active];

  return (
    <div className="glass p-6">
      <h3 className="font-display font-bold text-white mb-4">Comparar estilos</h3>
      <Tabs tabs={STYLE_TABS} activeTab={active} onChange={loadStyle} className="mb-4" />

      {loading && !current ? (
        <p className="text-sm text-slate-500 text-center py-4">Cargando...</p>
      ) : current ? (
        <div className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">{FIELD_LABELS[field]}</span>
                <span className="text-xs font-bold text-white tabular-nums">{current[field]}</span>
              </div>
              <Progress value={current[field]} max={100} size="sm" color="gradient" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-4">Selecciona un estilo</p>
      )}
    </div>
  );
}
