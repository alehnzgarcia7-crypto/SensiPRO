/**
 * Analytics constants — Event names, content types, and configuration
 */

// TikTok Standard Events (para optimización de campañas)
export const TIKTOK_EVENTS = {
  PAGE_VIEW: 'PageView',
  VIEW_CONTENT: 'ViewContent',
  SEARCH: 'Search',
  CLICK_BUTTON: 'ClickButton',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  PURCHASE: 'Purchase',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
} as const;

// Eventos internos SensiPRO (para Command Center / CRO)
export const INTERNAL_EVENTS = {
  // Landing
  LANDING_SHORT_VIEWED: 'landing_short_viewed',
  LANDING_LONG_VIEWED: 'landing_long_viewed',
  LANDING_CTA_GENERATE_CLICKED: 'landing_cta_generate_clicked',

  // Generator
  GENERATOR_VIEWED: 'generator_viewed',
  BRAND_SELECTED: 'brand_selected',
  MODEL_SELECTED: 'model_selected',
  STYLE_SELECTED: 'style_selected',
  RECOMMENDED_SPECS_USED: 'recommended_specs_used',
  RAM_SELECTED: 'ram_selected',
  REFRESH_RATE_SELECTED: 'refresh_rate_selected',
  DPI_ENABLED: 'dpi_enabled',
  GENERATOR_SUBMITTED: 'generator_submitted',
  GENERATOR_COMPLETED: 'generator_completed',
  RESULT_VIEWED: 'result_viewed',

  // Paywall
  BLUR_SHOWN: 'blur_shown',
  UNLOCK_CTA_CLICKED: 'unlock_cta_clicked',
  PAYMENT_METHOD_SELECTED: 'payment_method_selected',

  // Checkout
  CHECKOUT_CREATED: 'checkout_created',
  CHECKOUT_COMPLETED: 'checkout_completed',
  CHECKOUT_FAILED: 'checkout_failed',
  CHECKOUT_CANCELLED: 'checkout_cancelled',

  // Modules
  HEADSHOT_OPENED: 'headshot_opened',
  ACADEMY_OPENED: 'academy_opened',
  PRICING_VIEWED: 'pricing_viewed',

  // Post-payment pages
  SUCCESS_VIEWED: 'success_viewed',
  CANCEL_VIEWED: 'cancel_viewed',

  // In-app browser detection
  INAPP_BROWSER_DETECTED: 'inapp_browser_detected',
  INAPP_BROWSER_REDIRECT: 'inapp_browser_redirect',
  INAPP_BROWSER_COPY_LINK: 'inapp_browser_copy_link',
} as const;

// Content IDs for TikTok
export const CONTENT_IDS = {
  LANDING_SHORT: 'landing_short',
  LANDING_LONG: 'landing_long',
  GENERATOR: 'generator',
  GENERATOR_RESULT: 'generator_result',
  PAYWALL_BLUR: 'paywall_blur',
  PAYWALL_MODAL: 'paywall_modal',
  PRICING: 'pricing',
  HEADSHOT: 'headshot_mode',
  ACADEMY: 'academy',
  PRODUCT: 'sensipro_pro_lifetime',
} as const;

// Product info
export const PRODUCT = {
  CONTENT_ID: 'sensipro_pro_lifetime',
  CONTENT_TYPE: 'product',
  CURRENCY: 'MXN',
  VALUE: 199,
  VALUE_CENTS: 19900,
  NAME: 'SensiPRO Premium Lifetime',
} as const;
