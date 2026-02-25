'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — GlowProgressBar — Barra de sensibilidad épica con glow
// 3D reflection, shimmer, gradiente dinámico, spring animation
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';

interface GlowProgressBarProps {
  value: number;
  max?: number;
  delay?: number;
  className?: string;
}

function getBarGradient(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.9) return 'linear-gradient(90deg, #06b6d4, #e0f2fe)';   // cyan → blanco
  if (ratio >= 0.7) return 'linear-gradient(90deg, #06b6d4, #67e8f9)';   // cyan → cyan claro
  if (ratio >= 0.4) return 'linear-gradient(90deg, #ff6a00, #eab308)';   // naranja → amarillo
  return 'linear-gradient(90deg, #c2410c, #ff6a00)';                      // naranja oscuro → naranja
}

function getGlowColor(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.9) return 'rgba(6, 182, 212, 0.5)';
  if (ratio >= 0.7) return 'rgba(6, 182, 212, 0.4)';
  if (ratio >= 0.4) return 'rgba(255, 106, 0, 0.4)';
  return 'rgba(255, 106, 0, 0.3)';
}

export function GlowProgressBar({ value, max = 200, delay = 0, className }: GlowProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const gradient = getBarGradient(value, max);
  const glowColor = getGlowColor(value, max);

  return (
    <div className={className}>
      {/* Track principal */}
      <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
        {/* Fill con glow */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay,
          }}
          style={{
            background: gradient,
            boxShadow: `0 0 8px ${glowColor}, 0 0 2px ${glowColor}`,
          }}
        >
          {/* Shimmer — luz que recorre la barra */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="glow-bar-shimmer" />
          </div>
        </motion.div>
      </div>

      {/* Reflejo 3D debajo de la barra */}
      <div className="relative h-1 mt-px overflow-hidden rounded-full opacity-[0.08]" style={{ transform: 'scaleY(-1)' }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full blur-[2px]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay,
          }}
          style={{ background: gradient }}
        />
      </div>
    </div>
  );
}
