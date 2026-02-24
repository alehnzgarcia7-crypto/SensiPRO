import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError, NotFoundError } from '@ares/errors';
import { logger } from '@ares/logger';

import { requireRole } from '@/lib/auth/auth.middleware';

// ══════════════════════════════════════════════════════════
// PATCH /api/admin/users/[id] — Actualizar tier, role, isActive de un usuario
// ══════════════════════════════════════════════════════════

const UpdateUserSchema = z.object({
  tier: z.enum(['FREE', 'PREMIUM', 'VIP']).optional(),
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  tierExpiresAt: z.string().datetime().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole('ADMIN');
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User', id);

    const body: unknown = await request.json();
    const parsed = UpdateUserSchema.safeParse(body);

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
    const updateData: Record<string, unknown> = {};

    if (changes.tier !== undefined) updateData['tier'] = changes.tier;
    if (changes.role !== undefined) updateData['role'] = changes.role;
    if (changes.isActive !== undefined) updateData['isActive'] = changes.isActive;
    if (changes.tierExpiresAt !== undefined) {
      updateData['tierExpiresAt'] = changes.tierExpiresAt
        ? new Date(changes.tierExpiresAt)
        : null;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        tier: true,
        role: true,
        isActive: true,
        tierExpiresAt: true,
      },
    });

    // Registrar accion en admin log
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_USER',
        target: id,
        details: JSON.parse(JSON.stringify(changes)),
      },
    });

    logger.info('Admin updated user', {
      adminId: session.user.id,
      targetUserId: id,
      targetUsername: user.username,
      changes,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
