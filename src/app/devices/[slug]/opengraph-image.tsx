import { ImageResponse } from 'next/og';

import { prisma } from '@ares/database';

// ═══════════════════════════════════════════════════════════════
// OG Image — Imagen dinámica para Open Graph por dispositivo
// Se genera en /devices/[slug]/opengraph-image → preview en redes
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';
export const alt = 'Sensibilidades PRO \u2014 Free Fire';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface OGImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OGImage({ params }: OGImageProps) {
  const { slug } = await params;

  const device = await prisma.device.findUnique({
    where: { slug },
    select: { brand: true, model: true, tier: true, screenHz: true, ramGb: true, panelType: true },
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
            background: 'linear-gradient(135deg, #050810 0%, #0f172a 100%)',
            color: 'white',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Sensibilidades PRO
        </div>
      ),
      { ...size },
    );
  }

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
        {/* Logo / marca */}
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
          Sensibilidades PRO
        </div>

        {/* Nombre del dispositivo */}
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 900, marginTop: 16 }}>
          {device.brand} {device.model}
        </div>

        {/* Specs del dispositivo */}
        <div style={{ display: 'flex', fontSize: 28, color: '#94a3b8', marginTop: 12, gap: 16 }}>
          {device.screenHz}Hz \u2022 {device.ramGb}GB RAM \u2022 {device.panelType} \u2022 Tier {device.tier}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', fontSize: 22, color: '#64748b', marginTop: 40 }}>
          Genera sensibilidades basadas en hardware real \u2192 sensibilidadespro.com
        </div>
      </div>
    ),
    { ...size },
  );
}
