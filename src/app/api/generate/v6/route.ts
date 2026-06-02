import { AresError, NotFoundError } from '@ares/errors';
import type { NextRequest, NextResponse } from 'next/server';

import { aresV6ErrorResponse, aresV6SuccessResponse } from '@/lib/ares-v6/api-errors';
import { isAresV6ApiEnabled, isAresV6LabMode } from '@/lib/ares-v6/feature-flags';
import { generateAresV6ForDeviceId } from '@/lib/ares-v6/generate-service';
import {
  buildAresV6GenerationRecord,
  isAresV6PersistenceRequired,
  persistAresV6Generation,
  shouldPersistAresV6Generations,
} from '@/lib/ares-v6/generation-persistence';
import { checkAresV6InternalAccess } from '@/lib/ares-v6/internal-access';
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
// POST /api/generate/v6 — ISOLATED, HARDENED ARES v6 endpoint (3A + 3B + 3C)
//
// OFF by default (404 when ARES_V6_API_ENABLED !== 'true'). Internal-access
// gated so it can be turned on for internal/preview only. Optional controlled
// persistence of generations (no PII). Never touches legacy/pagos/auth.
//
// Pipeline: flag → internal access → config gate → payload → JSON → strict Zod
//   → rate limit → generate → (optional) persist → response.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 20 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientIp = getTrustedClientIp(request);
  const ctx = createAresV6RequestContext(request, clientIp);

  // 1. Feature flag — hide the endpoint entirely when v6 is off.
  if (!isAresV6ApiEnabled()) {
    logAresV6Event({ type: 'ares_v6.request_blocked_flag_off', ctx });
    return aresV6ErrorResponse('NOT_FOUND', 'Recurso no encontrado.', 404, { ctx });
  }

  // 2. Internal access guard — prevents accidental public exposure.
  const access = checkAresV6InternalAccess(request);
  if (!access.ok) {
    logAresV6Event({ type: 'ares_v6.internal_access_denied', ctx, data: { reason: access.reason } });
    return aresV6ErrorResponse(
      access.code ?? 'NOT_FOUND',
      access.status === 403 ? 'Acceso no autorizado.' : 'Recurso no encontrado.',
      access.status ?? 404,
      { ctx },
    );
  }

  // 3. Runtime config gate (e.g. log salt required in production).
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
      return aresV6ErrorResponse('PAYLOAD_TOO_LARGE', 'El cuerpo de la solicitud excede el tamaño permitido.', 413, { ctx });
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
      const issue = parsed.error.issues[0];
      const field = issue && issue.path.length > 0 ? issue.path.join('.') : undefined;
      logAresV6Event({ type: 'ares_v6.validation_failed', ctx, data: { reason: 'schema', code: issue?.code, field } });
      return aresV6ErrorResponse(
        'VALIDATION_ERROR',
        field ? `Solicitud inválida en "${field}".` : 'Solicitud inválida.',
        400,
        { ctx },
      );
    }

    // 7. Dual-bucket abuse guard BEFORE any DB read or engine work.
    const rate = await checkAresV6RateLimit(request, parsed.data, { clientIp });
    if (rate.storeUnavailable && !rate.allowed) {
      logAresV6Event({ type: 'ares_v6.rate_limit_store_unavailable', ctx, data: { failMode: 'closed' } });
      return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx, rate });
    }
    if (!rate.allowed) {
      logAresV6Event({ type: 'ares_v6.rate_limited', ctx, data: { scopes: rate.scopesApplied } });
      return aresV6ErrorResponse('RATE_LIMIT', 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.', 429, { ctx, rate });
    }

    const { device, generation, timings } = await generateAresV6ForDeviceId(parsed.data);
    const totalDurationMs = Date.now() - ctx.startedAt;
    const labMode = isAresV6LabMode();

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

    // 9. Controlled persistence (flag-gated, no PII).
    let persistenceMeta: Record<string, unknown> | undefined;
    if (shouldPersistAresV6Generations()) {
      try {
        const record = buildAresV6GenerationRecord({
          requestId: ctx.requestId,
          device: { id: device.id, brand: device.brand, model: device.model, slug: device.slug },
          generation,
          player: {
            playstyle: parsed.data.player.playstyle,
            mode: parsed.data.player.mode,
            fingers: parsed.data.player.fingers,
            primaryWeaponCategory: parsed.data.player.primaryWeaponCategory,
          },
          rate: {
            scopesApplied: rate.scopesApplied,
            degraded: rate.degraded,
            proxyTrusted: rate.proxyTrusted,
            proxyIpSource: rate.proxyIpSource,
          },
          timings: { dbDurationMs: timings.dbDurationMs, engineDurationMs: timings.engineDurationMs, totalDurationMs },
          labMode,
        });
        const persisted = await persistAresV6Generation(record);
        persistenceMeta = { generationId: persisted.id, persistence: { persisted: true } };
      } catch {
        logAresV6Event({ type: 'ares_v6.persistence_failed', ctx, data: { error: 'persist_failed' } });
        if (isAresV6PersistenceRequired()) {
          return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx, rate });
        }
        persistenceMeta = { persistence: { persisted: false, degraded: true } };
      }
    }

    return aresV6SuccessResponse({
      ctx,
      rate,
      labMode,
      device: {
        id: device.id,
        brand: device.brand,
        model: device.model,
        slug: device.slug,
        screenDpi: device.screenDpi ?? null,
      },
      generation,
      extraMeta: persistenceMeta,
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
