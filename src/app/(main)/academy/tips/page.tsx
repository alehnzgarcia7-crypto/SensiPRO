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
    color: '#22c55e',
    bgActive: 'bg-green-500/15 text-green-400 border-green-500/30',
  },
  {
    key: 'INTERMEDIATE',
    label: 'Intermedio',
    color: '#f97316',
    bgActive: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  {
    key: 'ADVANCED',
    label: 'Avanzado',
    color: '#ef4444',
    bgActive: 'bg-red-500/15 text-red-400 border-red-500/30',
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
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Tips y Trucos
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm font-numbers">{tips.length} tips disponibles</p>
      </div>

      {/* Carousel — wrapped in AnimatedBorder */}
      {carouselTips.length > 0 && (
        <div className="academy-stagger" style={{ animationDelay: '50ms' }}>
          <TipCarousel tips={carouselTips} />
        </div>
      )}

      {/* Filtros */}
      <div className="space-y-3 academy-stagger" style={{ animationDelay: '100ms' }}>
        {/* Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory md:snap-none">
          <a
            href="/academy/tips"
            className={`flex-shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-[family-name:var(--font-rajdhani)] font-semibold uppercase tracking-wide transition-all duration-200 min-h-[44px] flex items-center border ${
              !category
                ? 'bg-fire-500/15 text-fire-400 border-fire-500/30 shadow-[0_0_12px_rgba(255,106,0,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
            }`}
          >
            Todas
          </a>
          {CATEGORIES_ORDER.map((key) => {
            const config = CATEGORY_CONFIGS[key];
            const isActive = category === key;
            return (
              <a
                key={key}
                href={`/academy/tips?category=${key}${validDifficulty ? `&difficulty=${validDifficulty}` : ''}`}
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

        {/* Dificultad */}
        <div className="flex items-center gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <a
              key={opt.key}
              href={`/academy/tips?difficulty=${opt.key}${validCategory ? `&category=${validCategory}` : ''}`}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-[family-name:var(--font-rajdhani)] font-semibold transition-all duration-200 min-h-[44px] border ${
                difficulty === opt.key
                  ? opt.bgActive
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
              style={
                difficulty === opt.key
                  ? { boxShadow: `0 0 10px ${opt.color}25` }
                  : undefined
              }
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
            <div className="mb-2">
              <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Icon className="w-5 h-5" style={{ color: config.color }} />
                {config.nameEs}
                <span className="font-numbers text-xs text-slate-500 font-normal normal-case tracking-normal">({catTips.length})</span>
              </h2>
            </div>
            <div className="section-heading-separator mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {catTips.map((tip, index) => (
                <div
                  key={tip.id}
                  className="relative glass-card p-4 pl-6 academy-stagger group"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Category accent bar — left side */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200 group-hover:w-[5px]"
                    style={{
                      background: config.color,
                      boxShadow: `0 0 8px ${config.color}40`,
                    }}
                  />
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5 glow-pulse" />
                    <div>
                      <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm mb-1">
                        {tip.title}
                      </h3>
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
          <p className="text-lg font-[family-name:var(--font-rajdhani)] font-medium">No se encontraron tips</p>
        </div>
      )}
    </div>
  );
}
