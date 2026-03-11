'use client';

import { cn } from '@/lib/cn';

interface RangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
}

const DEFAULT_OPTIONS = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: 'all', label: 'Todo' },
];

export function RangeSelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: RangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-[#080810] rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            value === opt.value
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
