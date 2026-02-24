'use client';

import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';

interface GyroValue {
  key: string;
  label: string;
  value: number;
}

interface GyroPanelProps {
  values: GyroValue[];
  isLocked: boolean;
  onUpgrade?: () => void;
}

export function GyroPanel({ values, isLocked, onUpgrade }: GyroPanelProps) {
  return (
    <Card variant="glow" className="p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          🔄 Giroscopio
          {isLocked ? (
            <Lock size={14} className="text-slate-500" />
          ) : (
            <Unlock size={14} className="text-success" />
          )}
        </h3>
        {isLocked && (
          <button
            onClick={onUpgrade}
            className="text-xs font-ui font-semibold text-fire-400 hover:text-fire-300 transition-colors"
          >
            Desbloquear con Premium →
          </button>
        )}
      </div>

      <div className={cn('space-y-3', isLocked && 'blur-sm pointer-events-none select-none')}>
        {values.map((v, i) => (
          <motion.div
            key={v.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">{v.label}</span>
              <span className="text-sm font-display font-bold text-white tabular-nums">{v.value}</span>
            </div>
            <Progress value={v.value} max={100} size="sm" color="ice" />
          </motion.div>
        ))}
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-base/30">
          <button
            onClick={onUpgrade}
            className="glass px-6 py-3 flex items-center gap-2 hover:border-fire-500/30 transition-colors"
          >
            <Lock size={16} className="text-fire-500" />
            <span className="font-ui font-semibold text-white text-sm">Premium</span>
          </button>
        </div>
      )}
    </Card>
  );
}
