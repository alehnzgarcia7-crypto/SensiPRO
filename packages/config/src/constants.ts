// ══════════════════════════════════════════════════════════
// ARES — Constantes globales del proyecto
// ══════════════════════════════════════════════════════════

// App
export const APP_NAME = 'Sensibilidades PRO';
export const APP_CODENAME = 'ARES';
export const APP_DOMAIN = 'sensibilidadespro.com';

// Sensitivity ranges (Free Fire usa 60-190)
export const SENSITIVITY_MIN = 60;
export const SENSITIVITY_MAX = 190;

// Gyroscope max (giroscopio no debería superar 140)
export const GYRO_MAX = 140;

// Calibration ranges por nivel
export const CALIBRATION_RANGES = {
  BAJA: { min: 60, max: 140 },
  MEDIA: { min: 141, max: 165 },
  ALTA: { min: 166, max: 190 },
} as const;

// Calibration offsets (reemplazan los multiplicadores viejos)
export const CALIBRATION_OFFSETS = {
  BAJA: -50,
  MEDIA: 0,
  ALTA: 30,
} as const;

// RAM options disponibles y sus offsets para el algoritmo
export const RAM_OPTIONS = [2, 3, 4, 6, 8, 12, 16] as const;
export const RAM_FACTORS: Record<number, number> = {
  2: -15,
  3: -10,
  4: -5,
  6: 0,
  8: 5,
  12: 8,
  16: 10,
};

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

// Sensitivity algorithm base values (rango 60-190, MEDIA cae ~141-165)
export const BASE_SENSITIVITY = {
  general: 150,
  redPoint: 140,
  scope2x: 125,
  scope4x: 110,
  sniperScope: 95,
  freeView: 160,
} as const;

// Gyroscope base factor (proporción de sensibilidad → gyro, valores 60-140)
export const GYRO_BASE_FACTOR = 0.35;
export const GYRO_PANEL_BONUS = 0.05;     // AMOLED/OLED
export const GYRO_GAMING_BONUS = 0.08;    // GAMING tier

// DPI reduction: offset fijo cuando DPI activo (resta 12 a cada valor)
export const DPI_OFFSET = -12;
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
