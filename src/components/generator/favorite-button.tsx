'use client';

import type { SensitivityStyle } from '@prisma/client';
import { useState, useCallback } from 'react';

import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// FavoriteButton — Toggle de favorito con animacion de corazon
// Incluye feedback visual (pulso/escala) al agregar/quitar
// ═══════════════════════════════════════════════════════════════

interface FavoriteButtonProps {
  deviceId: string;
  style: SensitivityStyle;
  isFavorited: boolean;
  onToggle: (
    deviceId: string,
    style: SensitivityStyle,
  ) => Promise<{ success: boolean; error?: string }>;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'h-8 w-8 text-base',
  md: 'h-10 w-10 text-xl',
  lg: 'h-12 w-12 text-2xl',
};

export function FavoriteButton({
  deviceId,
  style,
  isFavorited,
  onToggle,
  size = 'md',
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const [animating, setAnimating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    if (toggling) return;

    setToggling(true);
    setError(null);
    setAnimating(true);

    const result = await onToggle(deviceId, style);

    if (!result.success) {
      setError(result.error ?? 'Error');
      setTimeout(() => setError(null), 3000);
    }

    setTimeout(() => setAnimating(false), 300);
    setToggling(false);
  }, [deviceId, style, onToggle, toggling]);

  return (
    <div className={cn('relative inline-flex items-center gap-2', className)}>
      <button
        onClick={handleClick}
        disabled={toggling}
        aria-label={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className={cn(
          'inline-flex items-center justify-center rounded-full border transition-all duration-200',
          SIZE_CLASSES[size],
          isFavorited
            ? 'border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20'
            : 'border-slate-600/50 bg-slate-700/30 text-slate-400 hover:border-slate-500 hover:text-red-400',
          animating && 'scale-125',
          toggling && 'opacity-50',
        )}
      >
        <span
          className={cn(
            'transition-transform duration-200',
            animating && 'animate-pulse',
          )}
        >
          {isFavorited ? '\u2764\uFE0F' : '\uD83E\uDE76'}
        </span>
      </button>

      {showLabel && (
        <span className="text-sm text-slate-400">
          {isFavorited ? 'En favoritos' : 'Guardar'}
        </span>
      )}

      {error && (
        <div className="absolute -bottom-8 left-0 whitespace-nowrap rounded bg-red-500/90 px-2 py-1 text-xs text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
