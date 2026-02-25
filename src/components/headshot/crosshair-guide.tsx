'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CrosshairGuideProps {
  tips: readonly string[];
}

type Stance = 'standing' | 'crouching' | 'gloowall';

const STANCES: { key: Stance; label: string }[] = [
  { key: 'standing', label: 'De Pie' },
  { key: 'crouching', label: 'Agachado' },
  { key: 'gloowall', label: 'Detrás de Gloo Wall' },
];

// SVG Y positions para la cabeza por stance
const HEAD_Y: Record<Stance, number> = {
  standing: 30,
  crouching: 50,
  gloowall: 35,
};

export function CrosshairGuide({ tips }: CrosshairGuideProps) {
  const [stance, setStance] = useState<Stance>('standing');
  const headY = HEAD_Y[stance];

  return (
    <section>
      <h3 className="font-heading font-bold text-white text-xl md:text-2xl mb-5">
        POSICIÓN DEL CROSSHAIR
      </h3>

      <div className="glass-card p-6">
        {/* Regla de oro */}
        <div className="text-center mb-6">
          <p className="text-2xl font-heading font-black headshot-text-gradient">
            SIEMPRE a nivel de CABEZA
          </p>
          <p className="text-lg font-heading font-bold text-slate-600 mt-1">
            NUNCA al cuerpo
          </p>
        </div>

        {/* Stance tabs */}
        <div className="flex justify-center gap-2 mb-4">
          {STANCES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStance(s.key)}
              className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-ui transition-all border ${
                stance === s.key
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-white/[0.03] border-white/10 text-slate-500'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* SVG visual */}
        <div className="flex justify-center mb-6">
          <svg width="260" height="140" viewBox="0 0 260 140" className="max-w-full">
            {/* Background */}
            <rect width="260" height="140" fill="rgba(5,8,16,0.6)" rx="8" />

            {/* Ground */}
            <line x1="0" y1="120" x2="260" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            {/* Gloo wall */}
            {stance === 'gloowall' && (
              <rect x="100" y="45" width="60" height="75" rx="3" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth="0.5" />
            )}

            {/* Character silhouette */}
            {stance === 'standing' && (
              <>
                <circle cx="130" cy="30" r="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                <line x1="130" y1="38" x2="130" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                <line x1="130" y1="50" x2="115" y2="65" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="130" y1="50" x2="145" y2="65" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="130" y1="80" x2="118" y2="118" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="130" y1="80" x2="142" y2="118" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </>
            )}
            {stance === 'crouching' && (
              <>
                <circle cx="130" cy="50" r="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                <line x1="130" y1="58" x2="130" y2="85" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                <line x1="130" y1="65" x2="115" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="130" y1="65" x2="145" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="130" y1="85" x2="115" y2="118" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="130" y1="85" x2="145" y2="118" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </>
            )}
            {stance === 'gloowall' && (
              <circle cx="130" cy="35" r="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            )}

            {/* Head level line — animated pulse */}
            <motion.line
              x1="20" y1={headY} x2="240" y2={headY}
              stroke="#ef4444"
              strokeWidth="1"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <text x="245" y={headY + 3} fill="#ef4444" fontSize="6" fontFamily="Orbitron, sans-serif" fontWeight="bold" textAnchor="start">
              HEAD
            </text>

            {/* Crosshair */}
            <g transform={`translate(60, ${headY})`}>
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#ef4444" strokeWidth="1" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#ef4444" strokeWidth="1" />
              <circle cx="0" cy="0" r="3" fill="none" stroke="#ef4444" strokeWidth="0.5" />
            </g>
          </svg>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-2 items-start"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
              <p className="text-xs text-slate-400 font-body">{tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
