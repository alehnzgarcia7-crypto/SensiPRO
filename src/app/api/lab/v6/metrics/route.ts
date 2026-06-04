import type { NextRequest, NextResponse } from 'next/server';
import { NextResponse as JsonResponse } from 'next/server';
import { z } from 'zod';

import { aresV6ErrorResponse } from '@/lib/ares-v6/api-errors';
import { enforceAresV6InternalAccess } from '@/lib/ares-v6/internal-access-route';
import { getAresV6LabMetrics } from '@/lib/ares-v6/lab-metrics';
import { createAresV6RequestContext, logAresV6Event } from '@/lib/ares-v6/observability';
import { checkAresV6RuntimeConfig } from '@/lib/ares-v6/observability-policy';
import { getTrustedClientIp } from '@/lib/ares-v6/proxy-trust';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';

// ═══════════════════════════════════════════════════════════════
// GET /api/lab/v6/metrics — INTERNAL lab metrics (Fase 3C + 3C.1)
//
// OFF by default (404 when ARES_V6_LAB_METRICS_ENABLED !== 'true'). Internal-
// access gated, rate-limited (own 'metrics' bucket, BEFORE any DB query), and
// bounded to a safe time window (default 7d, max 90d). Read-only aggregates —
// no PII, no per-row data — never exposed publicly.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_MS = 7 * DAY_MS;
const MAX_RANGE_MS = 90 * DAY_MS;

const querySchema = z
  .object({
    since: z.string().datetime({ message: 'since debe ser ISO 8601' }).optional(),
    until: z.string().datetime({ message: 'until debe ser ISO 8601' }).optional(),
    deviceId: z.string().max(64).optional(),
    presetId: z.string().max(64).optional(),
    includeSuspicious: z.enum(['true', 'false']).optional(),
  })
  .strict();

export async function GET(request: NextRequest): Promise<NextResponse> {
  const clientIp = getTrustedClientIp(request);
  const ctx = createAresV6RequestContext(request, clientIp);

  if (process.env.ARES_V6_LAB_METRICS_ENABLED !== 'true') {
    logAresV6Event({ type: 'ares_v6.request_blocked_flag_off', ctx });
    return aresV6ErrorResponse('NOT_FOUND', 'Recurso no encontrado.', 404, { ctx });
  }

  const access = enforceAresV6InternalAccess(request, ctx);
  if (!access.ok) return access.response;

  const configError = checkAresV6RuntimeConfig();
  if (configError) {
    logAresV6Event({ type: 'ares_v6.config_error', ctx, data: { code: configError.code } });
    return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx });
  }

  // Rate limit BEFORE any DB query (own 'metrics' bucket).
  const rate = await checkAresV6RateLimit(request, undefined, { clientIp, keyNamespace: 'metrics' });
  if (rate.storeUnavailable && !rate.allowed) {
    logAresV6Event({ type: 'ares_v6.rate_limit_store_unavailable', ctx, data: { failMode: 'closed' } });
    return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx, rate });
  }
  if (!rate.allowed) {
    logAresV6Event({ type: 'ares_v6.rate_limited', ctx, data: { scopes: rate.scopesApplied } });
    return aresV6ErrorResponse('RATE_LIMIT', 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.', 429, { ctx, rate });
  }

  const rawQuery = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(rawQuery);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue && issue.path.length > 0 ? issue.path.join('.') : undefined;
    logAresV6Event({ type: 'ares_v6.validation_failed', ctx, data: { reason: 'query', code: issue?.code, field } });
    return aresV6ErrorResponse(
      'VALIDATION_ERROR',
      field ? `Parámetro inválido: "${field}".` : 'Parámetros inválidos.',
      400,
      { ctx },
    );
  }

  // Safe time window: default last 7d, hard max 90d.
  const nowMs = Date.now();
  const until = parsed.data.until ? new Date(parsed.data.until) : new Date(nowMs);
  const since = parsed.data.since ? new Date(parsed.data.since) : new Date(until.getTime() - DEFAULT_WINDOW_MS);
  if (until.getTime() < since.getTime()) {
    logAresV6Event({ type: 'ares_v6.validation_failed', ctx, data: { reason: 'until_before_since' } });
    return aresV6ErrorResponse('VALIDATION_ERROR', 'until no puede ser anterior a since.', 400, { ctx });
  }
  if (until.getTime() - since.getTime() > MAX_RANGE_MS) {
    logAresV6Event({ type: 'ares_v6.validation_failed', ctx, data: { reason: 'range_too_large' } });
    return aresV6ErrorResponse('VALIDATION_ERROR', 'El rango máximo permitido es de 90 días.', 400, { ctx });
  }

  try {
    const metrics = await getAresV6LabMetrics({
      since,
      until,
      deviceId: parsed.data.deviceId,
      presetId: parsed.data.presetId,
      includeSuspicious: parsed.data.includeSuspicious === 'true',
    });

    logAresV6Event({
      type: 'ares_v6.lab_metrics_served',
      ctx,
      data: { totalGenerations: metrics.totalGenerations, totalFeedback: metrics.totalFeedback },
    });

    return JsonResponse.json({
      success: true as const,
      data: metrics,
      meta: { requestId: ctx.requestId, window: { since: since.toISOString(), until: until.toISOString() } },
    });
  } catch {
    logAresV6Event({ type: 'ares_v6.failed', ctx, data: { error: 'internal' } });
    return aresV6ErrorResponse('INTERNAL_ERROR', 'Error interno del servidor.', 500, { ctx });
  }
}
