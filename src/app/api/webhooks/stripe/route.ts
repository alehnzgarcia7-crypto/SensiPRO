/**
 * POST /api/webhooks/stripe
 *
 * Stripe envía eventos aquí cuando un pago se completa.
 * ESTO es lo que activa la licencia premium.
 *
 * Eventos que manejamos:
 * - checkout.session.completed → Pago con tarjeta exitoso
 * - payment_intent.succeeded → Pago OXXO completado
 *
 * SEGURIDAD: Verificamos la firma del webhook para asegurar
 * que el evento viene de Stripe y no de un atacante.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type Stripe from 'stripe';

import { TIKTOK_EVENTS, PRODUCT } from '@/lib/analytics/constants';
import { purchaseEventId } from '@/lib/analytics/dedup';
import { trackServerEvent } from '@/lib/analytics/track-server';
import { activatePremiumLicense } from '@/lib/payments/payment-service';
import { stripeLifetime } from '@/lib/payments/stripe-config';

export const dynamic = 'force-dynamic';

// Stripe envía raw body, necesitamos leerlo así
async function getRawBody(request: NextRequest): Promise<Buffer> {
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];

  if (!reader) throw new Error('No request body');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  if (!stripeLifetime) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const rawBody = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verificar firma del webhook
    let event: Stripe.Event;

    try {
      event = stripeLifetime.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[SensiPRO] Webhook signature verification failed:', message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Procesar evento
    switch (event.type) {
      case 'checkout.session.completed': {
        // Pago con TARJETA completado
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid') {
          const email = session.customer_email || session.metadata?.email;

          if (email) {
            await activatePremiumLicense({
              email,
              paymentProvider: 'stripe',
              paymentId: session.id,
              paymentMethod: 'card',
              amountPaid: session.amount_total || 19900,
              currency: (session.currency || 'mxn').toUpperCase(),
              device: session.metadata?.device,
              fingerCount: session.metadata?.fingerCount ? parseInt(session.metadata.fingerCount) : undefined,
            });

            // Server-side Purchase event — ONLY on confirmed payment
            const evtId = purchaseEventId(session.id);
            void trackServerEvent({
              eventType: 'PAYMENT_COMPLETED',
              metadata: {
                email,
                paymentId: session.id,
                method: 'card',
                provider: 'stripe',
                eventId: evtId,
                amount: session.amount_total || 19900,
                currency: (session.currency || 'mxn').toUpperCase(),
              },
              path: '/api/webhooks/stripe',
              tiktok: {
                event: TIKTOK_EVENTS.COMPLETE_PAYMENT,
                eventId: evtId,
                email,
                value: (session.amount_total || 19900) / 100,
                currency: (session.currency || 'mxn').toUpperCase(),
                contentId: PRODUCT.CONTENT_ID,
                contentType: PRODUCT.CONTENT_TYPE,
              },
            });
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        // Pago OXXO completado (o cualquier payment intent)
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const email = paymentIntent.receipt_email || paymentIntent.metadata?.email;

        if (email) {
          // Verificar que es un pago de SensiPRO
          if (paymentIntent.metadata?.product === 'sensipro_premium_lifetime') {
            const payMethod = paymentIntent.payment_method_types?.[0] === 'oxxo' ? 'oxxo' : 'card';
            await activatePremiumLicense({
              email,
              paymentProvider: 'stripe',
              paymentId: paymentIntent.id,
              paymentMethod: payMethod,
              amountPaid: paymentIntent.amount,
              currency: paymentIntent.currency.toUpperCase(),
              device: paymentIntent.metadata?.device,
              fingerCount: paymentIntent.metadata?.fingerCount ? parseInt(paymentIntent.metadata.fingerCount) : undefined,
            });

            // Server-side Purchase event
            const evtId = purchaseEventId(paymentIntent.id);
            void trackServerEvent({
              eventType: 'PAYMENT_COMPLETED',
              metadata: {
                email,
                paymentId: paymentIntent.id,
                method: payMethod,
                provider: 'stripe',
                eventId: evtId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency.toUpperCase(),
              },
              path: '/api/webhooks/stripe',
              tiktok: {
                event: TIKTOK_EVENTS.COMPLETE_PAYMENT,
                eventId: evtId,
                email,
                value: paymentIntent.amount / 100,
                currency: paymentIntent.currency.toUpperCase(),
                contentId: PRODUCT.CONTENT_ID,
                contentType: PRODUCT.CONTENT_TYPE,
              },
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        // Pago falló — registrar para analytics
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        // eslint-disable-next-line no-console -- Server-side error logging for payment failures
        console.error(`[SensiPRO] Payment failed for ${failedIntent.receipt_email}: ${failedIntent.last_payment_error?.message}`);
        break;
      }

      default:
        // Eventos que no nos interesan — ignorar silenciosamente
        break;
    }

    // Stripe espera 200 OK para confirmar recepción
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('[SensiPRO] Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 },
    );
  }
}
