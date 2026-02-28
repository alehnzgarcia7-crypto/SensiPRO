/**
 * Barrel export para el sistema de pagos lifetime de SensiPRO.
 * Import todo desde aquí: import { ... } from '@/lib/payments';
 */

export { stripeLifetime, PRICING, PAYMENT_METHODS, OXXO_CONFIG } from './stripe-config';
export type { PaymentMetadata } from './stripe-config';

export { mercadopagoClient, LATAM_PRICES, getCurrencyByCountry } from './mercadopago-config';

export {
  checkPremiumStatus,
  createStripeCardPayment,
  createStripeOxxoPayment,
  createMercadoPagoPayment,
  activatePremiumLicense,
  captureEmail,
  PREMIUM_COOKIE_NAME,
  PREMIUM_COOKIE_MAX_AGE,
} from './payment-service';
export type {
  CreatePaymentInput,
  PaymentResult,
  PremiumStatus,
} from './payment-service';
