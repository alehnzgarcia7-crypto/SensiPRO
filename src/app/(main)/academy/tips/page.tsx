import { Metadata } from 'next';
import { Lightbulb, BarChart3 } from 'lucide-react';
import { getTips, getTipsRandom } from '@/lib/academy/academy-queries';
import { CATEGORY_CONFIGS, CATEGORIES_ORDER } from '@/lib/academy/academy-config';
import { TipCarousel } from '@/components/academy/tip-carousel';
import type { GuideCategory, TipDifficulty } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Tips y Trucos de Free Fire | Academia PRO — ARES SensiPRO',
  description:
    '100+ tips y trucos para mejorar tu gameplay en Free Fire. Sensibilidad, puntería, movimiento, estrategia y más.',
};

interface TipsPageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
  }>;
}

const DIFFICULTY_OPTIONS = [
  {
    key: 'BEGINNER',
    label: 'Principiante',
    color: 'text-green-400 bg-green-500/20 border-green-500/30',
  },
  {
    key: 'INTERMEDIATE',
    label: 'Intermedio',
    color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  },
  {
    key: 'ADVANCED',
    label: 'Avanzado',
    color: 'text-red-400 bg-red-500/20 border-red-500/30',
  },
] as const;

export default async function TipsPage({ searchParams }: TipsPageProps) {
  const params = await searchParams;
  const { category, difficulty } = params;

  const validCategory =
    category && CATEGORIES_ORDER.includes(category as GuideCategory)
      ? (category as GuideCategory)
      : undefined;
  const validDifficulty =
    difficulty && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)
      ? (difficulty as TipDifficulty)
      : undefined;

  const [{ tips }, carouselTips] = await Promise.all([
    getTips({ category: validCategory, difficulty: validDifficulty, limit: 200 }),
    getTipsRandom(5),
  ]);

  // Agrupar por categoría
  const grouped = tips.reduce<Record<string, typeof tips>>((acc, tip) => {
    if (!acc[tip.category]) acc[tip.category] = [];
    acc[tip.category]!.push(tip);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          Tips y Trucos
        </h1>
        <p className="text-slate-400 text-sm">{tips.length} tips disponibles</p>
      </div>

      {/* Carousel */}
      {carouselTips.length > 0 && <TipCarousel tips={carouselTips} />}

      {/* Filtros */}
      <div className="space-y-3">
        {/* Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <a
            href="/academy/tips"
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !category
                ? 'bg-fire-500/20 text-fire-400 border border-fire-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Todas
          </a>
          {CATEGORIES_ORDER.map((key) => {
            const config = CATEGORY_CONFIGS[key];
            return (
              <a
                key={key}
                href={`/academy/tips?category=${key}${validDifficulty ? `&difficulty=${validDifficulty}` : ''}`}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === key
                    ? 'bg-fire-500/20 text-fire-400 border border-fire-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {config.nameEs}
              </a>
            );
          })}
        </div>

        {/* Dificultad */}
        <div className="flex items-center gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <a
              key={opt.key}
              href={`/academy/tips?difficulty=${opt.key}${validCategory ? `&category=${validCategory}` : ''}`}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                difficulty === opt.key
                  ? opt.color + ' border'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              {opt.label}
            </a>
          ))}
        </div>
      </div>

      {/* Tips por categoría */}
      {Object.entries(grouped).map(([cat, catTips]) => {
        const config = CATEGORY_CONFIGS[cat as keyof typeof CATEGORY_CONFIGS];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <section key={cat}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icon className="w-5 h-5" style={{ color: config.color }} />
              {config.nameEs}
              <span className="text-xs text-slate-500 font-normal">({catTips.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catTips.map((tip) => (
                <div
                  key={tip.id}
                  className="rounded-xl border border-white/10 bg-background-card/30 p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">{tip.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{tip.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {tips.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No se encontraron tips</p>
        </div>
      )}
    </div>
  );
}
