import { FREE_FAVORITE_LIMIT } from '@ares/config';
import { prisma } from '@ares/database';
import { BusinessError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getRequiredSession } from '@/lib/auth/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// GET  /api/favorites — Listar favoritos del usuario autenticado
// POST /api/favorites — Agregar favorito (limite FREE=3, Premium=ilimitado)
// ═══════════════════════════════════════════════════════════════

const addFavoriteSchema = z.object({
  deviceId: z.string().cuid('ID de dispositivo invalido'),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER'], {
    errorMap: () => ({ message: 'Estilo debe ser AGGRESSIVE, BALANCED o SNIPER' }),
  }),
  nickname: z.string().max(50, 'Nickname maximo 50 caracteres').optional(),
});

export async function GET() {
  try {
    const session = await getRequiredSession();

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: favorites });
  } catch (error) {
    logger.error('GET /api/favorites failed', { error: String(error) });
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body: unknown = await request.json();

    const parsed = addFavoriteSchema.safeParse(body);
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

    const { deviceId, style, nickname } = parsed.data;
    const userTier = (session.user as Record<string, unknown>).tier as string;

    // Verificar limite para usuarios FREE
    if (userTier === 'FREE') {
      const count = await prisma.favorite.count({
        where: { userId: session.user.id },
      });

      if (count >= FREE_FAVORITE_LIMIT) {
        throw new BusinessError(
          'FAVORITE_LIMIT',
          `Has alcanzado el limite de ${FREE_FAVORITE_LIMIT} favoritos. Mejora a Premium para guardar ilimitados.`,
        );
      }
    }

    // Verificar si ya existe
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_deviceId_style: {
          userId: session.user.id,
          deviceId,
          style,
        },
      },
    });

    if (existing) {
      throw new BusinessError(
        'ALREADY_FAVORITED',
        'Ya tienes esta configuracion en favoritos',
      );
    }

    // Verificar que el dispositivo existe
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: { id: true, brand: true, model: true, slug: true, tier: true },
    });

    if (!device) {
      throw new BusinessError('DEVICE_NOT_FOUND', 'Dispositivo no encontrado');
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        deviceId,
        style,
        nickname: nickname ?? null,
      },
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

    // Incrementar contador del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalFavorites: { increment: 1 } },
    });

    logger.info('Favorite added', {
      userId: session.user.id,
      deviceId,
      style,
      device: `${device.brand} ${device.model}`,
    });

    return NextResponse.json(
      { success: true, data: favorite },
      { status: 201 },
    );
  } catch (error) {
    logger.error('POST /api/favorites failed', { error: String(error) });
    return handleApiError(error);
  }
}
