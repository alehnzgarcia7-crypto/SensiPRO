
import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireRole } from '@/lib/auth/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// DELETE /api/comments/[id] — Eliminar comentario (solo ADMIN)
// ═══════════════════════════════════════════════════════════════

const paramsSchema = z.object({
  id: z.string().cuid('ID de comentario invalido'),
});

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole('ADMIN');
    const { id: commentId } = paramsSchema.parse(await params);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, guideId: true, sharedConfigId: true },
    });

    if (!comment) {
      throw new NotFoundError('Comment', commentId);
    }

    // Eliminar comentario y sus replies en cascada (Prisma self-relation)
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { id: commentId },
          { parentId: commentId },
        ],
      },
    });

    logger.info('Comment deleted by admin', {
      commentId,
      adminId: session.user.id,
      targetUserId: comment.userId,
      guideId: comment.guideId,
      sharedConfigId: comment.sharedConfigId,
    });

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    logger.error('DELETE /api/comments/[id] failed', { error: String(error) });
    return handleApiError(error);
  }
}
