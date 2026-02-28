/**
 * POST /api/webhooks/mercadopago
 *
 * Mercado Pago envía notificaciones IPN aquí.
 * Cuando un pago se aprueba, activamos la licencia.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
          await activatePremiumLicense({
            email,
            paymentProvider: 'mercadopago',
            paymentId: String(payment.id),
            paymentMethod: 'mercadopago',
            amountPaid: Math.round((payment.transaction_amount || 299) * 100),
            currency: payment.currency_id || 'MXN',
            device: metadata?.device as string | undefined,
            fingerCount: metadata?.fingerCount
              ? parseInt(String(metadata.fingerCount))
              : undefined,
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
