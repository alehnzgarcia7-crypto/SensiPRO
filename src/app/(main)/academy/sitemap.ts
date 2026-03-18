// ═══════════════════════════════════════════════════════════════
// ARES-305 — Sitemap dinámico de Academia
// Genera sitemap XML con guías de guide-content.ts + páginas estáticas
// ═══════════════════════════════════════════════════════════════

import type { MetadataRoute } from 'next';

import { ALL_GUIDE_SLUGS } from '@/lib/academy/guide-content';

const BASE_URL = 'https://sensibilidadespro.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/academy`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/academy/como-funciona`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/academy/guides`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/academy/tips`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/academy/meta`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/academy/videos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const guidePages: MetadataRoute.Sitemap = ALL_GUIDE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/academy/guides/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...guidePages];
}
