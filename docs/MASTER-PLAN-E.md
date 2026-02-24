# ARES SensiPRO — MASTER PLAN E
# ══════════════════════════════════════════════════════════════
# FASE 4 — MONETIZACIÓN (8 scripts: ARES-400 → ARES-407)
# "Cómo esto genera dinero real"
# ══════════════════════════════════════════════════════════════
#
# Sistema completo de monetización para el mercado mexicano:
# MercadoPago como pasarela principal, Stripe como alternativa,
# códigos de activación para venta offline/influencers,
# sistema de referidos, y analytics de revenue.
# ══════════════════════════════════════════════════════════════

## Instrucciones para Claude Code

1. **Lee CLAUDE.md** para convenciones
2. **Variables de entorno requeridas**: MP_ACCESS_TOKEN, MP_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
3. **Precios en MXN**: Premium $49/mes, VIP $99/mes
4. **Webhooks**: Siempre verificar firma antes de procesar
5. **Después de terminar**: actualiza PROGRESS.md, git commit + push

---

# ████████████████████████████████████████████████████████████
# █                                                          █
# █   FASE 4 — MONETIZACIÓN                                 █
# █   Scripts 33-40 | El engine de revenue                  █
# █                                                          █
# ████████████████████████████████████████████████████████████

---

## ARES-400-tier-system

**Fase:** 4 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-003-auth-system
**Descripción:** Sistema de tiers FREE/PREMIUM/VIP con feature gates, checkAccess helper, upgrade/downgrade lógica, y middleware de protección. Es la base de toda la monetización.

### Archivos a crear:

```
[ARCHIVO] src/lib/tiers/tier-config.ts
```
```typescript
import type { UserTier } from '@prisma/client';

export interface TierConfig {
  key: UserTier;
  name: string;
  nameEs: string;
  priceMxn: number;
  priceLabel: string;
  color: string;
  icon: string;
  features: Record<string, boolean | number>;
}

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  FREE: {
    key: 'FREE',
    name: 'Free',
    nameEs: 'Gratis',
    priceMxn: 0,
    priceLabel: 'Gratis',
    color: '#64748b',
    icon: '🎮',
    features: {
      generateSensitivity: true,
      styleBalanced: true,
      styleAggressive: false,
      styleSniper: false,
      gyroscope: false,
      compareDevices: false,
      exportImage: false,
      maxFavorites: 3,
      maxHistory: 10,
      maxSearchesPerDay: 5,
      noAds: false,
      vipThemes: false,
      tournaments: false,
      prioritySupport: false,
      earlyAccess: false,
      academyFull: false,
    },
  },
  PREMIUM: {
    key: 'PREMIUM',
    name: 'Premium',
    nameEs: 'Premium',
    priceMxn: 49,
    priceLabel: '$49 MXN/mes',
    color: '#f59e0b',
    icon: '⭐',
    features: {
      generateSensitivity: true,
      styleBalanced: true,
      styleAggressive: true,
      styleSniper: true,
      gyroscope: true,
      compareDevices: true,
      exportImage: true,
      maxFavorites: 9999,
      maxHistory: 9999,
      maxSearchesPerDay: 9999,
      noAds: false,
      vipThemes: false,
      tournaments: false,
      prioritySupport: false,
      earlyAccess: false,
      academyFull: true,
    },
  },
  VIP: {
    key: 'VIP',
    name: 'VIP',
    nameEs: 'VIP',
    priceMxn: 99,
    priceLabel: '$99 MXN/mes',
    color: '#a855f7',
    icon: '👑',
    features: {
      generateSensitivity: true,
      styleBalanced: true,
      styleAggressive: true,
      styleSniper: true,
      gyroscope: true,
      compareDevices: true,
      exportImage: true,
      maxFavorites: 9999,
      maxHistory: 9999,
      maxSearchesPerDay: 9999,
      noAds: true,
      vipThemes: true,
      tournaments: true,
      prioritySupport: true,
      earlyAccess: true,
      academyFull: true,
    },
  },
};

export function getTierConfig(tier: UserTier): TierConfig {
  return TIER_CONFIGS[tier];
}
```

```
[ARCHIVO] src/lib/tiers/feature-gate.ts
```
```typescript
import type { UserTier } from '@prisma/client';

import { TIER_CONFIGS } from './tier-config';

type FeatureKey = keyof typeof TIER_CONFIGS.FREE.features;

/**
 * Check if a tier has access to a specific feature
 */
export function hasFeature(tier: UserTier, feature: FeatureKey): boolean {
  const config = TIER_CONFIGS[tier];
  const value = config.features[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}

/**
 * Get numeric limit for a feature (e.g. maxFavorites)
 */
export function getFeatureLimit(tier: UserTier, feature: FeatureKey): number {
  const config = TIER_CONFIGS[tier];
  const value = config.features[feature];
  return typeof value === 'number' ? value : (value ? 9999 : 0);
}

/**
 * Check if user can access based on tier hierarchy
 */
export function canAccessTier(userTier: UserTier, requiredTier: UserTier): boolean {
  const levels: Record<UserTier, number> = { FREE: 0, PREMIUM: 1, VIP: 2 };
  return levels[userTier] >= levels[requiredTier];
}

/**
 * Get the minimum tier required for a feature
 */
export function getMinimumTier(feature: FeatureKey): UserTier {
  if (hasFeature('FREE', feature)) return 'FREE';
  if (hasFeature('PREMIUM', feature)) return 'PREMIUM';
  return 'VIP';
}

/**
 * Get list of features user gains by upgrading
 */
export function getUpgradeFeatures(currentTier: UserTier, targetTier: UserTier): string[] {
  const current = TIER_CONFIGS[currentTier].features;
  const target = TIER_CONFIGS[targetTier].features;
  const gains: string[] = [];

  const labels: Record<string, string> = {
    styleAggressive: 'Estilo Agresivo',
    styleSniper: 'Estilo Francotirador',
    gyroscope: 'Giroscopio',
    compareDevices: 'Comparador de dispositivos',
    exportImage: 'Exportar imagen',
    noAds: 'Sin anuncios',
    vipThemes: 'Temas VIP exclusivos',
    tournaments: 'Torneos VIP',
    prioritySupport: 'Soporte prioritario',
    earlyAccess: 'Acceso anticipado',
    academyFull: 'Academia completa',
  };

  for (const [key, label] of Object.entries(labels)) {
    const curVal = current[key];
    const tarVal = target[key];
    if (!curVal && tarVal) gains.push(label);
  }

  return gains;
}
```

```
[ARCHIVO] src/lib/tiers/index.ts
```
```typescript
export { getTierConfig, TIER_CONFIGS } from './tier-config';
export type { TierConfig } from './tier-config';
export { hasFeature, getFeatureLimit, canAccessTier, getMinimumTier, getUpgradeFeatures } from './feature-gate';
```

```
[ARCHIVO] src/lib/tiers/__tests__/feature-gate.test.ts
```
```typescript
import { describe, it, expect } from 'vitest';

import { hasFeature, getFeatureLimit, canAccessTier, getMinimumTier, getUpgradeFeatures } from '../feature-gate';

describe('hasFeature', () => {
  it('FREE has generateSensitivity', () => {
    expect(hasFeature('FREE', 'generateSensitivity')).toBe(true);
  });
  it('FREE does NOT have gyroscope', () => {
    expect(hasFeature('FREE', 'gyroscope')).toBe(false);
  });
  it('PREMIUM has gyroscope', () => {
    expect(hasFeature('PREMIUM', 'gyroscope')).toBe(true);
  });
  it('VIP has noAds', () => {
    expect(hasFeature('VIP', 'noAds')).toBe(true);
  });
  it('PREMIUM does NOT have noAds', () => {
    expect(hasFeature('PREMIUM', 'noAds')).toBe(false);
  });
});

describe('getFeatureLimit', () => {
  it('FREE maxFavorites is 3', () => {
    expect(getFeatureLimit('FREE', 'maxFavorites')).toBe(3);
  });
  it('PREMIUM maxFavorites is 9999', () => {
    expect(getFeatureLimit('PREMIUM', 'maxFavorites')).toBe(9999);
  });
});

describe('canAccessTier', () => {
  it('VIP can access PREMIUM content', () => {
    expect(canAccessTier('VIP', 'PREMIUM')).toBe(true);
  });
  it('FREE cannot access PREMIUM', () => {
    expect(canAccessTier('FREE', 'PREMIUM')).toBe(false);
  });
});

describe('getMinimumTier', () => {
  it('gyroscope minimum is PREMIUM', () => {
    expect(getMinimumTier('gyroscope')).toBe('PREMIUM');
  });
  it('noAds minimum is VIP', () => {
    expect(getMinimumTier('noAds')).toBe('VIP');
  });
});

describe('getUpgradeFeatures', () => {
  it('FREE→PREMIUM gains multiple features', () => {
    const gains = getUpgradeFeatures('FREE', 'PREMIUM');
    expect(gains).toContain('Giroscopio');
    expect(gains).toContain('Estilo Agresivo');
    expect(gains).not.toContain('Sin anuncios');
  });
});
```

### Validación:
```bash
npx tsc --noEmit
npx vitest run src/lib/tiers/__tests__/feature-gate.test.ts
```

### Commit: `feat(tiers): ARES-400 tier system — FREE/PREMIUM/VIP config, feature gates, access checks + 9 tests`

---

## ARES-401-mercadopago-integration

**Fase:** 4 | **Prioridad:** CRÍTICO
**Dependencias:** ARES-400, ARES-003
**Descripción:** Integración con MercadoPago (pasarela principal para México): crear preferencia de pago, webhook para confirmar, páginas de success/failure, y helper para crear suscripciones.

### Archivos a crear:

```
[ARCHIVO] src/lib/payments/mercadopago.ts
```
```typescript
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

import { logger } from '@ares/logger';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com';

interface CreatePreferenceInput {
  userId: string;
  userEmail: string;
  tier: 'PREMIUM' | 'VIP';
  months?: number;
}

const TIER_PRICES: Record<string, { title: string; unitPrice: number }> = {
  PREMIUM: { title: 'SensiPRO Premium — 1 Mes', unitPrice: 49 },
  VIP: { title: 'SensiPRO VIP — 1 Mes', unitPrice: 99 },
};

export async function createPaymentPreference(input: CreatePreferenceInput) {
  const { userId, userEmail, tier, months = 1 } = input;
  const tierInfo = TIER_PRICES[tier];

  if (!tierInfo) throw new Error(`Invalid tier: ${tier}`);

  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [
        {
          id: `${tier}-${months}m`,
          title: tierInfo.title,
          description: `Acceso ${tier} a Sensibilidades PRO por ${months} mes(es)`,
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
        pending: `${SITE_URL}/payment/pending`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({ userId, tier, months }),
      notification_url: `${SITE_URL}/api/webhooks/mercadopago`,
      statement_descriptor: 'SENSIPRO',
    },
  });

  logger.info('MercadoPago preference created', { userId, tier, preferenceId: result.id });

  return {
    preferenceId: result.id,
    initPoint: result.init_point,
    sandboxInitPoint: result.sandbox_init_point,
  };
}

export async function getPaymentInfo(paymentId: string) {
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}

export function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
): boolean {
  // MercadoPago HMAC verification
  const crypto = require('crypto');
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;

  const parts = xSignature.split(',').reduce((acc: Record<string, string>, part: string) => {
    const [key, val] = part.split('=');
    acc[key.trim()] = val.trim();
    return acc;
  }, {});

  const ts = parts['ts'];
  const hash = parts['v1'];

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return hash === expected;
}
```

```
[ARCHIVO] src/app/api/payments/create/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { createPaymentPreference } from '@/lib/payments/mercadopago';

const createSchema = z.object({
  tier: z.enum(['PREMIUM', 'VIP']),
  months: z.number().int().min(1).max(12).optional().default(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();
    const parsed = createSchema.parse(body);

    const result = await createPaymentPreference({
      userId: session.user.id,
      userEmail: session.user.email!,
      tier: parsed.tier,
      months: parsed.months,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/app/api/webhooks/mercadopago/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import { getPaymentInfo, verifyWebhookSignature } from '@/lib/payments/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify signature
    const xSignature = request.headers.get('x-signature') ?? '';
    const xRequestId = request.headers.get('x-request-id') ?? '';

    if (body.type === 'payment' && body.data?.id) {
      const isValid = verifyWebhookSignature(xSignature, xRequestId, String(body.data.id));
      if (!isValid) {
        logger.warn('Invalid MercadoPago webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }

      const payment = await getPaymentInfo(body.data.id);

      if (payment.status === 'approved') {
        const externalRef = JSON.parse(payment.external_reference ?? '{}');
        const { userId, tier, months } = externalRef;

        if (userId && tier) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + (months ?? 1));

          // Upgrade user
          await prisma.user.update({
            where: { id: userId },
            data: {
              tier,
              tierExpiresAt: expiresAt,
            },
          });

          // Record payment
          await prisma.payment.create({
            data: {
              userId,
              provider: 'MERCADOPAGO',
              externalId: String(payment.id),
              amount: payment.transaction_amount ?? 0,
              currency: 'MXN',
              status: 'COMPLETED',
              tier,
              months: months ?? 1,
            },
          });

          logger.info('Payment processed — user upgraded', { userId, tier, paymentId: payment.id });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('MercadoPago webhook error', { error: String(error) });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

```
[ARCHIVO] src/app/(app)/payment/success/page.tsx
```
```tsx
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
        <CheckCircle size={40} className="text-success" />
      </div>
      <h1 className="text-3xl font-display font-bold text-white">¡Pago exitoso!</h1>
      <p className="mt-3 text-slate-400">
        Tu cuenta ha sido actualizada. Ya puedes disfrutar de todas las funciones.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/generator">
          <Button variant="primary" className="w-full">Ir al Generador</Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" className="w-full">Ver mi cuenta</Button>
        </Link>
      </div>
    </div>
  );
}
```

```
[ARCHIVO] src/app/(app)/payment/failure/page.tsx
```
```tsx
import Link from 'next/link';
import { XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function PaymentFailurePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-danger/10 mb-6">
        <XCircle size={40} className="text-danger" />
      </div>
      <h1 className="text-3xl font-display font-bold text-white">Pago no completado</h1>
      <p className="mt-3 text-slate-400">
        El pago no se pudo procesar. No se realizó ningún cargo. Puedes intentar de nuevo.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/pricing">
          <Button variant="primary" className="w-full">Intentar de nuevo</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="w-full">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
# Test payment creation (requires MP_ACCESS_TOKEN)
curl -X POST http://localhost:3000/api/payments/create -H "Content-Type: application/json" -d '{"tier":"PREMIUM"}'
```

### Commit: `feat(mercadopago): ARES-401 MercadoPago integration — preferences, webhook, success/failure pages`

---

## ARES-402-stripe-integration

**Fase:** 4 | **Prioridad:** ALTO
**Dependencias:** ARES-400
**Descripción:** Stripe como pasarela alternativa para usuarios internacionales o con tarjeta de crédito. Checkout session, webhook, y procesamiento de pagos.

### Archivos a crear:

```
[ARCHIVO] src/lib/payments/stripe.ts
```
```typescript
import Stripe from 'stripe';

import { logger } from '@ares/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com';

const STRIPE_PRICES: Record<string, { priceId: string; amount: number }> = {
  PREMIUM: { priceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? '', amount: 49_00 },
  VIP: { priceId: process.env.STRIPE_VIP_PRICE_ID ?? '', amount: 99_00 },
};

interface CreateCheckoutInput {
  userId: string;
  userEmail: string;
  tier: 'PREMIUM' | 'VIP';
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  const { userId, userEmail, tier } = input;
  const priceInfo = STRIPE_PRICES[tier];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `SensiPRO ${tier} — 1 Mes`,
            description: `Acceso ${tier} a Sensibilidades PRO`,
          },
          unit_amount: priceInfo.amount,
        },
        quantity: 1,
      },
    ],
    metadata: { userId, tier, months: '1' },
    success_url: `${SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/payment/failure`,
  });

  logger.info('Stripe checkout created', { userId, tier, sessionId: session.id });
  return { sessionId: session.id, url: session.url };
}

export async function constructWebhookEvent(payload: string, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}

export { stripe };
```

```
[ARCHIVO] src/app/api/webhooks/stripe/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import { constructWebhookEvent } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') ?? '';

    const event = await constructWebhookEvent(payload, signature);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Record<string, unknown>;
      const metadata = session.metadata as Record<string, string>;
      const { userId, tier, months } = metadata;

      if (userId && tier) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + parseInt(months ?? '1', 10));

        await prisma.user.update({
          where: { id: userId },
          data: { tier: tier as 'PREMIUM' | 'VIP', tierExpiresAt: expiresAt },
        });

        await prisma.payment.create({
          data: {
            userId,
            provider: 'STRIPE',
            externalId: session.id as string,
            amount: ((session.amount_total as number) ?? 0) / 100,
            currency: 'MXN',
            status: 'COMPLETED',
            tier: tier as 'PREMIUM' | 'VIP',
            months: parseInt(months ?? '1', 10),
          },
        });

        logger.info('Stripe payment processed', { userId, tier });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', { error: String(error) });
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
```

### Validación:
```bash
npx tsc --noEmit
# Test with Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Commit: `feat(stripe): ARES-402 Stripe integration — checkout session, webhook processing`

---

## ARES-403-activation-codes

**Fase:** 4 | **Prioridad:** ALTO
**Dependencias:** ARES-400
**Descripción:** Códigos de activación ARES-XXXX-XXXX-XXXX para venta offline, influencers, y promociones. Generar, validar, activar, bulk generate, y admin UI.

### Archivos a crear:

```
[ARCHIVO] src/lib/payments/activation-codes.ts
```
```typescript
import crypto from 'crypto';

import { prisma } from '@ares/database';
import { BusinessError, NotFoundError } from '@ares/errors';
import { logger } from '@ares/logger';
import type { UserTier } from '@prisma/client';

/**
 * Generate a code in format: ARES-XXXX-XXXX-XXXX
 */
function generateCodeString(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 to avoid confusion
  const segment = () =>
    Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join('');
  return `ARES-${segment()}-${segment()}-${segment()}`;
}

export async function generateActivationCode(
  tier: 'PREMIUM' | 'VIP',
  durationMonths: number,
  generatedBy: string,
  note?: string,
) {
  let code: string;
  let attempts = 0;

  // Ensure unique code
  do {
    code = generateCodeString();
    const existing = await prisma.activationCode.findUnique({ where: { code } });
    if (!existing) break;
    attempts++;
  } while (attempts < 10);

  const activationCode = await prisma.activationCode.create({
    data: {
      code: code!,
      tier,
      durationMonths,
      generatedBy,
      note: note ?? null,
    },
  });

  logger.info('Activation code generated', { code: activationCode.code, tier, durationMonths });
  return activationCode;
}

export async function bulkGenerateCodes(
  tier: 'PREMIUM' | 'VIP',
  durationMonths: number,
  count: number,
  generatedBy: string,
  note?: string,
) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = await generateActivationCode(tier, durationMonths, generatedBy, note);
    codes.push(code);
  }
  logger.info('Bulk codes generated', { count, tier, generatedBy });
  return codes;
}

export async function validateCode(code: string) {
  const normalized = code.toUpperCase().trim();
  const activationCode = await prisma.activationCode.findUnique({
    where: { code: normalized },
  });

  if (!activationCode) {
    throw new NotFoundError('Código de activación', normalized);
  }

  if (activationCode.usedAt) {
    throw new BusinessError('CODE_ALREADY_USED', 'Este código ya fue utilizado');
  }

  if (activationCode.expiresAt && activationCode.expiresAt < new Date()) {
    throw new BusinessError('CODE_EXPIRED', 'Este código ha expirado');
  }

  return {
    valid: true,
    tier: activationCode.tier,
    durationMonths: activationCode.durationMonths,
  };
}

export async function redeemCode(code: string, userId: string) {
  const normalized = code.toUpperCase().trim();

  // Validate first
  await validateCode(normalized);

  const activationCode = await prisma.activationCode.findUnique({
    where: { code: normalized },
  });

  if (!activationCode) throw new NotFoundError('Code', normalized);

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + activationCode.durationMonths);

  // Upgrade user
  await prisma.user.update({
    where: { id: userId },
    data: {
      tier: activationCode.tier as UserTier,
      tierExpiresAt: expiresAt,
    },
  });

  // Mark code as used
  await prisma.activationCode.update({
    where: { code: normalized },
    data: {
      usedAt: new Date(),
      usedBy: userId,
    },
  });

  // Record as payment
  await prisma.payment.create({
    data: {
      userId,
      provider: 'ACTIVATION_CODE',
      externalId: normalized,
      amount: 0,
      currency: 'MXN',
      status: 'COMPLETED',
      tier: activationCode.tier as 'PREMIUM' | 'VIP',
      months: activationCode.durationMonths,
    },
  });

  logger.info('Activation code redeemed', { code: normalized, userId, tier: activationCode.tier });

  return { tier: activationCode.tier, expiresAt };
}
```

```
[ARCHIVO] src/app/api/activation-codes/redeem/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { handleApiError } from '@ares/errors';
import { getRequiredSession } from '@/lib/auth/auth.middleware';
import { redeemCode } from '@/lib/payments/activation-codes';

const redeemSchema = z.object({
  code: z.string().min(16).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body = await request.json();
    const parsed = redeemSchema.parse(body);

    const result = await redeemCode(parsed.code, session.user.id);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
```

```
[ARCHIVO] src/components/features/redeem-code.tsx
```
```tsx
'use client';

import { useState } from 'react';
import { Ticket, Check, AlertCircle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function RedeemCode() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRedeem = async () => {
    if (code.length < 16) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/activation-codes/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(`¡Activado! Tu cuenta es ${data.data.tier} hasta ${new Date(data.data.expiresAt).toLocaleDateString('es-MX')}`);
      } else {
        setStatus('error');
        setMessage(data.error?.message ?? 'Código inválido');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión');
    }
  };

  // Auto-format: add dashes
  const handleChange = (value: string) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const parts = [
      clean.slice(0, 4),
      clean.slice(4, 8),
      clean.slice(8, 12),
      clean.slice(12, 16),
    ].filter(Boolean);

    if (parts[0] === 'ARES') {
      setCode(`ARES-${parts.slice(1).join('-')}`);
    } else {
      setCode(parts.join('-'));
    }
  };

  return (
    <div className="glass p-6">
      <h3 className="font-display font-bold text-white mb-2 flex items-center gap-2">
        <Ticket size={18} className="text-fire-500" />
        Código de Activación
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Ingresa tu código ARES-XXXX-XXXX-XXXX para activar Premium o VIP
      </p>

      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="ARES-XXXX-XXXX-XXXX"
          className="font-mono tracking-wider uppercase"
          maxLength={19}
        />
        <Button variant="primary" onClick={handleRedeem} loading={status === 'loading'} disabled={code.length < 16}>
          Activar
        </Button>
      </div>

      {status === 'success' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-success">
          <Check size={14} /> {message}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-danger">
          <AlertCircle size={14} /> {message}
        </div>
      )}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
# Test code generation in seed or admin endpoint
```

### Commit: `feat(codes): ARES-403 activation codes — ARES-XXXX-XXXX-XXXX generate, validate, redeem + UI component`

---

## ARES-404-subscription-management

**Fase:** 4 | **Prioridad:** ALTO
**Dependencias:** ARES-400, ARES-401
**Descripción:** Gestión de suscripciones: renovación, cancelación, expiración automática (cron job), y página de perfil con estado de suscripción.

### Archivos a crear:

```
[ARCHIVO] src/lib/payments/subscription.ts
```
```typescript
import { prisma } from '@ares/database';
import { logger } from '@ares/logger';

/**
 * Check and expire subscriptions that have passed their tierExpiresAt
 * Run this as a cron job daily
 */
export async function expireSubscriptions() {
  const expired = await prisma.user.findMany({
    where: {
      tier: { not: 'FREE' },
      tierExpiresAt: { lt: new Date() },
    },
    select: { id: true, username: true, tier: true, tierExpiresAt: true },
  });

  if (expired.length === 0) return { expired: 0 };

  await prisma.user.updateMany({
    where: {
      id: { in: expired.map((u) => u.id) },
    },
    data: {
      tier: 'FREE',
      tierExpiresAt: null,
    },
  });

  logger.info('Subscriptions expired', { count: expired.length, userIds: expired.map((u) => u.id) });

  return { expired: expired.length, users: expired };
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      tierExpiresAt: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, provider: true, amount: true, status: true, tier: true, months: true, createdAt: true,
        },
      },
    },
  });

  if (!user) return null;

  const daysRemaining = user.tierExpiresAt
    ? Math.max(0, Math.ceil((user.tierExpiresAt.getTime() - Date.now()) / 86400000))
    : null;

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;

  return {
    tier: user.tier,
    expiresAt: user.tierExpiresAt,
    daysRemaining,
    isExpiringSoon,
    recentPayments: user.payments,
  };
}
```

```
[ARCHIVO] src/app/api/cron/expire-subscriptions/route.ts
```
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { expireSubscriptions } from '@/lib/payments/subscription';

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await expireSubscriptions();
  return NextResponse.json({ success: true, data: result });
}
```

```
[ARCHIVO] src/app/(app)/profile/subscription/page.tsx
```
```tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Crown, AlertTriangle, Calendar, CreditCard } from 'lucide-react';

import { auth } from '@/lib/auth';
import { getSubscriptionStatus } from '@/lib/payments/subscription';
import { getTierConfig } from '@/lib/tiers';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RedeemCode } from '@/components/features/redeem-code';

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const status = await getSubscriptionStatus(session.user.id);
  if (!status) redirect('/login');

  const tierConfig = getTierConfig(status.tier);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Mi Suscripción</h1>

      {/* Current plan */}
      <Card variant="glow" className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tierConfig.icon}</span>
            <div>
              <h2 className="font-display font-bold text-white">{tierConfig.nameEs}</h2>
              <p className="text-sm text-slate-400">{tierConfig.priceLabel}</p>
            </div>
          </div>
          <Badge variant={status.tier === 'VIP' ? 'vip' : status.tier === 'PREMIUM' ? 'premium' : 'free'}>
            {status.tier}
          </Badge>
        </div>

        {status.expiresAt && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-slate-400">
              Expira: {new Date(status.expiresAt).toLocaleDateString('es-MX')}
              {status.daysRemaining !== null && ` (${status.daysRemaining} días restantes)`}
            </span>
          </div>
        )}

        {status.isExpiringSoon && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
            <AlertTriangle size={16} />
            Tu suscripción expira pronto. Renueva para no perder acceso.
          </div>
        )}

        {status.tier === 'FREE' && (
          <div className="mt-4">
            <Link href="/pricing">
              <Button variant="primary" leftIcon={<Crown size={16} />}>Mejorar Plan</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Redeem code */}
      <div className="mb-6">
        <RedeemCode />
      </div>

      {/* Payment history */}
      {status.recentPayments.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-white mb-3 flex items-center gap-2">
            <CreditCard size={16} /> Historial de Pagos
          </h2>
          <div className="space-y-2">
            {status.recentPayments.map((p) => (
              <div key={p.id} className="glass p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-ui font-semibold text-white">{p.tier} — {p.months} mes(es)</p>
                  <p className="text-xs text-slate-500">{p.provider} • {new Date(p.createdAt).toLocaleDateString('es-MX')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-white">
                    {p.amount > 0 ? `$${p.amount} MXN` : 'Código'}
                  </p>
                  <Badge variant="free" size="sm">{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
# Test cron endpoint
curl -X POST http://localhost:3000/api/cron/expire-subscriptions -H "Authorization: Bearer $CRON_SECRET"
```

### Commit: `feat(subscriptions): ARES-404 subscription management — expiration cron, status page, payment history`

---

## ARES-405-referral-system

**Fase:** 4 | **Prioridad:** MEDIO
**Dependencias:** ARES-400, ARES-003
**Descripción:** Sistema de referidos: cada usuario tiene un referral code, invitar da 7 días Premium gratis al referido y al referente, tracking de referidos, y página de referidos.

### Archivos a crear:

```
[ARCHIVO] src/lib/payments/referrals.ts
```
```typescript
import { prisma } from '@ares/database';
import { logger } from '@ares/logger';

const REFERRAL_BONUS_DAYS = 7;

export async function processReferral(newUserId: string, referralCode: string) {
  // Find the referrer
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true, tier: true, tierExpiresAt: true },
  });

  if (!referrer || referrer.id === newUserId) return null;

  const bonusExpiry = new Date();
  bonusExpiry.setDate(bonusExpiry.getDate() + REFERRAL_BONUS_DAYS);

  // Give bonus to new user (7 days Premium)
  const newUserCurrentExpiry = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { tierExpiresAt: true },
  });

  const newUserExpiry = newUserCurrentExpiry?.tierExpiresAt
    ? new Date(Math.max(newUserCurrentExpiry.tierExpiresAt.getTime(), bonusExpiry.getTime()))
    : bonusExpiry;

  await prisma.user.update({
    where: { id: newUserId },
    data: {
      tier: 'PREMIUM',
      tierExpiresAt: newUserExpiry,
      referredBy: referrer.id,
    },
  });

  // Give bonus to referrer (extend 7 days)
  const referrerExpiry = referrer.tierExpiresAt
    ? new Date(referrer.tierExpiresAt.getTime() + REFERRAL_BONUS_DAYS * 86400000)
    : bonusExpiry;

  await prisma.user.update({
    where: { id: referrer.id },
    data: {
      tier: referrer.tier === 'FREE' ? 'PREMIUM' : referrer.tier,
      tierExpiresAt: referrerExpiry,
      totalReferrals: { increment: 1 },
    },
  });

  logger.info('Referral processed', {
    referrerId: referrer.id,
    newUserId,
    bonusDays: REFERRAL_BONUS_DAYS,
  });

  return { referrerId: referrer.id, bonusDays: REFERRAL_BONUS_DAYS };
}

export async function getReferralStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, totalReferrals: true },
  });

  const referred = await prisma.user.findMany({
    where: { referredBy: userId },
    select: { id: true, username: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return {
    referralCode: user?.referralCode,
    totalReferrals: user?.totalReferrals ?? 0,
    referredUsers: referred,
    bonusDaysPerReferral: REFERRAL_BONUS_DAYS,
  };
}
```

```
[ARCHIVO] src/app/(app)/profile/referrals/page.tsx
```
```tsx
import { redirect } from 'next/navigation';
import { Users, Gift, Copy } from 'lucide-react';

import { auth } from '@/lib/auth';
import { getReferralStats } from '@/lib/payments/referrals';
import { Card } from '@/components/ui/card';
import { CopyReferralCode } from '@/components/features/copy-referral';

export default async function ReferralsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const stats = await getReferralStats(session.user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-white mb-2">Referidos</h1>
      <p className="text-sm text-slate-400 mb-6">
        Invita amigos y ambos reciben {stats.bonusDaysPerReferral} días Premium gratis
      </p>

      {/* Referral code */}
      <Card variant="glow" className="p-6 mb-6">
        <p className="text-xs font-ui text-slate-500 uppercase tracking-wider mb-2">Tu Código</p>
        <CopyReferralCode code={stats.referralCode ?? ''} />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-5 text-center">
          <Users size={24} className="mx-auto text-fire-500 mb-2" />
          <p className="text-2xl font-display font-black text-white">{stats.totalReferrals}</p>
          <p className="text-xs text-slate-500">Referidos totales</p>
        </Card>
        <Card className="p-5 text-center">
          <Gift size={24} className="mx-auto text-ice-500 mb-2" />
          <p className="text-2xl font-display font-black text-white">{stats.totalReferrals * stats.bonusDaysPerReferral}</p>
          <p className="text-xs text-slate-500">Días Premium ganados</p>
        </Card>
      </div>

      {/* Referred users */}
      {stats.referredUsers.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-white mb-3">Usuarios Referidos</h2>
          <div className="space-y-2">
            {stats.referredUsers.map((u) => (
              <div key={u.id} className="glass p-3 flex items-center justify-between">
                <span className="text-sm text-white font-ui">{u.username}</span>
                <span className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString('es-MX')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

```
[ARCHIVO] src/components/features/copy-referral.tsx
```
```tsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

import { useToast } from '@/components/ui/toast';

interface CopyReferralCodeProps { code: string }

export function CopyReferralCode({ code }: CopyReferralCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast('success', '¡Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('error', 'No se pudo copiar');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-background-base rounded-gaming p-3 font-mono text-lg text-fire-400 tracking-wider text-center">
        {code}
      </div>
      <button
        onClick={handleCopy}
        className="p-3 rounded-gaming bg-fire-500/10 hover:bg-fire-500/20 text-fire-500 transition-colors touch-target"
      >
        {copied ? <Check size={20} /> : <Copy size={20} />}
      </button>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
```

### Commit: `feat(referrals): ARES-405 referral system — 7-day Premium bonus, tracking, referral page`

---

## ARES-406-premium-gate

**Fase:** 4 | **Prioridad:** ALTO
**Dependencias:** ARES-400
**Descripción:** Componente de Premium lock overlay reutilizable: blur content, CTA de upgrade contextual, smart upselling basado en la feature bloqueada.

### Archivos a crear:

```
[ARCHIVO] src/components/features/premium-gate.tsx
```
```tsx
'use client';

import { Lock, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getMinimumTier, getUpgradeFeatures } from '@/lib/tiers';
import { cn } from '@/lib/cn';

interface PremiumGateProps {
  feature: string;
  userTier: 'FREE' | 'PREMIUM' | 'VIP';
  children: React.ReactNode;
  blurAmount?: number;
  showPreview?: boolean;
  className?: string;
}

const FEATURE_UPSELL: Record<string, { title: string; description: string; icon: typeof Lock }> = {
  gyroscope: { title: 'Giroscopio PRO', description: 'Valores de giroscopio calibrados para tu dispositivo', icon: Zap },
  compareDevices: { title: 'Comparador', description: 'Compara 2 dispositivos side-by-side', icon: Crown },
  exportImage: { title: 'Exportar Imagen', description: 'Descarga tu config como imagen para compartir', icon: Crown },
  styleAggressive: { title: 'Estilo Agresivo', description: 'Sensibilidades optimizadas para rush', icon: Zap },
  styleSniper: { title: 'Estilo Francotirador', description: 'Máxima precisión para largo alcance', icon: Zap },
  vipThemes: { title: 'Temas VIP', description: 'Temas exclusivos: Neon Purple, Blood Red, Matrix Green', icon: Crown },
};

export function PremiumGate({ feature, userTier, children, blurAmount = 8, showPreview = true, className }: PremiumGateProps) {
  const requiredTier = getMinimumTier(feature as never);

  const tierLevel: Record<string, number> = { FREE: 0, PREMIUM: 1, VIP: 2 };
  const hasAccess = tierLevel[userTier] >= tierLevel[requiredTier];

  if (hasAccess) return <>{children}</>;

  const upsell = FEATURE_UPSELL[feature] ?? { title: 'Contenido Premium', description: 'Mejora tu plan para acceder', icon: Lock };
  const Icon = upsell.icon;
  const gains = getUpgradeFeatures(userTier, requiredTier);

  return (
    <div className={cn('relative overflow-hidden rounded-gaming', className)}>
      {/* Blurred preview */}
      {showPreview && (
        <div className="pointer-events-none select-none" style={{ filter: `blur(${blurAmount}px)` }}>
          {children}
        </div>
      )}

      {/* Overlay */}
      <div className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        showPreview ? 'absolute inset-0 bg-background-base/60 backdrop-blur-sm' : '',
      )}>
        <div className="w-14 h-14 rounded-2xl bg-fire-500/10 flex items-center justify-center mb-4">
          <Icon size={24} className="text-fire-500" />
        </div>
        <h3 className="font-display font-bold text-white text-lg">{upsell.title}</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">{upsell.description}</p>

        {gains.length > 0 && (
          <div className="mt-4 text-left">
            {gains.slice(0, 3).map((g) => (
              <div key={g} className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                <span className="text-success">✓</span> {g}
              </div>
            ))}
          </div>
        )}

        <Link href="/pricing" className="mt-5">
          <Button variant="primary" size="sm" leftIcon={<Crown size={14} />}>
            Obtener {requiredTier}
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

### Validación:
```bash
npx tsc --noEmit
```

### Commit: `feat(gate): ARES-406 premium gate — blur overlay, contextual upsell, feature-based CTA`

---

## ARES-407-revenue-analytics

**Fase:** 4 | **Prioridad:** MEDIO
**Dependencias:** ARES-400, ARES-401, ARES-403
**Descripción:** Dashboard admin de revenue: MRR, pagos por día, conversión free→paid, LTV estimado, códigos vendidos, y charts.

### Archivos a crear:

```
[ARCHIVO] src/lib/analytics/revenue.ts
```
```typescript
import { prisma } from '@ares/database';

export async function getRevenueAnalytics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalUsers,
    premiumUsers,
    vipUsers,
    totalPayments,
    last30DaysPayments,
    totalRevenue,
    last30Revenue,
    activationCodesUsed,
    activationCodesTotal,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { tier: 'PREMIUM' } }),
    prisma.user.count({ where: { tier: 'VIP' } }),
    prisma.payment.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.count({ where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
    prisma.activationCode.count({ where: { usedAt: { not: null } } }),
    prisma.activationCode.count(),
  ]);

  const paidUsers = premiumUsers + vipUsers;
  const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;
  const mrr = (premiumUsers * 49) + (vipUsers * 99);
  const ltv = paidUsers > 0 ? (totalRevenue._sum.amount ?? 0) / paidUsers : 0;
  const arr = mrr * 12;

  // Daily revenue for last 30 days
  const dailyRevenue = await prisma.$queryRaw<{ date: string; total: number }[]>`
    SELECT DATE(created_at) as date, SUM(amount) as total
    FROM payments
    WHERE status = 'COMPLETED' AND created_at >= ${thirtyDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  return {
    overview: {
      totalUsers,
      premiumUsers,
      vipUsers,
      paidUsers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      mrr,
      arr,
      ltv: Math.round(ltv * 100) / 100,
    },
    revenue: {
      totalRevenue: totalRevenue._sum.amount ?? 0,
      last30Days: last30Revenue._sum.amount ?? 0,
      totalPayments,
      last30DaysPayments,
      dailyRevenue,
    },
    codes: {
      total: activationCodesTotal,
      used: activationCodesUsed,
      unused: activationCodesTotal - activationCodesUsed,
    },
  };
}
```

```
[ARCHIVO] src/app/api/admin/revenue/route.ts
```
```typescript
import { NextResponse } from 'next/server';

import { handleApiError } from '@ares/errors';
import { requireRole } from '@/lib/auth/auth.middleware';
import { getRevenueAnalytics } from '@/lib/analytics/revenue';

export async function GET() {
  try {
    await requireRole('ADMIN');
    const analytics = await getRevenueAnalytics();
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Validación:
```bash
npx tsc --noEmit
curl http://localhost:3000/api/admin/revenue # (requires ADMIN role)
```

### Commit: `feat(revenue): ARES-407 revenue analytics — MRR, conversion, LTV, daily revenue, code tracking`

---

# ═══════════════════════════════════════════════════════════════════
# FIN DE FASE 4 — MONETIZACIÓN
# ═══════════════════════════════════════════════════════════════════
#
# Al completar los 8 scripts de esta fase, el proyecto genera dinero:
#
# ✅ Tiers FREE/PREMIUM/VIP con feature gates y access checks
# ✅ MercadoPago: preferences, webhook, success/failure pages
# ✅ Stripe: checkout session + webhook (alternativa internacional)
# ✅ Códigos ARES-XXXX-XXXX-XXXX: generate, validate, redeem + UI
# ✅ Suscripciones: expiración automática, status page, historial
# ✅ Referidos: 7 días Premium por invitación + tracking + página
# ✅ Premium gate: blur overlay contextual + smart upselling
# ✅ Revenue analytics: MRR, conversión, LTV, daily charts
#
# MODELO DE NEGOCIO:
# - FREE: Generador básico (estilo Balanceado, 5 búsquedas/día)
# - PREMIUM $49/mes: 3 estilos, gyro, comparador, export, academia
# - VIP $99/mes: Todo + sin ads, temas, torneos, soporte
# - Códigos: Venta offline, influencers, promociones
# - Referidos: Viral growth loop (7 días gratis)
#
# PRÓXIMA FASE: docs/MASTER-PLAN-F.md (Fase 5 — Comunidad y Social)
#
# ═══════════════════════════════════════════════════════════════════
