import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { createPaymentPreference } from '@/lib/payments/mercadopago';

// ══════════════════════════════════════════════════════════
// POST /api/payments/create
// Crea una preferencia de pago en MercadoPago
// ══════════════════════════════════════════════════════════

const CreatePaymentSchema = z.object({
  tier: z.enum(['PREMIUM', 'VIP'], {
    errorMap: () => ({ message: 'Tier debe ser PREMIUM o VIP' }),
  }),
  months: z.coerce.number().int().min(1).max(12).optional().default(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body: unknown = await request.json();
    const parsed = CreatePaymentSchema.safeParse(body);

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

    const { tier, months } = parsed.data;

    logger.info('Payment creation requested', {
      userId: session.user.id,
      tier,
      months,
    });

    const result = await createPaymentPreference({
      userId: session.user.id,
      userEmail: session.user.email ?? '',
      tier,
      months,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
