import { ImageResponse } from 'next/og';

import { prisma } from '@ares/database';

// ═══════════════════════════════════════════════════════════════
// OG Image — Imagen dinamica Open Graph para configs compartidas
// Se genera en /community/[configId]/opengraph-image
// Preview automatico en WhatsApp, Twitter, Facebook, Telegram
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';
export const alt = 'Config compartida \u2014 SensiPRO';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface OGImageProps {
  params: Promise<{ configId: string }>;
}

export default async function OGImage({ params }: OGImageProps) {
  const { configId } = await params;

  const config = await prisma.sharedConfig.findUnique({
    where: { id: configId },
    include: {
      user: { select: { username: true, tier: true } },
      device: { select: { brand: true, model: true } },
    },
  });

  if (!config) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #050810 0%, #0f172a 100%)',
            color: 'white',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          SensiPRO
        </div>
      ),
      { ...size },
    );
  }

  const styleEmoji = config.style === 'AGGRESSIVE' ? '\u2694\uFE0F' : config.style === 'SNIPER' ? '\uD83D\uDD2D' : '\uD83C\uDFAF';

  const styleColor = config.style === 'AGGRESSIVE' ? '#ef4444' : config.style === 'SNIPER' ? '#22c55e' : '#3b82f6';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #050810 0%, #0f172a 50%, #1e1b4b 100%)',
          color: 'white',
          padding: 80,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#ff6a00',
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase' as const,
          }}
        >
          SENSIBILIDADES PRO
        </div>

        {/* Titulo de la config */}
        <div style={{ display: 'flex', fontSize: 48, fontWeight: 900, marginTop: 16 }}>
          {config.title}
        </div>

        {/* Estilo + dispositivo */}
        <div style={{ display: 'flex', fontSize: 28, color: '#94a3b8', marginTop: 12 }}>
          <span style={{ color: styleColor, marginRight: 8 }}>
            {styleEmoji} {config.style}
          </span>
          {' \u2014 '}
          {config.device.brand} {config.device.model}
        </div>

        {/* Autor + votos */}
        <div style={{ display: 'flex', fontSize: 22, color: '#64748b', marginTop: 24 }}>
          Por {config.user.username} ({config.user.tier}) \u2022 {config.votes} votos
        </div>
      </div>
    ),
    { ...size },
  );
}
