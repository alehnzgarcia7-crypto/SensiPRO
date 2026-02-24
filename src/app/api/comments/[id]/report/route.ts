import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { BusinessError, NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { getRequiredSession } from '@/lib/auth/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// POST /api/comments/[id]/report — Reportar comentario
// Auto-hide despues de 3 reportes distintos
// ═══════════════════════════════════════════════════════════════

const AUTO_HIDE_THRESHOLD = 3;

const paramsSchema = z.object({
  id: z.string().cuid('ID de comentario invalido'),
});

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getRequiredSession();
    const { id: commentId } = paramsSchema.parse(await params);

    // Verificar que el comentario existe
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, isHidden: true },
    });

    if (!comment) {
      throw new NotFoundError('Comment', commentId);
    }

    // No reportar tus propios comentarios
    if (comment.userId === session.user.id) {
      throw new BusinessError('SELF_REPORT', 'No puedes reportar tu propio comentario');
    }

    // No reportar comentarios ya ocultos
    if (comment.isHidden) {
      throw new BusinessError('ALREADY_HIDDEN', 'Este comentario ya fue moderado');
    }

    // Verificar si ya reporto este comentario
    const existingReport = await prisma.commentReport.findUnique({
      where: {
        commentId_reportedBy: {
          commentId,
          reportedBy: session.user.id,
        },
      },
    });

    if (existingReport) {
      throw new BusinessError('ALREADY_REPORTED', 'Ya reportaste este comentario');
    }

    // Crear reporte
    await prisma.commentReport.create({
      data: {
        commentId,
        reportedBy: session.user.id,
        reason: 'USER_REPORT',
      },
    });

    // Contar reportes totales y auto-hide si alcanza el threshold
    const reportCount = await prisma.commentReport.count({
      where: { commentId },
    });

    if (reportCount >= AUTO_HIDE_THRESHOLD) {
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          isHidden: true,
          reportCount,
        },
      });

      logger.info('Comment auto-hidden', {
        commentId,
        reportCount,
        lastReportedBy: session.user.id,
      });
    } else {
      // Actualizar el contador de reportes
      await prisma.comment.update({
        where: { id: commentId },
        data: { reportCount },
      });
    }

    logger.info('Comment reported', {
      commentId,
      reportedBy: session.user.id,
      totalReports: reportCount,
      autoHidden: reportCount >= AUTO_HIDE_THRESHOLD,
    });

    return NextResponse.json({
      success: true,
      data: { reported: true },
    });
  } catch (error) {
    logger.error('POST /api/comments/[id]/report failed', { error: String(error) });
    return handleApiError(error);
  }
}
