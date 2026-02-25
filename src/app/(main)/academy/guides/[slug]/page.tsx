import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Eye,
  ArrowLeft,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { getGuideBySlug, incrementGuideViews } from '@/lib/academy/academy-queries';
import { CATEGORY_CONFIGS } from '@/lib/academy/academy-config';
import { auth } from '@/lib/auth';
import { GuideSections } from '@/components/academy/guide-sections';
import { GuideComments } from '@/components/academy/guide-comments';

interface GuidePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) return { title: 'Guía no encontrada' };

  return {
    title: `${guide.title} | Academia PRO — ARES SensiPRO`,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      publishedTime: guide.createdAt.toISOString(),
      modifiedTime: guide.updatedAt.toISOString(),
      images: guide.imageUrl ? [{ url: guide.imageUrl }] : [],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const guide = await getGuideBySlug(params.slug);
  if (!guide || !guide.isPublished) notFound();

  // Increment views (fire and forget)
  incrementGuideViews(guide.id).catch(() => {});

  const session = await auth();
  const userTier = (session?.user as { tier?: string } | undefined)?.tier as
    | 'FREE'
    | 'PREMIUM'
    | 'VIP'
    | undefined;
  const tier = userTier || 'FREE';

  const categoryConfig = CATEGORY_CONFIGS[guide.category];
  const CategoryIcon = categoryConfig.icon;

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 font-[family-name:var(--font-rajdhani)]">
        <Link href="/academy" className="hover:text-slate-300 transition-colors">
          Academia
        </Link>
        <span>/</span>
        <Link href="/academy/guides" className="hover:text-slate-300 transition-colors">
          Guías
        </Link>
        <span>/</span>
        <Link
          href={`/academy/guides?category=${guide.category}`}
          className="hover:text-slate-300 transition-colors"
        >
          {categoryConfig.nameEs}
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{guide.title}</span>
      </nav>

      {/* Hero Image — glass card wrapper */}
      {guide.imageUrl ? (
        <div className="relative aspect-video glass-card overflow-hidden">
          <Image
            src={guide.imageUrl}
            alt={guide.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1200px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/60 to-transparent" />
        </div>
      ) : (
        <div
          className="relative aspect-video glass-card overflow-hidden"
          style={{ background: categoryConfig.headerGradient }}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <CategoryIcon className="w-24 h-24 text-white/20" strokeWidth={1} />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="academy-stagger">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-[family-name:var(--font-rajdhani)] font-bold text-xs uppercase tracking-wider text-white/90"
            style={{ backgroundColor: `${categoryConfig.color}cc` }}
          >
            <CategoryIcon className="w-3 h-3" />
            {categoryConfig.nameEs}
          </span>
          {guide.isPremium && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]">
              <Lock className="w-3 h-3" />
              PRO
            </span>
          )}
        </div>

        <h1 className="text-3xl lg:text-4xl font-black text-white mb-4 font-[family-name:var(--font-orbitron)]">
          {guide.title}
        </h1>
        <p className="text-slate-300 text-lg leading-relaxed mb-4">{guide.description}</p>

        <div className="flex items-center gap-4 font-numbers text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {guide.readTimeMin} min de lectura
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {guide.viewCount.toLocaleString()} vistas
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {guide.comments.length} comentarios
          </span>
        </div>
      </header>

      {/* Main Content (markdown) */}
      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-[family-name:var(--font-rajdhani)] prose-p:text-slate-300 prose-a:text-fire-400 prose-strong:text-white prose-code:text-ice-400 prose-code:bg-background-card prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
        <div dangerouslySetInnerHTML={{ __html: guide.content }} />
      </div>

      {/* Sections */}
      <GuideSections sections={guide.sections} userTier={tier} />

      {/* Premium Gate if needed */}
      {guide.isPremium && tier === 'FREE' && (
        <div className="relative glass-card p-8 text-center overflow-hidden">
          {/* Golden glow top border */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #eab308, #f97316, #eab308, transparent)',
              boxShadow: '0 0 16px rgba(234, 179, 8, 0.4)',
            }}
          />
          <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20 inline-flex mb-4 shadow-[0_0_24px_rgba(234,179,8,0.15)]">
            <Lock className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="text-xl font-[family-name:var(--font-orbitron)] font-bold text-white mb-2">
            Contenido Premium
          </h3>
          <p className="text-slate-400 mb-4">
            Esta guía es exclusiva para miembros Premium y VIP
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all duration-200 min-h-[44px] hover:shadow-[0_0_20px_rgba(255,106,0,0.3)]"
            style={{ background: 'linear-gradient(135deg, #ff6a00, #06b6d4)' }}
          >
            Desbloquear con Premium — $49/mes
          </Link>
        </div>
      )}

      {/* Comments */}
      <section id="comments">
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-fire-400" />
          Comentarios ({guide.comments.length})
        </h2>
        <div className="section-heading-separator mb-4" />
        <GuideComments guideId={guide.id} initialComments={guide.comments} />
      </section>

      {/* Back */}
      <div className="pt-4 border-t border-white/[0.06]">
        <Link
          href="/academy/guides"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-fire-400 transition-colors font-[family-name:var(--font-rajdhani)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a guías
        </Link>
      </div>
    </article>
  );
}
