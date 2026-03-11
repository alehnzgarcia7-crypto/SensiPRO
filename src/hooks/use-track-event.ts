'use client';

import { useCallback, useEffect, useRef } from 'react';

type EventType =
  | 'PAGE_VIEW' | 'SENSI_GENERATED' | 'PAYWALL_SHOWN' | 'PAYWALL_CLICKED'
  | 'PAYMENT_STARTED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED'
  | 'SIGNUP' | 'LOGIN' | 'DEVICE_SEARCHED' | 'HEADSHOT_MODE_USED'
  | 'ACADEMY_VIEWED' | 'PREMIUM_ACTIVATED';

interface TrackEvent {
  eventType: EventType;
  metadata?: Record<string, unknown>;
  path?: string;
}

// Session ID persists per browser tab
let sessionId: string | null = null;
function getSessionId(): string {
  if (!sessionId) {
    try {
      sessionId = sessionStorage.getItem('cc_session_id');
      if (!sessionId) {
        sessionId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem('cc_session_id', sessionId);
      }
    } catch {
      sessionId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }
  return sessionId;
}

// Global event buffer
const eventBuffer: Array<TrackEvent & { sessionId: string; timestamp: number }> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flushEvents(): void {
  if (eventBuffer.length === 0) return;
  const events = eventBuffer.splice(0, eventBuffer.length);
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }

  // Fire and forget
  fetch('/api/command-center/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
    keepalive: true,
  }).catch(() => {});
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(flushEvents, 5000);
}

export function useTrackEvent() {
  const hasTrackedPageView = useRef(false);

  // Flush on unmount/page hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flushEvents();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const track = useCallback((eventType: EventType, metadata?: Record<string, unknown>) => {
    eventBuffer.push({
      eventType,
      metadata,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      sessionId: getSessionId(),
      timestamp: Date.now(),
    });

    if (eventBuffer.length >= 10) {
      flushEvents();
    } else {
      scheduleFlush();
    }
  }, []);

  const trackPageView = useCallback(() => {
    if (hasTrackedPageView.current) return;
    hasTrackedPageView.current = true;
    track('PAGE_VIEW');
  }, [track]);

  return { track, trackPageView };
}
