import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Settings, Crown, Users, History, Heart, Trophy } from 'lucide-react';

import { auth } from '@/lib/auth';
import { prisma } from '@ares/database';
import { getTierConfig } from '@/lib/tiers';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// ══════════════════════════════════════════════════════════
// Perfil privado del usuario autenticado
// Dashboard con avatar, tier badge, stats, y menú de navegación
// ══════════════════════════════════════════════════════════

export const metadata = {
  title: 'Mi Perfil | Sensibilidades PRO',
  description: 'Tu perfil, estadísticas y configuraciones en SensiPRO.',
};

async function getProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      tier: true,
      tierExpiresAt: true,
      totalSearches: true,
      totalFavorites: true,
      referralCount: true,
      createdAt: true,
      _count: { select: { achievements: true, sharedConfigs: true } },
    },
  });
  return user;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await getProfileData(session.user.id);
  if (!user) redirect('/login');

  const tierConfig = getTierConfig(user.tier);

  const badgeVariant = user.tier === 'VIP'
    ? 'vip' as const
    : user.tier === 'PREMIUM'
      ? 'premium' as const
      : 'free' as const;

  const stats = [
    { icon: History, label: 'Búsquedas', value: user.totalSearches },
    { icon: Heart, label: 'Favoritos', value: user.totalFavorites },
    { icon: Users, label: 'Referidos', value: user.referralCount },
    { icon: Trophy, label: 'Logros', value: user._count.achievements },
  ];

  const menuItems = [
    { href: '/profile/edit', label: 'Editar Perfil', icon: Settings },
    { href: '/profile/subscription', label: 'Suscripción', icon: Crown },
    { href: '/profile/referrals', label: 'Referidos', icon: Users },
    { href: '/favorites', label: 'Favoritos', icon: Heart },
    { href: '/history', label: 'Historial', icon: History },
    { href: '/achievements', label: 'Logros', icon: Trophy },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header del perfil */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center text-2xl border-2 border-white/10">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-bold text-white">{user.username}</h1>
            <Badge variant={badgeVariant}>
              {tierConfig.icon} {user.tier}
            </Badge>
          </div>
          {user.bio && (
            <p className="text-sm text-slate-400 mt-0.5">{user.bio}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Miembro desde {new Date(user.createdAt).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 text-center">
              <Icon size={18} className="mx-auto text-slate-500 mb-1" />
              <p className="text-xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Menú de navegación */}
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div className="glass-hover p-4 flex items-center gap-3 min-h-[44px] rounded-gaming">
                <Icon size={18} className="text-slate-400" />
                <span className="text-sm font-ui font-medium text-white">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
