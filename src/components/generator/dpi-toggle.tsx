'use client';

import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/cn';

interface DpiToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  dpiValue: number | null;
}

export function DpiToggle({ enabled, onChange, dpiValue }: DpiToggleProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-ui font-medium text-slate-400 uppercase tracking-wider">
        Modo DPI
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(!enabled)}
          className={cn(
            'relative flex items-center h-8 rounded-full px-1 transition-colors duration-200 min-w-[52px]',
            enabled ? 'bg-ice-500/30 shadow-glow-ice' : 'bg-white/10',
          )}
        >
          <motion.div
            animate={{ x: enabled ? 22 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={cn(
              'h-6 w-6 rounded-full transition-colors',
              enabled ? 'bg-ice-400' : 'bg-slate-500',
            )}
          />
        </button>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-ui font-medium transition-colors',
            enabled ? 'text-ice-400' : 'text-slate-500',
          )}>
            {enabled ? 'CON DPI' : 'SIN DPI'}
          </span>
          <AnimatePresence>
            {enabled && dpiValue !== null && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, x: -5 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -5 }}
                className="text-sm font-display font-bold text-ice-300 bg-ice-500/10 px-2 py-0.5 rounded-md"
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
