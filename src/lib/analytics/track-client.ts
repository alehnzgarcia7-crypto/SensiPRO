/**
 * Client-side tracking helper
 *
 * Unified interface for sending events to:
 * 1. Internal analytics API (/api/analytics/track)
 * 2. TikTok Pixel (client-side)
 *
 * All events include session, visitor, and attribution data automatically.
 */

import { getAttributionForEvent } from './attribution';
import { generateEventId } from './dedup';
import { getSessionId, getVisitorId, touchSession } from './session';

interface TrackEventParams {
  event: string;
  eventId?: string;
  properties?: Record<string, unknown>;
  // TikTok-specific — will be sent to pixel AND internal
  tiktokEvent?: string;
  tiktokParams?: Record<string, unknown>;
}

// Buffer for batching internal events
const buffer: Array<Record<string, unknown>> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flush(): void {
  if (buffer.length === 0) return;
  const events = buffer.splice(0, buffer.length);
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }

  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
    keepalive: true,
  }).catch(() => {});
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 3000);
}

// Flush on page hide
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('beforeunload', flush);
}

/** Main client-side tracking function */
export function trackEvent(params: TrackEventParams): string {
  const eventId = params.eventId || generateEventId();

  touchSession();

  const attribution = getAttributionForEvent();

  // Send to internal analytics
  buffer.push({
    event: params.event,
    eventId,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    properties: params.properties || {},
    attribution,
    page: typeof window !== 'undefined' ? window.location.pathname : '',
    route: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: Date.now(),
  });

  if (buffer.length >= 10) {
    flush();
  } else {
    scheduleFlush();
  }

  return eventId;
}

/** Force flush all pending events */
export function flushTrackingEvents(): void {
  flush();
}
