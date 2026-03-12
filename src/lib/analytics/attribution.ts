/**
 * Attribution — Captures and persists traffic source data
 *
 * Captures: UTM params, ttclid, referrer, landing page, deep-link params
 * Persists in sessionStorage so it survives navigation within the funnel
 */

const ATTRIBUTION_KEY = 'sp_attribution';

export interface Attribution {
  // UTM
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;

  // TikTok
  ttclid: string | null;

  // Context
  referrer: string | null;
  landingPage: string | null;

  // Deep-link params
  deepLinkBrand: string | null;
  deepLinkModel: string | null;
  deepLinkStyle: string | null;

  // Meta
  capturedAt: number;
}

/** Parse attribution from current URL + document */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') {
    return emptyAttribution();
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    utmContent: params.get('utm_content'),
    utmTerm: params.get('utm_term'),
    ttclid: params.get('ttclid'),
    referrer: document.referrer || null,
    landingPage: window.location.pathname + window.location.search,
    deepLinkBrand: params.get('brand'),
    deepLinkModel: params.get('model'),
    deepLinkStyle: params.get('style'),
    capturedAt: Date.now(),
  };
}

function emptyAttribution(): Attribution {
  return {
    utmSource: null, utmMedium: null, utmCampaign: null,
    utmContent: null, utmTerm: null, ttclid: null,
    referrer: null, landingPage: null,
    deepLinkBrand: null, deepLinkModel: null, deepLinkStyle: null,
    capturedAt: Date.now(),
  };
}

/** Persist attribution — only overwrites if new data has source info */
export function persistAttribution(attr: Attribution): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getPersistedAttribution();

    // Only overwrite if the new attribution has actual source data
    // (don't erase campaign info on internal navigation)
    if (attr.utmSource || attr.ttclid || !existing) {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attr));
    }
  } catch {
    // Ignore storage errors
  }
}

/** Get persisted attribution from session */
export function getPersistedAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

/** Get attribution for event payloads (compact format) */
export function getAttributionForEvent(): Record<string, string> {
  const attr = getPersistedAttribution();
  if (!attr) return {};

  const result: Record<string, string> = {};
  if (attr.utmSource) result.utm_source = attr.utmSource;
  if (attr.utmMedium) result.utm_medium = attr.utmMedium;
  if (attr.utmCampaign) result.utm_campaign = attr.utmCampaign;
  if (attr.utmContent) result.utm_content = attr.utmContent;
  if (attr.utmTerm) result.utm_term = attr.utmTerm;
  if (attr.ttclid) result.ttclid = attr.ttclid;
  if (attr.referrer) result.referrer = attr.referrer;
  if (attr.landingPage) result.landing_page = attr.landingPage;

  return result;
}
