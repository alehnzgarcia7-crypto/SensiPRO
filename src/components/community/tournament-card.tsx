'use client';

import type { TournamentStatus, UserTier } from '@prisma/client';
import { Trophy, Users, Calendar, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';

interface TournamentCardProps {
  tournament: {
    id: string;
    title: string;
    description: string | null;
    status: TournamentStatus;
    startDate: Date | string;
    endDate: Date | string;
    maxParticipants: number | null;
    prizeDescription: string | null;
    entryTier: UserTier;
    _count: { entries: number };
  };
  userTier?: UserTier | null;
  isJoined?: boolean;
  onJoin?: (tournamentId: string) => Promise<void>;
  showJoinButton?: boolean;
}

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

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function TournamentCard({
  tournament,
  userTier,
  isJoined = false,
  onJoin,
  showJoinButton = false,
}: TournamentCardProps) {
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(isJoined);

  const isActive = tournament.status === 'ACTIVE' || tournament.status === 'UPCOMING';
  const isFull =
    tournament.maxParticipants !== null &&
    tournament._count.entries >= tournament.maxParticipants;

  async function handleJoin() {
    if (!onJoin || joining || joined) return;
    setJoining(true);
    try {
      await onJoin(tournament.id);
      setJoined(true);
    } finally {
      setJoining(false);
    }
  }

  return (
    <Card
      variant={isActive ? 'glow' : 'default'}
      className="p-5 transition-colors hover:border-fire-500/20"
    >
      {/* Encabezado: título + status badge */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">
          {tournament.title}
        </h3>
        <Badge
          variant={STATUS_BADGE_VARIANT[tournament.status]}
          size="sm"
        >
          {STATUS_LABELS[tournament.status]}
        </Badge>
      </div>

      {/* Descripción */}
      {tournament.description && (
        <p className="mb-3 text-sm text-slate-400 line-clamp-2">
          {tournament.description}
        </p>
      )}

      {/* Meta info */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={12} />
          {tournament._count.entries}
          {tournament.maxParticipants ? `/${tournament.maxParticipants}` : ''}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(tournament.startDate)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatDate(tournament.endDate)}
        </span>
        <Badge variant={TIER_BADGE_VARIANT[tournament.entryTier]} size="sm">
          {tournament.entryTier}
        </Badge>
      </div>

      {/* Premio */}
      {tournament.prizeDescription && (
        <p className="mb-3 text-xs text-tier-vip">
          <Trophy size={12} className="mr-1 inline" />
          {tournament.prizeDescription}
        </p>
      )}

      {/* Botón de inscripción */}
      {showJoinButton && isActive && (
        <div className="mt-2">
          {joined ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              ✓ Inscrito
            </span>
          ) : isFull ? (
            <span className="text-xs text-slate-500">Torneo lleno</span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className={cn(
                'inline-flex min-h-[36px] items-center gap-2 rounded-gaming px-4 py-2 text-sm font-bold transition-all',
                userTier && tournament.entryTier !== 'FREE'
                  ? 'bg-gradient-to-r from-fire-500 to-fire-600 text-white hover:from-fire-400 hover:to-fire-500'
                  : 'bg-white/10 text-white hover:bg-white/15',
                joining && 'cursor-not-allowed opacity-60',
              )}
            >
              {joining ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trophy size={14} />
              )}
              Inscribirme
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
