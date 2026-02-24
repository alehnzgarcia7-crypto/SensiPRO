'use client';

import { motion } from 'framer-motion';
import { Crosshair, Scale, Zap } from 'lucide-react';
import type { CalibrationLevel } from '@prisma/client';

import { cn } from '@/lib/cn';

interface CalibrationSelectorProps {
  value: CalibrationLevel;
  onChange: (calibration: CalibrationLevel) => void;
}

interface CalibrationOption {
  key: CalibrationLevel;
  label: string;
  icon: typeof Crosshair;
  description: string;
}

const OPTIONS: CalibrationOption[] = [
  {
    key: 'BAJA',
    label: 'Precisión',
    icon: Crosshair,
    description: 'Valores bajos, control fino',
  },
  {
    key: 'MEDIA',
    label: 'Balanceado',
    icon: Scale,
    description: 'Equilibrio perfecto',
  },
  {
    key: 'ALTA',
    label: 'Velocidad',
    icon: Zap,
    description: 'Giros rápidos, rush',
  },
];

export function CalibrationSelector({ value, onChange }: CalibrationSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-ui font-medium text-slate-400 uppercase tracking-wider">
        Calibración
      </p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = value === option.key;
          return (
            <button
              key={option.key}
              onClick={() => onChange(option.key)}
              className={cn(
                'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all min-h-[44px]',
                isActive
                  ? 'border-fire-500/50 bg-gradient-to-b from-fire-500/15 to-ice-500/10 shadow-lg shadow-fire-500/10'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="calibration-active"
                  className="absolute inset-0 rounded-xl border border-fire-500/30 bg-gradient-to-b from-fire-500/10 to-ice-500/5"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={cn(
                  'relative z-10 transition-colors',
                  isActive ? 'text-fire-400' : 'text-slate-500',
                )}
              />
              <span
                className={cn(
                  'relative z-10 text-xs font-ui font-semibold transition-colors',
                  isActive ? 'text-white' : 'text-slate-400',
                )}
              >
                {option.label}
              </span>
              <span className="relative z-10 text-[10px] text-slate-600 hidden md:block">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
