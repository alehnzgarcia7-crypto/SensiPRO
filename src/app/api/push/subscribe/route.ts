import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getRequiredSession } from '@/lib/auth/auth.middleware';

const subscribeSchema = z.object({
  endpoint: z.string().url('Endpoint de push inválido'),
  keys: z.object({
    p256dh: z.string().min(1, 'Clave p256dh requerida'),
    auth: z.string().min(1, 'Clave auth requerida'),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body: unknown = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Datos de suscripción inválidos';
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

    const { endpoint, keys } = parsed.data;

    // Upsert: actualizar si ya existe, crear si no
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint,
        },
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        isActive: true,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    logger.info('Push subscription created', {
      userId: session.user.id,
      endpoint: endpoint.slice(0, 50),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getRequiredSession();
    const body: unknown = await request.json();
    const parsed = z.object({ endpoint: z.string().url() }).safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? 'Endpoint inválido';
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

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint: parsed.data.endpoint,
      },
    });

    logger.info('Push subscription removed', {
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
