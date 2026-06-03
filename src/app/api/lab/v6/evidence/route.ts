import type { NextRequest, NextResponse } from 'next/server';
import { NextResponse as JsonResponse } from 'next/server';

import { aresV6ErrorResponse } from '@/lib/ares-v6/api-errors';
import { parseAresV6EvidenceQuery } from '@/lib/ares-v6/evidence-query-schema';
import { buildAresV6EvidenceRoutePayload } from '@/lib/ares-v6/evidence-route-service';
import { enforceAresV6InternalAccess } from '@/lib/ares-v6/internal-access-route';
import { createAresV6RequestContext, logAresV6Event } from '@/lib/ares-v6/observability';
import { checkAresV6RuntimeConfig } from '@/lib/ares-v6/observability-policy';
import { getTrustedClientIp } from '@/lib/ares-v6/proxy-trust';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';

// ═══════════════════════════════════════════════════════════════
// GET /api/lab/v6/evidence — INTERNAL evidence snapshot (Fase 3D / 3D.1 / 3D.1B)
//
// OFF by default (404 when ARES_V6_LAB_EVIDENCE_ENABLED !== 'true'). Internal-
// access gated (3C.1 surface flag), rate-limited (own 'evidence' bucket BEFORE
// any DB query), bounded window (default 7d, max 90d).
//
// 3D.1B: query parsing + response shaping live in shared, UNIT-TESTED modules
// (`evidence-query-schema.ts` + `evidence-route-service.ts`). The route is a thin
// gate→parse→build→respond shell:
//   • presetId validated against ARES_V6_PRESETS (400 otherwise).
//   • compareScope=filtered (default) filters the comparison by presetId;
//     compareScope=all ignores it + adds warning code comparison_not_filtered_by_preset.
//   • includeRows=false (default) → highRiskSummaryRows (NO vectors/deltas);
//     includeRows=true → highRiskRows capped 100 + meta.rowsLimit/rowsTruncated.
// No PII. The legacy engine is lazy-loaded only when includeLegacyCompare=true.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const clientIp = getTrustedClientIp(request);
  const ctx = createAresV6RequestContext(request, clientIp);

  if (process.env.ARES_V6_LAB_EVIDENCE_ENABLED !== 'true') {
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

  // Rate limit BEFORE any DB query (own 'evidence' bucket).
  const rate = await checkAresV6RateLimit(request, undefined, { clientIp, keyNamespace: 'evidence' });
  if (rate.storeUnavailable && !rate.allowed) {
    logAresV6Event({ type: 'ares_v6.rate_limit_store_unavailable', ctx, data: { failMode: 'closed' } });
    return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx, rate });
  }
  if (!rate.allowed) {
    logAresV6Event({ type: 'ares_v6.rate_limited', ctx, data: { scopes: rate.scopesApplied } });
    return aresV6ErrorResponse('RATE_LIMIT', 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.', 429, { ctx, rate });
  }

  // Strict parse + normalize (real preset enum, bounded window) BEFORE any DB.
  const parsed = parseAresV6EvidenceQuery(request.nextUrl.searchParams, Date.now());
  if (!parsed.ok) {
    logAresV6Event({ type: 'ares_v6.validation_failed', ctx, data: { reason: 'query', field: parsed.field } });
    return aresV6ErrorResponse('VALIDATION_ERROR', parsed.message, 400, { ctx });
  }
  const query = parsed.query;

  try {
    const { data, meta } = await buildAresV6EvidenceRoutePayload(query);

    logAresV6Event({
      type: 'ares_v6.lab_metrics_served',
      ctx,
      data: { decision: data.goNoGo.decision, totalGenerations: data.metrics.totalGenerations },
    });

    return JsonResponse.json({
      success: true as const,
      data,
      meta: {
        requestId: ctx.requestId,
        window: { since: query.since.toISOString(), until: query.until.toISOString() },
        ...meta,
      },
    });
  } catch {
    logAresV6Event({ type: 'ares_v6.failed', ctx, data: { error: 'internal' } });
    return aresV6ErrorResponse('INTERNAL_ERROR', 'Error interno del servidor.', 500, { ctx });
  }
}
