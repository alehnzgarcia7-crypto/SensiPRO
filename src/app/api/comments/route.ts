import { prisma } from '@ares/database';
import { BusinessError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getRequiredSession } from '@/lib/auth/auth.middleware';

// ═══════════════════════════════════════════════════════════════
// GET  /api/comments — Listar comentarios de una guía o config
// POST /api/comments — Crear comentario (rate-limited, filtro profanidad)
// ═══════════════════════════════════════════════════════════════

const querySchema = z.object({
  guideId: z.string().cuid().optional(),
  sharedConfigId: z.string().cuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const createSchema = z.object({
  guideId: z.string().cuid().optional(),
  sharedConfigId: z.string().cuid().optional(),
  parentId: z.string().cuid().optional(),
  content: z
    .string()
    .min(3, 'El comentario debe tener al menos 3 caracteres')
    .max(500, 'El comentario no puede exceder 500 caracteres')
    .trim(),
});

// Palabras no permitidas — filtro basico de moderacion
const BANNED_WORDS = [
  'hack', 'cheat', 'mod apk', 'aimbot', 'wallhack',
  'trampa', 'trampas', 'exploit', 'hacker',
];

function containsBannedWord(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}

// Limite de comentarios por usuario por dia
const DAILY_COMMENT_LIMIT = 20;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      guideId: searchParams.get('guideId') ?? undefined,
      sharedConfigId: searchParams.get('sharedConfigId') ?? undefined,
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 50,
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

    const { guideId, sharedConfigId, page, limit } = parsed.data;

    if (!guideId && !sharedConfigId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Se requiere guideId o sharedConfigId',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const where = {
      ...(guideId ? { guideId } : {}),
      ...(sharedConfigId ? { sharedConfigId } : {}),
      isHidden: false,
      parentId: null, // Solo comentarios raiz
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              tier: true,
            },
          },
          replies: {
            where: { isHidden: false },
            orderBy: { createdAt: 'asc' },
            take: 5,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                  tier: true,
                },
              },
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('GET /api/comments failed', { error: String(error) });
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

    const { guideId, sharedConfigId, parentId, content } = parsed.data;

    // Debe tener al menos un target
    if (!guideId && !sharedConfigId) {
      throw new BusinessError('MISSING_TARGET', 'Se requiere guideId o sharedConfigId');
    }

    // Filtro de profanidad
    if (containsBannedWord(content)) {
      throw new BusinessError('INAPPROPRIATE', 'Tu comentario contiene contenido no permitido');
    }

    // Rate limit: maximo N comentarios por dia
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.comment.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfDay },
      },
    });

    if (todayCount >= DAILY_COMMENT_LIMIT) {
      throw new BusinessError(
        'COMMENT_LIMIT',
        `Has alcanzado el limite de ${DAILY_COMMENT_LIMIT} comentarios por dia`,
      );
    }

    // Si es reply, verificar que el padre existe y pertenece al mismo target
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { guideId: true, sharedConfigId: true, isHidden: true },
      });

      if (!parent || parent.isHidden) {
        throw new BusinessError('PARENT_NOT_FOUND', 'El comentario padre no existe');
      }

      // Verificar que el reply va al mismo target
      if (guideId && parent.guideId !== guideId) {
        throw new BusinessError('INVALID_PARENT', 'El comentario padre no pertenece a esta guia');
      }
      if (sharedConfigId && parent.sharedConfigId !== sharedConfigId) {
        throw new BusinessError('INVALID_PARENT', 'El comentario padre no pertenece a esta config');
      }
    }

    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        content,
        guideId: guideId ?? null,
        sharedConfigId: sharedConfigId ?? null,
        parentId: parentId ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            tier: true,
          },
        },
        replies: {
          where: { isHidden: false },
          take: 0,
          select: { id: true },
        },
      },
    });

    logger.info('Comment created', {
      commentId: comment.id,
      userId: session.user.id,
      guideId: guideId ?? null,
      sharedConfigId: sharedConfigId ?? null,
      isReply: !!parentId,
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/comments failed', { error: String(error) });
    return handleApiError(error);
  }
}
