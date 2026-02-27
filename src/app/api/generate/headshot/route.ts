import { generateHeadshotSensitivity } from '@ares/algorithms';
import {
  HEADSHOT_WEAPONS,
  DRAG_TECHNIQUES,
  HEADSHOT_DRILLS,
  CROSSHAIR_TIPS,
} from '@ares/config';
import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getOptionalSession } from '@/lib/auth/auth.middleware';
import { enforceRateLimit } from '@/lib/security';

const headshotSchema = z.object({
  deviceId: z.string().cuid('ID de dispositivo inválido'),
  userRam: z.number().int().min(1).max(32).optional(),
  userHz: z.number().int().min(30).max(240).optional(),
  fingers: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = headshotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Error de validación',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { deviceId, userRam, userHz, fingers } = parsed.data;

    const user = await getOptionalSession();
    const userId = user?.id ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
    const tier = user?.tier ?? 'FREE';

    // Skip rate limit en development
    if (process.env.NODE_ENV !== 'development') {
      await enforceRateLimit(userId, tier);
    }

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundError('Device', deviceId);
    }

    const result = generateHeadshotSensitivity(
      {
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        ramGb: device.ramGb,
        panelType: device.panelType,
        tier: device.tier,
      },
      userRam,
      fingers,
      userHz,
    );

    logger.info('Headshot sensitivity generated', {
      deviceId: device.id,
      device: `${device.brand} ${device.model}`,
      userId: user?.id ?? 'anonymous',
      headshotScore: result.headshotScore,
      fingers: result.fireButton.fingers,
    });

    return NextResponse.json({
      success: true,
      data: {
        device: {
          id: device.id,
          brand: device.brand,
          model: device.model,
          slug: device.slug,
          tier: device.tier,
          screenSize: device.screenSize,
          screenHz: device.screenHz,
          ramGb: device.ramGb,
          panelType: device.panelType,
        },
        ...result,
        weapons: HEADSHOT_WEAPONS,
        techniques: DRAG_TECHNIQUES,
        drills: HEADSHOT_DRILLS,
        tips: CROSSHAIR_TIPS,
      },
    });
  } catch (error) {
    logger.error('POST /api/generate/headshot failed', { error: String(error) });
    return handleApiError(error);
  }
}
