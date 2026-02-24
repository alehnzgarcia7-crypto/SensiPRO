'use client';

import { cn } from '@/lib/cn';
import type { WeaponMeta } from '@/lib/academy/meta-config';
import { TIER_COLORS } from '@/lib/academy/meta-config';

// ═══════════════════════════════════════════════════════════════
// MetaChart — Tarjeta de stats de un arma con barras visuales
// ═══════════════════════════════════════════════════════════════

interface MetaChartProps {
  weapon: WeaponMeta;
}

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

function StatBar({ label, value, maxValue = 100, color = 'bg-fire-500' }: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function MetaChart({ weapon }: MetaChartProps) {
  const tierStyle = TIER_COLORS[weapon.tier];

  return (
    <div className={cn('rounded-xl border p-4', tierStyle.border, 'bg-background-card/50')}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-sm">{weapon.name}</h3>
          <span className="text-xs text-slate-500">{weapon.type}</span>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 rounded text-xs font-black',
            tierStyle.bg,
            tierStyle.text,
          )}
        >
          Tier {weapon.tier}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <StatBar label="Daño" value={weapon.damage} color="bg-red-500" />
        <StatBar label="Cadencia" value={weapon.fireRate} color="bg-yellow-500" />
        <StatBar label="Alcance" value={weapon.range} color="bg-blue-500" />
        <StatBar label="Precisión" value={weapon.accuracy} color="bg-green-500" />
        <StatBar label="Control" value={weapon.recoilControl} color="bg-purple-500" />
      </div>

      <p className="text-xs text-slate-400 mb-2">{weapon.description}</p>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Mejor para:</span>
        <span className="text-fire-400 font-medium">{weapon.bestFor}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WeaponCompare — Comparación side-by-side de dos armas
// ═══════════════════════════════════════════════════════════════

interface WeaponCompareProps {
  weapons: WeaponMeta[];
}

type NumericWeaponKey = 'damage' | 'fireRate' | 'range' | 'accuracy' | 'recoilControl' | 'magazine';

const COMPARE_STATS: { key: NumericWeaponKey; label: string }[] = [
  { key: 'damage', label: 'Daño' },
  { key: 'fireRate', label: 'Cadencia' },
  { key: 'range', label: 'Alcance' },
  { key: 'accuracy', label: 'Precisión' },
  { key: 'recoilControl', label: 'Control' },
  { key: 'magazine', label: 'Cargador' },
];

export function WeaponCompare({ weapons }: WeaponCompareProps) {
  const weaponA = weapons[0];
  const weaponB = weapons[1];

  if (!weaponA || !weaponB) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-background-card/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-white">{weaponA.name}</span>
        <span className="text-xs text-slate-500">VS</span>
        <span className="font-bold text-white">{weaponB.name}</span>
      </div>

      <div className="space-y-3">
        {COMPARE_STATS.map(({ key, label }) => {
          const valA = weaponA[key];
          const valB = weaponB[key];
          const maxVal = Math.max(valA, valB, 100);
          const pctA = (valA / maxVal) * 100;
          const pctB = (valB / maxVal) * 100;

          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={cn('font-medium', valA >= valB ? 'text-fire-400' : 'text-slate-400')}>
                  {valA}
                </span>
                <span className="text-slate-500">{label}</span>
                <span className={cn('font-medium', valB >= valA ? 'text-ice-400' : 'text-slate-400')}>
                  {valB}
                </span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden flex justify-end">
                  <div
                    className="h-full rounded-full bg-fire-500 transition-all duration-500"
                    style={{ width: `${pctA}%` }}
                  />
                </div>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-ice-500 transition-all duration-500"
                    style={{ width: `${pctB}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
