import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, MessageSquare } from 'lucide-react';

import { prisma } from '@ares/database';
import { Badge } from '@/components/ui/badge';
import { SocialShare } from '@/components/community/social-share';

// ═══════════════════════════════════════════════════════════════
// Pagina de config compartida individual
// URL: /community/[configId]
// Incluye OG metadata dinamico para previews en redes sociales
// ═══════════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ configId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { configId } = await params;

  const config = await prisma.sharedConfig.findUnique({
    where: { id: configId },
    include: {
      user: { select: { username: true } },
      device: { select: { brand: true, model: true } },
    },
  });

  if (!config) {
    return { title: 'Config no encontrada | SensiPRO' };
  }

  const description = `Config ${config.style} para ${config.device.brand} ${config.device.model} por ${config.user.username} — ${config.votes} votos`;

  return {
    title: `${config.title} | SensiPRO`,
    description,
    openGraph: {
      title: config.title,
      description,
      type: 'article',
      siteName: 'Sensibilidades PRO',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description,
    },
  };
}

export default async function SharedConfigPage({ params }: PageProps) {
  const { configId } = await params;

  const config = await prisma.sharedConfig.findUnique({
    where: { id: configId },
    include: {
      user: { select: { username: true, tier: true } },
      device: { select: { brand: true, model: true, screenHz: true, ramGb: true, panelType: true, tier: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!config) {
    notFound();
  }

  const sensitivity = await prisma.sensitivity.findUnique({
    where: { deviceId_style: { deviceId: config.deviceId, style: config.style } },
  });

  const styleColors: Record<string, string> = {
    AGGRESSIVE: 'text-red-400',
    BALANCED: 'text-blue-400',
    SNIPER: 'text-green-400',
  };

  const styleEmoji: Record<string, string> = {
    AGGRESSIVE: '\u2694\uFE0F',
    BALANCED: '\uD83C\uDFAF',
    SNIPER: '\uD83D\uDD2D',
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} />
        Volver a comunidad
      </Link>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {config.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Por <span className="text-white">{config.user.username}</span>
              <Badge variant={config.user.tier === 'VIP' ? 'vip' : config.user.tier === 'PREMIUM' ? 'premium' : 'free'} size="sm" className="ml-2">
                {config.user.tier}
              </Badge>
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <ThumbsUp size={14} /> {config.votes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={14} /> {config._count.comments}
            </span>
          </div>
        </div>

        {/* Dispositivo */}
        <div className="rounded-lg bg-white/5 border border-white/5 p-4 mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dispositivo</p>
          <p className="text-white font-semibold">
            {config.device.brand} {config.device.model}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {config.device.screenHz}Hz \u2022 {config.device.ramGb}GB RAM \u2022 {config.device.panelType} \u2022 {config.device.tier}
          </p>
        </div>

        {/* Estilo */}
        <div className="mb-4">
          <span className={`text-sm font-semibold ${styleColors[config.style] ?? 'text-slate-300'}`}>
            {styleEmoji[config.style] ?? ''} {config.style}
          </span>
        </div>

        {/* Descripcion */}
        {config.description && (
          <p className="text-sm text-slate-300 mb-4">{config.description}</p>
        )}

        {/* Valores de sensibilidad */}
        {sensitivity && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {([
              { label: 'General', value: sensitivity.general },
              { label: 'Red Point', value: sensitivity.redPoint },
              { label: 'Scope 2x', value: sensitivity.scope2x },
              { label: 'Scope 4x', value: sensitivity.scope4x },
              { label: 'Sniper', value: sensitivity.sniperScope },
              { label: 'Free View', value: sensitivity.freeView },
            ] as const).map((item) => (
              <div key={item.label} className="rounded-lg bg-white/5 border border-white/5 p-3 text-center">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-xl font-bold text-white mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Social Share */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-slate-500 mb-2">Compartir esta config</p>
          <SocialShare
            title={config.title}
            url={`/community/${config.id}`}
            text={`${styleEmoji[config.style] ?? ''} Config ${config.style} para ${config.device.brand} ${config.device.model} en SensiPRO`}
          />
        </div>
      </div>
    </div>
  );
}
