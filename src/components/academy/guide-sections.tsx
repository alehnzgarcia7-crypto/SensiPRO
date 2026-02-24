'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { canAccessSection } from '@/lib/academy/academy-config';

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
      <h2 className="text-xl font-bold text-white">Secciones</h2>

      {sections.map((section, index) => {
        const isExpanded = expandedIds.has(section.id);
        const canAccess = canAccessSection(userTier, section.isPremium);

        return (
          <div
            key={section.id}
            className={cn(
              'rounded-xl border overflow-hidden transition-colors',
              isExpanded
                ? 'border-fire-500/30 bg-fire-500/5'
                : 'border-white/10 bg-background-card/50',
            )}
          >
            <button
              onClick={() => canAccess && toggleSection(section.id)}
              className={cn(
                'w-full flex items-center justify-between p-4 text-left transition-colors',
                canAccess
                  ? 'hover:bg-white/5 cursor-pointer'
                  : 'cursor-not-allowed opacity-60',
              )}
              disabled={!canAccess}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-fire-500/20 flex items-center justify-center text-xs font-bold text-fire-400">
                  {index + 1}
                </span>
                <span className="font-medium text-white text-sm">{section.title}</span>
                {section.isPremium && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">
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
