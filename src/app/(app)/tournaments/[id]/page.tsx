import { prisma } from '@ares/database';
import type { TournamentStatus, UserTier } from '@prisma/client';
import { Trophy, Users, Calendar, Clock, ArrowLeft, Crown } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { canAccessTier } from '@/lib/tiers';


import { JoinTournamentButton } from './join-button';

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

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getTournament(id: string) {
  return prisma.tournament.findUnique({
    where: { id },
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
      createdAt: true,
      _count: { select: { entries: true } },
      entries: {
        orderBy: [
          { score: 'desc' },
          { joinedAt: 'asc' },
        ],
        take: 50,
        select: {
          id: true,
          score: true,
          rank: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              tier: true,
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) return { title: 'Torneo no encontrado | SensiPRO' };

  return {
    title: `${tournament.title} | Torneos SensiPRO`,
    description:
      tournament.description ??
      `Torneo de Free Fire — ${tournament._count.entries} participantes`,
  };
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) notFound();

  const session = await auth();
  const userTier = (session?.user?.tier as UserTier) ?? 'FREE';
  const canJoin = canAccessTier(userTier, tournament.entryTier);
  const isAccepting =
    tournament.status === 'ACTIVE' || tournament.status === 'UPCOMING';
  const isFull =
    tournament.maxParticipants !== null &&
    tournament._count.entries >= tournament.maxParticipants;

  // Verificar si el usuario ya está inscrito
  let isJoined = false;
  if (session?.user?.id) {
    const entry = await prisma.tournamentEntry.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId: tournament.id,
          userId: session.user.id,
        },
      },
      select: { id: true },
    });
    isJoined = entry !== null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Navegación */}
      <Link
        href="/tournaments"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Volver a torneos
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={28} className="text-tier-vip" />
          <h1 className="text-3xl font-display font-bold text-white">
            {tournament.title}
          </h1>
          <Badge
            variant={STATUS_BADGE_VARIANT[tournament.status]}
            size="md"
          >
            {STATUS_LABELS[tournament.status]}
          </Badge>
        </div>
        {tournament.description && (
          <p className="text-slate-400">{tournament.description}</p>
        )}
      </div>

      {/* Info grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4 text-center">
          <Users size={18} className="mx-auto mb-1 text-slate-400" />
          <p className="text-lg font-bold text-white">
            {tournament._count.entries}
            {tournament.maxParticipants
              ? `/${tournament.maxParticipants}`
              : ''}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Participantes
          </p>
        </Card>
        <Card className="p-4 text-center">
          <Calendar size={18} className="mx-auto mb-1 text-slate-400" />
          <p className="text-sm font-bold text-white">
            {new Date(tournament.startDate).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Inicio
          </p>
        </Card>
        <Card className="p-4 text-center">
          <Clock size={18} className="mx-auto mb-1 text-slate-400" />
          <p className="text-sm font-bold text-white">
            {new Date(tournament.endDate).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Fin
          </p>
        </Card>
        <Card className="p-4 text-center">
          <Crown size={18} className="mx-auto mb-1 text-tier-vip" />
          <Badge
            variant={TIER_BADGE_VARIANT[tournament.entryTier]}
            size="md"
          >
            {tournament.entryTier}
          </Badge>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
            Tier mínimo
          </p>
        </Card>
      </div>

      {/* Premio */}
      {tournament.prizeDescription && (
        <Card variant="glow" className="mb-6 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={16} className="text-tier-vip" />
            <span className="font-display font-bold text-white">Premio</span>
          </div>
          <p className="text-sm text-tier-vip">
            {tournament.prizeDescription}
          </p>
        </Card>
      )}

      {/* Botón de inscripción */}
      {session?.user && isAccepting && (
        <div className="mb-8">
          {isJoined ? (
            <div className="rounded-gaming bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <p className="font-bold text-emerald-400">
                ✓ Ya estás inscrito en este torneo
              </p>
            </div>
          ) : !canJoin ? (
            <div className="rounded-gaming bg-fire-500/10 border border-fire-500/20 p-4 text-center">
              <p className="text-sm text-slate-400">
                Necesitas ser{' '}
                <span className="font-bold text-tier-vip">
                  {tournament.entryTier}
                </span>{' '}
                para inscribirte
              </p>
              <Link
                href="/pricing"
                className="mt-2 inline-block text-xs font-bold text-fire-400 hover:text-fire-300"
              >
                Mejorar plan →
              </Link>
            </div>
          ) : isFull ? (
            <div className="rounded-gaming bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-sm text-slate-400">El torneo está lleno</p>
            </div>
          ) : (
            <JoinTournamentButton tournamentId={tournament.id} />
          )}
        </div>
      )}

      {/* Tabla de participantes */}
      <div>
        <h2 className="mb-4 text-xl font-display font-bold text-white">
          Participantes
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({tournament._count.entries})
          </span>
        </h2>

        {tournament.entries.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-slate-500">
              Aún no hay participantes inscritos
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {tournament.entries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {/* Posición */}
                  <span className="w-8 text-center text-sm font-bold text-slate-500">
                    {entry.rank ?? idx + 1}
                  </span>

                  {/* Avatar placeholder */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-300">
                    {entry.user.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/u/${entry.user.username}`}
                      className="text-sm font-semibold text-white hover:text-fire-400 transition-colors truncate block"
                    >
                      {entry.user.username}
                    </Link>
                    <span className="text-[10px] text-slate-500">
                      Inscrito{' '}
                      {new Date(entry.joinedAt).toLocaleDateString('es-MX')}
                    </span>
                  </div>

                  {/* Tier badge */}
                  <Badge
                    variant={TIER_BADGE_VARIANT[entry.user.tier]}
                    size="sm"
                  >
                    {entry.user.tier}
                  </Badge>

                  {/* Score */}
                  {entry.score !== null && entry.score > 0 && (
                    <span className="text-sm font-bold text-fire-400">
                      {entry.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
