'use client';

// ═══════════════════════════════════════════════════════════════
// ARES-302 — VideoPlayer: reproductor gaming-styled con YouTube embed
// Muestra thumbnail → click para reproducir, o lock si es Premium
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

export function VideoPlayer({ video, canAccess }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const difficulty = DIFFICULTY_LABELS[video.difficulty];

  // ── Estado: Premium bloqueado ──────────────────────
  if (!canAccess) {
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden border border-yellow-500/30 bg-background-card">
        {/* Thumbnail con blur */}
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <Lock className="w-12 h-12 text-yellow-400 mb-3" />
          <p className="text-white font-bold mb-1">Video Premium</p>
          <p className="text-slate-400 text-sm mb-4">Upgrade para ver este tutorial</p>
          <a
            href="/pricing"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fire-500 to-fire-600 text-white text-sm font-bold hover:from-fire-600 hover:to-fire-700 transition-all"
          >
            Desbloquear — $49/mes
          </a>
        </div>
      </div>
    );
  }

  // ── Estado: Thumbnail (antes de play) ──────────────
  if (!isPlaying) {
    return (
      <div
        className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-background-card group cursor-pointer"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Botón de play central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-fire-500/90 flex items-center justify-center shadow-lg shadow-fire-500/30 group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Barra de info inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{video.title}</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              {video.duration}
            </span>
            <span
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                difficulty.color,
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
    <div className="relative aspect-video rounded-xl overflow-hidden border border-fire-500/30">
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
