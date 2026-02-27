import { logger } from '@ares/logger';
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getGuides } from '@/lib/academy/academy-queries';

const querySchema = z.object({
  category: z
    .enum(['SENSITIVITY', 'MOVEMENT', 'AIM', 'STRATEGY', 'DEVICE', 'META'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      category: searchParams.get('category') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      search: searchParams.get('search') || undefined,
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

    const { guides, total } = await getGuides(parsed.data);

    return NextResponse.json({
      success: true,
      data: guides,
      meta: {
        page: parsed.data.page,
        limit: parsed.data.limit,
        total,
        totalPages: Math.ceil(total / parsed.data.limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GET /api/v1/academy/guides failed', { error: message });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener guías',
        },
      },
      { status: 500 },
    );
  }
}
