import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';

// Validación para crear comentario
const CreateCommentSchema = z.object({
  guideId: z.string().cuid('ID de guía inválido').optional(),
  sharedConfigId: z.string().cuid('ID de config inválido').optional(),
  content: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'Máximo 1000 caracteres'),
}).refine(
  (data) => data.guideId || data.sharedConfigId,
  { message: 'Se requiere guideId o sharedConfigId' },
);

const DeleteCommentSchema = z.object({
  id: z.string().cuid('ID de comentario inválido'),
});

// POST — Crear comentario
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Inicia sesión para comentar', statusCode: 401 } },
        { status: 401 },
      );
    }

    const body: unknown = await req.json();
    const parsed = CreateCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Error de validación', statusCode: 400 } },
        { status: 400 },
      );
    }

    const userId = (session.user as unknown as { id: string }).id;
    const { guideId, sharedConfigId, content } = parsed.data;

    const comment = await prisma.comment.create({
      data: {
        userId,
        guideId: guideId ?? null,
        sharedConfigId: sharedConfigId ?? null,
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });

    logger.info('Comment created', {
      commentId: comment.id,
      userId,
      guideId: guideId ?? null,
      sharedConfigId: sharedConfigId ?? null,
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create comment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al crear comentario', statusCode: 500 } },
      { status: 500 },
    );
  }
}

// DELETE — Eliminar comentario propio
export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Inicia sesión', statusCode: 401 } },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const parsed = DeleteCommentSchema.safeParse({ id: searchParams.get('id') });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Error de validación', statusCode: 400 } },
        { status: 400 },
      );
    }

    const userId = (session.user as unknown as { id: string }).id;
    const userRole = (session.user as unknown as { role: string }).role;

    const comment = await prisma.comment.findUnique({
      where: { id: parsed.data.id },
      select: { userId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Comentario no encontrado', statusCode: 404 } },
        { status: 404 },
      );
    }

    // Solo el dueño o admin pueden eliminar
    if (comment.userId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'No tienes permiso para eliminar este comentario', statusCode: 403 } },
        { status: 403 },
      );
    }

    await prisma.comment.delete({
      where: { id: parsed.data.id },
    });

    logger.info('Comment deleted', { commentId: parsed.data.id, deletedBy: userId });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    logger.error('Failed to delete comment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al eliminar comentario', statusCode: 500 } },
      { status: 500 },
    );
  }
}
