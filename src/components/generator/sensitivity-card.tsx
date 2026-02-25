'use client';

import { motion } from 'framer-motion';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';

interface SensitivityCardProps {
  label: string;
  value: number;
  icon?: string;
  delay?: number;
  color?: 'fire' | 'ice' | 'gradient';
}

export function SensitivityCard({ label, value, icon, delay = 0, color = 'gradient' }: SensitivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass p-4 hover:border-fire-500/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="text-xs font-ui font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
          className="text-2xl font-display font-black text-white tabular-nums"
        >
          {value}
        </motion.span>
      </div>
      <Progress value={value} max={200} size="sm" color={color} />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-600">Bajo</span>
        <span className="text-[10px] text-slate-600">Alto</span>
      </div>
    </motion.div>
  );
}
