'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { getWeaponRecommendation, type FingerCount } from '@ares/algorithms';

interface WeaponTierDisplayProps {
  fingers: FingerCount;
}

const TIER_STYLES: Record<'S' | 'A' | 'B', { bg: string; border: string; text: string; badge: string; icon: string }> = {
  S: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    icon: '⭐',
  },
  A: {
    bg: 'bg-slate-400/5',
    border: 'border-slate-400/15',
    text: 'text-slate-300',
    badge: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
    icon: '🔹',
  },
  B: {
    bg: 'bg-orange-800/5',
    border: 'border-orange-800/15',
    text: 'text-orange-400/70',
    badge: 'bg-orange-800/10 text-orange-400/70 border-orange-800/20',
    icon: '🔸',
  },
};

export function WeaponTierDisplay({ fingers }: WeaponTierDisplayProps) {
  const recommendation = getWeaponRecommendation(fingers);

  return (
    <div>
      {/* Section header */}
      <h3 className="font-heading font-bold text-white text-xl md:text-2xl mb-1">
        ARMAS RECOMENDADAS PARA {fingers} DEDOS
      </h3>
      <p className="text-sm text-slate-500 font-body mb-5">
        Tier list personalizada para tu estilo de agarre
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={fingers}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          {recommendation.tiers.map((tier) => {
            const style = TIER_STYLES[tier.tier];

            return (
              <div
                key={tier.tier}
                className={cn('glass-card overflow-hidden', style.border)}
              >
                {/* Tier header */}
                <div className={cn('px-4 py-2 border-b flex items-center gap-2', style.bg, style.border)}>
                  <span className="text-sm">{style.icon}</span>
                  <span className={cn('text-xs font-heading font-bold uppercase tracking-[0.12em]', style.text)}>
                    Tier {tier.tier}
                  </span>
                  <span className={cn(
                    'ml-auto px-2 py-0.5 rounded-full text-[9px] font-ui font-bold border',
                    style.badge,
                  )}>
                    {tier.weapons.length} arma{tier.weapons.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Weapons */}
                <div className="p-3 space-y-2">
                  {tier.weapons.map((weapon) => (
                    <div key={weapon.name} className="flex items-start gap-2">
                      <span className={cn(
                        'text-sm font-ui font-bold shrink-0 min-w-[70px]',
                        tier.tier === 'S' ? 'text-white' : tier.tier === 'A' ? 'text-slate-300' : 'text-slate-500',
                      )}>
                        {weapon.name}
                      </span>
                      <p className="text-[11px] text-slate-500 font-body leading-snug">
                        {weapon.reasonEs}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="glass-card p-4">
            <p className="text-xs text-slate-400 font-body">{recommendation.summaryEs}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
