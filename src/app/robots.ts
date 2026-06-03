import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/internal/',
          '/profile/',
          '/payment/',
          '/_next/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/internal/', '/payment/'],
      },
    ],
    sitemap: 'https://sensibilidadespro.com/sitemap.xml',
    host: 'https://sensibilidadespro.com',
  };
}
