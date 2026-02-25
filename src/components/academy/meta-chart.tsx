'use client';

import { cn } from '@/lib/cn';
import type { WeaponMeta } from '@/lib/academy/meta-config';
import { TIER_COLORS } from '@/lib/academy/meta-config';
import { GlowProgressBar } from '@/components/effects/glow-progress-bar';

// ═══════════════════════════════════════════════════════════════
// MetaChart — Tarjeta premium de stats de un arma con GlowProgressBar
// ═══════════════════════════════════════════════════════════════

interface MetaChartProps {
  weapon: WeaponMeta;
  index?: number;
}

const STATS: { key: keyof Pick<WeaponMeta, 'damage' | 'fireRate' | 'range' | 'accuracy' | 'recoilControl'>; label: string }[] = [
  { key: 'damage', label: 'Daño' },
  { key: 'fireRate', label: 'Cadencia' },
  { key: 'range', label: 'Alcance' },
  { key: 'accuracy', label: 'Precisión' },
  { key: 'recoilControl', label: 'Control' },
];

export function MetaChart({ weapon, index = 0 }: MetaChartProps) {
  const tierStyle = TIER_COLORS[weapon.tier];

  return (
    <div
      className="glass-card p-4 group academy-stagger"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm">
            {weapon.name}
          </h3>
          <span className="text-xs text-slate-500">{weapon.type}</span>
        </div>
        <span
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-black border transition-all duration-300 group-hover:scale-110',
            tierStyle.bg,
            tierStyle.text,
            tierStyle.border,
          )}
          style={{
            boxShadow: weapon.tier === 'S'
              ? '0 0 12px rgba(239, 68, 68, 0.3)'
              : weapon.tier === 'A'
                ? '0 0 12px rgba(249, 115, 22, 0.3)'
                : weapon.tier === 'B'
                  ? '0 0 12px rgba(6, 182, 212, 0.3)'
                  : undefined,
          }}
        >
          Tier {weapon.tier}
        </span>
      </div>

      <div className="space-y-3 mb-3">
        {STATS.map((stat, i) => (
          <div key={stat.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{stat.label}</span>
              <span className="font-numbers text-white font-medium">{weapon[stat.key]}</span>
            </div>
            <GlowProgressBar
              value={weapon[stat.key]}
              max={100}
              delay={i * 0.08 + index * 0.05}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-2">{weapon.description}</p>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Mejor para:</span>
        <span
          className="px-2 py-0.5 rounded-md font-medium text-fire-400 bg-fire-500/10 border border-fire-500/20"
          style={{ boxShadow: '0 0 8px rgba(255, 106, 0, 0.15)' }}
        >
          {weapon.bestFor}
        </span>
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
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-[family-name:var(--font-rajdhani)] font-bold text-white">{weaponA.name}</span>
        <span className="text-xs text-slate-500 font-numbers">VS</span>
        <span className="font-[family-name:var(--font-rajdhani)] font-bold text-white">{weaponB.name}</span>
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
                <span className={cn('font-numbers font-medium', valA >= valB ? 'text-fire-400' : 'text-slate-400')}>
                  {valA}
                </span>
                <span className="text-slate-500">{label}</span>
                <span className={cn('font-numbers font-medium', valB >= valA ? 'text-ice-400' : 'text-slate-400')}>
                  {valB}
                </span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden flex justify-end shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pctA}%`,
                      background: 'linear-gradient(90deg, #c2410c, #ff6a00)',
                      boxShadow: '0 0 6px rgba(255, 106, 0, 0.3)',
                    }}
                  />
                </div>
                <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pctB}%`,
                      background: 'linear-gradient(90deg, #06b6d4, #67e8f9)',
                      boxShadow: '0 0 6px rgba(6, 182, 212, 0.3)',
                    }}
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
