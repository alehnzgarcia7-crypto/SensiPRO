'use client';

import type { SensitivityOutput, GyroscopeOutput } from '@ares/algorithms';
import { motion } from 'framer-motion';
import { Crosshair, Target, Scan, Eye } from 'lucide-react';

import { AnimatedBorder } from '@/components/effects/animated-border';
import { CountUp } from '@/components/effects/count-up';
import { GlowProgressBar } from '@/components/effects/glow-progress-bar';

interface HeadshotSensitivityPanelProps {
  sensitivity: SensitivityOutput;
  gyroscope: GyroscopeOutput;
  normalSensitivity: SensitivityOutput;
  normalGyroscope: GyroscopeOutput;
  showGyroscope?: boolean;
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

export function HeadshotSensitivityPanel({
  sensitivity,
  gyroscope,
  showGyroscope = true,
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
                    <span className="text-2xl font-mono font-black headshot-text-gradient" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      <CountUp end={sensitivity[key]} duration={600} />
                    </span>
                  </div>
                  <GlowProgressBar value={sensitivity[key]} max={200} delay={i * 0.06} color="red" />
                </motion.div>
              ))}
            </div>

            {showGyroscope && (
              <>
                <div className="divider-gradient my-6" />
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
                        <span className="text-2xl font-mono font-black text-red-300" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          <CountUp end={gyroscope[key]} duration={600} />
                        </span>
                      </div>
                      <GlowProgressBar value={gyroscope[key]} max={100} delay={0.5 + i * 0.06} color="red" />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </AnimatedBorder>
    </div>
  );
}
