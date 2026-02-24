import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError, NotFoundError } from '@ares/errors';

import { requireRole } from '@/lib/auth/auth.middleware';
import { toggleExperiment, getExperimentResults } from '@/lib/ab-testing/ab-engine';

const updateSchema = z.object({
  isActive: z.boolean(),
});

// GET /api/admin/ab-tests/:key — Detalle de un experimento
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await requireRole('ADMIN');

    const { key } = await params;
    const results = await getExperimentResults(key);

    if (!results) {
      throw new NotFoundError('Experiment', key);
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/admin/ab-tests/:key — Activar/desactivar experimento
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    await requireRole('ADMIN');

    const { key } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    await toggleExperiment(key, parsed.data.isActive);

    return NextResponse.json({
      success: true,
      data: { key, isActive: parsed.data.isActive },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
