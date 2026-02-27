import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type Stripe from 'stripe';


import { constructWebhookEvent } from '@/lib/payments/stripe';

// ══════════════════════════════════════════════════════════
// POST /api/webhooks/stripe
// Procesa eventos de webhook de Stripe
// ══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') ?? '';

    if (!signature) {
      logger.warn('Stripe webhook received without signature');
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_SIGNATURE', message: 'Falta firma stripe-signature', statusCode: 401 } },
        { status: 401 },
      );
    }

    const event = constructWebhookEvent(payload, signature);

    logger.info('Stripe webhook received', {
      type: event.type,
      eventId: event.id,
    });

    // Solo procesar checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Retornar 400 para que Stripe reintente con errores de firma
    // Retornar 200 para errores de procesamiento
    const isSignatureError =
      error instanceof Error && error.message.includes('signature');
    return NextResponse.json(
      { received: false, error: 'Webhook processing failed' },
      { status: isSignatureError ? 400 : 200 },
    );
  }
}

// ──────────────────────────────────────────────────────────
// Handler: checkout.session.completed
// ──────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const metadata = session.metadata ?? {};
  const userId = metadata['userId'];
  const tier = metadata['tier'] as 'PREMIUM' | 'VIP' | undefined;
  const monthsStr = metadata['months'] ?? '1';
  const months = parseInt(monthsStr, 10) || 1;

  if (!userId || !tier || (tier !== 'PREMIUM' && tier !== 'VIP')) {
    logger.warn('Stripe checkout missing metadata', {
      sessionId: session.id,
      metadata,
    });
    return;
  }

  // Verificar pago duplicado
  const existingPayment = await prisma.payment.findFirst({
    where: { externalId: session.id },
  });

  if (existingPayment) {
    logger.info('Stripe payment already processed, skipping', {
      sessionId: session.id,
      existingId: existingPayment.id,
    });
    return;
  }

  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    logger.error('User not found for Stripe payment', {
      userId,
      sessionId: session.id,
    });
    return;
  }

  // Calcular fecha de expiracion
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + months);

  // Si ya tiene suscripcion activa, extender desde esa fecha
  if (user.tierExpiresAt && user.tierExpiresAt > now) {
    expiresAt.setTime(user.tierExpiresAt.getTime());
    expiresAt.setMonth(expiresAt.getMonth() + months);
  }

  // Monto en centavos (Stripe ya devuelve en centavos)
  const amountCentavos = session.amount_total ?? 0;

  // Transaccion: actualizar usuario + registrar pago + crear suscripcion
  await prisma.$transaction(async (tx) => {
    // Actualizar tier del usuario
    await tx.user.update({
      where: { id: userId },
      data: {
        tier,
        tierExpiresAt: expiresAt,
      },
    });

    // Registrar pago
    const payment = await tx.payment.create({
      data: {
        userId,
        provider: 'STRIPE',
        externalId: session.id,
        amount: amountCentavos,
        currency: (session.currency ?? 'mxn').toUpperCase(),
        status: 'COMPLETED',
        metadata: {
          stripeSessionId: session.id,
          stripePaymentIntent: session.payment_intent as string | null,
          stripeCustomerEmail: session.customer_email,
          tier,
          months,
        },
      },
    });

    // Crear suscripcion
    await tx.subscription.create({
      data: {
        userId,
        tier,
        startDate: now,
        endDate: expiresAt,
        isActive: true,
        paymentId: payment.id,
      },
    });
  });

  logger.info('Stripe payment processed — user upgraded', {
    userId,
    tier,
    months,
    expiresAt: expiresAt.toISOString(),
    stripeSessionId: session.id,
    amount: amountCentavos,
  });
}
