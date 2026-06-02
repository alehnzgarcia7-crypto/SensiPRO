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
import { checkAresV6RuntimeConfig } from '@/lib/ares-v6/observability-policy';
import { getTrustedClientIp } from '@/lib/ares-v6/proxy-trust';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';
import { getAresV6RateLimitFailMode } from '@/lib/ares-v6/rate-limit-policy';
import { aresV6GenerateRequestSchema } from '@/lib/ares-v6/request-schema';

// ═══════════════════════════════════════════════════════════════
// POST /api/generate/v6 — ISOLATED, HARDENED ARES v6 endpoint (Phase 3A + 3B)
//
// OFF by default (404 when ARES_V6_API_ENABLED !== 'true'). Never touches the
// legacy /api/generate routes; writes no feedback.
//
// Pipeline (cheap → expensive; abuse guard sits before any DB/engine work):
//   flag → config gate → payload-size → JSON → strict Zod → rate limit → generate.
//
// Rate-limit outcomes: store unavailable + fail-closed → 503; any bucket over
// → 429; both before Prisma. SensiPRO no modifica Free Fire ni usa
// APK/hacks/macros/auto-headshot/GFX: sólo valores manuales para los ajustes
// oficiales.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

/** Reject obviously oversized bodies via Content-Length before reading them. */
const MAX_BODY_BYTES = 20 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientIp = getTrustedClientIp(request);
  const ctx = createAresV6RequestContext(request, clientIp);

  // Feature flag gate first — hide the endpoint entirely when v6 is off.
  if (!isAresV6ApiEnabled()) {
    logAresV6Event({ type: 'ares_v6.request_blocked_flag_off', ctx });
    return aresV6ErrorResponse('NOT_FOUND', 'Recurso no encontrado.', 404, { ctx });
  }

  // Runtime config gate (e.g. log salt required in production). Fail closed (503).
  const configError = checkAresV6RuntimeConfig();
  if (configError) {
    logAresV6Event({ type: 'ares_v6.config_error', ctx, data: { code: configError.code } });
    return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx });
  }

  const realInfraSmoke = process.env.ARES_V6_REAL_INFRA_SMOKE === 'true';

  try {
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

    // Dual-bucket abuse guard BEFORE any DB read or engine work.
    const rate = await checkAresV6RateLimit(request, parsed.data, { clientIp });

    if (rate.storeUnavailable && !rate.allowed) {
      // Fail-closed: the rate-limit store is down, so we refuse rather than serve unmetered.
      logAresV6Event({ type: 'ares_v6.rate_limit_store_unavailable', ctx, data: { failMode: 'closed' } });
      return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx, rate });
    }

    if (!rate.allowed) {
      logAresV6Event({ type: 'ares_v6.rate_limited', ctx, data: { scopes: rate.scopesApplied } });
      return aresV6ErrorResponse(
        'RATE_LIMIT',
        'Demasiadas solicitudes. Intenta de nuevo en unos segundos.',
        429,
        { ctx, rate },
      );
    }

    const { device, generation, timings } = await generateAresV6ForDeviceId(parsed.data);

    const totalDurationMs = Date.now() - ctx.startedAt;
    const metrics = buildAresV6GenerationMetrics({
      deviceId: device.id,
      durationMs: totalDurationMs,
      player: parsed.data.player,
      generation,
      operational: {
        rateLimitScopes: rate.scopesApplied,
        rateLimitDegraded: rate.degraded,
        rateLimitFailMode: getAresV6RateLimitFailMode(),
        proxyIpSource: clientIp.source,
        proxyTrusted: clientIp.trusted,
        dbDurationMs: timings.dbDurationMs,
        engineDurationMs: timings.engineDurationMs,
        totalDurationMs,
        ...(realInfraSmoke ? { realInfraSmoke: true } : {}),
      },
    });
    logAresV6Event({
      type: realInfraSmoke ? 'ares_v6.real_infra_smoke_generated' : 'ares_v6.generated',
      ctx,
      data: { ...metrics },
    });

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

    logAresV6Event({ type: 'ares_v6.failed', ctx, data: { durationMs, error: 'internal' } });
    return aresV6ErrorResponse('INTERNAL_ERROR', 'Error interno del servidor.', 500, { ctx });
  }
}
