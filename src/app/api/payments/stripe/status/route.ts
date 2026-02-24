import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { retrieveCheckoutSession } from '@/lib/payments/stripe';

// ══════════════════════════════════════════════════════════
// GET /api/payments/stripe/status?session_id=xxx
// Verificar el estado de una sesion de checkout de Stripe
// ══════════════════════════════════════════════════════════

const StatusQuerySchema = z.object({
  session_id: z.string().min(1, 'session_id es requerido'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const { searchParams } = new URL(request.url);
    const parsed = StatusQuerySchema.safeParse({
      session_id: searchParams.get('session_id'),
    });

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

    const checkoutSession = await retrieveCheckoutSession(
      parsed.data.session_id,
    );

    // Verificar que la sesion pertenece al usuario autenticado
    const metadata = checkoutSession.metadata ?? {};
    if (metadata['userId'] !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes acceso a esta sesion de pago',
            statusCode: 403,
          },
        },
        { status: 403 },
      );
    }

    logger.info('Stripe session status checked', {
      userId: session.user.id,
      sessionId: parsed.data.session_id,
      status: checkoutSession.payment_status,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        paymentStatus: checkoutSession.payment_status,
        status: checkoutSession.status,
        tier: metadata['tier'] ?? null,
        months: metadata['months'] ? parseInt(metadata['months'], 10) : 1,
        amountTotal: checkoutSession.amount_total,
        currency: checkoutSession.currency,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
