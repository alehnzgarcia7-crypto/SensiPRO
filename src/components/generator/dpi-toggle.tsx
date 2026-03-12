'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — DpiToggle — Toggle premium con glow trail y afterimage
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/cn';

interface DpiToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  dpiValue: number | null;
}

export function DpiToggle({ enabled, onChange, dpiValue }: DpiToggleProps) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-xs font-heading uppercase tracking-[0.15em] text-white/60">
          Modo DPI
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          Ajuste fino para pantallas de alta densidad
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Toggle track */}
        <button
          onClick={() => onChange(!enabled)}
          className={cn(
            'relative flex items-center h-7 rounded-full px-0.5 transition-all duration-300 min-w-[52px]',
            'border',
            enabled
              ? 'bg-fire-500/20 border-fire-500/40 shadow-[0_0_12px_rgba(255,106,0,0.25)]'
              : 'bg-white/[0.06] border-white/[0.08]',
          )}
        >
          {/* Trail / afterimage */}
          <AnimatePresence>
            {enabled && (
              <motion.div
                className="absolute h-5 w-5 rounded-full bg-fire-400/20 blur-[4px]"
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: 24, opacity: 0.6 }}
                exit={{ x: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </AnimatePresence>

          {/* Thumb */}
          <motion.div
            animate={{ x: enabled ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={cn(
              'relative h-6 w-6 rounded-full transition-all duration-200',
              enabled
                ? 'bg-gradient-to-br from-fire-400 to-fire-600 shadow-[0_0_8px_rgba(255,106,0,0.4)]'
                : 'bg-slate-500 shadow-md',
            )}
          >
            {/* Inner glow dot */}
            {enabled && (
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            )}
          </motion.div>
        </button>

        {/* Label */}
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ color: enabled ? '#fb923c' : '#64748b' }}
            className="text-sm font-ui font-bold uppercase tracking-wider"
          >
            {enabled ? 'CON DPI' : 'SIN DPI'}
          </motion.span>
          <AnimatePresence>
            {enabled && dpiValue !== null && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, x: -5 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -5 }}
                className="text-sm font-mono font-bold text-fire-300 bg-fire-500/10 border border-fire-500/20 px-2.5 py-0.5 rounded-lg"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {dpiValue}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
