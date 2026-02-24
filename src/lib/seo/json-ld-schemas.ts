// ═══════════════════════════════════════════════════════════════
// ARES-800 — JSON-LD Schemas
// Schema.org estructurado: WebApplication, HowTo (devices),
// FAQPage, Article, BreadcrumbList
// Complementa a structured-data.ts de ARES-305
// ═══════════════════════════════════════════════════════════════

const BASE_URL = 'https://sensibilidadespro.com';

export function webApplicationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sensibilidades PRO',
    alternateName: 'SensiPRO',
    url: BASE_URL,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Android, iOS, Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'MXN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
    },
    description: 'Generador de sensibilidades perfectas para Free Fire basado en tu dispositivo.',
    inLanguage: 'es-MX',
  };
}

export function deviceHowToSchema(device: {
  brand: string;
  model: string;
  slug: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Cómo configurar la sensibilidad del ${device.brand} ${device.model} en Free Fire`,
    description: `Guía paso a paso para obtener la sensibilidad perfecta en tu ${device.brand} ${device.model}.`,
    totalTime: 'PT2M',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Selecciona tu dispositivo',
        text: `Busca "${device.brand} ${device.model}" en el generador de sensibilidades.`,
        url: `${BASE_URL}/generator`,
      },
      {
        '@type': 'HowToStep',
        name: 'Elige tu estilo de juego',
        text: 'Selecciona Balanceado, Agresivo, o Francotirador según tu playstyle.',
      },
      {
        '@type': 'HowToStep',
        name: 'Aplica los valores',
        text: 'Copia los valores generados a la configuración de sensibilidad de Free Fire.',
      },
      {
        '@type': 'HowToStep',
        name: 'Ajusta en entrenamiento',
        text: 'Entra a la sala de entrenamiento y practica con los nuevos valores.',
      },
    ],
  };
}

export function faqSchema(
  faqs: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  authorName?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: `${BASE_URL}/academy/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Organization',
      name: article.authorName ?? 'SensiPRO Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sensibilidades PRO',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icons/icon-512x512.png` },
    },
    inLanguage: 'es-MX',
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
