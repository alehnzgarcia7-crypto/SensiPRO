'use client';

import { Lock, Check } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { getAvailableThemes, THEMES, type ThemeConfig } from '@/lib/themes/theme-config';
import { useTheme } from '@/lib/themes/theme-context';

interface ThemeSelectorProps {
  userTier: 'FREE' | 'PREMIUM' | 'VIP';
}

export function ThemeSelector({ userTier }: ThemeSelectorProps) {
  const { theme: current, setTheme } = useTheme();
  const available = getAvailableThemes(userTier);

  const canSelect = (t: ThemeConfig): boolean => available.some((a) => a.key === t.key);

  return (
    <div>
      <h3 className="font-display font-bold text-white mb-4">Tema visual</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {THEMES.map((t) => {
          const isAvailable = canSelect(t);
          const isActive = current.key === t.key;

          return (
            <button
              key={t.key}
              onClick={() => isAvailable && setTheme(t.key)}
              disabled={!isAvailable}
              className={cn(
                'glass p-4 text-center transition-all min-h-[44px]',
                isActive && 'border-white/20 shadow-lg',
                !isAvailable && 'opacity-50 cursor-not-allowed',
              )}
            >
              {/* Preview del gradiente */}
              <div
                className="w-full h-8 rounded-lg mb-3"
                style={{ background: t.preview }}
              />

              <p className="text-sm font-display font-bold text-white">{t.nameEs}</p>

              <div className="mt-1 flex items-center justify-center gap-1">
                {isActive && <Check size={12} className="text-success" />}
                {!isAvailable && <Lock size={12} className="text-slate-500" />}
                {t.tier !== 'FREE' && (
                  <Badge variant={t.tier === 'VIP' ? 'vip' : 'premium'} size="sm">
                    {t.tier}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
