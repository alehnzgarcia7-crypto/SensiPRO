import { generateAllCalibrations } from '@ares/algorithms';
import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { getOptionalSession } from '@/lib/auth/auth.middleware';

const generateAllSchema = z.object({
  deviceId: z.string().cuid('ID de dispositivo inválido'),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER'], {
    errorMap: () => ({ message: 'Estilo debe ser AGGRESSIVE, BALANCED o SNIPER' }),
  }),
  includeGyro: z.boolean().optional().default(false),
  fingers: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  userRam: z.number().int().min(1).max(32).optional(),
  userHz: z.number().int().min(30).max(240).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = generateAllSchema.safeParse(body);

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

    const { deviceId, style, includeGyro, fingers, userRam, userHz } = parsed.data;

    // Obtener sesión (opcional — usuarios anónimos pueden generar)
    const user = await getOptionalSession();

    // Buscar dispositivo con todos sus specs
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundError('Device', deviceId);
    }

    // Generar las 6 combinaciones de calibración
    const result = generateAllCalibrations(
      {
        screenHz: device.screenHz,
        screenSize: device.screenSize,
        ramGb: device.ramGb,
        panelType: device.panelType,
        tier: device.tier,
      },
      style,
      includeGyro,
      userRam,
      userHz,
      fingers,
    );

    // Guardar en historial si el usuario está autenticado
    if (user?.id) {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          deviceId: device.id,
          style,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { totalSearches: { increment: 1 } },
      });
    }

    logger.info('All calibrations generated', {
      deviceId: device.id,
      device: `${device.brand} ${device.model}`,
      style,
      userId: user?.id ?? 'anonymous',
      combinations: result.combinations.length,
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
      },
    });
  } catch (error) {
    logger.error('POST /api/generate/all failed', { error: String(error) });
    return handleApiError(error);
  }
}
