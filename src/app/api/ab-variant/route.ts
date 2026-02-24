import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { handleApiError } from '@ares/errors';

import { getOptionalSession } from '@/lib/auth/auth.middleware';
import { getVariantForUser } from '@/lib/ab-testing/ab-engine';

// GET /api/ab-variant?experiment=<key>
// Retorna la variante asignada al usuario para un experimento
export async function GET(request: NextRequest) {
  try {
    const session = await getOptionalSession();
    if (!session?.id) {
      return NextResponse.json({
        success: true,
        data: { variant: null },
      });
    }

    const { searchParams } = new URL(request.url);
    const experiment = searchParams.get('experiment');

    if (!experiment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Parámetro experiment es requerido',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const variant = await getVariantForUser(session.id, experiment);
    return NextResponse.json({ success: true, data: { variant } });
  } catch (error) {
    return handleApiError(error);
  }
}
