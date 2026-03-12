/**
 * Server-side tracking helper
 *
 * Writes events to AnalyticsEvent in Prisma + optionally sends to TikTok Events API.
 * Used for high-value events: checkout, purchase, registration.
 */

import { createHash } from 'crypto';

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { AnalyticsEventType } from '@prisma/client';

import { sendTikTokServerEvent } from './server-events';

interface ServerTrackParams {
  // Internal event
  eventType: AnalyticsEventType;
  userId?: string;
  sessionId?: string;
  visitorId?: string;
  metadata?: Record<string, unknown>;
  path?: string;
  ipAddress?: string;
  userAgent?: string;

  // TikTok server event (optional)
  tiktok?: {
    event: string;
    eventId: string;
    email?: string;
    value?: number;
    currency?: string;
    contentId?: string;
    contentType?: string;
    ttclid?: string;
    pageUrl?: string;
  };
}

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.NEXTAUTH_SECRET || 'salt'))
    .digest('hex')
    .slice(0, 16);
}

export async function trackServerEvent(params: ServerTrackParams): Promise<void> {
  // 1. Write to internal analytics DB
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: params.eventType,
        userId: params.userId || null,
        sessionId: params.sessionId || `srv-${Date.now()}`,
        metadata: params.metadata ? (params.metadata as Record<string, string>) : undefined,
        ipHash: params.ipAddress ? hashIp(params.ipAddress) : null,
        path: params.path || null,
      },
    });
  } catch (err) {
    logger.error('Failed to write analytics event', {
      eventType: params.eventType,
      error: err instanceof Error ? err.message : 'Unknown',
    });
  }

  // 2. Send to TikTok Events API if configured
  if (params.tiktok) {
    await sendTikTokServerEvent({
      event: params.tiktok.event,
      eventId: params.tiktok.eventId,
      email: params.tiktok.email,
      externalId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      value: params.tiktok.value,
      currency: params.tiktok.currency,
      contentId: params.tiktok.contentId,
      contentType: params.tiktok.contentType,
      ttclid: params.tiktok.ttclid,
      pageUrl: params.tiktok.pageUrl,
    });
  }
}
