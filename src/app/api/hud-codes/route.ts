import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

const QuerySchema = z.object({
  fingers: z.coerce.number().int().refine(
    (v) => v === 2 || v === 3 || v === 4,
    { message: 'fingers debe ser 2, 3 o 4' },
  ),
  screenSize: z.coerce.number().min(3).max(15).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      fingers: searchParams.get('fingers') ?? undefined,
      screenSize: searchParams.get('screenSize') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Parámetros inválidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { fingers, screenSize } = parsed.data;

    const codes = await prisma.hudCode.findMany({
      where: { fingers },
      orderBy: [{ isDefault: 'desc' }, { precision: 'desc' }],
    });

    // Si hay screenSize, reordenar priorizando códigos cuyo rango incluya ese tamaño
    let sorted = codes;
    if (screenSize) {
      sorted = [...codes].sort((a, b) => {
        const aFits =
          a.screenMin !== null &&
          a.screenMax !== null &&
          screenSize >= a.screenMin &&
          screenSize <= a.screenMax;
        const bFits =
          b.screenMin !== null &&
          b.screenMax !== null &&
          screenSize >= b.screenMin &&
          screenSize <= b.screenMax;

        // Primero los que encajan en el rango del screen
        if (aFits && !bFits) return -1;
        if (!aFits && bFits) return 1;

        // Después los default
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;

        // Finalmente por precisión
        return b.precision - a.precision;
      });
    }

    // El recomendado es el default para ese # de dedos, o el primero del resultado
    const recommended = sorted.find((c) => c.isDefault) ?? sorted[0] ?? null;

    logger.info('HUD codes fetched', { fingers, screenSize, count: sorted.length });

    return NextResponse.json({
      success: true,
      data: {
        codes: sorted,
        recommended,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
