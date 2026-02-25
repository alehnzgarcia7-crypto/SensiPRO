'use client';

import { motion } from 'framer-motion';
import { CountUp } from '@/components/effects/count-up';
import type { FireButtonResult } from '@ares/algorithms';

interface FireButtonDisplayProps {
  fireButton: FireButtonResult;
  screenSize: number;
}

export function FireButtonDisplay({ fireButton, screenSize }: FireButtonDisplayProps) {
  // SVG proportional fire button (landscape phone)
  const btnRadius = 8 + (fireButton.percentage / 100) * 12; // escala 8-20

  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-5">
        Tamaño de Botón de Disparo
      </h3>

      {/* SVG: celular landscape con fire button */}
      <div className="flex justify-center mb-6">
        <svg width="280" height="160" viewBox="0 0 280 160" className="max-w-full">
          {/* Phone body */}
          <rect x="10" y="10" width="260" height="140" rx="14" ry="14"
            fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          {/* Screen */}
          <rect x="20" y="20" width="240" height="120" rx="6" ry="6"
            fill="rgba(5,8,16,0.8)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

          {/* Joystick (left side) */}
          <circle cx="70" cy="100" r="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <circle cx="70" cy="100" r="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

          {/* Fire button (right side) — pulsing */}
          <motion.circle
            cx="210"
            cy="95"
            r={btnRadius}
            fill="rgba(239,68,68,0.3)"
            stroke="#ef4444"
            strokeWidth="1.5"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.4))' }}
          />
          <text x="210" y="99" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="Orbitron, sans-serif" fontWeight="bold">
            {fireButton.percentage}%
          </text>

          {/* Guide lines */}
          <line x1="190" y1="60" x2="190" y2="130" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3,3" />
          <line x1="160" y1="80" x2="240" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="3,3" />

          {/* Scope button (top right) */}
          <circle cx="230" cy="45" r="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <text x="230" y="48" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="sans-serif">
            Scope
          </text>
        </svg>
      </div>

      {/* Número grande */}
      <div className="text-center mb-4">
        <span className="text-6xl font-heading font-black headshot-text-gradient" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <CountUp end={fireButton.percentage} duration={800} />
          <span className="text-2xl">%</span>
        </span>
        <p className="text-sm text-slate-400 font-body mt-2">
          Tamaño recomendado para tu pantalla de {screenSize}&quot; con {fireButton.fingers} dedos
        </p>
      </div>

      {/* Position tip */}
      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
        <p className="text-xs font-ui text-slate-500 uppercase tracking-wider mb-1">Posición recomendada</p>
        <p className="text-sm text-slate-300 font-body">{fireButton.positionTip}</p>
      </div>
    </div>
  );
}
