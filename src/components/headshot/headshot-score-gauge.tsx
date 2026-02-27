'use client';

import { motion } from 'framer-motion';
import { CountUp } from '@/components/effects/count-up';

interface HeadshotScoreGaugeProps {
  score: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 75) return '#06b6d4';
  if (score >= 50) return '#f97316';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Score 95+ — Tu config está lista para ranked.';
  if (score >= 75) return 'Buen setup para headshots. Practica el drag y vas a notar la diferencia.';
  if (score >= 50) return 'Setup decente. Enfócate en las técnicas de drag para sacarle más provecho.';
  return 'Tu cel tiene limitaciones, pero con buena técnica se compensa.';
}

export function HeadshotScoreGauge({ score }: HeadshotScoreGaugeProps) {
  const color = getScoreColor(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-6 md:p-8 text-center">
      <div className="relative inline-block">
        <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
          {/* Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
          />
          {/* Fill */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-heading font-black"
            style={{ color, filter: `drop-shadow(0 0 10px ${color}40)` }}
          >
            <CountUp end={score} duration={1000} />
          </span>
          <span className="text-xs font-ui uppercase tracking-[0.2em] text-slate-500 mt-1">
            HEADSHOT SCORE
          </span>
        </div>
      </div>
      <p className="text-sm font-body text-slate-400 mt-4 max-w-sm mx-auto">
        {getScoreLabel(score)}
      </p>
    </div>
  );
}
