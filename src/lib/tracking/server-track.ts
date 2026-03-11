import { createHash } from 'crypto';

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { AnalyticsEventType } from '@prisma/client';

interface TrackEventInput {
  eventType: AnalyticsEventType;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  path?: string;
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.NEXTAUTH_SECRET || 'salt')).digest('hex').slice(0, 16);
}

export async function serverTrackEvent(input: TrackEventInput): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: input.eventType,
        userId: input.userId || null,
        sessionId: input.sessionId || `anon-${Date.now()}`,
        metadata: input.metadata ? (input.metadata as Record<string, string>) : undefined,
        deviceInfo: input.userAgent ? ({ userAgent: input.userAgent } as Record<string, string>) : undefined,
        ipHash: input.ipAddress ? hashIp(input.ipAddress) : null,
        path: input.path || null,
      },
    });
  } catch (err) {
    logger.error('Failed to track event', { eventType: input.eventType, error: err instanceof Error ? err.message : 'Unknown' });
  }
}
