// ═══════════════════════════════════════════════════════════════
// Guide Footer — Guías relacionadas + CTA al generador
// ═══════════════════════════════════════════════════════════════

import { ArrowLeft, ArrowRight, BookOpen, Crosshair } from 'lucide-react';
import Link from 'next/link';

import type { GuideData } from '@/lib/academy/guide-content';
import { CATEGORY_COLOR_MAP, DIFFICULTY_COLOR_MAP, getRelatedGuides } from '@/lib/academy/guide-content';
import { cn } from '@/lib/cn';

interface GuideFooterProps {
  relatedSlugs: string[];
  currentSlug: string;
}

export function GuideFooter({ relatedSlugs, currentSlug }: GuideFooterProps) {
  const related = getRelatedGuides(relatedSlugs).filter((g) => g.slug !== currentSlug);

  return (
    <div className="space-y-6 mt-12">
      {/* Guías relacionadas */}
      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4 font-[family-name:var(--font-rajdhani)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-fire-400" />
            Guías relacionadas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {related.slice(0, 3).map((guide) => (
              <RelatedGuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </section>
      )}

      {/* CTA al generador */}
      <div className="glass-card p-6 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, #06b6d4, #ff6a00, #06b6d4, transparent)',
          }}
        />
        <Crosshair className="w-8 h-8 text-fire-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white font-[family-name:var(--font-rajdhani)] mb-2">
          ¿Listo para aplicar lo que aprendiste?
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Genera la sensibilidad perfecta para tu dispositivo en segundos
        </p>
        <Link
          href="/generator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all duration-200 min-h-[44px] hover:shadow-[0_0_20px_rgba(255,106,0,0.3)]"
          style={{ background: 'linear-gradient(135deg, #ff6a00, #06b6d4)' }}
        >
          Genera tu sensibilidad <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Última actualización + volver */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <Link
          href="/academy/guides"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-fire-400 transition-colors font-[family-name:var(--font-rajdhani)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a guías
        </Link>
        <span className="text-xs text-slate-600 font-numbers">
          Actualizado: Feb 2026
        </span>
      </div>
    </div>
  );
}

function RelatedGuideCard({ guide }: { guide: GuideData }) {
  const catColor = CATEGORY_COLOR_MAP[guide.category];
  const diffStyle = DIFFICULTY_COLOR_MAP[guide.difficulty];

  return (
    <Link
      href={`/academy/guides/${guide.slug}`}
      className="group glass-card p-4 transition-all duration-300 hover:-translate-y-0.5 block"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-[family-name:var(--font-rajdhani)] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
          style={{ backgroundColor: `${catColor}15`, color: catColor }}
        >
          {guide.category}
        </span>
        <span
          className={cn(
            'text-[10px] font-[family-name:var(--font-rajdhani)] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
            diffStyle.bg,
            diffStyle.text,
            diffStyle.border,
          )}
        >
          {guide.difficulty}
        </span>
      </div>
      <h4 className="text-sm font-bold text-white font-[family-name:var(--font-rajdhani)] mb-1 group-hover:text-fire-400 transition-colors leading-tight">
        {guide.title}
      </h4>
      <p className="text-xs text-slate-500 font-numbers">{guide.readTime} min de lectura</p>
    </Link>
  );
}
