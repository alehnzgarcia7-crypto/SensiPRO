'use client';

import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useState } from 'react';

import { canAccessSection } from '@/lib/academy/academy-config';
import { cn } from '@/lib/cn';

interface Section {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  isPremium: boolean;
}

interface GuideSectionsProps {
  sections: Section[];
  userTier: 'FREE' | 'PREMIUM' | 'VIP';
}

export function GuideSections({ sections, userTier }: GuideSectionsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(sections.length > 0 && sections[0] ? [sections[0].id] : []),
  );

  function toggleSection(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (sections.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide">
        Secciones
      </h2>
      <div className="section-heading-separator mb-4" />

      {sections.map((section, index) => {
        const isExpanded = expandedIds.has(section.id);
        const canAccess = canAccessSection(userTier, section.isPremium);

        return (
          <div
            key={section.id}
            className={cn(
              'glass-card overflow-hidden transition-all duration-300',
              isExpanded && 'border-fire-500/20',
            )}
          >
            <button
              onClick={() => canAccess && toggleSection(section.id)}
              className={cn(
                'w-full flex items-center justify-between p-4 text-left transition-all duration-200',
                canAccess
                  ? 'hover:bg-white/[0.03] cursor-pointer'
                  : 'cursor-not-allowed opacity-60',
              )}
              disabled={!canAccess}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-numbers text-xs font-bold"
                  style={{
                    background: isExpanded
                      ? 'linear-gradient(135deg, #ff6a00, #c2410c)'
                      : 'rgba(255, 106, 0, 0.15)',
                    color: isExpanded ? 'white' : '#fb923c',
                    boxShadow: isExpanded ? '0 0 12px rgba(255, 106, 0, 0.3)' : undefined,
                  }}
                >
                  {index + 1}
                </span>
                <span className="font-[family-name:var(--font-rajdhani)] font-medium text-white text-sm">
                  {section.title}
                </span>
                {section.isPremium && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                    <Lock className="w-2.5 h-2.5" />
                    PRO
                  </span>
                )}
              </div>

              {canAccess ? (
                isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )
              ) : (
                <Lock className="w-4 h-4 text-yellow-500" />
              )}
            </button>

            {isExpanded && canAccess && (
              <div className="px-4 pb-4 pt-0">
                <div className="pl-10 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-fire-400">
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              </div>
            )}

            {!canAccess && (
              <div className="px-4 pb-4 pt-0">
                <div className="pl-10 text-sm text-slate-500 flex items-center gap-2">
                  <Lock className="w-3 h-3 text-yellow-500" />
                  Upgrade a Premium para desbloquear esta sección
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
