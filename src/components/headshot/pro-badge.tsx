'use client';

import { motion } from 'framer-motion';
import type { FingerCount } from '@ares/algorithms';

interface ProBadgeProps {
  fingers: FingerCount;
  style?: string;
}

export function ProBadge({ fingers, style }: ProBadgeProps) {
  // Only show for 4 fingers
  if (fingers !== 4) return null;

  // Optional: boost if aggressive/velocidad style
  const isAggressiveStyle = style?.toLowerCase().includes('agresivo') ||
    style?.toLowerCase().includes('velocidad') ||
    style?.toLowerCase().includes('aggressive');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card overflow-hidden ring-1 ring-amber-500/30"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(217,119,6,0.02))',
        animation: 'proBadgePulse 3s ease-in-out infinite',
      }}
    >
      <div className="px-5 py-4 text-center">
        <p className="text-2xl mb-2">🏆</p>
        <p className="text-sm font-heading font-bold uppercase tracking-[0.12em] text-amber-400">
          Configuración Pro Player
        </p>
        <p className="text-xs text-slate-400 font-body mt-2 leading-relaxed">
          La misma config que usan los competitivos de Free Fire LATAM.
          {isAggressiveStyle && ' Agresivo + 4 dedos = la combinación más letal.'}
        </p>
        <p className="text-xs text-amber-500/60 font-body mt-2">
          Solo el 8% de jugadores usan garra. Tú eres parte de ese 8%.
        </p>
      </div>

      {/* CSS animation for subtle pulse */}
      <style jsx>{`
        @keyframes proBadgePulse {
          0%, 100% { box-shadow: 0 0 15px rgba(245,158,11,0.05); }
          50% { box-shadow: 0 0 25px rgba(245,158,11,0.1); }
        }
      `}</style>
    </motion.div>
  );
}
