'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

interface MetricCardProps {
  label: string;
  value: number;
  format?: 'number' | 'currency' | 'percent';
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  accentColor?: 'cyan' | 'green' | 'yellow' | 'red' | 'purple';
}

function formatValue(value: number, format: MetricCardProps['format']): string {
  switch (format) {
    case 'currency':
      return `$${(value / 100).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString('es-MX');
  }
}

function CountUp({ target, format }: { target: number; format: MetricCardProps['format'] }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const from = ref.current;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = from + (target - from) * eased;
      setCurrent(val);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = target;
    }

    requestAnimationFrame(animate);
  }, [target]);

  return <span>{formatValue(Math.round(current), format)}</span>;
}

const ACCENT_COLORS = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', icon: 'text-cyan-500' },
  green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-500' },
  yellow: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-500' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'text-red-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'text-purple-500' },
};

export function MetricCard({
  label,
  value,
  format = 'number',
  delta,
  deltaLabel,
  icon: Icon,
  accentColor = 'cyan',
}: MetricCardProps) {
  const colors = ACCENT_COLORS[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-5 bg-[#0d0d1a]',
        colors.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-4 h-4', colors.icon)} />
        </div>
      </div>

      <div className="text-2xl font-bold text-white font-mono mb-1">
        <CountUp target={value} format={format} />
      </div>

      {delta !== undefined && (
        <div className="flex items-center gap-1 text-xs">
          {delta > 0 ? (
            <ArrowUp className="w-3 h-3 text-emerald-400" />
          ) : delta < 0 ? (
            <ArrowDown className="w-3 h-3 text-red-400" />
          ) : (
            <Minus className="w-3 h-3 text-slate-500" />
          )}
          <span
            className={cn(
              delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-slate-500'
            )}
          >
            {Math.abs(delta).toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-slate-500 ml-1">{deltaLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
