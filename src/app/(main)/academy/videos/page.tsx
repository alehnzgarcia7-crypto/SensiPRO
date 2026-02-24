// ═══════════════════════════════════════════════════════════════
// ARES-302 — Videos Page: galería de tutoriales con filtros
// Categoría + dificultad + búsqueda por texto
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
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
          <Video className="w-6 h-6 text-fire-400" />
          Video Tutoriales
        </h1>
        <p className="text-slate-400 text-sm">
          {videos.length} video{videos.length !== 1 ? 's' : ''} disponible
          {videos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {/* Filtro por categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <a
            href="/academy/videos"
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !searchParams.category
                ? 'bg-fire-500/20 text-fire-400 border border-fire-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Todos
          </a>
          {CATEGORIES_ORDER.map((key) => {
            const config = CATEGORY_CONFIGS[key];
            const diffParam = searchParams.difficulty
              ? `&difficulty=${searchParams.difficulty}`
              : '';
            return (
              <a
                key={key}
                href={`/academy/videos?category=${key}${diffParam}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  searchParams.category === key
                    ? 'bg-fire-500/20 text-fire-400 border border-fire-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
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
            const catParam = searchParams.category
              ? `&category=${searchParams.category}`
              : '';
            return (
              <a
                key={diff}
                href={`/academy/videos?difficulty=${diff}${catParam}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  searchParams.difficulty === diff
                    ? config.color + ' border border-current/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {config.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Grid de videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((video) => (
          <div key={video.id} className="space-y-2">
            <VideoPlayer
              video={video}
              canAccess={!video.isPremium || canAccessPremium}
            />
            <p className="text-xs text-slate-400 line-clamp-2">
              {video.description}
            </p>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {videos.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No se encontraron videos</p>
          <p className="text-sm mt-1">Intenta con otro filtro</p>
        </div>
      )}
    </div>
  );
}
