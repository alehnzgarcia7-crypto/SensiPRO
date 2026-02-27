import { prisma } from '@ares/database';
import { redirect } from 'next/navigation';


import { Badge } from '@/components/ui/badge';
import { ACHIEVEMENTS } from '@/lib/achievements/achievement-definitions';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/cn';

// Colores del borde por tier del logro
const TIER_COLORS: Record<string, string> = {
  BRONZE: 'border-amber-700/40',
  SILVER: 'border-slate-400/40',
  GOLD: 'border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
  LEGENDARY: 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
};

// Mapea tier del logro a variante del Badge
const TIER_BADGE_VARIANT: Record<string, 'free' | 'premium' | 'vip' | 'default'> = {
  BRONZE: 'default',
  SILVER: 'free',
  GOLD: 'premium',
  LEGENDARY: 'vip',
};

export const metadata = {
  title: 'Logros | Sensibilidades PRO',
  description: 'Desbloquea logros y demuestra tu nivel en Sensibilidades PRO',
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const unlocked = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    select: {
      achievement: { select: { key: true } },
      unlockedAt: true,
    },
  });

  const unlockedMap = new Map(
    unlocked.map((u) => [u.achievement.key, u.unlockedAt]),
  );

  const totalPoints = ACHIEVEMENTS.filter((a) => unlockedMap.has(a.key))
    .reduce((sum, a) => sum + a.points, 0);

  const categories = ['SEARCH', 'SOCIAL', 'PREMIUM', 'SPECIAL'] as const;
  const categoryLabels: Record<string, string> = {
    SEARCH: 'Búsqueda',
    SOCIAL: 'Social',
    PREMIUM: 'Premium',
    SPECIAL: 'Especiales',
  };
  const categoryIcons: Record<string, string> = {
    SEARCH: '🔍',
    SOCIAL: '👥',
    PREMIUM: '⭐',
    SPECIAL: '🎭',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Logros
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            {unlockedMap.size}/{ACHIEVEMENTS.length} desbloqueados
          </span>
          <span className="text-yellow-500 font-semibold">
            {totalPoints} puntos
          </span>
        </div>
        {/* Barra de progreso */}
        <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 transition-all duration-700"
            style={{ width: `${(unlockedMap.size / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Logros por categoría */}
      {categories.map((cat) => {
        const catAchievements = ACHIEVEMENTS.filter((a) => a.category === cat);
        const catUnlocked = catAchievements.filter((a) => unlockedMap.has(a.key)).length;

        return (
          <section key={cat} className="mb-8">
            <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
              <span>{categoryIcons[cat]}</span>
              {categoryLabels[cat]}
              <span className="text-xs text-slate-500 font-normal ml-auto">
                {catUnlocked}/{catAchievements.length}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {catAchievements.map((a) => {
                const isUnlocked = unlockedMap.has(a.key);
                const unlockedAt = unlockedMap.get(a.key);

                return (
                  <div
                    key={a.key}
                    className={cn(
                      'relative rounded-xl border bg-white/[0.02] p-4 text-center transition-all duration-300',
                      isUnlocked
                        ? TIER_COLORS[a.tier]
                        : 'border-white/5 opacity-40 grayscale',
                    )}
                  >
                    <span className="text-3xl block mb-2">{a.icon}</span>
                    <p className="font-display font-bold text-white text-xs leading-tight">
                      {a.nameEs}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                      {a.description}
                    </p>
                    <Badge
                      variant={TIER_BADGE_VARIANT[a.tier] ?? 'default'}
                      size="sm"
                      className="mt-2"
                    >
                      {a.tier}
                    </Badge>
                    {isUnlocked && unlockedAt && (
                      <p className="text-[9px] text-slate-600 mt-1">
                        {new Date(unlockedAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                    {isUnlocked && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
