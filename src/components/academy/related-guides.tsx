// ═══════════════════════════════════════════════════════════════
// ARES-305 — Related Guides Component
// Sidebar de guías relacionadas con internal linking para SEO
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { CATEGORY_CONFIGS } from '@/lib/academy/academy-config';
import type { GuideCategory } from '@prisma/client';

interface RelatedGuide {
  slug: string;
  title: string;
  category: GuideCategory;
  readTimeMin: number;
}

interface RelatedGuidesProps {
  guides: RelatedGuide[];
  currentSlug: string;
}

export function RelatedGuides({ guides, currentSlug }: RelatedGuidesProps) {
  const filtered = guides.filter((g) => g.slug !== currentSlug).slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <section className="rounded-xl border border-white/10 bg-background-card/50 p-5">
      <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-fire-400" />
        Guías Relacionadas
      </h3>

      <div className="space-y-2">
        {filtered.map((guide) => {
          const config = CATEGORY_CONFIGS[guide.category];
          const Icon = config.icon;

          return (
            <Link
              key={guide.slug}
              href={`/academy/guides/${guide.slug}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className={`flex-shrink-0 p-1.5 rounded-md bg-gradient-to-br ${config.gradient}`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate group-hover:text-fire-400 transition-colors">
                  {guide.title}
                </p>
                <p className="text-xs text-slate-500">{guide.readTimeMin} min</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-fire-400 transition-colors" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
