import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError } from '@ares/errors';

import { getOptionalSession } from '@/lib/auth/auth.middleware';
import { trackConversion } from '@/lib/ab-testing/ab-engine';

const conversionSchema = z.object({
  experiment: z.string().min(1),
  event: z.string().min(1).max(100),
});

// POST /api/ab-variant/convert — Registra una conversión
export async function POST(request: NextRequest) {
  try {
    const session = await getOptionalSession();
    if (!session?.id) {
      return NextResponse.json({ success: true, data: { tracked: false } });
    }

    const body = await request.json();
    const parsed = conversionSchema.safeParse(body);

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

    const tracked = await trackConversion(
      session.id,
      parsed.data.experiment,
      parsed.data.event,
    );

    return NextResponse.json({ success: true, data: { tracked } });
  } catch (error) {
    return handleApiError(error);
  }
}
