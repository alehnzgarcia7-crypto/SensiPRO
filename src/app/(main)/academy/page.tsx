import { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, ArrowRight, Eye, BookOpen, Lightbulb } from 'lucide-react';
import { getFeaturedGuides, getGuideCategoryCounts } from '@/lib/academy/academy-queries';
import { CATEGORY_CONFIGS, CATEGORIES_ORDER } from '@/lib/academy/academy-config';
import { GuideCard } from '@/components/academy/guide-card';
import { TipOfDay } from '@/components/academy/tip-of-day';

export const metadata: Metadata = {
  title: 'Academia PRO | ARES SensiPRO',
  description:
    'Aprende a dominar Free Fire con guías profesionales, tips avanzados y análisis del meta actual. Desde sensibilidades hasta estrategias de alto nivel.',
  openGraph: {
    title: 'Academia PRO — ARES SensiPRO',
    description: 'Guías, tips y análisis de meta para dominar Free Fire',
  },
};

export default async function AcademyHubPage() {
  const [featured, categoryCounts] = await Promise.all([
    getFeaturedGuides(6),
    getGuideCategoryCounts(),
  ]);

  const totalGuides = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fire-500/20 via-background-card to-ice-500/20 border border-white/10 p-8 lg:p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-fire-500/20 border border-fire-500/30">
              <GraduationCap className="w-8 h-8 text-fire-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white">Academia PRO</h1>
              <p className="text-slate-400 text-sm">
                Tu camino de novato a crack de Free Fire
              </p>
            </div>
          </div>

          <p className="text-slate-300 max-w-2xl mb-6 leading-relaxed">
            Guías escritas por jugadores competitivos, tips que realmente funcionan, y análisis
            del meta actualizado. No es teoría — es lo que usan los pros.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <BookOpen className="w-4 h-4 text-fire-400" />
              <span className="font-medium">{totalGuides} guías</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Lightbulb className="w-4 h-4 text-ice-400" />
              <span className="font-medium">100+ tips</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="font-medium">6 categorías</span>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fire-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-ice-500/5 rounded-full blur-3xl" />
      </section>

      {/* Tip del día */}
      <TipOfDay />

      {/* Categorías */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Explorar por Categoría</h2>
          <Link
            href="/academy/guides"
            className="text-sm text-fire-400 hover:text-fire-300 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES_ORDER.map((key) => {
            const config = CATEGORY_CONFIGS[key];
            const count = categoryCounts[key] || 0;

            return (
              <Link
                key={key}
                href={`/academy/guides?category=${key}`}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-background-card/50 p-4 hover:border-white/20 transition-all duration-300"
              >
                <div
                  className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${config.gradient} mb-3`}
                >
                  <config.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{config.nameEs}</h3>
                <p className="text-xs text-slate-500">
                  {count} {count === 1 ? 'guía' : 'guías'}
                </p>
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Guías destacadas */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Guías Destacadas</h2>
          <Link
            href="/academy/guides"
            className="text-sm text-fire-400 hover:text-fire-300 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>

        {featured.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aún no hay guías publicadas</p>
          </div>
        )}
      </section>
    </div>
  );
}
