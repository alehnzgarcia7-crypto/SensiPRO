import { prisma } from '@ares/database';
import { Search, Trophy, Share2 } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';


import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getTierConfig } from '@/lib/tiers';

// ══════════════════════════════════════════════════════════
// Perfil público de usuario /u/[username]
// Visible para cualquier persona autenticada
// Muestra: avatar, tier, bio, stats, logros, configs compartidas
// ══════════════════════════════════════════════════════════

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true },
  });

  if (!user) {
    return { title: 'Usuario no encontrado | SensiPRO' };
  }

  return {
    title: `${user.username} | SensiPRO`,
    description: `Perfil de ${user.username} en Sensibilidades PRO — estadísticas, logros y configs compartidas.`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      avatarUrl: true,
      bio: true,
      tier: true,
      totalSearches: true,
      totalFavorites: true,
      createdAt: true,
      _count: { select: { achievements: true, sharedConfigs: true } },
    },
  });

  if (!user) notFound();

  const tierConfig = getTierConfig(user.tier);

  const badgeVariant = user.tier === 'VIP'
    ? 'vip' as const
    : user.tier === 'PREMIUM'
      ? 'premium' as const
      : 'free' as const;

  const stats = [
    { icon: Search, label: 'Búsquedas', value: user.totalSearches },
    { icon: Trophy, label: 'Logros', value: user._count.achievements },
    { icon: Share2, label: 'Configs', value: user._count.sharedConfigs },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header centrado */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-background-elevated flex items-center justify-center text-3xl border-2 border-white/10 mb-3">
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
        <h1 className="text-2xl font-display font-bold text-white">{user.username}</h1>
        <Badge variant={badgeVariant} className="mt-1">
          {tierConfig.icon} {user.tier}
        </Badge>
        {user.bio && (
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">{user.bio}</p>
        )}
        <p className="text-xs text-slate-600 mt-2">
          Miembro desde {new Date(user.createdAt).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 text-center">
              <Icon size={16} className="mx-auto text-slate-500 mb-1" />
              <p className="text-xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
