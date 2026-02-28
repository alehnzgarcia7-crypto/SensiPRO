/**
 * MERCADO PAGO CONFIGURATION — SensiPRO Premium (Lifetime)
 *
 * Mercado Pago para el resto de LATAM:
 * - Argentina (ARS), Brasil (BRL), Colombia (COP)
 * - Chile (CLP), Perú (PEN), Uruguay (UYU)
 * - México (MXN) — como alternativa a Stripe
 */

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Validación
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.warn('[SensiPRO Payments] MERCADOPAGO_ACCESS_TOKEN no configurado — Mercado Pago deshabilitado');
}

// Instancia de Mercado Pago
export const mercadopagoClient = process.env.MERCADOPAGO_ACCESS_TOKEN
  ? new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    })
  : null;

// Helpers para crear preferencias y consultar pagos
export const mpPreference = mercadopagoClient
  ? new Preference(mercadopagoClient)
  : null;

export const mpPayment = mercadopagoClient
  ? new Payment(mercadopagoClient)
  : null;

// Conversiones de precio por país (aproximados)
// Base: $299 MXN = ~$14.90 USD (Feb 2026)
export const LATAM_PRICES: Record<string, {
  amount: number;
  currency: string;
  symbol: string;
  country: string;
  formatted: string;
}> = {
  MXN: { amount: 299, currency: 'MXN', symbol: '$', country: 'México', formatted: '$299 MXN' },
  ARS: { amount: 14900, currency: 'ARS', symbol: '$', country: 'Argentina', formatted: '$14,900 ARS' },
  BRL: { amount: 79.90, currency: 'BRL', symbol: 'R$', country: 'Brasil', formatted: 'R$79.90' },
  COP: { amount: 64900, currency: 'COP', symbol: '$', country: 'Colombia', formatted: '$64,900 COP' },
  CLP: { amount: 14900, currency: 'CLP', symbol: '$', country: 'Chile', formatted: '$14,900 CLP' },
  PEN: { amount: 54.90, currency: 'PEN', symbol: 'S/', country: 'Perú', formatted: 'S/54.90' },
  UYU: { amount: 649, currency: 'UYU', symbol: '$', country: 'Uruguay', formatted: '$649 UYU' },
  USD: { amount: 14.99, currency: 'USD', symbol: '$', country: 'Internacional', formatted: '$14.99 USD' },
};

// Detectar moneda por país
export function getCurrencyByCountry(countryCode: string): string {
  const map: Record<string, string> = {
    MX: 'MXN', AR: 'ARS', BR: 'BRL', CO: 'COP',
    CL: 'CLP', PE: 'PEN', UY: 'UYU',
  };
  return map[countryCode?.toUpperCase()] || 'USD';
}
