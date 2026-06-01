import { AresError, NotFoundError } from '@ares/errors';
import type { NextRequest, NextResponse } from 'next/server';

import { aresV6ErrorResponse, aresV6SuccessResponse } from '@/lib/ares-v6/api-errors';
import { isAresV6ApiEnabled, isAresV6LabMode } from '@/lib/ares-v6/feature-flags';
import { generateAresV6ForDeviceId } from '@/lib/ares-v6/generate-service';
import {
  buildAresV6GenerationMetrics,
  createAresV6RequestContext,
  logAresV6Event,
} from '@/lib/ares-v6/observability';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';
import { aresV6GenerateRequestSchema } from '@/lib/ares-v6/request-schema';

// ═══════════════════════════════════════════════════════════════
// POST /api/generate/v6 — ISOLATED, HARDENED ARES v6 endpoint (Phase 3A)
//
// OFF by default: when ARES_V6_API_ENABLED !== 'true' it returns 404 so the
// route is invisible in production. It never replaces, imports, or touches the
// legacy /api/generate routes, and writes no feedback.
//
// Pipeline order (cheap → expensive; abuse guard sits before any DB/engine work):
//   flag → payload-size guard → JSON parse → strict Zod → rate limit → generate.
//
// SensiPRO no modifica Free Fire, no usa APK/hacks/macros/auto-headshot/GFX:
// solo entrega valores manuales para aplicar en los ajustes oficiales.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

/** Reject obviously oversized bodies via Content-Length before reading them. */
const MAX_BODY_BYTES = 20 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ctx = createAresV6RequestContext(request);

  // Feature flag gate first — hide the endpoint entirely when v6 is off.
  if (!isAresV6ApiEnabled()) {
    logAresV6Event({ type: 'ares_v6.request_blocked_flag_off', ctx });
    return aresV6ErrorResponse('NOT_FOUND', 'Recurso no encontrado.', 404, { ctx });
  }

  try {
    // Payload guard (cheap, pre-parse). Missing Content-Length falls through to
    // the strict schema, which rejects anything unexpected anyway.
    const contentLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      logAresV6Event({ type: 'ares_v6.validation_failed', ctx, data: { reason: 'payload_too_large' } });
      return aresV6ErrorResponse(
        'PAYLOAD_TOO_LARGE',
        'El cuerpo de la solicitud excede el tamaño permitido.',
        413,
        { ctx },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      logAresV6Event({ type: 'ares_v6.validation_failed', ctx, data: { reason: 'invalid_json' } });
      return aresV6ErrorResponse('VALIDATION_ERROR', 'Cuerpo JSON inválido.', 400, { ctx });
    }

    const parsed = aresV6GenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
      // Log only the issue code + field path — never the user's values.
      const issue = parsed.error.issues[0];
      const field = issue && issue.path.length > 0 ? issue.path.join('.') : undefined;
      logAresV6Event({
        type: 'ares_v6.validation_failed',
        ctx,
        data: { reason: 'schema', code: issue?.code, field },
      });
      return aresV6ErrorResponse(
        'VALIDATION_ERROR',
        field ? `Solicitud inválida en "${field}".` : 'Solicitud inválida.',
        400,
        { ctx },
      );
    }

    // Abuse guard BEFORE any DB read or engine work.
    const rate = await checkAresV6RateLimit(request, parsed.data);
    if (!rate.allowed) {
      logAresV6Event({ type: 'ares_v6.rate_limited', ctx, data: { scope: rate.scope, limit: rate.limit } });
      return aresV6ErrorResponse(
        'RATE_LIMIT',
        'Demasiadas solicitudes. Intenta de nuevo en unos segundos.',
        429,
        { ctx, rate },
      );
    }

    const { device, generation } = await generateAresV6ForDeviceId(parsed.data);

    const metrics = buildAresV6GenerationMetrics({
      deviceId: device.id,
      durationMs: Date.now() - ctx.startedAt,
      player: parsed.data.player,
      generation,
    });
    logAresV6Event({ type: 'ares_v6.generated', ctx, data: { ...metrics } });

    return aresV6SuccessResponse({
      ctx,
      rate,
      labMode: isAresV6LabMode(),
      device: {
        id: device.id,
        brand: device.brand,
        model: device.model,
        slug: device.slug,
        screenDpi: device.screenDpi ?? null,
      },
      generation,
    });
  } catch (error) {
    const durationMs = Date.now() - ctx.startedAt;

    if (error instanceof NotFoundError) {
      logAresV6Event({ type: 'ares_v6.device_not_found', ctx, data: { durationMs } });
      return aresV6ErrorResponse('NOT_FOUND', 'Dispositivo no encontrado.', 404, { ctx });
    }

    if (error instanceof AresError) {
      logAresV6Event({ type: 'ares_v6.failed', ctx, data: { durationMs, code: error.code } });
      return aresV6ErrorResponse(error.code, 'No se pudo completar la solicitud.', error.statusCode, { ctx });
    }

    // Unknown error: log a generic marker (no stack, no PII) and return 500.
    logAresV6Event({ type: 'ares_v6.failed', ctx, data: { durationMs, error: 'internal' } });
    return aresV6ErrorResponse('INTERNAL_ERROR', 'Error interno del servidor.', 500, { ctx });
  }
}
