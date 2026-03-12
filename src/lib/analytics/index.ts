/**
 * Analytics barrel exports
 */

// Constants
export { TIKTOK_EVENTS, INTERNAL_EVENTS, CONTENT_IDS, PRODUCT } from './constants';

// Session & Identity
export { getVisitorId, getSessionId, touchSession } from './session';

// Attribution
export {
  captureAttribution,
  persistAttribution,
  getPersistedAttribution,
  getAttributionForEvent,
  type Attribution,
} from './attribution';

// Deduplication
export {
  generateEventId,
  checkoutEventId,
  purchaseEventId,
  hasEventFired,
  markEventFired,
  resetFiredEvents,
} from './dedup';

// Client-side tracking
export { trackEvent, flushTrackingEvents } from './track-client';

// TikTok Pixel (client-side)
export {
  initTikTokPixel,
  trackPageView as ttPageView,
  trackViewContent as ttViewContent,
  trackSearch as ttSearch,
  trackClickButton as ttClickButton,
  trackInitiateCheckout as ttInitiateCheckout,
  trackPurchase as ttPurchase,
  trackCompleteRegistration as ttCompleteRegistration,
  identifyUser as ttIdentifyUser,
} from './pixel';
