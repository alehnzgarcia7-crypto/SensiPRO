import type { NextRequest, NextResponse } from 'next/server';
import { NextResponse as JsonResponse } from 'next/server';
import { z } from 'zod';

import { aresV6ErrorResponse } from '@/lib/ares-v6/api-errors';
import { buildAresV6EvidenceSnapshot } from '@/lib/ares-v6/evidence-snapshot';
import { enforceAresV6InternalAccess } from '@/lib/ares-v6/internal-access-route';
import type { AresV6ComparisonRow } from '@/lib/ares-v6/legacy-vs-v6-comparator';
import { createAresV6RequestContext, logAresV6Event } from '@/lib/ares-v6/observability';
import { checkAresV6RuntimeConfig } from '@/lib/ares-v6/observability-policy';
import { getTrustedClientIp } from '@/lib/ares-v6/proxy-trust';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';
import { ARES_V6_PRESETS, type AresV6PresetId } from '@ares/algorithms/engine-v6';

// ═══════════════════════════════════════════════════════════════
// GET /api/lab/v6/evidence — INTERNAL evidence snapshot (Fase 3D / 3D.1)
//
// OFF by default (404 when ARES_V6_LAB_EVIDENCE_ENABLED !== 'true'). Internal-
// access gated (3C.1 surface flag), rate-limited (own 'evidence' bucket BEFORE
// any DB query), bounded window (default 7d, max 90d).
//
// 3D.1 filter integrity:
//   • presetId is validated against the real ARES_V6_PRESETS (400 otherwise).
//   • compareScope=filtered (default) filters the comparison by presetId;
//     compareScope=all ignores it and adds a meta warning.
//   • includeRows=false (default) returns AGGREGATED summary rows only — NO
//     legacy/v6 vectors, NO deltas. includeRows=true returns full rows capped
//     at 100 (internal-only). No PII either way.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_MS = 7 * DAY_MS;
const MAX_RANGE_MS = 90 * DAY_MS;
const MAX_FULL_ROWS = 100;

const VALID_PRESET_IDS = new Set<string>(ARES_V6_PRESETS.map((preset) => preset.id));
function isAresV6PresetId(value: string): value is AresV6PresetId {
  return VALID_PRESET_IDS.has(value);
}

const querySchema = z
  .object({
    since: z.string().datetime({ message: 'since debe ser ISO 8601' }).optional(),
    until: z.string().datetime({ message: 'until debe ser ISO 8601' }).optional(),
    deviceId: z.string().max(64).optional(),
    presetId: z.string().refine(isAresV6PresetId, 'presetId no es un preset válido de ARES v6').optional(),
    includeSuspicious: z.enum(['true', 'false']).optional(),
    includeLegacyCompare: z.enum(['true', 'false']).optional(),
    includeRows: z.enum(['true', 'false']).optional(),
    compareScope: z.enum(['filtered', 'all']).optional(),
  })
  .strict();

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

  const presetId = parsed.data.presetId;
  const compareScope = parsed.data.compareScope ?? 'filtered';
  const includeRows = parsed.data.includeRows === 'true';
  const includeLegacyCompare = parsed.data.includeLegacyCompare === 'true';
  const warnings: string[] = [];

  try {
    // Lazy-load the comparator (and thus the frozen legacy engine) ONLY when asked.
    let comparisonRows: AresV6ComparisonRow[] = [];
    if (includeLegacyCompare) {
      const { buildAresV6ComparisonMatrix } = await import('@/lib/ares-v6/legacy-vs-v6-comparator');
      if (compareScope === 'all') {
        comparisonRows = buildAresV6ComparisonMatrix({});
        if (presetId) warnings.push('comparison not filtered by presetId (compareScope=all)');
      } else if (presetId && isAresV6PresetId(presetId)) {
        comparisonRows = buildAresV6ComparisonMatrix({ presetId });
      } else {
        comparisonRows = buildAresV6ComparisonMatrix({});
      }
    }

    const snapshot = await buildAresV6EvidenceSnapshot({
      filter: { since, until, deviceId: parsed.data.deviceId, presetId },
      includeSuspicious: parsed.data.includeSuspicious === 'true',
      comparisonRows,
    });

    logAresV6Event({
      type: 'ares_v6.lab_metrics_served',
      ctx,
      data: { decision: snapshot.goNoGo.decision, totalGenerations: snapshot.metrics.totalGenerations },
    });

    // Aggregated by default: summary rows only (NO legacy/v6 vectors, NO deltas).
    const rowsField = includeRows
      ? { highRiskRows: snapshot.highRiskRows.slice(0, MAX_FULL_ROWS) }
      : { highRiskSummaryRows: snapshot.highRiskSummaryRows };

    return JsonResponse.json({
      success: true as const,
      data: {
        schemaVersion: snapshot.schemaVersion,
        goNoGo: snapshot.goNoGo,
        goNoGoInput: snapshot.goNoGoInput,
        metrics: snapshot.metrics,
        evidenceFixtureCoverage: snapshot.evidenceFixtureCoverage,
        evidenceCoveredFixtures: snapshot.evidenceCoveredFixtures,
        comparisonFixtureCoverage: snapshot.comparisonFixtureCoverage,
        comparisonCoveredFixtures: snapshot.comparisonCoveredFixtures,
        totalFixtures: snapshot.totalFixtures,
        structuralRisk: snapshot.structuralRisk,
        trustedFeedbackSummary: snapshot.trustedFeedbackSummary,
        comparisonSummary: snapshot.comparisonSummary,
        ...rowsField,
        insufficientEvidenceRows: snapshot.insufficientEvidenceRows,
        recommendedNextActions: snapshot.recommendedNextActions,
      },
      meta: {
        requestId: ctx.requestId,
        window: { since: since.toISOString(), until: until.toISOString() },
        compareScope,
        includeLegacyCompare,
        includeRows,
        ...(warnings.length > 0 ? { warnings } : {}),
      },
    });
  } catch {
    logAresV6Event({ type: 'ares_v6.failed', ctx, data: { error: 'internal' } });
    return aresV6ErrorResponse('INTERNAL_ERROR', 'Error interno del servidor.', 500, { ctx });
  }
}
