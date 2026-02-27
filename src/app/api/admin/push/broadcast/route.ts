import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { requireRole } from '@/lib/auth/auth.middleware';
import { broadcastPush } from '@/lib/push/web-push';

const broadcastSchema = z.object({
  title: z.string().min(3, 'Título mínimo 3 caracteres').max(100, 'Título máximo 100 caracteres'),
  body: z.string().min(3, 'Cuerpo mínimo 3 caracteres').max(200, 'Cuerpo máximo 200 caracteres'),
  url: z.string().optional(),
  tier: z.enum(['ALL', 'PREMIUM', 'VIP']).optional().default('ALL'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('ADMIN');
    const body: unknown = await request.json();
    const parsed = broadcastSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos de broadcast inválidos';
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message,
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { title, body: messageBody, url, tier } = parsed.data;

    const where: Prisma.PushSubscriptionWhereInput = { isActive: true };
    if (tier !== 'ALL') {
      where.user = { tier };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where,
      select: { endpoint: true, p256dh: true, auth: true },
    });

    const pushSubs = subscriptions.map((s) => ({
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth },
    }));

    const result = await broadcastPush(pushSubs, {
      title,
      body: messageBody,
      url,
    });

    // Desactivar suscripciones expiradas
    if (result.expired > 0) {
      const expiredEndpoints = subscriptions
        .slice(0, result.expired)
        .map((s) => s.endpoint);

      await prisma.pushSubscription.updateMany({
        where: { endpoint: { in: expiredEndpoints } },
        data: { isActive: false },
      });
    }

    logger.info('Admin broadcast push', {
      adminId: session.user.id,
      tier,
      total: result.total,
      sent: result.sent,
      expired: result.expired,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
