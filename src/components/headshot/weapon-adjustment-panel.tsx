'use client';

import type { WeaponAdjustmentRow } from '@ares/algorithms';
import { WEAPON_CATEGORIES, type WeaponCategory } from '@ares/algorithms';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';


interface WeaponAdjustmentPanelProps {
  adjustments: WeaponAdjustmentRow[];
}

function ModifierColor({ modifier }: { modifier: string }) {
  if (modifier === 'Base') return <span className="text-slate-400">{modifier}</span>;
  if (modifier.startsWith('+')) return <span className="text-green-400">{modifier}</span>;
  return <span className="text-orange-400">{modifier}</span>;
}

export function WeaponAdjustmentPanel({ adjustments }: WeaponAdjustmentPanelProps) {
  const [expanded, setExpanded] = useState<WeaponCategory | null>(null);

  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-1">
        🔫 Ajuste por Arma
      </h3>
      <p className="text-xs text-slate-500 font-body mb-5">
        Tu sensibilidad cambia según el arma que uses
      </p>

      <div className="space-y-1">
        {adjustments.map((row) => {
          const isBase = row.modifier === 'Base' && row.category === 'ar_fast';
          const isExpanded = expanded === row.category;
          const catData = WEAPON_CATEGORIES[row.category];

          return (
            <div key={row.category}>
              <button
                onClick={() => setExpanded(isExpanded ? null : row.category)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all min-h-[44px]',
                  isBase
                    ? 'bg-white/[0.04] border border-white/[0.08]'
                    : 'hover:bg-white/[0.03]',
                )}
              >
                {/* Icon + Name */}
                <span className="text-lg shrink-0">{row.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-ui font-semibold text-slate-300 truncate">
                      {row.nameEs}
                    </span>
                    <span className="text-[10px] font-mono font-bold">
                      <ModifierColor modifier={row.modifier} />
                    </span>
                  </div>
                </div>

                {/* Values */}
                <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono shrink-0">
                  <span className="text-slate-500">P.Rojo:</span>
                  <span className={cn(
                    'font-bold',
                    row.modifier.startsWith('+') ? 'text-green-400' : row.modifier.startsWith('-') ? 'text-orange-400' : 'text-slate-300',
                  )}>{row.redPoint}</span>
                  <span className="text-slate-600">2x:</span>
                  <span className="text-slate-400">{row.scope2x}</span>
                  <span className="text-slate-600">4x:</span>
                  <span className="text-slate-400">{row.scope4x}</span>
                </div>

                {/* Mobile values */}
                <div className="flex sm:hidden items-center gap-1 text-[10px] font-mono shrink-0">
                  <span className={cn(
                    'font-bold',
                    row.modifier.startsWith('+') ? 'text-green-400' : row.modifier.startsWith('-') ? 'text-orange-400' : 'text-slate-300',
                  )}>{row.redPoint}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">{row.scope2x}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">{row.scope4x}</span>
                </div>

                <ChevronDown
                  size={14}
                  className={cn(
                    'text-slate-600 transition-transform shrink-0',
                    isExpanded && 'rotate-180',
                  )}
                />
              </button>

              {/* Expanded: show weapons */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2 ml-8 space-y-1">
                      {catData.weapons.map((w) => (
                        <div key={w.name} className="flex items-center gap-2 text-xs font-body">
                          <span className="text-slate-400">{w.name}</span>
                          {w.meta && (
                            <span className="text-[9px] font-ui font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                              META
                            </span>
                          )}
                        </div>
                      ))}
                      <p className="text-[10px] text-slate-600 font-body mt-1">
                        {catData.bestDragEs}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-4 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <p className="text-[11px] text-slate-600 font-body">
          ℹ️ Estos son ajustes recomendados. Tu sensibilidad base no cambia — solo ajusta cuando uses esa categoría.
        </p>
      </div>
    </div>
  );
}
