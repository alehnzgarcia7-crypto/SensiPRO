'use client';

import { FINGER_PROFILES, type FingerCount } from '@ares/algorithms';
import { motion } from 'framer-motion';

import { cn } from '@/lib/cn';

interface FingerSelectorProps {
  value: FingerCount;
  onChange: (v: FingerCount) => void;
}

const LEVEL_COLORS: Record<'casual' | 'competitive' | 'pro', { bg: string; text: string; border: string }> = {
  casual: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
  competitive: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  pro: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

const FINGER_OPTIONS: FingerCount[] = [2, 3, 4];

export function FingerSelector({ value, onChange }: FingerSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-heading uppercase tracking-[0.15em] text-slate-500 mb-3">
        🎯 ¿Cuántos dedos usas para jugar?
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {FINGER_OPTIONS.map((fingers) => {
          const profile = FINGER_PROFILES[fingers];
          const active = value === fingers;
          const levelStyle = LEVEL_COLORS[profile.competitiveLevel];

          return (
            <motion.button
              key={fingers}
              onClick={() => onChange(fingers)}
              whileTap={{ scale: 0.97 }}
              animate={active ? { scale: 1.03 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'relative min-h-[44px] p-4 rounded-xl text-left transition-all duration-300 border',
                active
                  ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'bg-white/[0.03] border-white/[0.06] opacity-60 hover:opacity-80 hover:border-white/15',
              )}
              style={active ? {
                backdropFilter: 'blur(20px) saturate(1.5)',
              } : undefined}
            >
              {/* Icon */}
              <div className="text-3xl mb-2">{profile.icon}</div>

              {/* Name */}
              <p className={cn(
                'text-sm font-heading font-bold uppercase tracking-wider',
                active ? 'text-white' : 'text-slate-400',
              )}>
                {profile.nameEs}
              </p>

              {/* Level badge */}
              <span className={cn(
                'inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider border',
                levelStyle.bg, levelStyle.text, levelStyle.border,
              )}>
                {profile.competitiveLabelEs}
              </span>

              {/* Capabilities */}
              <p className={cn(
                'text-[11px] font-body mt-2',
                active ? 'text-slate-400' : 'text-slate-600',
              )}>
                {profile.capabilities.simultaneousActions} acciones simultáneas
              </p>
              <p className={cn(
                'text-[11px] font-body',
                active ? 'text-slate-500' : 'text-slate-600',
              )}>
                {profile.capabilities.optimalRangeEs}
              </p>

              {/* Selected indicator glow */}
              {active && (
                <motion.div
                  layoutId="finger-selector-glow"
                  className="absolute inset-0 rounded-xl border border-red-500/30 pointer-events-none"
                  style={{ boxShadow: '0 0 15px rgba(239,68,68,0.1), inset 0 0 15px rgba(239,68,68,0.05)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
