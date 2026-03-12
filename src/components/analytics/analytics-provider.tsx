/**
 * AnalyticsProvider — Initializes TikTok Pixel + captures attribution on app load
 *
 * Renders as invisible client component. Placed in Providers wrapper.
 * Does NOT block rendering. Does NOT affect SSR.
 */

'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

import {
  initTikTokPixel,
  ttPageView,
  captureAttribution,
  persistAttribution,
  trackEvent,
  INTERNAL_EVENTS,
  ttViewContent,
  CONTENT_IDS,
  getSessionId,
  getVisitorId,
  hasEventFired,
  markEventFired,
} from '@/lib/analytics';

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);
  const lastPathRef = useRef<string>('');

  // Initialize pixel + capture attribution ONCE on first mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Init TikTok Pixel
    initTikTokPixel();

    // Capture and persist attribution from URL
    const attribution = captureAttribution();
    persistAttribution(attribution);

    // Initialize session + visitor IDs
    getSessionId();
    getVisitorId();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Don't fire duplicate for same path
    if (fullPath === lastPathRef.current) return;
    lastPathRef.current = fullPath;

    // TikTok PageView
    ttPageView();

    // Route-specific tracking
    const path = pathname || '';

    // Landing pages
    if (path === '/' || path === '') {
      if (!hasEventFired('landing_viewed')) {
        markEventFired('landing_viewed');
        trackEvent({ event: INTERNAL_EVENTS.LANDING_SHORT_VIEWED });
        ttViewContent({ contentId: CONTENT_IDS.LANDING_SHORT, contentType: 'landing' });
      }
    }

    // Generator
    else if (path === '/generator') {
      if (!hasEventFired('generator_viewed')) {
        markEventFired('generator_viewed');
        trackEvent({ event: INTERNAL_EVENTS.GENERATOR_VIEWED });
        ttViewContent({ contentId: CONTENT_IDS.GENERATOR, contentType: 'tool' });
      }
    }

    // Headshot
    else if (path === '/generator/headshot') {
      trackEvent({ event: INTERNAL_EVENTS.HEADSHOT_OPENED });
      ttViewContent({ contentId: CONTENT_IDS.HEADSHOT, contentType: 'tool' });
    }

    // Pricing
    else if (path === '/pricing') {
      trackEvent({ event: INTERNAL_EVENTS.PRICING_VIEWED });
      ttViewContent({ contentId: CONTENT_IDS.PRICING, contentType: 'pricing' });
    }

    // Academy
    else if (path.startsWith('/academy')) {
      trackEvent({ event: INTERNAL_EVENTS.ACADEMY_OPENED });
      ttViewContent({ contentId: CONTENT_IDS.ACADEMY, contentType: 'content' });
    }

    // Success page
    else if (path === '/payment/success') {
      trackEvent({ event: INTERNAL_EVENTS.SUCCESS_VIEWED });
    }

    // Cancel/failure page
    else if (path === '/payment/failure') {
      trackEvent({ event: INTERNAL_EVENTS.CANCEL_VIEWED });
      trackEvent({ event: INTERNAL_EVENTS.CHECKOUT_CANCELLED });
    }

  }, [pathname, searchParams]);

  return null;
}

/** Wrapped in Suspense because useSearchParams requires it in App Router */
export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  );
}
