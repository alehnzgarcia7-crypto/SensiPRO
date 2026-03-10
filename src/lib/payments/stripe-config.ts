/**
 * STRIPE CONFIGURATION — SensiPRO Premium (Lifetime)
 *
 * Stripe es el procesador principal.
 * Soporta: Tarjeta crédito/débito + OXXO (México)
 *
 * OXXO: El usuario recibe un voucher con un código de barras,
 * va a cualquier OXXO en México, paga en efectivo, y el webhook
 * nos notifica que el pago se completó. Tarda hasta 72 horas.
 */

import Stripe from 'stripe';

// Validación de variables de entorno
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[SensiPRO Payments] STRIPE_SECRET_KEY no configurada — pagos con Stripe deshabilitados');
}

// Instancia de Stripe (null si no hay key)
export const stripeLifetime = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
      typescript: true,
      appInfo: {
        name: 'SensiPRO',
        version: '1.0.0',
        url: 'https://sensibilidadespro.com',
      },
    })
  : null;

// Configuración de precios
export const PRICING = {
  // Precio de lanzamiento (lo que paga el usuario)
  launchPrice: parseInt(process.env.PREMIUM_PRICE_MXN || '19900', 10),

  // Precio original (tachado, para mostrar el descuento)
  originalPrice: parseInt(process.env.PREMIUM_ORIGINAL_PRICE_MXN || '59900', 10),

  // Moneda
  currency: (process.env.PREMIUM_CURRENCY || 'MXN').toLowerCase() as 'mxn',

  // Descuento calculado
  get discountPercent(): number {
    return Math.round((1 - this.launchPrice / this.originalPrice) * 100);
  },

  // Precio formateado para mostrar
  get formattedPrice(): string {
    return `$${(this.launchPrice / 100).toFixed(0)} MXN`;
  },

  get formattedOriginalPrice(): string {
    return `$${(this.originalPrice / 100).toFixed(0)} MXN`;
  },
} as const;

// Métodos de pago habilitados
export const PAYMENT_METHODS = {
  stripe: {
    card: true,
    oxxo: true,
  },
  mercadopago: true,
} as const;

// Configuración de OXXO
export const OXXO_CONFIG = {
  expiresInHours: 72,
  minimumAmount: 1000,
  maximumAmount: 1000000,
} as const;

// Metadata que enviamos con cada pago
export interface PaymentMetadata {
  product: 'sensipro_premium_lifetime';
  email: string;
  device?: string;
  fingerCount?: string;
  style?: string;
  source: 'generator' | 'headshot' | 'academy' | 'pricing' | 'landing';
  appVersion: '1.0.0';
}
