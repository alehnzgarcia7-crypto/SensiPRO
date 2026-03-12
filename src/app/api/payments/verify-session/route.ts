/**
 * GET /api/payments/verify-session?session_id=xxx
 *
 * Verifica una sesión de Stripe Checkout y activa la licencia.
 * Se llama desde la página de success después de pagar.
 *
 * Además retorna hasAccount para que la success page sepa
 * si mostrar formulario de login o de registro.
 */

import { prisma } from '@ares/database';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { activatePremiumLicense } from '@/lib/payments/payment-service';
import { stripeLifetime } from '@/lib/payments/stripe-config';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId || !stripeLifetime) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }

  try {
    const session = await stripeLifetime.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        status: session.payment_status,
        email: session.customer_email,
      });
    }

    const email = session.customer_email || session.metadata?.email;

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Activar licencia (idempotente)
    await activatePremiumLicense({
      email: normalizedEmail,
      paymentProvider: 'stripe',
      paymentId: session.id,
      paymentMethod: 'card',
      amountPaid: session.amount_total || 19900,
      currency: (session.currency || 'mxn').toUpperCase(),
      device: session.metadata?.device,
      fingerCount: session.metadata?.fingerCount ? parseInt(session.metadata.fingerCount) : undefined,
    });

    // Verificar si el email tiene una cuenta de usuario
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, username: true },
    });

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      isPremium: true,
      hasAccount: !!existingUser,
      username: existingUser?.username ?? undefined,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console -- Server-side error logging
    console.error('[SensiPRO] Verify session error:', error);
    return NextResponse.json(
      { error: 'Error verifying session' },
      { status: 500 }
    );
  }
}
