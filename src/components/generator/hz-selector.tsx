'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — HzSelector — Selector de tasa de refresco (Hz)
// Mismo estilo que RamSelector: pills futuristas con glow
// ═══════════════════════════════════════════════════════════════

import { HZ_OPTIONS } from '@ares/config';
import { motion } from 'framer-motion';

import { cn } from '@/lib/cn';

interface HzSelectorProps {
  value: number | null;
  onChange: (hz: number) => void;
  suggestedHz?: number;
}

function getHzLabel(hz: number): string {
  if (hz <= 60) return 'Estándar';
  if (hz <= 90) return 'Gama Media';
  return 'Alta gama';
}

export function HzSelector({ value, onChange, suggestedHz }: HzSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-heading uppercase tracking-[0.15em] text-white/80">
        Tasa de refresco
      </label>
      <div className="flex flex-wrap gap-2">
        {HZ_OPTIONS.map((hz) => {
          const isSelected = value === hz;
          const isSuggested = suggestedHz === hz;

          return (
            <motion.button
              key={hz}
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(hz)}
              className={cn(
                'relative px-4 py-2.5 rounded-xl font-ui font-bold text-sm min-h-[44px]',
                'border transition-all duration-200',
                isSelected
                  ? 'bg-gradient-to-r from-ice-500 to-ice-600 text-white border-ice-400/50 scale-105'
                  : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-white/15 hover:bg-white/[0.04] hover:text-slate-300',
              )}
              style={isSelected ? {
                boxShadow: '0 0 12px rgba(0, 163, 255, 0.3), 0 0 24px rgba(0, 163, 255, 0.1)',
                animation: 'pulseGlow 2s ease-in-out infinite',
              } : undefined}
            >
              {/* Active indicator — layoutId slider */}
              {isSelected && (
                <motion.div
                  layoutId="hz-active-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-ice-500/20 to-ice-600/20 border border-ice-400/30"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <span className="font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>{hz}Hz</span>
                <span className="text-[9px] font-normal opacity-70">{getHzLabel(hz)}</span>
              </div>

              {/* Badge 'detectado' con pulso */}
              {isSuggested && !isSelected && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 text-[9px] font-ui font-bold bg-ice-600 text-white px-1.5 py-0.5 rounded-full shadow-glow-ice"
                  style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
                >
                  detectado
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
