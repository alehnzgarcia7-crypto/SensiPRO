import type { NextRequest, NextResponse } from 'next/server';
import { NextResponse as JsonResponse } from 'next/server';
import { z } from 'zod';

import { aresV6ErrorResponse } from '@/lib/ares-v6/api-errors';
import { checkAresV6InternalAccess } from '@/lib/ares-v6/internal-access';
import { getAresV6LabMetrics } from '@/lib/ares-v6/lab-metrics';
import { createAresV6RequestContext, logAresV6Event } from '@/lib/ares-v6/observability';
import { checkAresV6RuntimeConfig } from '@/lib/ares-v6/observability-policy';
import { getTrustedClientIp } from '@/lib/ares-v6/proxy-trust';

// ═══════════════════════════════════════════════════════════════
// GET /api/lab/v6/metrics — INTERNAL lab metrics (Fase 3C)
//
// OFF by default (404 when ARES_V6_LAB_METRICS_ENABLED !== 'true'). Internal-
// access gated. Read-only aggregate metrics (no PII, no per-row data). Never
// exposed publicly.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

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

  const configError = checkAresV6RuntimeConfig();
  if (configError) {
    logAresV6Event({ type: 'ares_v6.config_error', ctx, data: { code: configError.code } });
    return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx });
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

  try {
    const metrics = await getAresV6LabMetrics({
      since: parsed.data.since ? new Date(parsed.data.since) : undefined,
      until: parsed.data.until ? new Date(parsed.data.until) : undefined,
      deviceId: parsed.data.deviceId,
      presetId: parsed.data.presetId,
      includeSuspicious: parsed.data.includeSuspicious === 'true',
    });

    logAresV6Event({
      type: 'ares_v6.lab_metrics_served',
      ctx,
      data: { totalGenerations: metrics.totalGenerations, totalFeedback: metrics.totalFeedback },
    });

    return JsonResponse.json({ success: true as const, data: metrics, meta: { requestId: ctx.requestId } });
  } catch {
    logAresV6Event({ type: 'ares_v6.failed', ctx, data: { error: 'internal' } });
    return aresV6ErrorResponse('INTERNAL_ERROR', 'Error interno del servidor.', 500, { ctx });
  }
}
