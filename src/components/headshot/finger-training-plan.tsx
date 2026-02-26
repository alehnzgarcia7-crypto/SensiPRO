'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { getTrainingPlan, type FingerCount, type TrainingExercise } from '@ares/algorithms';
import { GlowProgressBar } from '@/components/effects/glow-progress-bar';

interface FingerTrainingPlanProps {
  fingers: FingerCount;
}

type TimerState = 'idle' | 'running' | 'paused' | 'done';

// --- Exercise row with timer + rep counter ---

function ExerciseRow({ exercise, onDone }: { exercise: TrainingExercise; onDone: () => void }) {
  const [reps, setReps] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const pausedElapsedRef = useRef(0);

  const remaining = Math.max(0, exercise.timerSeconds - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;
    setTimerState('running');
    intervalRef.current = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (newElapsed >= exercise.timerSeconds) {
        setElapsed(exercise.timerSeconds);
        clearTimer();
        setTimerState('done');
        onDone();
      } else {
        setElapsed(newElapsed);
      }
    }, 250);
  }, [exercise.timerSeconds, onDone, clearTimer]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    pausedElapsedRef.current = elapsed;
    setTimerState('paused');
  }, [clearTimer, elapsed]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setElapsed(0);
    pausedElapsedRef.current = 0;
    setTimerState('idle');
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Reset when finger changes
  useEffect(() => {
    resetTimer();
    setReps(0);
  }, [exercise.id, resetTimer]);

  return (
    <div className="px-3 py-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      {/* Exercise header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <p className="text-xs font-ui font-bold text-white">{exercise.nameEs}</p>
          <p className="text-[11px] text-slate-500 font-body mt-0.5">{exercise.descriptionEs}</p>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-ui font-bold bg-white/[0.04] text-slate-500 border border-white/5">
          {exercise.weaponEs}
        </span>
      </div>

      {/* Timer + Reps row */}
      <div className="flex items-center gap-3 mt-2">
        {/* Timer */}
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'font-mono text-sm font-bold tabular-nums',
            timerState === 'done' ? 'text-green-400' : timerState === 'running' ? 'text-white' : 'text-slate-500',
          )}>
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
          {timerState === 'idle' && (
            <button onClick={startTimer} className="min-h-[28px] px-2 py-0.5 rounded text-[10px] font-ui font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
              Iniciar
            </button>
          )}
          {timerState === 'running' && (
            <button onClick={pauseTimer} className="min-h-[28px] px-2 py-0.5 rounded text-[10px] font-ui font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
              Pausa
            </button>
          )}
          {timerState === 'paused' && (
            <button onClick={startTimer} className="min-h-[28px] px-2 py-0.5 rounded text-[10px] font-ui font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
              Reanudar
            </button>
          )}
          {timerState !== 'idle' && (
            <button onClick={resetTimer} className="min-h-[28px] px-1.5 py-0.5 rounded text-[10px] font-ui text-slate-600 hover:text-slate-400 transition-colors">
              Reset
            </button>
          )}
        </div>

        <div className="w-px h-4 bg-white/5" />

        {/* Rep counter */}
        {exercise.reps > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setReps((r) => Math.max(0, r - 1))}
              className="min-w-[24px] min-h-[24px] rounded text-xs font-mono text-slate-500 bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors"
            >
              -
            </button>
            <span className={cn(
              'text-xs font-mono font-bold tabular-nums min-w-[50px] text-center',
              reps >= exercise.reps ? 'text-green-400' : 'text-slate-400',
            )}>
              {reps} / {exercise.reps}
            </span>
            <button
              onClick={() => setReps((r) => r + 1)}
              className="min-w-[24px] min-h-[24px] rounded text-xs font-mono text-slate-500 bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="mt-2 px-2 py-1.5 rounded bg-blue-500/5 border border-blue-500/10">
        <p className="text-[10px] text-blue-400/70 font-body">
          <span className="font-ui font-bold">Tip:</span> {exercise.tipEs}
        </p>
      </div>

      {/* Focus */}
      <p className="text-[9px] text-slate-600 font-body mt-1.5 uppercase tracking-wider">
        Enfoque: {exercise.focusEs}
      </p>
    </div>
  );
}

// --- Main training plan component ---

export function FingerTrainingPlan({ fingers }: FingerTrainingPlanProps) {
  const plan = getTrainingPlan(fingers);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [exerciseDone, setExerciseDone] = useState<Set<string>>(new Set());

  // Reset state when fingers change
  useEffect(() => {
    setExpandedDay(1);
    setCompletedDays(new Set());
    setExerciseDone(new Set());
  }, [fingers]);

  const markDayDone = useCallback((day: number) => {
    setCompletedDays((prev) => new Set(prev).add(day));
  }, []);

  const handleExerciseDone = useCallback((id: string) => {
    setExerciseDone((prev) => new Set(prev).add(id));
  }, []);

  const resetPlan = useCallback(() => {
    setCompletedDays(new Set());
    setExerciseDone(new Set());
    setExpandedDay(1);
  }, []);

  const completedCount = completedDays.size;
  const allDone = completedCount === 7;

  return (
    <div>
      {/* Section header */}
      <h3 className="font-heading font-bold text-white text-xl md:text-2xl mb-1">
        PLAN DE ENTRENAMIENTO: {plan.nameEs.toUpperCase()}
      </h3>
      <p className="text-sm text-slate-500 font-body mb-1">{plan.subtitleEs}</p>
      <p className="text-xs text-slate-400 font-body mb-4">{plan.introEs}</p>

      {/* Warning */}
      {plan.warningEs && (
        <div className="glass-card p-3 mb-4 border-amber-500/15 bg-amber-500/[0.03]">
          <p className="text-xs text-amber-400/90 font-body">
            ⚠️ {plan.warningEs}
          </p>
        </div>
      )}

      {/* Weekly progress */}
      <div className="glass-card p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-ui text-slate-400">
            Día {Math.min(completedCount + 1, 7)} de 7 — {Math.round((completedCount / 7) * 100)}% completado
          </span>
          <span className="text-[10px] font-mono text-slate-600">{completedCount}/7</span>
        </div>
        <GlowProgressBar value={completedCount} max={7} color="red" />
      </div>

      {/* Day cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={fingers}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {plan.days.map((day) => {
            const isExpanded = expandedDay === day.day;
            const isDone = completedDays.has(day.day);
            const isFinalDay = day.day === 7;

            return (
              <div
                key={day.day}
                className={cn(
                  'glass-card overflow-hidden transition-all',
                  isFinalDay && 'ring-1 ring-amber-500/20',
                  isDone && 'opacity-70',
                )}
              >
                {/* Day header — click to expand */}
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                  className="w-full min-h-[44px] px-4 py-3 flex items-center gap-3 text-left"
                >
                  {/* Day number */}
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-bold shrink-0',
                    isDone
                      ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                      : isFinalDay
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'bg-white/[0.04] text-slate-500 border border-white/5',
                  )}>
                    {isDone ? '✓' : day.day}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-ui font-bold truncate',
                      isDone ? 'text-green-400/70' : 'text-white',
                    )}>
                      {isFinalDay && '🏆 '}{day.titleEs}
                    </p>
                    <p className="text-[11px] text-slate-600 font-body truncate">{day.summaryEs}</p>
                  </div>

                  <span className="text-xs text-slate-600 shrink-0">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2">
                        {/* Exercises */}
                        {day.exercises.map((ex) => (
                          <ExerciseRow
                            key={ex.id}
                            exercise={ex}
                            onDone={() => handleExerciseDone(ex.id)}
                          />
                        ))}

                        {/* Challenge */}
                        {day.challengeEs && (
                          <div className="px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15">
                            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-amber-400">
                              Desafío del día
                            </span>
                            <p className="text-xs text-amber-300/80 font-body mt-0.5">{day.challengeEs}</p>
                          </div>
                        )}

                        {/* Motivation */}
                        <p className="text-[11px] text-slate-600 font-body italic text-center pt-1">
                          &ldquo;{day.motivationEs}&rdquo;
                        </p>

                        {/* Mark done button */}
                        {!isDone && (
                          <button
                            onClick={() => markDayDone(day.day)}
                            className="w-full min-h-[36px] px-3 py-2 rounded-lg text-xs font-ui font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/15 transition-colors"
                          >
                            Marcar Día {day.day} como Completado
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Completion message */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mt-4 text-center border-green-500/20"
        >
          <p className="text-2xl mb-2">🏆</p>
          <p className="text-sm font-heading font-bold text-green-400 mb-2">¡PLAN COMPLETADO!</p>
          <p className="text-xs text-slate-400 font-body">{plan.completionMessageEs}</p>
        </motion.div>
      )}

      {/* Reset button */}
      <button
        onClick={resetPlan}
        className="w-full min-h-[36px] mt-3 px-3 py-2 rounded-lg text-[11px] font-ui text-slate-600 bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors"
      >
        Reiniciar Plan
      </button>
    </div>
  );
}
