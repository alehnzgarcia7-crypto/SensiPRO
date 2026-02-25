// ═══════════════════════════════════════════════════════════════
// ARES-302 — Videos Page: galería premium de tutoriales con filtros
// ═══════════════════════════════════════════════════════════════

import { Metadata } from 'next';
import { Video } from 'lucide-react';
import {
  VIDEO_TUTORIALS,
  getVideosByCategory,
  DIFFICULTY_LABELS,
} from '@/lib/academy/video-config';
import { CATEGORY_CONFIGS, CATEGORIES_ORDER } from '@/lib/academy/academy-config';
import { VideoPlayer } from '@/components/academy/video-player';
import { auth } from '@/lib/auth';
import type { VideoTutorial, VideoDifficulty } from '@/lib/academy/video-config';

export const metadata: Metadata = {
  title: 'Video Tutoriales | Academia PRO — ARES SensiPRO',
  description:
    'Video tutoriales de Free Fire: sensibilidad, puntería, movimiento, estrategia y más.',
};

interface VideosPageProps {
  searchParams: {
    category?: string;
    difficulty?: string;
    search?: string;
  };
}

const DIFFICULTY_PILL_ACTIVE: Record<string, string> = {
  BEGINNER: 'bg-green-500/15 text-green-400 border-green-500/30',
  INTERMEDIATE: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  ADVANCED: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const DIFFICULTY_GLOW: Record<string, string> = {
  BEGINNER: '0 0 10px rgba(34, 197, 94, 0.25)',
  INTERMEDIATE: '0 0 10px rgba(249, 115, 22, 0.25)',
  ADVANCED: '0 0 10px rgba(239, 68, 68, 0.25)',
};

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const session = await auth();
  const userTier =
    ((session?.user as { tier?: string } | undefined)?.tier as
      | 'FREE'
      | 'PREMIUM'
      | 'VIP') || 'FREE';
  const canAccessPremium = userTier === 'PREMIUM' || userTier === 'VIP';

  // Filtrar por categoría
  let videos: VideoTutorial[] = searchParams.category
    ? getVideosByCategory(searchParams.category)
    : VIDEO_TUTORIALS;

  // Filtrar por dificultad
  if (searchParams.difficulty) {
    const diff = searchParams.difficulty as VideoDifficulty;
    videos = videos.filter((v) => v.difficulty === diff);
  }

  // Filtrar por búsqueda
  if (searchParams.search) {
    const lower = searchParams.search.toLowerCase();
    videos = videos.filter(
      (v) =>
        v.title.toLowerCase().includes(lower) ||
        v.description.toLowerCase().includes(lower) ||
        v.tags.some((t) => t.includes(lower)),
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <Video className="w-6 h-6 text-fire-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Video Tutoriales
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm font-numbers">
          {videos.length} video{videos.length !== 1 ? 's' : ''} disponible
          {videos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 academy-stagger" style={{ animationDelay: '50ms' }}>
        {/* Filtro por categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory md:snap-none">
          <a
            href="/academy/videos"
            className={`flex-shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-[family-name:var(--font-rajdhani)] font-semibold uppercase tracking-wide transition-all duration-200 min-h-[44px] flex items-center border ${
              !searchParams.category
                ? 'bg-fire-500/15 text-fire-400 border-fire-500/30 shadow-[0_0_12px_rgba(255,106,0,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            Todos
          </a>
          {CATEGORIES_ORDER.map((key) => {
            const config = CATEGORY_CONFIGS[key];
            const isActive = searchParams.category === key;
            const diffParam = searchParams.difficulty
              ? `&difficulty=${searchParams.difficulty}`
              : '';
            return (
              <a
                key={key}
                href={`/academy/videos?category=${key}${diffParam}`}
                className={`flex-shrink-0 snap-start px-3 py-2 rounded-xl text-xs font-[family-name:var(--font-rajdhani)] font-semibold transition-all duration-200 min-h-[44px] flex items-center border ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${config.color}20`,
                        borderColor: `${config.color}40`,
                        color: config.color,
                        boxShadow: `0 0 12px ${config.color}25`,
                      }
                    : undefined
                }
              >
                {config.nameEs}
              </a>
            );
          })}
        </div>

        {/* Filtro por dificultad */}
        <div className="flex items-center gap-2">
          {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((diff) => {
            const config = DIFFICULTY_LABELS[diff];
            const isActive = searchParams.difficulty === diff;
            const catParam = searchParams.category
              ? `&category=${searchParams.category}`
              : '';
            return (
              <a
                key={diff}
                href={`/academy/videos?difficulty=${diff}${catParam}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-[family-name:var(--font-rajdhani)] font-semibold transition-all duration-200 min-h-[44px] flex items-center border ${
                  isActive
                    ? DIFFICULTY_PILL_ACTIVE[diff] ?? ''
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
                style={
                  isActive
                    ? { boxShadow: DIFFICULTY_GLOW[diff] }
                    : undefined
                }
              >
                {config.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Grid de videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="space-y-2 academy-stagger"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <VideoPlayer
              video={video}
              canAccess={!video.isPremium || canAccessPremium}
            />
            <p className="text-xs text-slate-400 line-clamp-2 px-1">
              {video.description}
            </p>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {videos.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-[family-name:var(--font-rajdhani)] font-medium">No se encontraron videos</p>
          <p className="text-sm mt-1">Intenta con otro filtro</p>
        </div>
      )}
    </div>
  );
}
