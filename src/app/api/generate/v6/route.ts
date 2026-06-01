import { formatErrorResponse, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse, type NextRequest } from 'next/server';

import { isAresV6ApiEnabled, isAresV6LabMode } from '@/lib/ares-v6/feature-flags';
import { generateAresV6ForDeviceId } from '@/lib/ares-v6/generate-service';
import { aresV6GenerateRequestSchema } from '@/lib/ares-v6/request-schema';

// ═══════════════════════════════════════════════════════════════
// POST /api/generate/v6 — ISOLATED ARES v6 endpoint
//
// OFF by default. When ARES_V6_API_ENABLED !== 'true' it returns 404 so the
// route is invisible in production. It does NOT replace, import, or touch the
// legacy /api/generate routes. No feedback is written in Phase 2.
//
// SensiPRO no modifica Free Fire, no usa APK/hacks/macros/auto-headshot/GFX:
// solo entrega valores manuales para aplicar en los ajustes oficiales.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Feature flag gate first — hide the endpoint entirely when v6 is off.
  if (!isAresV6ApiEnabled()) {
    return NextResponse.json(
      formatErrorResponse('NOT_FOUND', 'Recurso no encontrado.', 404),
      { status: 404 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        formatErrorResponse('VALIDATION_ERROR', 'Cuerpo JSON inválido.', 400),
        { status: 400 },
      );
    }

    const parsed = aresV6GenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        formatErrorResponse(
          'VALIDATION_ERROR',
          parsed.error.issues[0]?.message ?? 'Error de validación',
          400,
        ),
        { status: 400 },
      );
    }

    const { device, generation } = await generateAresV6ForDeviceId(parsed.data);

    logger.info('ARES v6 generation', {
      deviceId: device.id,
      device: `${device.brand} ${device.model}`,
      presetId: generation.presetId,
      general: generation.sensitivity.general,
      confidence: generation.confidence.grade,
    });

    return NextResponse.json({
      success: true,
      data: {
        device: {
          id: device.id,
          brand: device.brand,
          model: device.model,
          slug: device.slug,
          screenDpi: device.screenDpi ?? null,
        },
        generation,
      },
      meta: {
        engine: generation.algorithmVersion,
        labMode: isAresV6LabMode(),
      },
    });
  } catch (error) {
    logger.error('POST /api/generate/v6 failed', { error: String(error) });
    return handleApiError(error);
  }
}
