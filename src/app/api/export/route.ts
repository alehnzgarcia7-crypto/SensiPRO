import { generateSensitivity } from '@ares/algorithms';
import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


import { requireTier } from '@/lib/auth/auth.middleware';
import { generateExportHtml, generateExportText } from '@/lib/export/generate-image';

// ═══════════════════════════════════════════════════════════════
// POST /api/export — Exportar configuración de sensibilidad
// Feature PREMIUM: genera texto copiable o datos para imagen
// ═══════════════════════════════════════════════════════════════

const exportSchema = z.object({
  deviceId: z.string().cuid('ID de dispositivo inválido'),
  style: z.enum(['AGGRESSIVE', 'BALANCED', 'SNIPER'], {
    errorMap: () => ({ message: 'Estilo debe ser AGGRESSIVE, BALANCED o SNIPER' }),
  }),
  format: z.enum(['text', 'square', 'story']).default('text'),
  includeGyro: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Export es feature PREMIUM
    const session = await requireTier('PREMIUM');

    const body: unknown = await request.json();
    const parsed = exportSchema.safeParse(body);

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

    const { deviceId, style, format, includeGyro } = parsed.data;

    const device = await prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) throw new NotFoundError('Device', deviceId);

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
    });

    const exportData = {
      deviceBrand: device.brand,
      deviceModel: device.model,
      style,
      sensitivity: result.sensitivity,
      gyroscope: result.gyroscope,
      performanceScore: result.meta.performanceScore,
    };

    if (format === 'text') {
      const text = generateExportText(exportData);

      logger.info('Config exported as text', {
        userId: session.user.id,
        device: `${device.brand} ${device.model}`,
        style,
      });

      return NextResponse.json({
        success: true,
        data: { format: 'text' as const, content: text },
      });
    }

    // Para formatos de imagen, retornar HTML template + datos
    // El cliente renderiza con html-to-image
    const html = generateExportHtml(exportData, {
      format,
      includeGyro,
      includeWatermark: true,
    });

    logger.info('Config exported as image', {
      userId: session.user.id,
      device: `${device.brand} ${device.model}`,
      style,
      imageFormat: format,
    });

    return NextResponse.json({
      success: true,
      data: {
        format,
        html,
        width: 1080,
        height: format === 'square' ? 1080 : 1920,
        exportData,
      },
    });
  } catch (error) {
    logger.error('POST /api/export failed', { error: String(error) });
    return handleApiError(error);
  }
}
