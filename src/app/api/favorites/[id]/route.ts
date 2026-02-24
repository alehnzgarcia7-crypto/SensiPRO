import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { NotFoundError, ForbiddenError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { getRequiredSession } from '@/lib/auth/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// PATCH  /api/favorites/[id] — Actualizar nickname de un favorito
// DELETE /api/favorites/[id] — Eliminar un favorito
// ═══════════════════════════════════════════════════════════════

const updateFavoriteSchema = z.object({
  nickname: z.string().max(50, 'Nickname maximo 50 caracteres').nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getRequiredSession();
    const { id } = await params;

    const favorite = await prisma.favorite.findUnique({
      where: { id },
    });

    if (!favorite) throw new NotFoundError('Favorite', id);
    if (favorite.userId !== session.user.id) {
      throw new ForbiddenError('No puedes modificar favoritos de otro usuario');
    }

    const body: unknown = await request.json();
    const parsed = updateFavoriteSchema.safeParse(body);

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

    const updated = await prisma.favorite.update({
      where: { id },
      data: { nickname: parsed.data.nickname },
      include: {
        device: {
          select: {
            id: true,
            brand: true,
            model: true,
            slug: true,
            tier: true,
            screenHz: true,
            panelType: true,
            imageUrl: true,
          },
        },
      },
    });

    logger.info('Favorite updated', {
      userId: session.user.id,
      favoriteId: id,
      nickname: parsed.data.nickname,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error('PATCH /api/favorites/[id] failed', { error: String(error) });
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getRequiredSession();
    const { id } = await params;

    const favorite = await prisma.favorite.findUnique({
      where: { id },
    });

    if (!favorite) throw new NotFoundError('Favorite', id);
    if (favorite.userId !== session.user.id) {
      throw new ForbiddenError('No puedes eliminar favoritos de otro usuario');
    }

    await prisma.favorite.delete({ where: { id } });

    // Decrementar contador del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalFavorites: { decrement: 1 } },
    });

    logger.info('Favorite removed', {
      userId: session.user.id,
      favoriteId: id,
      deviceId: favorite.deviceId,
      style: favorite.style,
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    logger.error('DELETE /api/favorites/[id] failed', { error: String(error) });
    return handleApiError(error);
  }
}
