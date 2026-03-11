import { prisma } from '@ares/database';
import { BusinessError, handleApiError, NotFoundError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { isAdminEmail } from '@/lib/constants/admin';

// ═══════════════════════════════════════════════════════════════
// GET  /api/shared-configs — Feed de configs compartidas
// POST /api/shared-configs — Publicar config en la comunidad
// ═══════════════════════════════════════════════════════════════

const querySchema = z.object({
  sort: z.enum(['trending', 'newest', 'top']).default('trending'),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createSchema = z.object({
  deviceId: z.string().cuid('ID de dispositivo invalido'),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER'], {
    errorMap: () => ({ message: 'Estilo debe ser AGGRESSIVE, BALANCED o SNIPER' }),
  }),
  title: z
    .string()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(100, 'El titulo no puede exceder 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'La descripcion no puede exceder 500 caracteres')
    .trim()
    .optional(),
});

// Limite diario de configs compartidas por usuario
const DAILY_SHARE_LIMIT = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      sort: searchParams.get('sort') ?? undefined,
      style: searchParams.get('style') ?? undefined,
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 20,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Parametros invalidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { sort, style, page, limit } = parsed.data;

    const where: { style?: 'AGGRESSIVE' | 'BALANCED' | 'SNIPER'; isApproved: boolean } = {
      isApproved: true,
    };
    if (style) {
      where.style = style;
    }

    // Determinar ordenamiento
    const orderBy =
      sort === 'newest'
        ? { createdAt: 'desc' as const }
        : { votes: 'desc' as const }; // trending y top usan votes desc

    const [configs, total] = await Promise.all([
      prisma.sharedConfig.findMany({
        where,
        orderBy:
          sort === 'trending'
            ? [{ votes: 'desc' }, { createdAt: 'desc' }]
            : [orderBy],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              username: true,
              avatarUrl: true,
              tier: true,
            },
          },
          device: {
            select: {
              brand: true,
              model: true,
              slug: true,
              tier: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.sharedConfig.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: configs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('GET /api/shared-configs failed', { error: String(error) });
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body: unknown = await request.json();

    const parsed = createSchema.safeParse(body);
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

    const { deviceId, style, title, description } = parsed.data;

    // Verificar que el dispositivo existe
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      select: { id: true, isActive: true },
    });
    if (!device || !device.isActive) {
      throw new NotFoundError('Device', deviceId);
    }

    // Rate limit: maximo N configs por dia (admin bypass)
    if (!isAdminEmail(session.user.email)) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayCount = await prisma.sharedConfig.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfDay },
        },
      });

      if (todayCount >= DAILY_SHARE_LIMIT) {
        throw new BusinessError(
          'SHARE_LIMIT',
          `Has alcanzado el limite de ${DAILY_SHARE_LIMIT} configs compartidas por dia`,
        );
      }
    }

    // Verificar duplicado: misma config (user+device+style) no deberia repetirse
    const existing = await prisma.sharedConfig.findFirst({
      where: {
        userId: session.user.id,
        deviceId,
        style,
      },
    });

    if (existing) {
      throw new BusinessError(
        'DUPLICATE_CONFIG',
        'Ya compartiste una config con este dispositivo y estilo',
      );
    }

    const config = await prisma.sharedConfig.create({
      data: {
        userId: session.user.id,
        deviceId,
        style,
        title,
        description: description ?? null,
        votes: 0,
      },
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true,
            tier: true,
          },
        },
        device: {
          select: {
            brand: true,
            model: true,
            slug: true,
            tier: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Incrementar contador de shares del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalShares: { increment: 1 } },
    });

    logger.info('SharedConfig created', {
      configId: config.id,
      userId: session.user.id,
      deviceId,
      style,
      title,
    });

    return NextResponse.json({ success: true, data: config }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/shared-configs failed', { error: String(error) });
    return handleApiError(error);
  }
}
