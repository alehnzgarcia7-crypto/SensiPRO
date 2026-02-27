'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — CalibrationSelector — Cards con perspectiva 3D
// Tilt on hover, animated gradient border en seleccionada,
// deselected cards dimmed, spring animations
// ═══════════════════════════════════════════════════════════════

import type { CalibrationLevel } from '@prisma/client';
import { motion } from 'framer-motion';
import { Crosshair, Scale, Zap } from 'lucide-react';
import { useCallback, useRef } from 'react';

import { cn } from '@/lib/cn';

interface CalibrationSelectorProps {
  value: CalibrationLevel;
  onChange: (calibration: CalibrationLevel) => void;
}

const CALIBRATION_COLORS: Record<CalibrationLevel, { gradient: string; accent: string }> = {
  BAJA: { gradient: 'from-ice-500/15 to-ice-600/5', accent: 'text-ice-400' },
  MEDIA: { gradient: 'from-purple-500/15 to-purple-600/5', accent: 'text-purple-400' },
  ALTA: { gradient: 'from-fire-500/15 to-fire-600/5', accent: 'text-fire-400' },
};

interface CalibrationOption {
  key: CalibrationLevel;
  label: string;
  icon: typeof Crosshair;
  description: string;
}

const OPTIONS: CalibrationOption[] = [
  { key: 'BAJA', label: 'Precision', icon: Crosshair, description: 'Control fino' },
  { key: 'MEDIA', label: 'Balanceado', icon: Scale, description: 'Equilibrio' },
  { key: 'ALTA', label: 'Velocidad', icon: Zap, description: 'Rush rapido' },
];

function TiltCard({
  children,
  isActive,
  onClick,
  className,
  style,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    cardRef.current.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isActive ? 'scale(1.02)' : 'scale(1)'}`;
  }, [isActive]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)`;
  }, []);

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 200ms ease-out', ...style }}
    >
      {children}
    </button>
  );
}

export function CalibrationSelector({ value, onChange }: CalibrationSelectorProps) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-heading uppercase tracking-[0.15em] text-white/60">
        Calibracion
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = value === option.key;
          const colors = CALIBRATION_COLORS[option.key];

          return (
            <TiltCard
              key={option.key}
              isActive={isActive}
              onClick={() => onChange(option.key)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border min-h-[44px]',
                'transition-all duration-300',
                isActive
                  ? `border-transparent bg-gradient-to-b ${colors.gradient} shadow-lg`
                  : 'border-white/[0.05] bg-white/[0.02] opacity-60 grayscale-[0.3] hover:opacity-80 hover:grayscale-0 hover:border-white/[0.08]',
              )}
              style={isActive ? {
                boxShadow: '0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
              } : undefined}
            >
              {/* Active animated border indicator */}
              {isActive && (
                <motion.div
                  layoutId="calibration-active-3d"
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="absolute inset-0 animated-border-gradient opacity-40" style={{ animationDuration: '4s' }} />
                  <div className="absolute inset-[1px] rounded-[15px] bg-[#0a0f1e]/90" />
                </motion.div>
              )}

              <motion.div
                animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon
                  size={20}
                  className={cn(
                    'relative z-10 transition-colors duration-200',
                    isActive ? colors.accent : 'text-slate-500',
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  'relative z-10 text-xs font-ui font-bold uppercase tracking-wider transition-colors',
                  isActive ? 'text-white' : 'text-slate-500',
                )}
              >
                {option.label}
              </span>
              <span className="relative z-10 text-[10px] text-slate-600 hidden md:block">
                {option.description}
              </span>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
