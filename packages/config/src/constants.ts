// ══════════════════════════════════════════════════════════
// ARES — Constantes globales del proyecto
// ══════════════════════════════════════════════════════════

// App
export const APP_NAME = 'Sensibilidades PRO';
export const APP_CODENAME = 'ARES';
export const APP_DOMAIN = 'sensibilidadespro.com';

// Sensitivity ranges
export const SENSITIVITY_MIN = 1;
export const SENSITIVITY_MAX = 100;

// Tier limits
export const FREE_SEARCH_LIMIT = 5;
export const FREE_FAVORITE_LIMIT = 3;
export const FREE_HISTORY_LIMIT = 10;
export const FREE_BRANDS = ['Samsung', 'Apple', 'Redmi'];
export const FREE_STYLES = ['BALANCED'] as const;

// Pricing (centavos MXN)
export const PREMIUM_MONTHLY_PRICE = 4900;    // $49 MXN
export const PREMIUM_ANNUAL_PRICE = 39900;    // $399 MXN
export const VIP_MONTHLY_PRICE = 9900;        // $99 MXN
export const VIP_ANNUAL_PRICE = 79900;        // $799 MXN

// Code format
export const CODE_PREFIX = 'ARES';
export const CODE_SEGMENT_LENGTH = 4;
export const CODE_SEGMENTS = 3;

// Durations (days)
export const TIER_DURATIONS: Record<string, number> = {
  PREMIUM_30: 30,
  PREMIUM_90: 90,
  PREMIUM_365: 365,
  VIP_30: 30,
  VIP_90: 90,
  VIP_365: 365,
};

// Referral reward
export const REFERRAL_REWARD_DAYS = 7;
export const REFERRAL_REWARD_TIER = 'PREMIUM';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rate limiting
export const RATE_LIMIT_WINDOW_SECONDS = 86400; // 24 hours

// Sensitivity algorithm base values
export const BASE_SENSITIVITY = {
  general: 50,
  redPoint: 45,
  scope2x: 40,
  scope4x: 35,
  sniperScope: 30,
  freeView: 55,
} as const;

// Gyroscope base factor
export const GYRO_BASE_FACTOR = 0.50;
export const GYRO_PANEL_BONUS = 0.05;     // AMOLED/OLED
export const GYRO_GAMING_BONUS = 0.08;    // GAMING tier

// Calibration multipliers (BAJA=precisión, MEDIA=base, ALTA=velocidad)
export const CALIBRATION_MULTIPLIERS = {
  BAJA: 0.72,
  MEDIA: 1.0,
  ALTA: 1.28,
} as const;

// DPI reduction: when DPI is active, touch input is amplified → sensitivity must be lower
export const DPI_REDUCTION_FACTOR = 0.82;
// DPI precision bonus (CON DPI = more precise, higher precisionScore)
export const DPI_PRECISION_BONUS = 8;

// DPI calculation constants
export const DPI_FORMULA_FACTOR = 4.2;
export const DPI_FORMULA_BASE = 180;
export const DPI_MIN = 200;
export const DPI_MAX = 800;

// Button size thresholds (screenSize en pulgadas → mm)
export const BUTTON_SIZE_MAP: readonly { maxScreen: number; sizeMm: number }[] = [
  { maxScreen: 5.5, sizeMm: 42 },
  { maxScreen: 6.2, sizeMm: 46 },
  { maxScreen: 6.7, sizeMm: 50 },
  { maxScreen: Infinity, sizeMm: 54 },
] as const;

// HUD recommendation thresholds
export const HUD_THRESHOLD_SMALL = 5.8;
export const HUD_THRESHOLD_LARGE = 6.4;
