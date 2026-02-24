// ═══════════════════════════════════════════════════════════════
// ARES-305 — Sitemap dinámico de Academia
// Genera sitemap XML con todas las guías publicadas + páginas estáticas
// ═══════════════════════════════════════════════════════════════

import type { MetadataRoute } from 'next';
import { prisma } from '@ares/database';

const BASE_URL = 'https://sensibilidadespro.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const guides = await prisma.guide.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/academy`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
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

  const guidePages: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${BASE_URL}/academy/guides/${guide.slug}`,
    lastModified: guide.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...guidePages];
}
