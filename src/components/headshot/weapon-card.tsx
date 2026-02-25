'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import type { SensitivityOutput } from '@ares/algorithms';
import { GlowProgressBar } from '@/components/effects/glow-progress-bar';
import { CountUp } from '@/components/effects/count-up';
import { HeadshotCopyButton } from './headshot-copy-button';

interface WeaponData {
  id: string;
  name: string;
  type: string;
  tier: string;
  damage: number;
  headshotDamage: number;
  headshotMultiplier: number;
  rpm: number;
  range: number;
  dragType: string;
  sensAdjust: Partial<Record<keyof SensitivityOutput, number>>;
  attachments: readonly string[];
  tip: string;
  proTip: string;
}

interface WeaponCardProps {
  weapon: WeaponData;
  baseSensitivity: SensitivityOutput;
  getAdjusted: (base: SensitivityOutput, adjust: Partial<Record<keyof SensitivityOutput, number>>) => SensitivityOutput;
  index: number;
}

const TIER_COLORS: Record<string, string> = {
  S: 'bg-red-500/15 text-red-400 border-red-500/20',
  A: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  B: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
};

const DRAG_EMOJIS: Record<string, string> = {
  vertical: '⬆️',
  rotation: '🔄',
  direction: '↗️',
};

export function WeaponCard({ weapon, baseSensitivity, getAdjusted, index }: WeaponCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showProTip, setShowProTip] = useState(false);
  const adjusted = getAdjusted(baseSensitivity, weapon.sensAdjust);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-start gap-3 min-h-[44px]"
      >
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-ui font-bold text-white text-base">{weapon.name}</h4>
            <span className="text-[10px] font-ui px-1.5 py-0.5 rounded-full bg-white/[0.04] text-slate-500">
              {weapon.type}
            </span>
            <span className={`text-[10px] font-ui font-bold px-1.5 py-0.5 rounded-full border ${TIER_COLORS[weapon.tier] ?? TIER_COLORS.B}`}>
              {weapon.tier}
            </span>
          </div>

          {/* Mini stat bars */}
          <div className="mt-3 space-y-2">
            <StatRow label="Daño" value={weapon.damage} max={100} />
            <StatRow label="HS Daño" value={weapon.headshotDamage} max={250} color="red" />
            <StatRow label="Cadencia" value={weapon.rpm} max={1000} />
            <StatRow label="Alcance" value={weapon.range} max={100} />
          </div>

          {/* Drag type + Multiplier */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/5">
              {DRAG_EMOJIS[weapon.dragType] ?? '⬆️'} {weapon.dragType}
            </span>
            <span className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              HS ×{weapon.headshotMultiplier}
            </span>
          </div>

          {/* Attachments */}
          <div className="flex flex-wrap gap-1 mt-2">
            {weapon.attachments.map((a) => (
              <span key={a} className="text-[10px] font-body text-slate-600">{a}</span>
            ))}
          </div>

          {/* Tip */}
          <p className="text-xs text-slate-400 font-body mt-2">{weapon.tip}</p>

          {/* Pro tip toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowProTip(!showProTip); }}
            className="text-[10px] font-ui text-cyan-400 mt-1 hover:underline min-h-[44px] flex items-center"
          >
            {showProTip ? '▼ Ocultar Pro Tip' : '▶ Ver Pro Tip'}
          </button>
          <AnimatePresence>
            {showProTip && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-xs text-cyan-300/80 italic font-body overflow-hidden"
              >
                {weapon.proTip}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-600 transition-transform shrink-0 mt-1 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded: weapon-adjusted sensitivity */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              <p className="text-[10px] font-ui font-bold uppercase tracking-wider text-red-400 mb-2">
                Sensibilidad para {weapon.name}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(adjusted) as [keyof SensitivityOutput, number][]).map(([key, val]) => {
                  const diff = val - baseSensitivity[key];
                  if (diff === 0) return null;
                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-ui capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-1">
                        <span className={`font-mono font-bold ${diff > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                        <span className="font-mono font-bold text-white">{val}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3">
                <HeadshotCopyButton
                  sensitivity={adjusted}
                  label={`COPIAR SENSI PARA ${weapon.name.toUpperCase()}`}
                  className="text-xs py-2"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatRow({ label, value, max, color }: { label: string; value: number; max: number; color?: 'red' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-ui text-slate-600 w-14 shrink-0">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (value / max) * 100)}%`,
            background: color === 'red'
              ? 'linear-gradient(90deg, #ef4444, #f97316)'
              : 'linear-gradient(90deg, #06b6d4, #67e8f9)',
          }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{value}</span>
    </div>
  );
}
