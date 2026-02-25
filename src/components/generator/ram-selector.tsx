'use client';

import { motion } from 'framer-motion';

import { RAM_OPTIONS } from '@ares/config';

interface RamSelectorProps {
  value: number | null;
  onChange: (ram: number) => void;
  suggestedRam?: number;
}

export function RamSelector({ value, onChange, suggestedRam }: RamSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-display font-semibold text-white">
        {'📱 ¿Cuánta RAM tiene tu dispositivo?'}
      </label>
      <p className="text-xs text-slate-500">
        Si no sabes, revisa Ajustes → Acerca del teléfono → Memoria
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {RAM_OPTIONS.map((ram) => {
          const isSelected = value === ram;
          const isSuggested = suggestedRam === ram;

          return (
            <motion.button
              key={ram}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(ram)}
              className={`
                relative px-3 py-2 rounded-lg text-sm font-display font-bold
                transition-colors duration-200 min-h-[44px]
                ${isSelected
                  ? 'bg-fire-500 text-white shadow-lg shadow-fire-500/25'
                  : 'bg-transparent border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                }
              `}
            >
              {ram}GB
              {isSuggested && !isSelected && (
                <span className="absolute -top-2 -right-2 text-[10px] bg-ice-600 text-white px-1.5 py-0.5 rounded-full">
                  detectado
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
