import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError } from '@ares/errors';

import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { validateCode } from '@/lib/payments/activation-codes';

// ══════════════════════════════════════════════════════════
// POST /api/activation-codes/validate
// Validar un codigo sin canjearlo (preview del resultado)
// ══════════════════════════════════════════════════════════

const ValidateSchema = z.object({
  code: z
    .string()
    .min(14, 'Codigo demasiado corto')
    .max(19, 'Codigo demasiado largo'),
});

export async function POST(request: NextRequest) {
  try {
    await getRequiredSession();
    const body: unknown = await request.json();
    const parsed = ValidateSchema.safeParse(body);

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

    const result = await validateCode(parsed.data.code);

    return NextResponse.json({
      success: true,
      data: {
        valid: result.valid,
        tier: result.tier,
        days: result.days,
        codeType: result.codeType,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
