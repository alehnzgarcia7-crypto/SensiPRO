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
      <div>
        <h1 className="text-2xl font-black text-white mb-2">Guías de Free Fire</h1>
        <p className="text-slate-400 text-sm">
          {total} {total === 1 ? 'guía disponible' : 'guías disponibles'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <form method="GET" action="/academy/guides">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar guías..."
            className="w-full rounded-xl bg-background-card border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 transition-colors min-h-[44px]"
            aria-label="Buscar guías"
          />
          {category && <input type="hidden" name="category" value={category} />}
        </form>
      </div>

      {/* Category Filter */}
      <Suspense fallback={null}>
        <CategoryFilter selected={category} counts={categoryCounts} />
      </Suspense>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      {guides.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No se encontraron guías</p>
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-fire-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
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
