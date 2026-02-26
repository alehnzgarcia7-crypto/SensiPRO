import { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, ArrowRight, Eye, BookOpen, Lightbulb } from 'lucide-react';
import { getFeaturedGuides, getGuideCategoryCounts } from '@/lib/academy/academy-queries';
import { CATEGORY_CONFIGS, CATEGORIES_ORDER } from '@/lib/academy/academy-config';
import { GuideCard } from '@/components/academy/guide-card';
import { TipOfDay } from '@/components/academy/tip-of-day';

export const metadata: Metadata = {
  title: 'Academia PRO | SensiPRO — Guías y Tips de Free Fire',
  description:
    'Aprende a dominar Free Fire con guías profesionales, tips de pros, meta actual, y video tutoriales. Mejora tu headshot rate.',
  keywords: ['guías free fire', 'tips free fire', 'academia free fire', 'tutoriales free fire'],
  openGraph: {
    title: 'Academia PRO — SensiPRO',
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
      {/* Hero — Glass card con gradientes premium */}
      <section className="relative overflow-hidden glass-card p-8 lg:p-12 academy-stagger">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-fire-500/15 border border-fire-500/20 shadow-[0_0_20px_rgba(255,106,0,0.1)]">
              <GraduationCap className="w-8 h-8 text-fire-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
                <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                  Academia PRO
                </span>
              </h1>
              <p className="text-slate-400 text-sm font-[family-name:var(--font-rajdhani)]">
                Tu camino de novato a crack de Free Fire
              </p>
            </div>
          </div>

          <p className="text-slate-300 max-w-2xl mb-6 leading-relaxed">
            Guías escritas por jugadores competitivos, tips que realmente funcionan, y análisis
            del meta actualizado al parche OB51. No es teoría — es lo que usan los pros.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300 glass-card !rounded-lg px-3 py-1.5">
              <BookOpen className="w-4 h-4 text-fire-400" />
              <span className="font-numbers font-medium">{totalGuides} guías</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 glass-card !rounded-lg px-3 py-1.5">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="font-numbers font-medium">100+ tips</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 glass-card !rounded-lg px-3 py-1.5">
              <Eye className="w-4 h-4 text-ice-400" />
              <span className="font-numbers font-medium">6 categorías</span>
            </div>
          </div>
        </div>

        {/* Background decoration — ambient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-fire-500/8 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-ice-500/6 rounded-full blur-[60px]" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-500/5 rounded-full blur-[50px]" />
      </section>

      {/* Tip del día */}
      <TipOfDay />

      {/* Categorías */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide">
            Explorar por Categoría
          </h2>
          <Link
            href="/academy/guides"
            className="text-sm text-fire-400 hover:text-fire-300 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="section-heading-separator mb-6" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES_ORDER.map((key, index) => {
            const config = CATEGORY_CONFIGS[key];
            const count = categoryCounts[key] || 0;

            return (
              <Link
                key={key}
                href={`/academy/guides?category=${key}`}
                className="group glass-card p-4 academy-stagger"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div
                  className="inline-flex p-2.5 rounded-lg mb-3 shadow-lg"
                  style={{
                    background: config.headerGradient,
                    boxShadow: `0 4px 12px ${config.color}33`,
                  }}
                >
                  <config.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm mb-1">
                  {config.nameEs}
                </h3>
                <p className="font-numbers text-xs text-slate-500">
                  {count} {count === 1 ? 'guía' : 'guías'}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Guías destacadas */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide">
            Guías Destacadas
          </h2>
          <Link
            href="/academy/guides"
            className="text-sm text-fire-400 hover:text-fire-300 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="section-heading-separator mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((guide, index) => (
            <GuideCard key={guide.id} guide={guide} index={index} />
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
