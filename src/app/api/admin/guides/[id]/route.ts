import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { logger } from '@ares/logger';

import { requireRole } from '@/lib/auth/auth.middleware';

// ══════════════════════════════════════════════════════════
// GET /api/admin/guides/[id] — Detalle completo de una guia
// PATCH /api/admin/guides/[id] — Actualizar guia
// DELETE /api/admin/guides/[id] — Eliminar guia
// ══════════════════════════════════════════════════════════

const UpdateGuideSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(500).optional(),
  content: z.string().min(10).optional(),
  category: z
    .enum(['SENSITIVITY', 'MOVEMENT', 'AIM', 'STRATEGY', 'DEVICE', 'META'])
    .optional(),
  readTimeMin: z.number().int().min(1).max(60).optional(),
  isPremium: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole('ADMIN');
    const { id } = await params;

    const guide = await prisma.guide.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { orderIndex: 'asc' } },
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!guide) throw new NotFoundError('Guide', id);

    return NextResponse.json({ success: true, data: guide });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole('ADMIN');
    const { id } = await params;

    const guide = await prisma.guide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundError('Guide', id);

    const body: unknown = await request.json();
    const parsed = UpdateGuideSchema.safeParse(body);

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

    const changes = parsed.data;

    const updated = await prisma.guide.update({
      where: { id },
      data: changes,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        isPremium: true,
        isPublished: true,
        viewCount: true,
        readTimeMin: true,
        updatedAt: true,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_GUIDE',
        target: id,
        details: JSON.parse(JSON.stringify(changes)),
      },
    });

    logger.info('Admin updated guide', {
      adminId: session.user.id,
      guideId: id,
      title: guide.title,
      changes,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole('ADMIN');
    const { id } = await params;

    const guide = await prisma.guide.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    if (!guide) throw new NotFoundError('Guide', id);

    await prisma.guide.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'DELETE_GUIDE',
        target: id,
        details: { title: guide.title },
      },
    });

    logger.info('Admin deleted guide', {
      adminId: session.user.id,
      guideId: id,
      title: guide.title,
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
