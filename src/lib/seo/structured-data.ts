// ═══════════════════════════════════════════════════════════════
// ARES-305 — Structured Data (Schema.org)
// Genera JSON-LD para Article, HowTo, FAQPage, BreadcrumbList
// ═══════════════════════════════════════════════════════════════

const SITE_URL = 'https://sensibilidadespro.com';
const ORG_NAME = 'ARES SensiPRO';
const LOGO_URL = `${SITE_URL}/logo.png`;

// ── Interfaces ──────────────────────────────────────────────

export interface ArticleStructuredData {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedTime: string;
  modifiedTime: string;
  authorName: string;
  category: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// ── Generadores de Schema ───────────────────────────────────

/**
 * Schema.org Article — para guías individuales de la academia
 */
export function generateArticleSchema(data: ArticleStructuredData): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    url: data.url,
    ...(data.imageUrl ? { image: data.imageUrl } : {}),
    datePublished: data.publishedTime,
    dateModified: data.modifiedTime,
    author: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    articleSection: data.category,
    inLanguage: 'es-MX',
  };
}

/**
 * Schema.org HowTo — para guías de tipo tutorial paso a paso
 */
export function generateHowToSchema(
  title: string,
  description: string,
  steps: HowToStep[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
    inLanguage: 'es-MX',
  };
}

/**
 * Schema.org FAQPage — para secciones de preguntas frecuentes
 */
export function generateFAQSchema(items: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Schema.org BreadcrumbList — navegación jerárquica con JSON-LD
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Schema.org WebSite — datos generales del sitio
 */
export function generateWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: SITE_URL,
    description: 'Generador de Sensibilidades #1 para Free Fire',
    inLanguage: 'es-MX',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/devices?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
