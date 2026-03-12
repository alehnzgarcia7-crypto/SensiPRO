/**
 * TikTok Pixel client-side wrapper
 *
 * Loads TikTok Pixel script and provides typed tracking methods.
 * Only loads in production (or when NEXT_PUBLIC_TIKTOK_PIXEL_ID is set).
 * Safe for SSR — all methods check for window.
 */

import { TIKTOK_EVENTS, PRODUCT } from './constants';
import { generateEventId } from './dedup';

// TikTok Pixel global type
declare global {
  interface Window {
    ttq?: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (event: string, params?: Record<string, unknown>, options?: { event_id?: string }) => void;
      identify: (params: Record<string, unknown>) => void;
    };
    TiktokAnalyticsObject?: string;
  }
}

let pixelLoaded = false;
let pixelId: string | null = null;

/** Initialize TikTok Pixel — call once in provider/layout */
export function initTikTokPixel(): void {
  if (typeof window === 'undefined') return;

  const id = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  if (!id) return;

  if (pixelLoaded) return;
  pixelId = id;

  // Inject TikTok Pixel script tag directly — avoids the IIFE pattern
  // that requires `any` types for the SDK bootstrap queue
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=ttq`;
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);

  // Initialize ttq queue for commands before script loads
  window.TiktokAnalyticsObject = 'ttq';
  if (!window.ttq) {
    // Minimal queue stub — SDK replaces this on load
    const queue: Array<unknown[]> = [];
    const stub = {
      _i: { [id]: [] },
      _t: { [id]: +new Date() },
      _o: { [id]: {} },
      load: () => { /* handled by script src */ },
      page: (...args: unknown[]) => { queue.push(['page', ...args]); },
      track: (...args: unknown[]) => { queue.push(['track', ...args]); },
      identify: (...args: unknown[]) => { queue.push(['identify', ...args]); },
    };
    window.ttq = stub as unknown as typeof window.ttq;
  }

  window.ttq?.page();
  pixelLoaded = true;
}

/** Check if pixel is available */
function getPixel() {
  if (typeof window === 'undefined' || !window.ttq || !pixelId) return null;
  return window.ttq;
}

// ═══════════════════════════════════════════════════════
// TRACKING METHODS
// ═══════════════════════════════════════════════════════

export function trackPageView(): void {
  getPixel()?.page();
}

export function trackViewContent(params: {
  contentId: string;
  contentType?: string;
  description?: string;
}): void {
  const eventId = generateEventId();
  getPixel()?.track(TIKTOK_EVENTS.VIEW_CONTENT, {
    content_id: params.contentId,
    content_type: params.contentType || 'page',
    description: params.description,
  }, { event_id: eventId });
}

export function trackSearch(query: string): void {
  getPixel()?.track(TIKTOK_EVENTS.SEARCH, {
    query,
  });
}

export function trackClickButton(params: {
  contentId?: string;
  description?: string;
}): void {
  getPixel()?.track(TIKTOK_EVENTS.CLICK_BUTTON, {
    content_id: params.contentId,
    description: params.description,
  });
}

export function trackInitiateCheckout(params: {
  eventId: string;
  value?: number;
  currency?: string;
  contentId?: string;
  method?: string;
}): void {
  getPixel()?.track(TIKTOK_EVENTS.INITIATE_CHECKOUT, {
    content_id: params.contentId || PRODUCT.CONTENT_ID,
    content_type: PRODUCT.CONTENT_TYPE,
    value: params.value || PRODUCT.VALUE,
    currency: params.currency || PRODUCT.CURRENCY,
    description: params.method ? `method:${params.method}` : undefined,
  }, { event_id: params.eventId });
}

export function trackCompletePayment(params: {
  eventId: string;
  value?: number;
  currency?: string;
  contentId?: string;
}): void {
  getPixel()?.track(TIKTOK_EVENTS.COMPLETE_PAYMENT, {
    content_id: params.contentId || PRODUCT.CONTENT_ID,
    content_type: PRODUCT.CONTENT_TYPE,
    value: params.value || PRODUCT.VALUE,
    currency: params.currency || PRODUCT.CURRENCY,
  }, { event_id: params.eventId });
}

export function trackCompleteRegistration(params?: {
  contentId?: string;
}): void {
  getPixel()?.track(TIKTOK_EVENTS.COMPLETE_REGISTRATION, {
    content_id: params?.contentId || 'sensipro_registration',
  });
}

/** Identify user for advanced matching */
export function identifyUser(params: {
  email?: string;
  externalId?: string;
}): void {
  const data: Record<string, unknown> = {};
  if (params.email) data.email = params.email;
  if (params.externalId) data.external_id = params.externalId;
  if (Object.keys(data).length > 0) {
    getPixel()?.identify(data);
  }
}
