// ═══════════════════════════════════════════════════════════════
// ARES-802 — OG Image: Guide
// Genera imagen Open Graph dinámica (1200×630) para cada guía.
// Usado por: WhatsApp preview, Twitter Cards, Facebook, Telegram.
// ═══════════════════════════════════════════════════════════════

import { ImageResponse } from 'next/og';

import { prisma } from '@ares/database';

const CATEGORY_EMOJI: Record<string, string> = {
  SENSITIVITY: '🎯',
  MOVEMENT: '🏃',
  AIM: '🔫',
  STRATEGY: '🧠',
  DEVICE: '📱',
  META: '⚡',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<ImageResponse> {
  const { slug } = await params;

  const guide = await prisma.guide.findUnique({
    where: { slug },
    select: { title: true, category: true, isPremium: true, readTimeMin: true },
  });

  if (!guide) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: '#050810',
            color: 'white',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          SensiPRO Academy
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const emoji = CATEGORY_EMOJI[guide.category] ?? '📖';
  const tierLabel = guide.isPremium ? 'Premium' : 'Gratis';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #050810 0%, #0f1729 100%)',
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div
            style={{
              background: '#ff6a00',
              color: 'white',
              padding: '4px 16px',
              borderRadius: 4,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            ACADEMIA PRO
          </div>
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: 'white',
            marginTop: 16,
            lineHeight: 1.2,
          }}
        >
          {emoji} {guide.title}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 24, color: '#94a3b8', fontSize: 20 }}>
          <span>{guide.readTimeMin} min lectura</span>
          <span>&bull;</span>
          <span>{tierLabel}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
