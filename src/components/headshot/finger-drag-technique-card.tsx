'use client';

import type { DragTechniqueData } from '@ares/algorithms';
import { motion } from 'framer-motion';

import { cn } from '@/lib/cn';

interface FingerDragTechniqueCardProps {
  technique: DragTechniqueData;
  isPrimary: boolean;
}

const DIFFICULTY_STYLES: Record<1 | 2 | 3, { label: string; bg: string; text: string; border: string }> = {
  1: { label: 'Fácil', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  2: { label: 'Media', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  3: { label: 'Avanzada', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

const RANGE_EMOJI: Record<string, string> = {
  'close': '🔥',
  'close-medium': '🎯',
  'medium-long': '🔭',
};

export function FingerDragTechniqueCard({ technique, isPrimary }: FingerDragTechniqueCardProps) {
  const diffStyle = DIFFICULTY_STYLES[technique.difficulty];
  const pathId = `finger-drag-${technique.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'glass-card overflow-hidden transition-all',
        isPrimary && 'ring-1 ring-red-500/20',
      )}
    >
      {/* Primary badge */}
      {isPrimary && (
        <div className="px-4 py-1.5 bg-gradient-to-r from-red-500/10 to-transparent border-b border-red-500/10">
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-red-400">
            Técnica Principal
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Header: name + difficulty */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="font-ui font-bold text-white text-sm">{technique.nameEs}</h4>
            <p className="text-[11px] text-slate-500 font-body mt-0.5">
              {RANGE_EMOJI[technique.bestRange] ?? '🎯'} {technique.bestRangeEs}
            </p>
          </div>
          <span className={cn(
            'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-ui font-bold border',
            diffStyle.bg, diffStyle.text, diffStyle.border,
          )}>
            {diffStyle.label}
          </span>
        </div>

        {/* Animated SVG */}
        <div className="relative aspect-[16/9] bg-black/30 rounded-lg overflow-hidden border border-white/5 mb-3">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id={`grid-${pathId}`} width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.3" />
              </pattern>
              <linearGradient id={`grad-${pathId}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" fill={`url(#grid-${pathId})`} />

            {/* Head silhouette target */}
            <circle cx="50" cy="22" r="5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <line x1="50" y1="27" x2="50" y2="42" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

            {/* Head level line */}
            <line x1="10" y1="22" x2="90" y2="22" stroke="#ef4444" strokeWidth="0.3" strokeDasharray="2,2" opacity="0.3" />

            {/* Trail path */}
            <path
              d={technique.svgPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeOpacity="0.2"
            />

            {/* Animated drag path */}
            <path
              d={technique.svgPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="200"
              style={{
                animation: 'drawPath 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 4px #ef4444)',
              }}
            />

            {/* Moving dot */}
            <circle r="3" fill="#ef4444" opacity="0.9"
              style={{
                offsetPath: `path('${technique.svgPath}')`,
                animation: 'moveDot 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 6px #ef4444)',
              }}
            />

            {/* HEADSHOT flash */}
            <text
              x="50" y="14"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="5"
              fontFamily="Orbitron, system-ui, sans-serif"
              fontWeight="bold"
              style={{ animation: 'headshotFlash 2s ease-in-out infinite' }}
            >
              HEADSHOT!
            </text>
          </svg>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 font-body mb-3">{technique.descriptionEs}</p>

        {/* Speed */}
        <div className="mb-3">
          <span className="text-[10px] font-ui font-bold uppercase tracking-wider text-slate-600">Velocidad:</span>
          <p className="text-[11px] text-slate-400 font-body mt-0.5">{technique.speedEs}</p>
        </div>

        {/* When to use */}
        <div className="mb-3">
          <span className="text-[10px] font-ui font-bold uppercase tracking-wider text-slate-600">Cuándo usar:</span>
          <p className="text-[11px] text-slate-400 font-body mt-0.5">{technique.whenToUseEs}</p>
        </div>

        {/* Step by step */}
        <div className="mb-3">
          <span className="text-[10px] font-ui font-bold uppercase tracking-wider text-slate-600">Paso a paso:</span>
          <ol className="mt-1 space-y-0.5">
            {technique.howToEs.map((step, i) => (
              <li key={i} className="text-[11px] text-slate-400 font-body flex gap-1.5">
                <span className="font-mono font-bold text-slate-600 shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Best weapons */}
        <div className="flex flex-wrap gap-1">
          {technique.bestWeaponsEs.map((w) => (
            <span key={w} className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-500 border border-white/5">
              {w}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
