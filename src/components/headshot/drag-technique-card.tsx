'use client';

import { motion } from 'framer-motion';

import { DragTechniqueSvg } from './drag-technique-svg';

interface DragTechnique {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  difficulty: number;
  color: string;
  description: string;
  when: string;
  howTo: readonly string[];
  weapons: readonly string[];
  commonMistake: string;
  svgPath: string;
}

interface DragTechniqueCardProps {
  technique: DragTechnique;
  index: number;
}

export function DragTechniqueCard({ technique, index }: DragTechniqueCardProps) {
  const stars = Array.from({ length: 4 }, (_, i) => i < technique.difficulty ? '⭐' : '☆');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-5 transition-all"
      style={{ borderColor: `${technique.color}20` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{technique.emoji}</span>
        <div className="flex-1">
          <h4 className="font-ui font-bold text-white text-base">{technique.name}</h4>
          <p className="text-xs text-slate-500">{technique.subtitle}</p>
        </div>
        <div className="text-xs" title={`Dificultad: ${technique.difficulty}/4`}>
          {stars.join('')}
        </div>
      </div>

      {/* Animated SVG */}
      <DragTechniqueSvg
        svgPath={technique.svgPath}
        color={technique.color}
        name={technique.name}
      />

      {/* Description */}
      <p className="text-sm text-slate-300 font-body mt-3">{technique.description}</p>

      {/* When to use */}
      <div className="mt-3">
        <span className="text-[10px] font-ui font-bold uppercase tracking-wider text-slate-500">CUÁNDO USAR:</span>
        <p className="text-xs text-slate-400 font-body mt-0.5">{technique.when}</p>
      </div>

      {/* Steps */}
      <div className="mt-3">
        <span className="text-[10px] font-ui font-bold uppercase tracking-wider text-slate-500">PASO A PASO:</span>
        <ol className="mt-1 space-y-0.5">
          {technique.howTo.map((step, i) => (
            <li key={i} className="text-xs text-slate-400 font-body flex gap-1.5">
              <span className="font-mono font-bold text-slate-600 shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Common mistake */}
      <div className="mt-3 bg-red-500/5 rounded-lg p-2 border border-red-500/10">
        <span className="text-[10px] font-ui font-bold uppercase tracking-wider text-red-400">ERROR COMÚN:</span>
        <p className="text-xs text-red-300/80 font-body mt-0.5">{technique.commonMistake}</p>
      </div>

      {/* Weapons */}
      <div className="mt-3 flex flex-wrap gap-1">
        {technique.weapons.map((w) => (
          <span key={w} className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-500 border border-white/5">
            {w}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
