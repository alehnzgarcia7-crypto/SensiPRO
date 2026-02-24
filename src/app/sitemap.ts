import type { MetadataRoute } from 'next';

import { prisma } from '@ares/database';

const BASE_URL = 'https://sensibilidadespro.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/generator`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/devices`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/academy`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/academy/meta`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE_URL}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${BASE_URL}/tournaments`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Páginas de dispositivos (500+)
  const devices = await prisma.device.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  const devicePages: MetadataRoute.Sitemap = devices.map((d) => ({
    url: `${BASE_URL}/devices/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Páginas de marcas (agrupadas)
  const brands = await prisma.device.groupBy({
    by: ['brand'],
    _max: { updatedAt: true },
  });

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE_URL}/devices/brand/${b.brand.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: b._max.updatedAt ?? new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Páginas de guías publicadas
  const guides = await prisma.guide.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${BASE_URL}/academy/${g.slug}`,
    lastModified: g.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...devicePages, ...brandPages, ...guidePages];
}
