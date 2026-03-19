/**
 * POST /api/create-payment-intent
 *
 * Crea un Stripe PaymentIntent para el flujo de pago embebido.
 * Se usa cuando el usuario está en un WebView (TikTok, Instagram, etc.)
 * donde Stripe Checkout Sessions no funcionan.
 *
 * Body: { email, device?, fingerCount?, style?, source? }
 * Returns: { clientSecret }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { checkPremiumStatus } from '@/lib/payments/payment-service';
import { stripeLifetime, PRICING } from '@/lib/payments/stripe-config';

export async function POST(request: NextRequest) {
  if (!stripeLifetime) {
    return NextResponse.json(
      { error: 'Stripe no está configurado' },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { email, device, fingerCount, style, source } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verificar si ya es premium
    const premiumStatus = await checkPremiumStatus(normalizedEmail);
    if (premiumStatus.isPremium) {
      return NextResponse.json(
        { error: 'Este email ya tiene acceso Premium', isPremium: true },
        { status: 409 },
      );
    }

    // Construir metadata (misma que Checkout Sessions para que el webhook funcione)
    const metadata: Record<string, string> = {
      product: 'sensipro_premium_lifetime',
      email: normalizedEmail,
      source: source || 'generator',
      appVersion: '1.0.0',
    };
    if (device) metadata['device'] = String(device);
    if (fingerCount) metadata['fingerCount'] = String(fingerCount);
    if (style) metadata['style'] = String(style);

    const paymentIntent = await stripeLifetime.paymentIntents.create({
      amount: PRICING.launchPrice,
      currency: PRICING.currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: normalizedEmail,
      metadata,
      description: 'SensiPRO Premium — Acceso de por vida (WebView)',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear el PaymentIntent';
    // eslint-disable-next-line no-console -- Server-side error logging
    console.error('[SensiPRO] Create PaymentIntent error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
