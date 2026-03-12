'use client';

import { motion } from 'framer-motion';
import { Monitor, Cpu, MemoryStick } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Progress } from '@/components/ui/progress';

interface DeviceSpecsCardProps {
  brand: string;
  model: string;
  tier: string;
  screenHz: number;
  ramGb: number;
  performanceScore: number;
}

function getScreenLabel(hz: number): string {
  if (hz >= 120) return 'Ultra fluida';
  if (hz >= 90) return 'Fluida';
  return 'Estandar';
}

function getRamLabel(gb: number): string {
  if (gb >= 8) return 'Excelente';
  if (gb >= 4) return 'Suficiente';
  return 'Limitada';
}

function getTierLabel(tier: string): string {
  if (tier === 'GAMING') return 'Elite';
  if (tier === 'ULTRA' || tier === 'HIGH') return 'Muy bueno';
  if (tier === 'MID') return 'Bueno';
  return 'Basico';
}

export function DeviceSpecsCard({ brand, model, tier, screenHz, ramGb, performanceScore }: DeviceSpecsCardProps) {
  const specs: { icon: LucideIcon; label: string; value: string; subtext: string }[] = [
    { icon: Monitor, label: 'Pantalla', value: `${screenHz}Hz`, subtext: getScreenLabel(screenHz) },
    { icon: MemoryStick, label: 'RAM', value: `${ramGb}GB`, subtext: getRamLabel(ramGb) },
    { icon: Cpu, label: 'Rendimiento', value: getTierLabel(tier), subtext: '' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-6"
    >
      <div className="mb-4">
        <p className="text-xs text-slate-500 font-ui">{brand}</p>
        <p className="font-display font-bold text-white">{model}</p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Performance Score</span>
          <span className="text-sm font-display font-bold text-gradient-fire-ice">{performanceScore}/100</span>
        </div>
        <Progress value={performanceScore} max={100} size="md" color="gradient" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div key={spec.label} className="text-center p-2 rounded-lg bg-white/[0.02]">
              <Icon size={16} className="mx-auto text-slate-500 mb-1" />
              <p className="text-xs font-display font-bold text-white">{spec.value}</p>
              <p className="text-[10px] text-slate-600">{spec.subtext}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
