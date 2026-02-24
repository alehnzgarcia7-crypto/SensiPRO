// ═══════════════════════════════════════════════════════════════
// ARES-305 — Academy SEO Meta Helpers
// Generadores de Metadata para páginas de academia
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';

const BASE_URL = 'https://sensibilidadespro.com';

interface AcademyMetaParams {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  type?: 'article' | 'website';
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Genera Metadata completa para páginas de academia
 * Incluye OpenGraph, Twitter Cards, canonical URL, robots
 */
export function generateAcademyMeta(params: AcademyMetaParams): Metadata {
  const {
    title,
    description,
    path,
    imageUrl,
    type = 'website',
    publishedTime,
    modifiedTime,
  } = params;
  const url = `${BASE_URL}${path}`;

  return {
    title: `${title} | ARES SensiPRO`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'ARES SensiPRO',
      locale: 'es_MX',
      type: type === 'article' ? 'article' : 'website',
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : [],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  };
}

/**
 * Busca guías previas y siguientes para navegación interna
 * Usa datos ya cargados para evitar queries extra
 */
export function generateInternalLinks(
  allSlugs: string[],
  currentSlug: string,
): { prev: string | null; next: string | null } {
  const currentIndex = allSlugs.indexOf(currentSlug);
  if (currentIndex === -1) return { prev: null, next: null };

  return {
    prev: currentIndex > 0 ? (allSlugs[currentIndex - 1] ?? null) : null,
    next: currentIndex < allSlugs.length - 1 ? (allSlugs[currentIndex + 1] ?? null) : null,
  };
}
