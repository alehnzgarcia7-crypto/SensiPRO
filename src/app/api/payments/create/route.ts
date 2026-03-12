/**
 * POST /api/payments/create
 *
 * Crea una sesión de pago según el método elegido.
 * Body: { email, method, device?, fingerCount?, style?, source, currency? }
 *
 * Returns:
 * - card: { checkoutUrl } → redirigir al checkout de Stripe
 * - oxxo: { clientSecret } → usar con Stripe Elements para mostrar voucher
 * - mercadopago: { checkoutUrl } → redirigir al checkout de MP
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { TIKTOK_EVENTS, PRODUCT } from '@/lib/analytics/constants';
import { checkoutEventId } from '@/lib/analytics/dedup';
import { trackServerEvent } from '@/lib/analytics/track-server';
import {
  createStripeCardPayment,
  createStripeOxxoPayment,
  createMercadoPagoPayment,
  checkPremiumStatus,
  type CreatePaymentInput,
} from '@/lib/payments/payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación
    const { email, method, device, fingerCount, style, source, currency } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 },
      );
    }

    if (!method || !['card', 'oxxo', 'mercadopago'].includes(method)) {
      return NextResponse.json(
        { error: 'Método de pago inválido. Usa: card, oxxo, o mercadopago' },
        { status: 400 },
      );
    }

    // Verificar si ya es premium
    const premiumStatus = await checkPremiumStatus(email);
    if (premiumStatus.isPremium) {
      return NextResponse.json(
        { error: 'Este email ya tiene acceso Premium', isPremium: true },
        { status: 409 },
      );
    }

    // Crear pago según método
    const input: CreatePaymentInput = {
      email: email.toLowerCase().trim(),
      method,
      device,
      fingerCount,
      style,
      source: source || 'generator',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      currency,
    };

    let result;

    switch (method) {
      case 'card':
        result = await createStripeCardPayment(input);
        break;
      case 'oxxo':
        result = await createStripeOxxoPayment(input);
        break;
      case 'mercadopago':
        result = await createMercadoPagoPayment(input);
        break;
      default:
        return NextResponse.json({ error: 'Método no soportado' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error procesando el pago' },
        { status: 500 },
      );
    }

    // Server-side InitiateCheckout event — fires after checkout session is CREATED
    const checkoutId = result.paymentIntentId || result.preferenceId || `${method}_${Date.now()}`;
    const eventId = checkoutEventId(checkoutId);
    const ttclid = typeof body.ttclid === 'string' ? body.ttclid : undefined;

    void trackServerEvent({
      eventType: 'PAYMENT_STARTED',
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : undefined,
      metadata: {
        method,
        email: email.toLowerCase().trim(),
        device,
        checkoutId,
        eventId,
        source: source || 'generator',
      },
      path: '/api/payments/create',
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      tiktok: {
        event: TIKTOK_EVENTS.INITIATE_CHECKOUT,
        eventId,
        email: email.toLowerCase().trim(),
        value: PRODUCT.VALUE,
        currency: PRODUCT.CURRENCY,
        contentId: PRODUCT.CONTENT_ID,
        contentType: PRODUCT.CONTENT_TYPE,
        ttclid,
      },
    });

    return NextResponse.json({ ...result, eventId });
  } catch (error: unknown) {
    console.error('[SensiPRO] Payment creation error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
