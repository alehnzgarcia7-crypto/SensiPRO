// ═══════════════════════════════════════════════════════════════
// ARES-800 — Metadata Builder
// Generador de Metadata dinámica para todas las rutas:
// devices, guías, marcas, generador. Canonicals y hreflang.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';

const BASE_URL = 'https://sensibilidadespro.com';
const SITE_NAME = 'Sensibilidades PRO';

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const url = `${BASE_URL}${input.path}`;
  const ogImage = input.ogImage ?? `${BASE_URL}/og-image.png`;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url,
      languages: { 'es-MX': url, 'es': url },
    },
    openGraph: {
      type: input.type ?? 'website',
      url,
      title: input.title,
      description: input.description,
      siteName: SITE_NAME,
      locale: 'es_MX',
      images: [{ url: ogImage, width: 1200, height: 630 }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildDeviceMetadata(device: {
  brand: string;
  model: string;
  slug: string;
  tier: string;
}): Metadata {
  return buildMetadata({
    title: `Sensibilidad ${device.brand} ${device.model} — Free Fire`,
    description: `Configuración de sensibilidad para ${device.brand} ${device.model} en Free Fire. Valores ajustados para dispositivo ${device.tier}. Generador PRO gratuito.`,
    path: `/devices/${device.slug}`,
    ogImage: `${BASE_URL}/api/og/device/${device.slug}`,
  });
}

export function buildGuideMetadata(guide: {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt?: Date;
  updatedAt?: Date;
}): Metadata {
  return buildMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/academy/${guide.slug}`,
    type: 'article',
    publishedTime: guide.publishedAt?.toISOString(),
    modifiedTime: guide.updatedAt?.toISOString(),
  });
}

export function buildBrandMetadata(brand: string, deviceCount: number): Metadata {
  return buildMetadata({
    title: `Sensibilidades ${brand} — Free Fire | ${deviceCount} dispositivos`,
    description: `Configuraciones de sensibilidad para todos los dispositivos ${brand} en Free Fire. ${deviceCount} modelos con ajustes calibrados.`,
    path: `/devices/brand/${brand.toLowerCase()}`,
  });
}
