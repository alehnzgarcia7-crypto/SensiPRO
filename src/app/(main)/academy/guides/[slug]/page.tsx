import { Clock } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GuideFooter } from '@/components/academy/guide-footer';
import { GuideRenderer } from '@/components/academy/guide-renderer';
import { GuideToc } from '@/components/academy/guide-toc';
import {
  CATEGORY_COLOR_MAP,
  DIFFICULTY_COLOR_MAP,
  getGuideContent,
  ALL_GUIDE_SLUGS,
} from '@/lib/academy/guide-content';
import { cn } from '@/lib/cn';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideContent(slug);
  if (!guide) return { title: 'Guía no encontrada' };

  return {
    title: `${guide.title} | Academia PRO — ARES SensiPRO`,
    description: guide.intro,
    openGraph: {
      title: guide.title,
      description: guide.intro,
      type: 'article',
    },
  };
}

export function generateStaticParams() {
  return ALL_GUIDE_SLUGS.map((slug) => ({ slug }));
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideContent(slug);

  if (!guide) notFound();

  const catColor = CATEGORY_COLOR_MAP[guide.category];
  const diffStyle = DIFFICULTY_COLOR_MAP[guide.difficulty];

  return (
    <article className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 font-[family-name:var(--font-rajdhani)] mb-6">
        <Link href="/academy" className="hover:text-slate-300 transition-colors">
          Academia
        </Link>
        <span>/</span>
        <Link href="/academy/guides" className="hover:text-slate-300 transition-colors">
          Guías
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{guide.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 academy-stagger">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Category badge */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-[family-name:var(--font-rajdhani)] font-bold text-xs uppercase tracking-wider text-white/90"
            style={{ backgroundColor: `${catColor}cc` }}
          >
            {guide.category}
          </span>

          {/* Difficulty badge */}
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-md font-[family-name:var(--font-rajdhani)] font-bold text-xs uppercase tracking-wider border',
              diffStyle.bg,
              diffStyle.text,
              diffStyle.border,
            )}
          >
            {guide.difficulty}
          </span>

          {/* Read time */}
          <span className="flex items-center gap-1 text-xs text-slate-500 font-numbers">
            <Clock className="w-3.5 h-3.5" />
            {guide.readTime} min de lectura
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-black text-white mb-4 font-[family-name:var(--font-orbitron)] leading-tight">
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {guide.title}
          </span>
        </h1>

        {/* Intro */}
        <p className="text-slate-300 text-base leading-relaxed max-w-3xl">{guide.intro}</p>
      </header>

      {/* Main content area with TOC sidebar */}
      <div className="flex gap-8">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile TOC */}
          <GuideToc sections={guide.sections} />

          {/* Guide Content */}
          <GuideRenderer sections={guide.sections} />

          {/* Footer: related guides + CTA */}
          <GuideFooter relatedSlugs={guide.relatedSlugs} currentSlug={guide.slug} />
        </div>

        {/* Desktop TOC sidebar */}
        <GuideToc sections={guide.sections} />
      </div>
    </article>
  );
}
