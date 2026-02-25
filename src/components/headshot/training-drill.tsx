'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

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

interface TrainingDrillProps {
  drill: DrillData;
  onComplete: () => void;
}

type TimerState = 'idle' | 'running' | 'paused' | 'done';

export function TrainingDrill({ drill, onComplete }: TrainingDrillProps) {
  const [state, setState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const pausedElapsedRef = useRef(0);

  const remaining = Math.max(0, drill.duration - elapsed);
  const progress = elapsed / drill.duration;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000;
    setState('running');

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const newElapsed = Math.floor((now - startTimeRef.current) / 1000);
      if (newElapsed >= drill.duration) {
        setElapsed(drill.duration);
        clearTimer();
        setState('done');
        onComplete();
      } else {
        setElapsed(newElapsed);
      }
    }, 250);
  }, [drill.duration, onComplete, clearTimer]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    pausedElapsedRef.current = elapsed;
    setState('paused');
  }, [elapsed, clearTimer]);

  const handleClick = useCallback(() => {
    if (state === 'idle' || state === 'paused') {
      startTimer();
    } else if (state === 'running') {
      pauseTimer();
    }
  }, [state, startTimer, pauseTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const stateColor = state === 'done' ? '#22c55e' : state === 'running' ? '#22c55e' : '#64748b';

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border-l-2" style={{ borderLeftColor: stateColor }}>
      {/* Timer circle */}
      <button
        onClick={handleClick}
        className="relative shrink-0 min-h-[44px] min-w-[44px]"
        disabled={state === 'done'}
      >
        <svg width="72" height="72" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={stateColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {state === 'done' ? (
            <span className="text-green-400 text-lg">✓</span>
          ) : (
            <>
              <span className="text-xs font-mono font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-[8px] text-slate-600">
                {state === 'idle' ? '▶' : state === 'running' ? '⏸' : '▶'}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{drill.emoji}</span>
          <h4 className="font-ui font-bold text-white text-sm truncate">{drill.name}</h4>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="text-[10px] text-slate-500 font-body">{drill.weapon}</span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-500 font-body">{drill.reps} reps</span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] text-slate-500 font-body">{drill.objective}</span>
        </div>
        <p className="text-[10px] text-slate-600 font-body mt-0.5 line-clamp-2">{drill.description}</p>
      </div>
    </div>
  );
}
