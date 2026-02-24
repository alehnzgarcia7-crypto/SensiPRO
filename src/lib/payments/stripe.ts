import Stripe from 'stripe';

import { logger } from '@ares/logger';
import { BusinessError } from '@ares/errors';
import {
  PREMIUM_MONTHLY_PRICE,
  VIP_MONTHLY_PRICE,
} from '@ares/config';

// ══════════════════════════════════════════════════════════
// Stripe SDK — Pasarela alternativa para usuarios internacionales
// ══════════════════════════════════════════════════════════

const secretKey = process.env.STRIPE_SECRET_KEY ?? '';

const stripe = new Stripe(secretKey, {
  apiVersion: '2023-08-16',
  typescript: true,
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com';

// Precios en centavos MXN (Stripe usa centavos)
const TIER_PRICES: Record<
  string,
  { title: string; description: string; unitAmount: number }
> = {
  PREMIUM: {
    title: 'SensiPRO Premium — 1 Mes',
    description:
      'Acceso Premium: todos los estilos, giroscopio, comparador, exportar, y mas',
    unitAmount: PREMIUM_MONTHLY_PRICE, // 4900 centavos = $49 MXN
  },
  VIP: {
    title: 'SensiPRO VIP — 1 Mes',
    description:
      'Acceso VIP: todo Premium + sin anuncios, torneos exclusivos, temas VIP, soporte prioritario',
    unitAmount: VIP_MONTHLY_PRICE, // 9900 centavos = $99 MXN
  },
};

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface CreateCheckoutInput {
  userId: string;
  userEmail: string;
  tier: 'PREMIUM' | 'VIP';
  months?: number;
}

interface CheckoutResult {
  sessionId: string;
  url: string;
}

// ──────────────────────────────────────────────────────────
// Crear sesion de checkout
// ──────────────────────────────────────────────────────────

export async function createCheckoutSession(
  input: CreateCheckoutInput,
): Promise<CheckoutResult> {
  const { userId, userEmail, tier, months = 1 } = input;
  const tierInfo = TIER_PRICES[tier];

  if (!tierInfo) {
    throw new BusinessError('INVALID_TIER', `Tier invalido: ${tier}`);
  }

  if (!secretKey) {
    throw new BusinessError(
      'STRIPE_NOT_CONFIGURED',
      'Stripe no esta configurado. Contacta soporte.',
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name:
              months > 1
                ? `SensiPRO ${tier} — ${months} Meses`
                : tierInfo.title,
            description: tierInfo.description,
          },
          unit_amount: tierInfo.unitAmount * months,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      tier,
      months: String(months),
    },
    success_url: `${SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/payment/failure`,
  });

  logger.info('Stripe checkout session created', {
    userId,
    tier,
    months,
    sessionId: session.id,
  });

  return {
    sessionId: session.id,
    url: session.url ?? '',
  };
}

// ──────────────────────────────────────────────────────────
// Construir evento de webhook (verifica firma)
// ──────────────────────────────────────────────────────────

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new BusinessError(
      'STRIPE_WEBHOOK_NOT_CONFIGURED',
      'STRIPE_WEBHOOK_SECRET no esta configurado',
    );
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ──────────────────────────────────────────────────────────
// Recuperar sesion de checkout
// ──────────────────────────────────────────────────────────

export async function retrieveCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId);
}

export { stripe };
