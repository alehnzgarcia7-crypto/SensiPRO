'use client';

import { cn } from '@/lib/cn';

interface FingerSelectorProps {
  value: 2 | 3 | 4;
  onChange: (v: 2 | 3 | 4) => void;
}

const OPTIONS: { value: 2 | 3 | 4; label: string }[] = [
  { value: 2, label: '✌️ 2 Dedos' },
  { value: 3, label: '🤟 3 Dedos' },
  { value: 4, label: '🖐 4 Dedos' },
];

export function FingerSelector({ value, onChange }: FingerSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-heading uppercase tracking-[0.15em] text-slate-500 mb-2">
        Dedos que usas
      </label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                'min-h-[44px] px-4 py-2 rounded-xl text-sm font-ui font-semibold transition-all border',
                active
                  ? 'bg-red-500/15 border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
