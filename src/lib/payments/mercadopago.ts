import crypto from 'crypto';

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

import { logger } from '@ares/logger';
import { BusinessError } from '@ares/errors';
import {
  PREMIUM_MONTHLY_PRICE,
  VIP_MONTHLY_PRICE,
} from '@ares/config';

// ══════════════════════════════════════════════════════════
// MercadoPago SDK — Pasarela principal para Mexico
// ══════════════════════════════════════════════════════════

const accessToken = process.env.MP_ACCESS_TOKEN ?? '';

const client = new MercadoPagoConfig({
  accessToken,
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com';

// Precios en pesos MXN (no centavos — MP usa pesos enteros)
const TIER_PRICES: Record<
  string,
  { title: string; description: string; unitPrice: number }
> = {
  PREMIUM: {
    title: 'SensiPRO Premium — 1 Mes',
    description:
      'Acceso Premium: todos los estilos, giroscopio, comparador, exportar, y mas',
    unitPrice: PREMIUM_MONTHLY_PRICE / 100, // 49 MXN
  },
  VIP: {
    title: 'SensiPRO VIP — 1 Mes',
    description:
      'Acceso VIP: todo Premium + sin anuncios, torneos exclusivos, temas VIP, soporte prioritario',
    unitPrice: VIP_MONTHLY_PRICE / 100, // 99 MXN
  },
};

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface CreatePreferenceInput {
  userId: string;
  userEmail: string;
  tier: 'PREMIUM' | 'VIP';
  months?: number;
}

interface PreferenceResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

interface ExternalReference {
  userId: string;
  tier: 'PREMIUM' | 'VIP';
  months: number;
}

// ──────────────────────────────────────────────────────────
// Crear preferencia de pago
// ──────────────────────────────────────────────────────────

export async function createPaymentPreference(
  input: CreatePreferenceInput,
): Promise<PreferenceResult> {
  const { userId, userEmail, tier, months = 1 } = input;
  const tierInfo = TIER_PRICES[tier];

  if (!tierInfo) {
    throw new BusinessError('INVALID_TIER', `Tier invalido: ${tier}`);
  }

  if (!accessToken) {
    throw new BusinessError(
      'MP_NOT_CONFIGURED',
      'MercadoPago no esta configurado. Contacta soporte.',
    );
  }

  const preference = new Preference(client);

  const externalRef: ExternalReference = { userId, tier, months };

  const result = await preference.create({
    body: {
      items: [
        {
          id: `${tier}-${months}m`,
          title:
            months > 1
              ? `SensiPRO ${tier} — ${months} Meses`
              : tierInfo.title,
          description: tierInfo.description,
          quantity: months,
          unit_price: tierInfo.unitPrice,
          currency_id: 'MXN',
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${SITE_URL}/payment/success`,
        failure: `${SITE_URL}/payment/failure`,
        pending: `${SITE_URL}/payment/success`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify(externalRef),
      notification_url: `${SITE_URL}/api/webhooks/mercadopago`,
      statement_descriptor: 'SENSIPRO',
    },
  });

  logger.info('MercadoPago preference created', {
    userId,
    tier,
    months,
    preferenceId: result.id,
  });

  return {
    preferenceId: result.id ?? '',
    initPoint: result.init_point ?? '',
    sandboxInitPoint: result.sandbox_init_point ?? '',
  };
}

// ──────────────────────────────────────────────────────────
// Obtener informacion de un pago
// ──────────────────────────────────────────────────────────

export async function getPaymentInfo(paymentId: number) {
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}

// ──────────────────────────────────────────────────────────
// Verificar firma del webhook
// ──────────────────────────────────────────────────────────

export function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;

  // En desarrollo sin secret, aceptar todos los webhooks
  if (!secret) {
    logger.warn('MP_WEBHOOK_SECRET not set — skipping signature verification');
    return true;
  }

  // Parsear la firma: ts=xxx,v1=xxx
  const parts: Record<string, string> = {};
  for (const segment of xSignature.split(',')) {
    const eqIndex = segment.indexOf('=');
    if (eqIndex === -1) continue;
    const key = segment.slice(0, eqIndex).trim();
    const val = segment.slice(eqIndex + 1).trim();
    parts[key] = val;
  }

  const ts = parts['ts'];
  const hash = parts['v1'];

  if (!ts || !hash) {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return hash === expected;
}

// ──────────────────────────────────────────────────────────
// Parsear external reference
// ──────────────────────────────────────────────────────────

export function parseExternalReference(
  raw: string | undefined | null,
): ExternalReference | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'userId' in parsed &&
      'tier' in parsed
    ) {
      const ref = parsed as Record<string, unknown>;
      const tier = ref['tier'];
      if (tier !== 'PREMIUM' && tier !== 'VIP') return null;

      return {
        userId: String(ref['userId']),
        tier,
        months: typeof ref['months'] === 'number' ? ref['months'] : 1,
      };
    }
  } catch {
    return null;
  }

  return null;
}
