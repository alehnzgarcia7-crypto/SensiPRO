'use client';

import type { GyroscopeFingerValues } from '@ares/algorithms';
import type { FingerProfile } from '@ares/algorithms';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';

import { CountUp } from '@/components/effects/count-up';
import { GlowProgressBar } from '@/components/effects/glow-progress-bar';

interface GyroscopeRecommendationProps {
  gyroscope: GyroscopeFingerValues | null;
  fingerProfile: FingerProfile;
}

const GYRO_FIELDS: { key: keyof GyroscopeFingerValues; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'redPoint', label: 'Punto Rojo' },
  { key: 'scope2x', label: 'Mira 2x' },
  { key: 'scope4x', label: 'Mira 4x' },
  { key: 'sniperScope', label: 'AWM' },
];

export function GyroscopeRecommendation({ gyroscope, fingerProfile }: GyroscopeRecommendationProps) {
  const enabled = fingerProfile.gyroscope.enabled;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone size={16} className="text-slate-500" />
        <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm">
          Giroscopio Recomendado
        </h3>
      </div>

      {enabled && gyroscope ? (
        <>
          <div className="space-y-3">
            {GYRO_FIELDS.map(({ key, label }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-ui text-slate-500">{label}</span>
                  <span className="text-lg font-mono font-black text-red-300" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <CountUp end={gyroscope[key]} duration={500} />
                  </span>
                </div>
                <GlowProgressBar value={gyroscope[key]} max={100} delay={i * 0.04} color="red" />
              </motion.div>
            ))}
          </div>

          <div className="mt-4 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10">
            <p className="text-xs text-green-400/80 font-body">
              💡 {fingerProfile.gyroscope.tipEs}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="px-3 py-4 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
            <p className="text-sm text-slate-500 font-body">
              ❌ {fingerProfile.gyroscope.tipEs}
            </p>
          </div>

          <div className="mt-3 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <p className="text-xs text-orange-400/80 font-body">
              💡 Cambia a 3 o 4 dedos para poder usar el giroscopio.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
