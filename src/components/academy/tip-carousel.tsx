'use client';

import { ChevronLeft, ChevronRight, Lightbulb, BarChart3 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { AnimatedBorder } from '@/components/effects/animated-border';
import { cn } from '@/lib/cn';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
}

interface TipCarouselProps {
  tips: Tip[];
  autoPlayMs?: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'text-green-400',
  INTERMEDIATE: 'text-yellow-400',
  ADVANCED: 'text-red-400',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};

export function TipCarousel({ tips, autoPlayMs = 5000 }: TipCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  }, [tips.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  }, [tips.length]);

  useEffect(() => {
    if (isPaused || tips.length <= 1) return;
    const timer = setInterval(next, autoPlayMs);
    return () => clearInterval(timer);
  }, [isPaused, next, autoPlayMs, tips.length]);

  if (tips.length === 0) return null;

  const tip = tips[currentIndex];
  if (!tip) return null;

  const diffColor = DIFFICULTY_COLORS[tip.difficulty] ?? 'text-slate-400';
  const diffLabel = DIFFICULTY_LABELS[tip.difficulty] ?? tip.difficulty;

  return (
    <AnimatedBorder speed="slow">
      <div
        className="p-5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-start gap-4">
          {/* Lightbulb icon with glow pulse */}
          <div className="flex-shrink-0 p-2.5 rounded-lg bg-fire-500/20 border border-fire-500/30">
            <Lightbulb className="w-5 h-5 text-fire-400 glow-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-[family-name:var(--font-rajdhani)] text-xs font-bold text-fire-400 uppercase tracking-wider">
                Tip #{currentIndex + 1} de {tips.length}
              </span>
              <span className={cn('flex items-center gap-1 text-xs font-medium', diffColor)}>
                <BarChart3 className="w-3 h-3" />
                {diffLabel}
              </span>
            </div>

            <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm mb-1">
              {tip.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{tip.content}</p>
          </div>
        </div>

        {/* Navegación */}
        {tips.length > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={prev}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Tip anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {tips.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === currentIndex
                      ? 'bg-fire-400 w-5 shadow-[0_0_6px_rgba(255,106,0,0.4)]'
                      : 'bg-white/20 w-1.5 hover:bg-white/40',
                  )}
                  aria-label={`Ir al tip ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Siguiente tip"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AnimatedBorder>
  );
}
