import { handleApiError } from '@ares/errors';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { redeemCode } from '@/lib/payments/activation-codes';

// ══════════════════════════════════════════════════════════
// POST /api/activation-codes/redeem
// Canjear un codigo de activacion para upgrade de tier
// ══════════════════════════════════════════════════════════

const RedeemSchema = z.object({
  code: z
    .string()
    .min(14, 'Codigo demasiado corto')
    .max(19, 'Codigo demasiado largo')
    .regex(
      /^ARES-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i,
      'Formato invalido. Usa ARES-XXXX-XXXX-XXXX',
    ),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body: unknown = await request.json();
    const parsed = RedeemSchema.safeParse(body);

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

    const result = await redeemCode(parsed.data.code, session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        tier: result.tier,
        expiresAt: result.expiresAt.toISOString(),
        codeType: result.codeType,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
