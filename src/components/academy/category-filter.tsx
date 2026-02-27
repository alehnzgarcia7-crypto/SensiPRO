'use client';

import type { GuideCategory } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

import { CATEGORY_CONFIGS, CATEGORIES_ORDER } from '@/lib/academy/academy-config';
import { cn } from '@/lib/cn';

interface CategoryFilterProps {
  selected?: GuideCategory | null;
  counts?: Record<GuideCategory, number>;
}

export function CategoryFilter({ selected, counts }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(category: GuideCategory | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/academy/guides?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory md:snap-none">
      {/* Todas */}
      <button
        onClick={() => handleSelect(null)}
        className={cn(
          'flex-shrink-0 snap-start px-4 py-2 rounded-xl text-sm font-[family-name:var(--font-rajdhani)] font-semibold uppercase tracking-wide transition-all duration-200 min-h-[44px] border',
          !selected
            ? 'bg-fire-500/15 text-fire-400 border-fire-500/30 shadow-[0_0_12px_rgba(255,106,0,0.15)]'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10',
        )}
      >
        Todas
      </button>

      {CATEGORIES_ORDER.map((key) => {
        const config = CATEGORY_CONFIGS[key];
        const count = counts?.[key];
        const isSelected = selected === key;
        const Icon = config.icon;

        return (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className={cn(
              'flex-shrink-0 snap-start flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-[family-name:var(--font-rajdhani)] font-semibold transition-all duration-200 min-h-[44px] border',
              isSelected
                ? 'text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10',
            )}
            style={{
              ...(isSelected
                ? {
                    backgroundColor: `${config.color}20`,
                    borderColor: `${config.color}40`,
                    color: config.color,
                    boxShadow: `0 0 12px ${config.color}25`,
                  }
                : {}),
            }}
          >
            <Icon className="w-4 h-4" />
            {config.nameEs}
            {count !== undefined && (
              <span className="font-numbers text-xs opacity-60">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
