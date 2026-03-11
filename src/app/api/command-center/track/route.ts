import { createHash } from 'crypto';

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Enum values deben coincidir con AnalyticsEventType del schema de Prisma
const VALID_EVENT_TYPES = [
  'PAGE_VIEW',
  'SENSI_GENERATED',
  'PAYWALL_SHOWN',
  'PAYWALL_CLICKED',
  'PAYMENT_STARTED',
  'PAYMENT_COMPLETED',
  'PAYMENT_FAILED',
  'SIGNUP',
  'LOGIN',
  'DEVICE_SEARCHED',
  'HEADSHOT_MODE_USED',
  'ACADEMY_VIEWED',
  'PREMIUM_ACTIVATED',
] as const;

const EventSchema = z.object({
  eventType: z.enum(VALID_EVENT_TYPES),
  metadata: z.record(z.unknown()).optional(),
  path: z.string().max(500).optional(),
  sessionId: z.string().max(100),
  timestamp: z.string().or(z.number()).optional(),
});

const BatchSchema = z.object({
  events: z.array(EventSchema).min(1).max(100),
});

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.NEXTAUTH_SECRET || 'salt'))
    .digest('hex')
    .slice(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Validation error' } },
        { status: 400 },
      );
    }

    const { events } = parsed.data;

    // Obtener IP del request
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const rawIp = forwardedFor?.split(',')[0]?.trim() || realIp || null;
    const ipHash = rawIp ? hashIp(rawIp) : null;

    const deviceInfoHeader = req.headers.get('user-agent');
    const deviceInfo = deviceInfoHeader ? { userAgent: deviceInfoHeader } : undefined;

    const data = events.map(event => ({
      eventType: event.eventType,
      sessionId: event.sessionId,
      metadata: event.metadata ? (event.metadata as Record<string, string>) : undefined,
      path: event.path ?? null,
      ipHash,
      deviceInfo: deviceInfo ? (deviceInfo as Record<string, string>) : undefined,
      userId: null as string | null,
    }));

    await prisma.analyticsEvent.createMany({ data });

    logger.info('Batch tracking events recorded', {
      count: events.length,
      types: events.map(e => e.eventType),
    });

    return NextResponse.json({
      success: true,
      data: { recorded: events.length },
    });
  } catch (err) {
    logger.error('Failed to record tracking events', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al registrar eventos' } },
      { status: 500 },
    );
  }
}
