'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { CATEGORY_CONFIGS, CATEGORIES_ORDER } from '@/lib/academy/academy-config';
import type { GuideCategory } from '@prisma/client';

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
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => handleSelect(null)}
        className={cn(
          'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]',
          !selected
            ? 'bg-fire-500/20 text-fire-400 border border-fire-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent',
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
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]',
              isSelected
                ? 'bg-fire-500/20 text-fire-400 border border-fire-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent',
            )}
          >
            <Icon className="w-4 h-4" />
            {config.nameEs}
            {count !== undefined && (
              <span className="text-xs text-slate-500">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
