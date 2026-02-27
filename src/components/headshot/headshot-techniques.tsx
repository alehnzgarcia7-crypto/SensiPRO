'use client';

import {
  getFingerTechniques,
  getTechniquesForFingers,
  getDragTechniqueData,
  type FingerCount,
} from '@ares/algorithms';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/cn';

import { FingerDragTechniqueCard } from './finger-drag-technique-card';

interface HeadshotTechniquesProps {
  fingers: FingerCount;
}

export function HeadshotTechniques({ fingers }: HeadshotTechniquesProps) {
  const fingerSet = getFingerTechniques(fingers);
  const techniques = getTechniquesForFingers(fingers);
  const primaryTechnique = getDragTechniqueData(fingerSet.primaryTechnique);

  return (
    <div>
      {/* Section header */}
      <h3 className="font-heading font-bold text-white text-xl md:text-2xl mb-1">
        TÉCNICAS DE HEADSHOT PARA {fingers} DEDOS
      </h3>
      <p className="text-sm text-slate-500 font-body mb-4">
        Personalizadas para tu estilo de agarre
      </p>

      {/* Summary */}
      <AnimatePresence mode="wait">
        <motion.div
          key={fingers}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-4 mb-5"
        >
          <p className="text-sm text-slate-300 font-body">{fingerSet.summaryEs}</p>
        </motion.div>
      </AnimatePresence>

      {/* Technique cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={fingers}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5"
        >
          {techniques.map((tech) => (
            <FingerDragTechniqueCard
              key={tech.id}
              technique={tech}
              isPrimary={tech.id === primaryTechnique.id}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Advanced technique panel */}
      {fingerSet.advancedTechniqueEs && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className={cn(
            'glass-card overflow-hidden mb-5',
            fingers === 4
              ? 'ring-1 ring-amber-500/30'
              : 'ring-1 ring-green-500/20',
          )}
        >
          {/* Gold/green header */}
          <div className={cn(
            'px-4 py-2 border-b',
            fingers === 4
              ? 'bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/15'
              : 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/15',
          )}>
            <div className="flex items-center gap-2">
              <span className="text-base">{fingers === 4 ? '👑' : '🎯'}</span>
              <span className={cn(
                'text-xs font-heading font-bold uppercase tracking-[0.12em]',
                fingers === 4 ? 'text-amber-400' : 'text-green-400',
              )}>
                Técnica Avanzada — {fingerSet.advancedTechnique}
              </span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm text-slate-300 font-body">
              {fingerSet.advancedTechniqueEs}
            </p>

            {/* Combo display */}
            {fingerSet.comboEs && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] font-ui font-bold uppercase tracking-wider text-slate-600">Combo:</span>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  {fingerSet.comboEs}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Limitation notice */}
      {fingerSet.limitationEs && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-card p-4 border-orange-500/10"
        >
          <div className="flex items-start gap-2">
            <span className="text-sm shrink-0">⚠️</span>
            <div>
              <p className="text-xs text-orange-400/80 font-body">{fingerSet.limitationEs}</p>
              {fingers < 4 && (
                <p className="text-[11px] text-slate-600 font-body mt-1.5">
                  Tip: Cambia a {fingers + 1} dedos para poder usar{' '}
                  {fingers === 2 ? 'Peek & Fire' : 'Jump-Crouch-Fire (Two9)'}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
