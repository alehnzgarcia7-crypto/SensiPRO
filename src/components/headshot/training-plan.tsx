'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

import { GlowProgressBar } from '@/components/effects/glow-progress-bar';

import { TrainingDrill } from './training-drill';

interface DrillData {
  id: string;
  name: string;
  duration: number;
  weapon: string;
  reps: number;
  objective: string;
  description: string;
  emoji: string;
}

interface TrainingPlanProps {
  drills: readonly DrillData[];
}

export function TrainingPlan({ drills }: TrainingPlanProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const allDone = completed.size === drills.length;

  const remainingTime = useMemo(() => {
    let total = 0;
    for (const drill of drills) {
      if (!completed.has(drill.id)) total += drill.duration;
    }
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [drills, completed]);

  return (
    <section>
      <h3 className="font-heading font-bold text-white text-xl md:text-2xl mb-1">
        PLAN DE ENTRENAMIENTO DIARIO
      </h3>
      <p className="text-sm text-slate-500 font-body mb-5">~15 minutos antes de jugar ranked</p>

      <div className="glass-card p-5 space-y-3">
        {drills.map((drill) => (
          <TrainingDrill
            key={drill.id}
            drill={drill}
            onComplete={() => setCompleted((prev) => new Set(prev).add(drill.id))}
          />
        ))}

        {/* Progress bar total */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-ui text-slate-400">
              {completed.size}/{drills.length} drills completados
            </span>
            <span className="text-xs font-mono text-slate-500">{remainingTime} restantes</span>
          </div>
          <GlowProgressBar value={completed.size} max={drills.length} color="green" />
        </div>

        {/* Completion celebration */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            {/* Mini confetti */}
            <div className="relative h-16 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    left: `${15 + i * 10}%`,
                    top: '0',
                    background: ['#ef4444', '#f97316', '#22c55e', '#06b6d4', '#a855f7', '#eab308', '#ef4444', '#06b6d4'][i],
                    animation: `confettiDrop ${0.8 + i * 0.1}s ease-out ${i * 0.05}s forwards`,
                  }}
                />
              ))}
            </div>
            <p className="text-lg font-heading font-bold text-green-400">
              ENTRENAMIENTO COMPLETO!
            </p>
            <p className="text-xs text-slate-500 font-body mt-1">
              Estás listo para dominar ranked
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
