/**
 * PAYMENT SERVICE — El cerebro de los pagos lifetime de SensiPRO
 *
 * Responsabilidades:
 * 1. Crear sesiones de pago (Stripe card, OXXO, MP)
 * 2. Verificar si un email es premium
 * 3. Activar licencias después de pago exitoso
 * 4. Capturar emails para remarketing
 * 5. Registrar intentos de pago (exitosos y fallidos)
 */

import { prisma } from '@ares/database';
import { v4 as uuidv4 } from 'uuid';

import { isAdminEmail } from '@/lib/constants/admin';

import { mpPreference, LATAM_PRICES } from './mercadopago-config';
import { stripeLifetime, PRICING, type PaymentMetadata } from './stripe-config';

// ═══════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════

export interface CreatePaymentInput {
  email: string;
  method: 'card' | 'oxxo' | 'mercadopago';
  device?: string;
  fingerCount?: number;
  style?: string;
  source: PaymentMetadata['source'];
  ipAddress?: string;
  userAgent?: string;
  currency?: string;
}

export interface PaymentResult {
  success: boolean;
  checkoutUrl?: string;
  oxxoVoucherUrl?: string;
  paymentIntentId?: string;
  preferenceId?: string;
  clientSecret?: string;
  error?: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  email?: string;
  activatedAt?: Date;
  paymentMethod?: string;
}

// ═══════════════════════════════════════════════════════
// VERIFICAR PREMIUM
// ═══════════════════════════════════════════════════════

/**
 * Verifica si un email tiene licencia premium activa.
 * Esta es la función MÁS IMPORTANTE — se llama en cada
 * request que necesite verificar acceso.
 */
export async function checkPremiumStatus(email: string): Promise<PremiumStatus> {
  if (!email) return { isPremium: false };

  // Admin override — acceso total permanente sin consultar DB
  if (isAdminEmail(email)) {
    return {
      isPremium: true,
      email: email.toLowerCase().trim(),
      activatedAt: new Date('2024-01-01'),
      paymentMethod: 'admin_override',
    };
  }

  try {
    const license = await prisma.premiumLicense.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        isActive: true,
        email: true,
        activatedAt: true,
        paymentMethod: true,
      },
    });

    if (!license || !license.isActive) {
      return { isPremium: false };
    }

    return {
      isPremium: true,
      email: license.email,
      activatedAt: license.activatedAt,
      paymentMethod: license.paymentMethod,
    };
  } catch (error) {
    console.error('[SensiPRO] Error checking premium status:', error);
    return { isPremium: false };
  }
}

// ═══════════════════════════════════════════════════════
// COOKIE / LOCAL STORAGE CONSTANTS
// ═══════════════════════════════════════════════════════

export const PREMIUM_COOKIE_NAME = 'sensipro_premium';
export const PREMIUM_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 año

// ═══════════════════════════════════════════════════════
// CREAR PAGO — STRIPE CARD
// ═══════════════════════════════════════════════════════

export async function createStripeCardPayment(input: CreatePaymentInput): Promise<PaymentResult> {
  if (!stripeLifetime) {
    return { success: false, error: 'Stripe no está configurado' };
  }

  try {
    const metadata: Record<string, string> = {
      product: 'sensipro_premium_lifetime',
      email: input.email.toLowerCase().trim(),
      source: input.source,
      appVersion: '1.0.0',
    };
    if (input.device) metadata['device'] = input.device;
    if (input.fingerCount) metadata['fingerCount'] = String(input.fingerCount);
    if (input.style) metadata['style'] = input.style;

    const session = await stripeLifetime.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: input.email.toLowerCase().trim(),

      line_items: [{
        price_data: {
          currency: PRICING.currency,
          unit_amount: PRICING.launchPrice,
          product_data: {
            name: 'SensiPRO Premium — Acceso de por vida',
            description: 'Sensibilidad calibrada + Headshot Mode + HUD Codes + Academia completa. Pago único, acceso para siempre.',
            images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://sensibilidadespro.com'}/images/sensipro-premium.png`],
          },
        },
        quantity: 1,
      }],

      metadata,

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?reason=cancelled`,

      locale: 'es',
      expires_at: Math.floor(Date.now() / 1000) + 1800,
      allow_promotion_codes: true,
    });

    // Registrar intento de pago
    await registerPaymentAttempt({
      email: input.email,
      provider: 'stripe',
      method: 'card',
      status: 'pending',
      amount: PRICING.launchPrice,
      currency: PRICING.currency.toUpperCase(),
      externalId: session.id,
      checkoutUrl: session.url || undefined,
      device: input.device,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return {
      success: true,
      checkoutUrl: session.url || undefined,
      paymentIntentId: session.id,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear el pago con tarjeta';
    console.error('[SensiPRO] Stripe card payment error:', error);
    return { success: false, error: message };
  }
}

// ═══════════════════════════════════════════════════════
// CREAR PAGO — STRIPE OXXO
// ═══════════════════════════════════════════════════════

export async function createStripeOxxoPayment(input: CreatePaymentInput): Promise<PaymentResult> {
  if (!stripeLifetime) {
    return { success: false, error: 'Stripe no está configurado' };
  }

  try {
    const metadata: Record<string, string> = {
      product: 'sensipro_premium_lifetime',
      email: input.email.toLowerCase().trim(),
      source: input.source,
      appVersion: '1.0.0',
    };
    if (input.device) metadata['device'] = input.device;
    if (input.fingerCount) metadata['fingerCount'] = String(input.fingerCount);

    // Checkout Session con OXXO — Stripe muestra el voucher en su página hosted.
    // El webhook payment_intent.succeeded se encarga de activar premium cuando
    // el usuario paga en OXXO (24-72h después). Pasamos metadata al PaymentIntent
    // para que el webhook lo identifique como pago de SensiPRO.
    const session = await stripeLifetime.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['oxxo'],
      customer_email: input.email.toLowerCase().trim(),

      line_items: [{
        price_data: {
          currency: PRICING.currency,
          unit_amount: PRICING.launchPrice,
          product_data: {
            name: 'SensiPRO Premium — Acceso de por vida',
            description: 'Sensibilidad calibrada + Headshot Mode + HUD Codes + Academia completa. Pago único, acceso para siempre.',
          },
        },
        quantity: 1,
      }],

      // Metadata en la session (para nuestros registros)
      metadata,

      // Metadata en el PaymentIntent subyacente (para que el webhook lo identifique)
      payment_intent_data: {
        metadata,
        receipt_email: input.email.toLowerCase().trim(),
        description: 'SensiPRO Premium — Acceso de por vida (OXXO)',
      },

      payment_method_options: {
        oxxo: {
          expires_after_days: 3,
        },
      },

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&method=oxxo`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?reason=cancelled`,

      locale: 'es',
      // OXXO sessions necesitan más tiempo — el usuario debe ir a la tienda
      expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 horas
    });

    // Registrar intento
    await registerPaymentAttempt({
      email: input.email,
      provider: 'stripe',
      method: 'oxxo',
      status: 'pending',
      amount: PRICING.launchPrice,
      currency: PRICING.currency.toUpperCase(),
      externalId: session.id,
      checkoutUrl: session.url || undefined,
      device: input.device,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return {
      success: true,
      checkoutUrl: session.url || undefined,
      paymentIntentId: session.id,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear el pago OXXO';
    console.error('[SensiPRO] Stripe OXXO payment error:', error);
    return { success: false, error: message };
  }
}

// ═══════════════════════════════════════════════════════
// CREAR PAGO — MERCADO PAGO
// ═══════════════════════════════════════════════════════

export async function createMercadoPagoPayment(input: CreatePaymentInput): Promise<PaymentResult> {
  if (!mpPreference) {
    return { success: false, error: 'Mercado Pago no está configurado' };
  }

  try {
    const currency = input.currency || 'MXN';
    const priceInfo = LATAM_PRICES[currency] ?? LATAM_PRICES['USD'];
    if (!priceInfo) {
      return { success: false, error: 'Moneda no soportada' };
    }

    const preference = await mpPreference.create({
      body: {
        items: [{
          id: 'sensipro_premium_lifetime',
          title: 'SensiPRO Premium — Acceso de por vida',
          description: 'Sensibilidad calibrada + Headshot Mode + HUD Codes + Academia completa.',
          quantity: 1,
          unit_price: priceInfo.amount,
          currency_id: priceInfo.currency,
        }],
        payer: {
          email: input.email.toLowerCase().trim(),
        },
        metadata: {
          email: input.email.toLowerCase().trim(),
          device: input.device || '',
          fingerCount: input.fingerCount || 0,
          source: input.source,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?provider=mercadopago`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure?reason=failed`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?provider=mercadopago&status=pending`,
        },
        auto_return: 'approved',
        statement_descriptor: 'SENSIPRO',
        external_reference: uuidv4(),
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Registrar intento
    await registerPaymentAttempt({
      email: input.email,
      provider: 'mercadopago',
      method: 'mercadopago',
      status: 'pending',
      amount: Math.round(priceInfo.amount * 100),
      currency: priceInfo.currency,
      externalId: preference.id || undefined,
      checkoutUrl: preference.init_point || undefined,
      device: input.device,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return {
      success: true,
      checkoutUrl: preference.init_point || undefined,
      preferenceId: preference.id || undefined,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear el pago con Mercado Pago';
    console.error('[SensiPRO] Mercado Pago payment error:', error);
    return { success: false, error: message };
  }
}

// ═══════════════════════════════════════════════════════
// ACTIVAR LICENCIA PREMIUM
// ═══════════════════════════════════════════════════════

/**
 * Llamada por los webhooks después de un pago exitoso.
 * IDEMPOTENTE: Si la licencia ya existe para ese email,
 * no crea duplicado — solo verifica que está activa.
 */
export async function activatePremiumLicense(params: {
  email: string;
  paymentProvider: string;
  paymentId: string;
  paymentMethod: string;
  amountPaid: number;
  currency: string;
  device?: string;
  fingerCount?: number;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; isNew: boolean }> {
  const email = params.email.toLowerCase().trim();

  try {
    // Verificar si ya tiene licencia (idempotencia)
    const existing = await prisma.premiumLicense.findUnique({
      where: { email },
    });

    if (existing) {
      // Ya tiene licencia — asegurar que está activa
      if (!existing.isActive) {
        await prisma.premiumLicense.update({
          where: { email },
          data: { isActive: true },
        });
      }
      return { success: true, isNew: false };
    }

    // Crear nueva licencia
    await prisma.premiumLicense.create({
      data: {
        email,
        isActive: true,
        paymentProvider: params.paymentProvider,
        paymentId: params.paymentId,
        paymentMethod: params.paymentMethod,
        amountPaid: params.amountPaid,
        currency: params.currency,
        originalPrice: PRICING.originalPrice,
        deviceUsed: params.device,
        fingerCount: params.fingerCount,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });

    // Marcar intento como exitoso
    await prisma.paymentAttempt.updateMany({
      where: {
        externalId: params.paymentId,
        status: 'pending',
      },
      data: { status: 'succeeded' },
    });

    // Marcar email como convertido (si fue capturado antes)
    await prisma.emailCapture.updateMany({
      where: { email, converted: false },
      data: { converted: true, convertedAt: new Date() },
    });

    // eslint-disable-next-line no-console -- Server-side logging for successful activations
    console.log(`[SensiPRO] Premium activado para ${email} via ${params.paymentMethod}`);
    return { success: true, isNew: true };
  } catch (error) {
    console.error('[SensiPRO] Error activating premium:', error);
    return { success: false, isNew: false };
  }
}

// ═══════════════════════════════════════════════════════
// CAPTURAR EMAIL
// ═══════════════════════════════════════════════════════

export async function captureEmail(params: {
  email: string;
  source: string;
  device?: string;
  style?: string;
  fingerCount?: number;
}): Promise<boolean> {
  try {
    await prisma.emailCapture.create({
      data: {
        email: params.email.toLowerCase().trim(),
        source: params.source,
        deviceUsed: params.device,
        styleUsed: params.style,
        fingerCount: params.fingerCount,
      },
    });
    return true;
  } catch {
    // Silenciar errores de duplicado — no es crítico
    return false;
  }
}

// ═══════════════════════════════════════════════════════
// REGISTRAR INTENTO DE PAGO
// ═══════════════════════════════════════════════════════

async function registerPaymentAttempt(params: {
  email: string;
  provider: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  externalId?: string;
  checkoutUrl?: string;
  oxxoVoucherUrl?: string;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.paymentAttempt.create({
      data: {
        email: params.email.toLowerCase().trim(),
        provider: params.provider,
        method: params.method,
        status: params.status,
        amount: params.amount,
        currency: params.currency,
        externalId: params.externalId,
        checkoutUrl: params.checkoutUrl,
        oxxoVoucherUrl: params.oxxoVoucherUrl,
        deviceUsed: params.device,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // No fallar si no se puede registrar — el pago es más importante
    console.error('[SensiPRO] Error registering payment attempt:', error);
  }
}
