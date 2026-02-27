// ═══════════════════════════════════════════════════════════════
// Table of Contents — Sidebar sticky (desktop) OR collapsible (mobile)
// Usa variant="sidebar" para desktop y variant="mobile" para mobile.
// Nunca renderizar ambos en el mismo punto del DOM para evitar duplicados.
// ═══════════════════════════════════════════════════════════════

'use client';

import { ChevronDown, List } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { GuideSection } from '@/lib/academy/guide-content';
import { cn } from '@/lib/cn';

interface GuideTocProps {
  sections: GuideSection[];
  variant: 'sidebar' | 'mobile';
}

export function GuideToc({ sections, variant }: GuideTocProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Intersection Observer para resaltar sección activa
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      setMobileOpen(false);
    }
  }, []);

  // Desktop — Sticky sidebar (solo visible en lg+)
  if (variant === 'sidebar') {
    return (
      <nav className="hidden lg:block sticky top-24 z-10 w-64 flex-shrink-0 self-start">
        <div className="glass-card p-4">
          <h3 className="text-xs font-[family-name:var(--font-rajdhani)] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <List className="w-3.5 h-3.5" />
            Contenido
          </h3>
          <ul className="space-y-1">
            {sections.map((section, index) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollTo(section.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 flex items-center gap-2',
                    activeId === section.id
                      ? 'bg-fire-500/10 text-fire-400 border border-fire-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]',
                  )}
                >
                  <span
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center font-numbers text-[10px] font-bold',
                      activeId === section.id
                        ? 'bg-fire-500/20 text-fire-400'
                        : 'bg-white/[0.06] text-slate-500',
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate font-[family-name:var(--font-rajdhani)] font-medium leading-tight">
                    {section.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }

  // Mobile — Collapsible dropdown (solo visible por debajo de lg)
  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="w-full glass-card p-3 flex items-center justify-between"
      >
        <span className="text-xs font-[family-name:var(--font-rajdhani)] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <List className="w-3.5 h-3.5" />
          Tabla de contenidos
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200',
            mobileOpen && 'rotate-180',
          )}
        />
      </button>

      {mobileOpen && (
        <div className="glass-card mt-1 p-2 space-y-0.5">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 min-h-[44px]',
                activeId === section.id
                  ? 'bg-fire-500/10 text-fire-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]',
              )}
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center font-numbers text-[10px] font-bold bg-white/[0.06] text-slate-500">
                {index + 1}
              </span>
              <span className="font-[family-name:var(--font-rajdhani)] font-medium">
                {section.title}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
