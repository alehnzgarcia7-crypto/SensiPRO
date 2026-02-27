import { compareDevices } from '@ares/algorithms';
import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { requireTier } from '@/lib/auth/auth.middleware';

const compareSchema = z.object({
  deviceIdA: z.string().cuid('ID de dispositivo A inválido'),
  deviceIdB: z.string().cuid('ID de dispositivo B inválido'),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER'], {
    errorMap: () => ({ message: 'Estilo debe ser AGGRESSIVE, BALANCED o SNIPER' }),
  }),
  includeGyro: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Comparación es feature PREMIUM
    await requireTier('PREMIUM');

    const body: unknown = await request.json();
    const parsed = compareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { deviceIdA, deviceIdB, style, includeGyro } = parsed.data;

    if (deviceIdA === deviceIdB) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SAME_DEVICE',
            message: 'No puedes comparar un dispositivo consigo mismo',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const [deviceA, deviceB] = await Promise.all([
      prisma.device.findUnique({ where: { id: deviceIdA } }),
      prisma.device.findUnique({ where: { id: deviceIdB } }),
    ]);

    if (!deviceA) throw new NotFoundError('Device A', deviceIdA);
    if (!deviceB) throw new NotFoundError('Device B', deviceIdB);

    const result = compareDevices(
      {
        id: deviceA.id,
        brand: deviceA.brand,
        model: deviceA.model,
        slug: deviceA.slug,
        specs: {
          screenHz: deviceA.screenHz,
          screenSize: deviceA.screenSize,
          ramGb: deviceA.ramGb,
          panelType: deviceA.panelType,
          tier: deviceA.tier,
        },
      },
      {
        id: deviceB.id,
        brand: deviceB.brand,
        model: deviceB.model,
        slug: deviceB.slug,
        specs: {
          screenHz: deviceB.screenHz,
          screenSize: deviceB.screenSize,
          ramGb: deviceB.ramGb,
          panelType: deviceB.panelType,
          tier: deviceB.tier,
        },
      },
      style,
      includeGyro,
    );

    logger.info('Device comparison completed', {
      deviceA: `${deviceA.brand} ${deviceA.model}`,
      deviceB: `${deviceB.brand} ${deviceB.model}`,
      style,
      overallWinner: result.overallWinner,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error('POST /api/compare failed', { error: String(error) });
    return handleApiError(error);
  }
}
