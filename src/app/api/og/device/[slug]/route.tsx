// ═══════════════════════════════════════════════════════════════
// ARES-802 — OG Image: Device
// Genera imagen Open Graph dinámica (1200×630) para cada dispositivo.
// Usado por: WhatsApp preview, Twitter Cards, Facebook, Telegram.
// ═══════════════════════════════════════════════════════════════

import { ImageResponse } from 'next/og';

import { prisma } from '@ares/database';

const TIER_COLORS: Record<string, string> = {
  GAMING: '#a855f7',
  ULTRA: '#3b82f6',
  HIGH: '#22c55e',
  MID: '#f59e0b',
  LOW: '#64748b',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<ImageResponse> {
  const { slug } = await params;

  const device = await prisma.device.findUnique({
    where: { slug },
    select: { brand: true, model: true, tier: true, screenHz: true, ramGb: true },
  });

  if (!device) {
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
          SensiPRO
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const tierColor = TIER_COLORS[device.tier] ?? '#64748b';

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
            SENSIBILIDADES PRO
          </div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, color: 'white', marginTop: 16 }}>
          {device.brand} {device.model}
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          <div
            style={{
              background: tierColor,
              color: 'white',
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {device.tier}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 20 }}>
            {device.screenHz}Hz &bull; {device.ramGb}GB RAM
          </div>
        </div>
        <div style={{ fontSize: 22, color: '#475569', marginTop: 32 }}>
          Configuración de sensibilidad perfecta para Free Fire
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
