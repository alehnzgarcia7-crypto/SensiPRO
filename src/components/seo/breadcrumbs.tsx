// ═══════════════════════════════════════════════════════════════
// ARES-305 — Breadcrumbs con JSON-LD Schema
// Navegación jerárquica accesible + structured data para SEO
// ═══════════════════════════════════════════════════════════════

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { JsonLd } from './json-ld';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

const DEFAULT_BASE_URL = 'https://sensibilidadespro.com';

export function Breadcrumbs({ items, baseUrl = DEFAULT_BASE_URL }: BreadcrumbsProps) {
  const schemaItems = [
    { name: 'Inicio', url: baseUrl },
    ...items.map((item) => ({ name: item.label, url: `${baseUrl}${item.href}` })),
  ];

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(schemaItems)} />
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-slate-500 overflow-x-auto scrollbar-hide"
      >
        <Link
          href="/"
          className="flex-shrink-0 hover:text-slate-300 transition-colors"
          aria-label="Inicio"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <span key={item.href} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-600" />
              {isLast ? (
                <span className="text-slate-300 truncate max-w-[200px]">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-slate-300 transition-colors truncate max-w-[150px]"
                >
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
