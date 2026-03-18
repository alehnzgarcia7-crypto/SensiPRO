'use client';

import type { FireButtonRecommendation as FireBtnRec } from '@ares/algorithms';
import { FINGER_PROFILES, type FingerCount } from '@ares/algorithms';
import { motion } from 'framer-motion';

import { CountUp } from '@/components/effects/count-up';
import { cn } from '@/lib/cn';

interface FireButtonRecommendationProps {
  fireButton: FireBtnRec;
  fingers: FingerCount;
  screenSize: number;
}

export function FireButtonRecommendation({ fireButton, fingers, screenSize }: FireButtonRecommendationProps) {
  // Range for the visual bar: min/max from current profile
  const profile = FINGER_PROFILES[fingers];
  const rangeMin = profile.fireButton.sizeRange.min;
  const rangeMax = profile.fireButton.sizeRange.max;
  const rangeSpan = rangeMax - rangeMin;
  const positionPercent = rangeSpan > 0 ? ((fireButton.size - rangeMin) / rangeSpan) * 100 : 50;

  // Comparison values for other finger counts
  const others = ([2, 3, 4] as FingerCount[]).filter((f) => f !== fingers);

  // Get screen category
  let screenCat: 'small' | 'medium' | 'large' | 'xlarge';
  if (screenSize < 6.0) screenCat = 'small';
  else if (screenSize <= 6.5) screenCat = 'medium';
  else if (screenSize <= 6.8) screenCat = 'large';
  else screenCat = 'xlarge';

  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-5">
        🔘 Botón de Disparo Recomendado
      </h3>

      {/* Big number */}
      <div className="text-center mb-5">
        <span className="text-5xl font-heading font-black headshot-text-gradient" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <CountUp end={fireButton.size} duration={600} />
          <span className="text-xl">%</span>
        </span>
        <p className="text-xs text-slate-500 font-body mt-1">
          Para pantalla de {screenSize}&quot; con {fingers} dedos
        </p>
      </div>

      {/* Range bar */}
      <div className="mb-5">
        <div className="relative h-3 rounded-full bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          {/* Fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgba(239,68,68,0.3), rgba(249,115,22,0.4))',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${positionPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          {/* Indicator dot */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border border-white/30"
            style={{ filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.5))' }}
            initial={{ left: 0 }}
            animate={{ left: `calc(${positionPercent}% - 6px)` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-mono text-slate-600">{rangeMin}%</span>
          <span className="text-[10px] font-mono text-slate-600">{rangeMax}%</span>
        </div>
      </div>

      {/* Comparison */}
      <div className="flex gap-2 mb-5">
        {others.map((f) => {
          const otherProfile = FINGER_PROFILES[f];
          const otherSize = otherProfile.fireButton.sizeByScreen[screenCat];
          return (
            <div key={f} className="flex-1 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
              <p className="text-[10px] text-slate-600 font-body">{f} dedos</p>
              <p className={cn(
                'text-sm font-mono font-bold',
                otherSize > fireButton.size ? 'text-green-400/70' : otherSize < fireButton.size ? 'text-orange-400/70' : 'text-slate-400',
              )}>
                {otherSize}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Details — combined in 1 card */}
      <div className="px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-xs shrink-0">📍</span>
          <p className="text-xs text-slate-300 font-body"><span className="text-slate-500">Posición:</span> {fireButton.positionEs}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs shrink-0">👆</span>
          <p className="text-xs text-slate-300 font-body"><span className="text-slate-500">Drag:</span> {fireButton.dragTipEs}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xs shrink-0">🎨</span>
          <p className="text-xs text-slate-300 font-body"><span className="text-slate-500">Transparencia:</span> {fireButton.transparency}%</p>
        </div>
      </div>
    </div>
  );
}
