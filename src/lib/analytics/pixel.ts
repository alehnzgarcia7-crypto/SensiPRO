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
interface TtqInstance {
  load: (pixelId: string, options?: Record<string, unknown>) => void;
  page: () => void;
  track: (event: string, params?: Record<string, unknown>, options?: { event_id?: string }) => void;
  identify: (params: Record<string, unknown>) => void;
  instance: (id: string) => TtqInstance;
  push: (args: unknown[]) => void;
  methods: string[];
  setAndDefer: (target: Record<string, unknown>, method: string) => void;
  _i: Record<string, unknown[]>;
  _t: Record<string, number>;
  _o: Record<string, Record<string, unknown>>;
}

declare global {
  interface Window {
    ttq?: TtqInstance;
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

  // Official TikTok Pixel bootstrap — queue stub + script loader
  window.TiktokAnalyticsObject = 'ttq';
  const ttq: TtqInstance = window.ttq = window.ttq || ([] as unknown as TtqInstance);
  ttq.methods = [
    'page', 'track', 'identify', 'instances', 'debug', 'on', 'off',
    'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
    'holdConsent', 'revokeConsent', 'grantConsent',
  ];
  ttq.setAndDefer = function (target: Record<string, unknown>, method: string) {
    target[method] = function () {
      // eslint-disable-next-line prefer-rest-params
      ttq.push([method].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (const method of ttq.methods) {
    ttq.setAndDefer(ttq as unknown as Record<string, unknown>, method);
  }
  ttq.instance = function (instanceId: string) {
    const instance = ttq._i[instanceId] || [];
    for (const method of ttq.methods) {
      ttq.setAndDefer(instance as unknown as Record<string, unknown>, method);
    }
    return instance as unknown as TtqInstance;
  };
  ttq.load = function (pixelIdToLoad: string, options?: Record<string, unknown>) {
    const scriptUrl = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    ttq._i = ttq._i || {};
    ttq._i[pixelIdToLoad] = [];
    (ttq._i[pixelIdToLoad] as unknown as { _u: string })._u = scriptUrl;
    ttq._t = ttq._t || {};
    ttq._t[pixelIdToLoad] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[pixelIdToLoad] = options || {};
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = scriptUrl + '?sdkid=' + pixelIdToLoad + '&lib=ttq';
    const f = document.getElementsByTagName('script')[0];
    f?.parentNode?.insertBefore(s, f);
  };

  ttq.load(id);
  ttq.page();
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

export function trackPurchase(params: {
  eventId: string;
  value?: number;
  currency?: string;
  contentId?: string;
}): void {
  getPixel()?.track(TIKTOK_EVENTS.PURCHASE, {
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
