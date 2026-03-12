/**
 * POST /api/analytics/track
 *
 * Internal analytics endpoint — receives batched events from client-side tracking.
 * Validates, sanitizes, and writes to AnalyticsEvent table.
 */

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { AnalyticsEventType } from '@prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Valid internal event names that map to AnalyticsEventType
const VALID_EVENT_TYPES = new Set([
  'PAGE_VIEW', 'SENSI_GENERATED', 'PAYWALL_SHOWN', 'PAYWALL_CLICKED',
  'PAYMENT_STARTED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED',
  'SIGNUP', 'LOGIN', 'DEVICE_SEARCHED', 'HEADSHOT_MODE_USED',
  'ACADEMY_VIEWED', 'PREMIUM_ACTIVATED',
]);

const EventSchema = z.object({
  event: z.string().max(100),
  eventId: z.string().max(100).optional(),
  visitorId: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
  properties: z.record(z.unknown()).optional(),
  attribution: z.record(z.string()).optional(),
  page: z.string().max(500).optional(),
  route: z.string().max(1000).optional(),
  timestamp: z.number().optional(),
});

const BatchSchema = z.object({
  events: z.array(EventSchema).max(50),
});

// Simple in-memory rate limiter (per IP, 100 events/min)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimits.entries()) {
    if (now > val.resetAt) rateLimits.delete(key);
  }
}, 5 * 60_000);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = BatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { events } = parsed.data;

    // Process events — write mapped events to AnalyticsEvent,
    // store others in metadata for internal tracking
    const dbWrites = [];

    for (const evt of events) {
      // Map event name to AnalyticsEventType if possible
      const eventName = evt.event.toUpperCase().replace(/[^A-Z_]/g, '_');

      const metadata: Record<string, unknown> = {
        ...evt.properties,
        ...evt.attribution,
        originalEvent: evt.event,
        eventId: evt.eventId,
        visitorId: evt.visitorId,
      };

      if (VALID_EVENT_TYPES.has(eventName)) {
        // Direct mapping to existing enum
        dbWrites.push(
          prisma.analyticsEvent.create({
            data: {
              eventType: eventName as AnalyticsEventType,
              sessionId: evt.sessionId || `anon-${Date.now()}`,
              metadata: metadata as Record<string, string>,
              path: evt.page || null,
            },
          }).catch((err: Error) => {
            logger.error('Failed to write mapped event', { event: eventName, error: err.message });
          })
        );
      } else {
        // Internal-only events — store as PAGE_VIEW with detailed metadata
        // This preserves them in the DB without requiring schema changes
        dbWrites.push(
          prisma.analyticsEvent.create({
            data: {
              eventType: 'PAGE_VIEW' as AnalyticsEventType,
              sessionId: evt.sessionId || `anon-${Date.now()}`,
              metadata: metadata as Record<string, string>,
              path: evt.page || null,
            },
          }).catch((err: Error) => {
            logger.error('Failed to write internal event', { event: evt.event, error: err.message });
          })
        );
      }
    }

    // Fire all writes in parallel
    await Promise.allSettled(dbWrites);

    return NextResponse.json({ received: events.length });
  } catch (error) {
    logger.error('Analytics track error', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
