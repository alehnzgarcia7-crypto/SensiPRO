import { Metadata } from 'next';
import { Suspense } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { getGuides, getGuideCategoryCounts } from '@/lib/academy/academy-queries';
import { CategoryFilter } from '@/components/academy/category-filter';
import { GuideCard } from '@/components/academy/guide-card';
import type { GuideCategory } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Guías de Free Fire | Academia PRO — ARES SensiPRO',
  description:
    'Guías profesionales para mejorar tu gameplay en Free Fire. Sensibilidad, puntería, movimiento, estrategia y más.',
};

interface GuidesPageProps {
  searchParams: {
    category?: string;
    page?: string;
    search?: string;
  };
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const category = (searchParams.category as GuideCategory) || undefined;
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || undefined;

  const [{ guides, total }, categoryCounts] = await Promise.all([
    getGuides({ category, page, limit: 12, search }),
    getGuideCategoryCounts(),
  ]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <BookOpen className="w-6 h-6 text-fire-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Guías de Free Fire
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm font-numbers">
          {total} {total === 1 ? 'guía disponible' : 'guías disponibles'}
        </p>
      </div>

      {/* Search — Glass input */}
      <div className="relative academy-stagger" style={{ animationDelay: '50ms' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <form method="GET" action="/academy/guides">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar guías..."
            className="w-full glass-card !rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-ice-500/40 focus:outline-none focus:ring-1 focus:ring-ice-500/30 transition-colors min-h-[44px]"
          />
          {category && <input type="hidden" name="category" value={category} />}
        </form>
      </div>

      {/* Category Filter */}
      <div className="academy-stagger" style={{ animationDelay: '100ms' }}>
        <Suspense fallback={null}>
          <CategoryFilter selected={category} counts={categoryCounts} />
        </Suspense>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide, index) => (
          <GuideCard key={guide.id} guide={guide} index={index} />
        ))}
      </div>

      {guides.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-[family-name:var(--font-rajdhani)] font-medium">No se encontraron guías</p>
          <p className="text-sm mt-1">Intenta con otra categoría o término de búsqueda</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (search) params.set('search', search);
            params.set('page', String(p));

            return (
              <a
                key={p}
                href={`/academy/guides?${params.toString()}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-numbers font-medium transition-all duration-200 min-h-[44px] flex items-center ${
                  p === page
                    ? 'text-white shadow-[0_0_12px_rgba(255,106,0,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                style={
                  p === page
                    ? { background: 'linear-gradient(135deg, #ff6a00, #c2410c)' }
                    : undefined
                }
              >
                {p}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
