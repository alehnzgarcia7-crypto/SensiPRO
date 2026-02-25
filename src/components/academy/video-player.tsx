'use client';

// ═══════════════════════════════════════════════════════════════
// ARES-302 — VideoPlayer: reproductor gaming-styled con YouTube embed
// Premium thumbnails con gradientes CSS, play pulse, glass cards
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Play, Lock, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DIFFICULTY_LABELS } from '@/lib/academy/video-config';
import type { VideoTutorial } from '@/lib/academy/video-config';

interface VideoPlayerProps {
  video: VideoTutorial;
  canAccess: boolean;
}

// Gradientes por categoría para thumbnails CSS
const CATEGORY_GRADIENTS: Record<string, string> = {
  SENSITIVITY: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(15,23,42,0.9) 100%)',
  AIM: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(15,23,42,0.9) 100%)',
  MOVEMENT: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(15,23,42,0.9) 100%)',
  STRATEGY: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(15,23,42,0.9) 100%)',
  DEVICE: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(15,23,42,0.9) 100%)',
  META: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(15,23,42,0.9) 100%)',
};

const DIFFICULTY_PILL_COLORS: Record<string, string> = {
  BEGINNER: 'text-green-400 bg-green-500/15 border-green-500/20',
  INTERMEDIATE: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
  ADVANCED: 'text-red-400 bg-red-500/15 border-red-500/20',
};

export function VideoPlayer({ video, canAccess }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const difficulty = DIFFICULTY_LABELS[video.difficulty];
  const diffPillColor = DIFFICULTY_PILL_COLORS[video.difficulty] ?? 'text-slate-400 bg-white/5 border-white/10';
  const categoryGradient = CATEGORY_GRADIENTS[video.category] ?? CATEGORY_GRADIENTS.SENSITIVITY;

  // ── Estado: Premium bloqueado ──────────────────────
  if (!canAccess) {
    return (
      <div className="relative aspect-video glass-card overflow-hidden">
        {/* Thumbnail con blur */}
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-30"
        />
        {/* Golden gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-[#0a0f1e]/90" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-3 shadow-[0_0_24px_rgba(234,179,8,0.15)]">
            <Lock className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-white font-[family-name:var(--font-rajdhani)] font-bold mb-1">Video Premium</p>
          <p className="text-slate-400 text-sm mb-4">Upgrade para ver este tutorial</p>
          <a
            href="/pricing"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] min-h-[44px] flex items-center"
            style={{
              background: 'linear-gradient(135deg, #ff6a00, #06b6d4)',
            }}
          >
            Desbloquear — $49/mes
          </a>
        </div>
      </div>
    );
  }

  const isPlaceholder = video.youtubeId === '_placeholder_';

  // ── Estado: Placeholder (próximamente) ────
  if (isPlaceholder) {
    return (
      <div
        className="relative aspect-video glass-card overflow-hidden"
        style={{ background: categoryGradient }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Play icon — glass circle */}
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
            <Play className="w-7 h-7 text-slate-500 ml-1" />
          </div>
          <h3 className="text-white font-[family-name:var(--font-rajdhani)] font-bold text-sm mb-1 px-4 text-center line-clamp-1">
            {video.title}
          </h3>
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-slate-400 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mt-2 uppercase tracking-widest">
            Próximamente
          </span>
        </div>

        {/* Barra de info inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-slate-400 font-numbers text-xs">
              <Clock className="w-3.5 h-3.5" />
              {video.duration}
            </span>
            <span
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
                diffPillColor,
              )}
            >
              <BarChart3 className="w-3 h-3" />
              {difficulty.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Estado: Thumbnail (antes de play) ──────────────
  if (!isPlaying) {
    return (
      <div
        className="relative aspect-video glass-card overflow-hidden group cursor-pointer"
        onClick={() => setIsPlaying(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsPlaying(true);
          }
        }}
        aria-label={`Reproducir: ${video.title}`}
      >
        {/* Thumbnail de YouTube */}
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/90 via-[#0a0f1e]/20 to-transparent" />

        {/* Botón de play central — glass circle with glow pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-[1.15] transition-transform duration-300 play-pulse">
            <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 font-numbers text-xs text-white/80">
          {video.duration}
        </div>

        {/* Barra de info inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-[family-name:var(--font-rajdhani)] font-bold text-lg mb-2 line-clamp-1">
            {video.title}
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-slate-300 font-numbers text-xs">
              <Clock className="w-3.5 h-3.5" />
              {video.duration}
            </span>
            <span
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
                diffPillColor,
              )}
            >
              <BarChart3 className="w-3 h-3" />
              {difficulty.label}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Estado: Reproduciendo (iframe YouTube) ─────────
  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-fire-500/30 shadow-[0_0_20px_rgba(255,106,0,0.15)]">
      <iframe
        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
