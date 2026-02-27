import { logger } from '@ares/logger';
import type { GuideCategory, TipDifficulty } from '@prisma/client';
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getTips, getTipsRandom } from '@/lib/academy/academy-queries';


const VALID_CATEGORIES = ['SENSITIVITY', 'MOVEMENT', 'AIM', 'STRATEGY', 'DEVICE', 'META'] as const;
const VALID_DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

const querySchema = z.object({
  category: z.enum(VALID_CATEGORIES).optional(),
  difficulty: z.enum(VALID_DIFFICULTIES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  random: z.coerce.number().int().min(1).max(20).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      random: searchParams.get('random') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Parámetros inválidos',
          },
        },
        { status: 400 },
      );
    }

    const { category, difficulty, page, limit, random } = parsed.data;

    // Si piden tips random (para carousel)
    if (random) {
      const tips = await getTipsRandom(random);
      return NextResponse.json({
        success: true,
        data: tips,
      });
    }

    // Listado paginado con filtros
    const { tips, total } = await getTips({
      category: category as GuideCategory | undefined,
      difficulty: difficulty as TipDifficulty | undefined,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: tips,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GET /api/v1/academy/tips failed', { error: message });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener tips',
        },
      },
      { status: 500 },
    );
  }
}
