// src/lib/geo-pricing.ts
// Precios equivalentes de $199 MXN en monedas LATAM
// Se cobra SIEMPRE en MXN — esto es solo para MOSTRAR al usuario

export interface CountryPricing {
  countryCode: string;
  countryName: string;
  currency: string;
  symbol: string;
  approximateAmount: string;
  flag: string;
  hasOxxo: boolean;
  hasMercadoPago: boolean;
}

export const LATAM_PRICING: Record<string, CountryPricing> = {
  MX: {
    countryCode: 'MX', countryName: 'México', currency: 'MXN',
    symbol: '$', approximateAmount: '199', flag: '🇲🇽',
    hasOxxo: true, hasMercadoPago: true,
  },
  CO: {
    countryCode: 'CO', countryName: 'Colombia', currency: 'COP',
    symbol: '$', approximateAmount: '41,500', flag: '🇨🇴',
    hasOxxo: false, hasMercadoPago: false,
  },
  PE: {
    countryCode: 'PE', countryName: 'Perú', currency: 'PEN',
    symbol: 'S/', approximateAmount: '38.50', flag: '🇵🇪',
    hasOxxo: false, hasMercadoPago: false,
  },
  AR: {
    countryCode: 'AR', countryName: 'Argentina', currency: 'ARS',
    symbol: '$', approximateAmount: '15,600', flag: '🇦🇷',
    hasOxxo: false, hasMercadoPago: false,
  },
  CL: {
    countryCode: 'CL', countryName: 'Chile', currency: 'CLP',
    symbol: '$', approximateAmount: '10,300', flag: '🇨🇱',
    hasOxxo: false, hasMercadoPago: false,
  },
  BR: {
    countryCode: 'BR', countryName: 'Brasil', currency: 'BRL',
    symbol: 'R$', approximateAmount: '59', flag: '🇧🇷',
    hasOxxo: false, hasMercadoPago: false,
  },
  UY: {
    countryCode: 'UY', countryName: 'Uruguay', currency: 'UYU',
    symbol: '$', approximateAmount: '453', flag: '🇺🇾',
    hasOxxo: false, hasMercadoPago: false,
  },
  BO: {
    countryCode: 'BO', countryName: 'Bolivia', currency: 'BOB',
    symbol: 'Bs', approximateAmount: '77', flag: '🇧🇴',
    hasOxxo: false, hasMercadoPago: false,
  },
  PY: {
    countryCode: 'PY', countryName: 'Paraguay', currency: 'PYG',
    symbol: '₲', approximateAmount: '72,000', flag: '🇵🇾',
    hasOxxo: false, hasMercadoPago: false,
  },
  VE: {
    countryCode: 'VE', countryName: 'Venezuela', currency: 'USD',
    symbol: '$', approximateAmount: '11.15', flag: '🇻🇪',
    hasOxxo: false, hasMercadoPago: false,
  },
  CR: {
    countryCode: 'CR', countryName: 'Costa Rica', currency: 'CRC',
    symbol: '₡', approximateAmount: '5,200', flag: '🇨🇷',
    hasOxxo: false, hasMercadoPago: false,
  },
  GT: {
    countryCode: 'GT', countryName: 'Guatemala', currency: 'GTQ',
    symbol: 'Q', approximateAmount: '86', flag: '🇬🇹',
    hasOxxo: false, hasMercadoPago: false,
  },
  HN: {
    countryCode: 'HN', countryName: 'Honduras', currency: 'HNL',
    symbol: 'L', approximateAmount: '296', flag: '🇭🇳',
    hasOxxo: false, hasMercadoPago: false,
  },
  NI: {
    countryCode: 'NI', countryName: 'Nicaragua', currency: 'NIO',
    symbol: 'C$', approximateAmount: '411', flag: '🇳🇮',
    hasOxxo: false, hasMercadoPago: false,
  },
  PA: {
    countryCode: 'PA', countryName: 'Panamá', currency: 'USD',
    symbol: '$', approximateAmount: '11.15', flag: '🇵🇦',
    hasOxxo: false, hasMercadoPago: false,
  },
  DO: {
    countryCode: 'DO', countryName: 'Rep. Dominicana', currency: 'DOP',
    symbol: 'RD$', approximateAmount: '676', flag: '🇩🇴',
    hasOxxo: false, hasMercadoPago: false,
  },
  EC: {
    countryCode: 'EC', countryName: 'Ecuador', currency: 'USD',
    symbol: '$', approximateAmount: '11.15', flag: '🇪🇨',
    hasOxxo: false, hasMercadoPago: false,
  },
  SV: {
    countryCode: 'SV', countryName: 'El Salvador', currency: 'USD',
    symbol: '$', approximateAmount: '11.15', flag: '🇸🇻',
    hasOxxo: false, hasMercadoPago: false,
  },
  CU: {
    countryCode: 'CU', countryName: 'Cuba', currency: 'USD',
    symbol: '$', approximateAmount: '11.15', flag: '🇨🇺',
    hasOxxo: false, hasMercadoPago: false,
  },
  HT: {
    countryCode: 'HT', countryName: 'Haití', currency: 'HTG',
    symbol: 'G', approximateAmount: '1,460', flag: '🇭🇹',
    hasOxxo: false, hasMercadoPago: false,
  },
};

// Default para países no LATAM o no detectados
export const DEFAULT_PRICING: CountryPricing = {
  countryCode: 'US', countryName: 'Internacional', currency: 'USD',
  symbol: '$', approximateAmount: '11.15', flag: '🌎',
  hasOxxo: false, hasMercadoPago: false,
};

export function getPricingForCountry(countryCode: string): CountryPricing {
  return LATAM_PRICING[countryCode] || DEFAULT_PRICING;
}

export function getCountryList(): CountryPricing[] {
  return Object.values(LATAM_PRICING).sort((a, b) =>
    a.countryName.localeCompare(b.countryName)
  );
}
