'use client';

import { motion } from 'framer-motion';
import { Crosshair, Target, Scan, Eye } from 'lucide-react';

import type { SensitivityOutput, GyroscopeOutput } from '@ares/algorithms';
import { CountUp } from '@/components/effects/count-up';
import { GlowProgressBar } from '@/components/effects/glow-progress-bar';
import { AnimatedBorder } from '@/components/effects/animated-border';
import { HeadshotCopyButton } from './headshot-copy-button';

interface HeadshotSensitivityPanelProps {
  sensitivity: SensitivityOutput;
  gyroscope: GyroscopeOutput;
  normalSensitivity: SensitivityOutput;
  normalGyroscope: GyroscopeOutput;
}

const SENS_FIELDS: { key: keyof SensitivityOutput; label: string; icon: typeof Crosshair }[] = [
  { key: 'general', label: 'General', icon: Crosshair },
  { key: 'redPoint', label: 'Punto Rojo', icon: Target },
  { key: 'scope2x', label: 'Mira 2x', icon: Scan },
  { key: 'scope4x', label: 'Mira 4x', icon: Scan },
  { key: 'sniperScope', label: 'AWM', icon: Crosshair },
  { key: 'freeView', label: 'Vista Libre', icon: Eye },
];

const GYRO_FIELDS: { key: keyof GyroscopeOutput; sensKey: keyof GyroscopeOutput; label: string; icon: typeof Crosshair }[] = [
  { key: 'gyroGeneral', sensKey: 'gyroGeneral', label: 'Gyro General', icon: Crosshair },
  { key: 'gyroRedPoint', sensKey: 'gyroRedPoint', label: 'Gyro Punto Rojo', icon: Target },
  { key: 'gyroScope2x', sensKey: 'gyroScope2x', label: 'Gyro 2x', icon: Scan },
  { key: 'gyroScope4x', sensKey: 'gyroScope4x', label: 'Gyro 4x', icon: Scan },
  { key: 'gyroSniper', sensKey: 'gyroSniper', label: 'Gyro AWM', icon: Crosshair },
  { key: 'gyroFreeView', sensKey: 'gyroFreeView', label: 'Gyro Vista Libre', icon: Eye },
];

function DiffBadge({ headshot, normal }: { headshot: number; normal: number }) {
  const diff = headshot - normal;
  if (diff === 0) return null;
  const isUp = diff > 0;
  return (
    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isUp ? 'bg-green-500/15 text-green-400' : 'bg-orange-500/15 text-orange-400'}`}>
      {isUp ? '+' : ''}{diff}
    </span>
  );
}

export function HeadshotSensitivityPanel({
  sensitivity,
  gyroscope,
  normalSensitivity,
  normalGyroscope,
}: HeadshotSensitivityPanelProps) {
  return (
    <div className="space-y-6">
      {/* Sensibilidad principal */}
      <AnimatedBorder active>
        <div className="animated-border-headshot">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm">
                Sensibilidad Headshot
              </h3>
              <span className="text-[10px] font-ui font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                OPTIMIZADO PARA TIRO A LA CABEZA
              </span>
            </div>

            <div className="space-y-4">
              {SENS_FIELDS.map(({ key, label, icon: Icon }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-slate-600 group-hover:text-red-400 transition-colors" />
                      <span className="text-sm font-ui font-medium text-slate-400">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DiffBadge headshot={sensitivity[key]} normal={normalSensitivity[key]} />
                      <span className="text-2xl font-mono font-black headshot-text-gradient" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <CountUp end={sensitivity[key]} duration={600} />
                      </span>
                    </div>
                  </div>
                  <GlowProgressBar value={sensitivity[key]} max={200} delay={i * 0.06} color="red" />
                </motion.div>
              ))}
            </div>

            <div className="divider-gradient my-6" />

            {/* Giroscopio */}
            <h4 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-xs mb-4">
              Giroscopio Headshot
            </h4>
            <div className="space-y-4">
              {GYRO_FIELDS.map(({ key, label, icon: Icon }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-slate-600 group-hover:text-red-400 transition-colors" />
                      <span className="text-sm font-ui font-medium text-slate-400">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DiffBadge headshot={gyroscope[key]} normal={normalGyroscope[key]} />
                      <span className="text-2xl font-mono font-black text-red-300" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <CountUp end={gyroscope[key]} duration={600} />
                      </span>
                    </div>
                  </div>
                  <GlowProgressBar value={gyroscope[key]} max={100} delay={0.5 + i * 0.06} color="red" />
                </motion.div>
              ))}
            </div>

            <div className="mt-6">
              <HeadshotCopyButton sensitivity={sensitivity} gyroscope={gyroscope} />
            </div>
          </div>
        </div>
      </AnimatedBorder>
    </div>
  );
}
