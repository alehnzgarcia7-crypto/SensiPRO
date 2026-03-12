/**
 * POST /api/webhooks/mercadopago
 *
 * Mercado Pago envía notificaciones IPN aquí.
 * Cuando un pago se aprueba, activamos la licencia.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { TIKTOK_EVENTS, PRODUCT } from '@/lib/analytics/constants';
import { purchaseEventId } from '@/lib/analytics/dedup';
import { trackServerEvent } from '@/lib/analytics/track-server';
import { mpPayment } from '@/lib/payments/mercadopago-config';
import { activatePremiumLicense } from '@/lib/payments/payment-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!mpPayment) {
    return NextResponse.json({ error: 'MP not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();

    // MP envía diferentes tipos de notificación
    if (body.type === 'payment' || body.action === 'payment.updated') {
      const paymentId = body.data?.id;

      if (!paymentId) {
        return NextResponse.json({ received: true });
      }

      // Consultar el pago completo a MP
      const payment = await mpPayment.get({ id: paymentId });

      if (payment.status === 'approved') {
        const metadata = payment.metadata as Record<string, unknown> | undefined;
        const email = payment.payer?.email ||
                      (metadata?.email as string | undefined);

        if (email) {
          const mpId = String(payment.id);
          const amountPaid = Math.round((payment.transaction_amount || 199) * 100);
          const currency = payment.currency_id || 'MXN';

          await activatePremiumLicense({
            email,
            paymentProvider: 'mercadopago',
            paymentId: mpId,
            paymentMethod: 'mercadopago',
            amountPaid,
            currency,
            device: metadata?.device as string | undefined,
            fingerCount: metadata?.fingerCount
              ? parseInt(String(metadata.fingerCount))
              : undefined,
          });

          // Server-side Purchase event
          const evtId = purchaseEventId(mpId);
          void trackServerEvent({
            eventType: 'PAYMENT_COMPLETED',
            metadata: {
              email,
              paymentId: mpId,
              method: 'mercadopago',
              provider: 'mercadopago',
              eventId: evtId,
              amount: amountPaid,
              currency,
            },
            path: '/api/webhooks/mercadopago',
            tiktok: {
              event: TIKTOK_EVENTS.PURCHASE,
              eventId: evtId,
              email,
              value: (payment.transaction_amount || 199),
              currency,
              contentId: PRODUCT.CONTENT_ID,
              contentType: PRODUCT.CONTENT_TYPE,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('[SensiPRO] MP webhook error:', error);
    // MP reintenta si no recibe 200/201
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
