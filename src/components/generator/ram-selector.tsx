'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — RamSelector — Pills futuristas estilo nave espacial
// Glow pulsante en seleccionada, badge detectado animado,
// layoutId slider animation entre pills
// ═══════════════════════════════════════════════════════════════

import { RAM_OPTIONS } from '@ares/config';
import { motion } from 'framer-motion';

import { cn } from '@/lib/cn';

interface RamSelectorProps {
  value: number | null;
  onChange: (ram: number) => void;
  suggestedRam?: number;
}

export function RamSelector({ value, onChange, suggestedRam }: RamSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-heading uppercase tracking-[0.15em] text-white/80">
          RAM del dispositivo
        </label>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Ajustes &rarr; Acerca del teléfono &rarr; Memoria
        </p>
        <p className="text-[10px] text-slate-600/70 mt-0.5">
          Si no sabes tu RAM, usa el valor detectado
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {RAM_OPTIONS.map((ram) => {
          const isSelected = value === ram;
          const isSuggested = suggestedRam === ram;

          return (
            <motion.button
              key={ram}
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(ram)}
              className={cn(
                'relative px-4 py-2.5 rounded-xl font-ui font-bold text-sm min-h-[44px]',
                'border transition-all duration-200',
                isSelected
                  ? 'bg-gradient-to-r from-fire-500 to-fire-600 text-white border-fire-400/50 scale-105'
                  : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-white/15 hover:bg-white/[0.04] hover:text-slate-300',
              )}
              style={isSelected ? {
                boxShadow: '0 0 12px rgba(255, 106, 0, 0.3), 0 0 24px rgba(255, 106, 0, 0.1)',
                animation: 'pulseGlow 2s ease-in-out infinite',
              } : undefined}
            >
              {/* Active indicator — layoutId slider */}
              {isSelected && (
                <motion.div
                  layoutId="ram-active-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-fire-500/20 to-fire-600/20 border border-fire-400/30"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>{ram}GB</span>

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
