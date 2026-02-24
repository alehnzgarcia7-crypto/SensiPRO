import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';

const paramsSchema = z.object({
  id: z.string().cuid('ID de torneo inválido'),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = paramsSchema.parse(await params);

    const tournament = await prisma.tournament.findUnique({
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
          orderBy: { score: 'desc' },
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

    if (!tournament) {
      throw new NotFoundError('Tournament', id);
    }

    return NextResponse.json({ success: true, data: tournament });
  } catch (error) {
    return handleApiError(error);
  }
}
