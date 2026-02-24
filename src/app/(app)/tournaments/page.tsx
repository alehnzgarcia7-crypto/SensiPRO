import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, Users, Calendar, Clock } from 'lucide-react';

import { prisma } from '@ares/database';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { TournamentStatus, UserTier } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Torneos | SensiPRO',
  description:
    'Participa en torneos con premios reales. Compite contra otros jugadores de Free Fire.',
};

const STATUS_LABELS: Record<TournamentStatus, string> = {
  UPCOMING: 'Próximo',
  ACTIVE: 'Activo',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

const STATUS_BADGE_VARIANT: Record<TournamentStatus, 'premium' | 'free' | 'default' | 'vip'> = {
  UPCOMING: 'default',
  ACTIVE: 'premium',
  COMPLETED: 'free',
  CANCELLED: 'default',
};

const TIER_BADGE_VARIANT: Record<UserTier, 'free' | 'premium' | 'vip'> = {
  FREE: 'free',
  PREMIUM: 'premium',
  VIP: 'vip',
};

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: [
      { status: 'asc' },
      { startDate: 'desc' },
    ],
    take: 20,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      maxParticipants: true,
      prizeDescription: true,
      entryTier: true,
      _count: { select: { entries: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Trophy size={28} className="text-tier-vip" />
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Torneos
          </h1>
          <p className="text-sm text-slate-400">
            Compite y gana premios reales
          </p>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">
            No hay torneos disponibles en este momento
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Vuelve pronto para nuevos torneos
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tournaments.map((t) => {
            const isActive =
              t.status === 'ACTIVE' || t.status === 'UPCOMING';

            return (
              <Link key={t.id} href={`/tournaments/${t.id}`}>
                <Card
                  variant={isActive ? 'glow' : 'default'}
                  className="p-5 transition-colors hover:border-fire-500/20"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-display font-bold text-white">
                      {t.title}
                    </h3>
                    <Badge
                      variant={STATUS_BADGE_VARIANT[t.status]}
                      size="sm"
                    >
                      {STATUS_LABELS[t.status]}
                    </Badge>
                  </div>

                  {t.description && (
                    <p className="mb-3 text-sm text-slate-400 line-clamp-2">
                      {t.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {t._count.entries}
                      {t.maxParticipants ? `/${t.maxParticipants}` : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(t.startDate).toLocaleDateString('es-MX')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(t.endDate).toLocaleDateString('es-MX')}
                    </span>
                    <Badge
                      variant={TIER_BADGE_VARIANT[t.entryTier]}
                      size="sm"
                    >
                      {t.entryTier}
                    </Badge>
                  </div>

                  {t.prizeDescription && (
                    <p className="mt-2 text-xs text-tier-vip">
                      <Trophy size={12} className="mr-1 inline" />
                      {t.prizeDescription}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
