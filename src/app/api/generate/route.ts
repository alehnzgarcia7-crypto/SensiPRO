import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { generateSensitivity } from '@ares/algorithms';

import { getOptionalSession } from '@/lib/auth/auth.middleware';
import { enforceRateLimit } from '@/lib/security';

const generateSchema = z.object({
  deviceId: z.string().cuid('ID de dispositivo inválido'),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER'], {
    errorMap: () => ({ message: 'Estilo debe ser AGGRESSIVE, BALANCED o SNIPER' }),
  }),
  includeGyro: z.boolean().optional().default(false),
  userRam: z.number().int().min(1).max(32).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = generateSchema.safeParse(body);

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

    const { deviceId, style, includeGyro, userRam } = parsed.data;

    // Obtener sesión (opcional — usuarios anónimos pueden generar con límites)
    const user = await getOptionalSession();
    const userId = user?.id ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
    const tier = user?.tier ?? 'FREE';

    // Verificar rate limit
    await enforceRateLimit(userId, tier);

    // Buscar dispositivo
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundError('Device', deviceId);
    }

    // Generar sensibilidad
    const result = generateSensitivity({
      specs: {
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        ramGb: device.ramGb,
        panelType: device.panelType,
        tier: device.tier,
      },
      style,
      includeGyro,
      userRam,
    });

    // Guardar en historial si el usuario está autenticado
    if (user?.id) {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          deviceId: device.id,
          style,
        },
      });

      // Incrementar contador de búsquedas
      await prisma.user.update({
        where: { id: user.id },
        data: { totalSearches: { increment: 1 } },
      });
    }

    // Verificar si la sensibilidad ya existe en BD, si no crearla
    const existingSensitivity = await prisma.sensitivity.findFirst({
      where: { deviceId: device.id, style },
    });

    if (!existingSensitivity) {
      await prisma.sensitivity.create({
        data: {
          deviceId: device.id,
          style,
          general: result.sensitivity.general,
          redPoint: result.sensitivity.redPoint,
          scope2x: result.sensitivity.scope2x,
          scope4x: result.sensitivity.scope4x,
          sniperScope: result.sensitivity.sniperScope,
          freeView: result.sensitivity.freeView,
          ...(result.gyroscope ? {
            gyroGeneral: result.gyroscope.gyroGeneral,
            gyroRedPoint: result.gyroscope.gyroRedPoint,
            gyroScope2x: result.gyroscope.gyroScope2x,
            gyroScope4x: result.gyroscope.gyroScope4x,
            gyroSniper: result.gyroscope.gyroSniper,
            gyroFreeView: result.gyroscope.gyroFreeView,
          } : {}),
        },
      });
    }

    logger.info('Sensitivity generated', {
      deviceId: device.id,
      device: `${device.brand} ${device.model}`,
      style,
      userId: user?.id ?? 'anonymous',
      general: result.sensitivity.general,
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
        },
        ...result,
      },
    });
  } catch (error) {
    logger.error('POST /api/generate failed', { error: String(error) });
    return handleApiError(error);
  }
}
