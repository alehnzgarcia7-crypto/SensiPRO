import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';

import {
  getPaymentInfo,
  verifyWebhookSignature,
  parseExternalReference,
} from '@/lib/payments/mercadopago';

// ══════════════════════════════════════════════════════════
// POST /api/webhooks/mercadopago
// Procesa notificaciones de MercadoPago (IPN)
// ══════════════════════════════════════════════════════════

interface MercadoPagoWebhookBody {
  type: string;
  data?: {
    id?: string | number;
  };
  action?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MercadoPagoWebhookBody;

    logger.info('MercadoPago webhook received', {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
    });

    // Solo procesar notificaciones de tipo payment
    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    // Verificar firma
    const xSignature = request.headers.get('x-signature') ?? '';
    const xRequestId = request.headers.get('x-request-id') ?? '';
    const dataId = String(body.data.id);

    const isValid = verifyWebhookSignature(xSignature, xRequestId, dataId);
    if (!isValid) {
      logger.warn('Invalid MercadoPago webhook signature', {
        dataId,
        xRequestId,
      });
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Firma invalida', statusCode: 401 } },
        { status: 401 },
      );
    }

    // Obtener info del pago desde MP
    const paymentInfo = await getPaymentInfo(Number(dataId));

    if (paymentInfo.status !== 'approved') {
      logger.info('Payment not approved, skipping', {
        paymentId: dataId,
        status: paymentInfo.status,
      });
      return NextResponse.json({ received: true });
    }

    // Parsear external_reference
    const externalRef = parseExternalReference(paymentInfo.external_reference);
    if (!externalRef) {
      logger.warn('Invalid external_reference in payment', {
        paymentId: dataId,
        externalReference: paymentInfo.external_reference,
      });
      return NextResponse.json({ received: true });
    }

    const { userId, tier, months } = externalRef;

    // Verificar que no hayamos procesado este pago antes
    const existingPayment = await prisma.payment.findFirst({
      where: { externalId: dataId },
    });

    if (existingPayment) {
      logger.info('Payment already processed, skipping', {
        paymentId: dataId,
        existingId: existingPayment.id,
      });
      return NextResponse.json({ received: true });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.error('User not found for payment', { userId, paymentId: dataId });
      return NextResponse.json({ received: true });
    }

    // Calcular fecha de expiracion
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + months);

    // Si el usuario ya tiene una suscripcion activa que expira despues de ahora,
    // extender desde esa fecha
    if (user.tierExpiresAt && user.tierExpiresAt > now) {
      expiresAt.setTime(user.tierExpiresAt.getTime());
      expiresAt.setMonth(expiresAt.getMonth() + months);
    }

    // Transaccion: actualizar usuario + registrar pago + crear suscripcion
    const amountCentavos = Math.round(
      (paymentInfo.transaction_amount ?? 0) * 100,
    );

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
          provider: 'MERCADOPAGO',
          externalId: dataId,
          amount: amountCentavos,
          currency: 'MXN',
          status: 'COMPLETED',
          metadata: {
            mpPaymentId: paymentInfo.id,
            mpStatus: paymentInfo.status,
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

    logger.info('MercadoPago payment processed — user upgraded', {
      userId,
      tier,
      months,
      expiresAt: expiresAt.toISOString(),
      mpPaymentId: paymentInfo.id,
      amount: paymentInfo.transaction_amount,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('MercadoPago webhook error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Retornar 200 para que MP no reintente infinitamente
    return NextResponse.json({ received: true });
  }
}
