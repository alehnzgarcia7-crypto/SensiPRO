import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { expireSubscriptions, getExpiringSubscriptions } from '@/lib/payments/subscription';

// ══════════════════════════════════════════════════════════
// Cron Job: Expirar suscripciones vencidas
// POST /api/cron/expire-subscriptions
// Protegido por CRON_SECRET en header Authorization
//
// Uso con Vercel Cron:
//   schedule: "0 6 * * *" (cada dia a las 6 AM UTC)
// ══════════════════════════════════════════════════════════

const CronSecretSchema = z.string().min(1, 'CRON_SECRET no configurado');

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verificar secret del cron
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  const secretResult = CronSecretSchema.safeParse(expectedSecret);
  if (!secretResult.success) {
    logger.error('CRON_SECRET not configured');
    return NextResponse.json(
      { success: false, error: { code: 'CONFIG_ERROR', message: 'Cron secret not configured' } },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${secretResult.data}`) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
      { status: 401 },
    );
  }

  try {
    // 1. Expirar suscripciones vencidas
    const expireResult = await expireSubscriptions();

    // 2. Notificar suscripciones que expiran en 3 días
    const expiringSoon = await getExpiringSubscriptions(3);

    if (expiringSoon.length > 0) {
      logger.info('Subscriptions expiring soon', {
        count: expiringSoon.length,
        users: expiringSoon.map((u) => ({ id: u.id, tier: u.tier, expiresAt: u.tierExpiresAt })),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        expired: expireResult.expired,
        expiringSoon: expiringSoon.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Cron expire-subscriptions failed', { error: message });

    return NextResponse.json(
      { success: false, error: { code: 'CRON_ERROR', message: 'Failed to process subscription expirations' } },
      { status: 500 },
    );
  }
}
