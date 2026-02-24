import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { BusinessError, NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { canAccessTier } from '@/lib/tiers';
import type { UserTier } from '@prisma/client';

const paramsSchema = z.object({
  id: z.string().cuid('ID de torneo inválido'),
});

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getRequiredSession();
    const { id: tournamentId } = paramsSchema.parse(await params);
    const userTier = session.user.tier as UserTier;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        title: true,
        status: true,
        entryTier: true,
        maxParticipants: true,
        _count: { select: { entries: true } },
      },
    });

    if (!tournament) {
      throw new NotFoundError('Tournament', tournamentId);
    }

    // Verificar que el torneo esté activo o próximo
    if (tournament.status !== 'ACTIVE' && tournament.status !== 'UPCOMING') {
      throw new BusinessError(
        'NOT_ACTIVE',
        'Este torneo no está aceptando inscripciones',
      );
    }

    // Verificar tier del usuario
    if (!canAccessTier(userTier, tournament.entryTier)) {
      throw new BusinessError(
        'TIER_REQUIRED',
        `Este torneo requiere ser ${tournament.entryTier}`,
      );
    }

    // Verificar capacidad máxima
    if (
      tournament.maxParticipants &&
      tournament._count.entries >= tournament.maxParticipants
    ) {
      throw new BusinessError('TOURNAMENT_FULL', 'El torneo está lleno');
    }

    // Verificar si ya está inscrito
    const existing = await prisma.tournamentEntry.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      throw new BusinessError(
        'ALREADY_JOINED',
        'Ya estás inscrito en este torneo',
      );
    }

    // Inscribir al usuario
    const entry = await prisma.tournamentEntry.create({
      data: {
        tournamentId,
        userId: session.user.id,
      },
      select: {
        id: true,
        joinedAt: true,
      },
    });

    logger.info('Tournament joined', {
      userId: session.user.id,
      tournamentId,
      tournamentTitle: tournament.title,
      userTier,
    });

    return NextResponse.json({
      success: true,
      data: { joined: true, entryId: entry.id, joinedAt: entry.joinedAt },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
