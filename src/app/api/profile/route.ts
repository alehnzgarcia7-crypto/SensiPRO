import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { BusinessError } from '@ares/errors';
import { logger } from '@ares/logger';
import { getRequiredSession } from '@/lib/auth/auth.middleware';

// ══════════════════════════════════════════════════════════
// API de perfil de usuario
// PATCH: Actualizar username y/o bio con validación Zod
// ══════════════════════════════════════════════════════════

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, _ y -')
    .optional(),
  bio: z
    .string()
    .max(160, 'Máximo 160 caracteres')
    .optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body: unknown = await request.json();
    const parsed = updateProfileSchema.parse(body);

    // Verificar disponibilidad de username si cambió
    if (parsed.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: parsed.username,
          id: { not: session.user.id },
        },
      });
      if (existing) {
        throw new BusinessError('USERNAME_TAKEN', 'Este nombre de usuario ya está en uso');
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(parsed.username ? { username: parsed.username } : {}),
        ...(parsed.bio !== undefined ? { bio: parsed.bio } : {}),
      },
      select: { username: true, bio: true },
    });

    logger.info('Profile updated', {
      userId: session.user.id,
      fields: Object.keys(parsed).filter((k) => parsed[k as keyof typeof parsed] !== undefined),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
