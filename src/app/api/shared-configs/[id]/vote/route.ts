import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getRequiredSession } from '@/lib/auth/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// POST /api/shared-configs/[id]/vote — Votar config (+1 / -1)
// Toggle: si ya votaste en la misma direccion, se elimina el voto
// Cambio: si votaste opuesto, se cambia la direccion
// ═══════════════════════════════════════════════════════════════

const voteSchema = z.object({
  direction: z.enum(['up', 'down'], {
    errorMap: () => ({ message: 'Direccion debe ser up o down' }),
  }),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getRequiredSession();
    const { id } = await params;
    const body: unknown = await request.json();

    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Datos invalidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { direction } = parsed.data;
    const voteValue = direction === 'up' ? 1 : -1;

    // Verificar que la config existe
    const config = await prisma.sharedConfig.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!config) {
      throw new NotFoundError('SharedConfig', id);
    }

    // Buscar voto existente del usuario en esta config
    const existing = await prisma.vote.findUnique({
      where: {
        userId_sharedConfigId: {
          userId: session.user.id,
          sharedConfigId: id,
        },
      },
    });

    if (existing) {
      if (existing.value === voteValue) {
        // Toggle off: misma direccion → eliminar voto
        await prisma.vote.delete({
          where: { id: existing.id },
        });

        await prisma.sharedConfig.update({
          where: { id },
          data: {
            votes: { decrement: voteValue },
          },
        });

        logger.info('Vote removed', {
          userId: session.user.id,
          configId: id,
          previousValue: voteValue,
        });

        return NextResponse.json({
          success: true,
          data: { vote: null, action: 'removed' },
        });
      }

      // Cambio de direccion: actualizar voto
      await prisma.vote.update({
        where: { id: existing.id },
        data: { value: voteValue },
      });

      // El cambio neto es 2 (de -1 a +1 = +2, o de +1 a -1 = -2)
      await prisma.sharedConfig.update({
        where: { id },
        data: {
          votes: { increment: voteValue * 2 },
        },
      });

      logger.info('Vote changed', {
        userId: session.user.id,
        configId: id,
        from: existing.value,
        to: voteValue,
      });

      return NextResponse.json({
        success: true,
        data: { vote: direction, action: 'changed' },
      });
    }

    // Nuevo voto
    await prisma.vote.create({
      data: {
        userId: session.user.id,
        sharedConfigId: id,
        value: voteValue,
      },
    });

    await prisma.sharedConfig.update({
      where: { id },
      data: {
        votes: { increment: voteValue },
      },
    });

    logger.info('Vote created', {
      userId: session.user.id,
      configId: id,
      value: voteValue,
    });

    return NextResponse.json({
      success: true,
      data: { vote: direction, action: 'created' },
    });
  } catch (error) {
    logger.error('POST /api/shared-configs/[id]/vote failed', { error: String(error) });
    return handleApiError(error);
  }
}
