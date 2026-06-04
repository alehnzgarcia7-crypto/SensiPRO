import { AresError } from '@ares/errors';
import { NextResponse, type NextRequest } from 'next/server';

import { aresV6ErrorResponse } from '@/lib/ares-v6/api-errors';
import { isAresV6FeedbackWriteEnabled } from '@/lib/ares-v6/feature-flags';
import { aresV6FeedbackRequestSchema } from '@/lib/ares-v6/feedback-schema';
import { submitAresV6Feedback } from '@/lib/ares-v6/feedback-service';
import { enforceAresV6InternalAccess } from '@/lib/ares-v6/internal-access-route';
import { createAresV6RequestContext, logAresV6Event } from '@/lib/ares-v6/observability';
import { checkAresV6RuntimeConfig } from '@/lib/ares-v6/observability-policy';
import { getTrustedClientIp } from '@/lib/ares-v6/proxy-trust';
import { checkAresV6RateLimit } from '@/lib/ares-v6/rate-limit';

// ═══════════════════════════════════════════════════════════════
// POST /api/feedback/v6 — INTERNAL feedback v0 (Fase 3C)
//
// OFF by default (404 when ARES_V6_WRITE_FEEDBACK !== 'true'). Internal-access
// gated, strict-validated, rate-limited (own 'fb' bucket, before any DB write).
// Feedback is EVIDENCE only — it never recalibrates the engine. One feedback
// per generation (duplicate → 409). PII comments are rejected at validation.
// ═══════════════════════════════════════════════════════════════

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 8 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientIp = getTrustedClientIp(request);
  const ctx = createAresV6RequestContext(request, clientIp);

  if (!isAresV6FeedbackWriteEnabled()) {
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

    const parsed = aresV6FeedbackRequestSchema.safeParse(body);
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

    // Per-IP feedback rate limit (own namespace), BEFORE any DB access.
    const rate = await checkAresV6RateLimit(request, undefined, { clientIp, keyNamespace: 'fb' });
    if (rate.storeUnavailable && !rate.allowed) {
      logAresV6Event({ type: 'ares_v6.rate_limit_store_unavailable', ctx, data: { failMode: 'closed' } });
      return aresV6ErrorResponse('SERVICE_UNAVAILABLE', 'Servicio no disponible temporalmente.', 503, { ctx, rate });
    }
    if (!rate.allowed) {
      logAresV6Event({ type: 'ares_v6.rate_limited', ctx, data: { scopes: rate.scopesApplied } });
      return aresV6ErrorResponse('RATE_LIMIT', 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.', 429, { ctx, rate });
    }

    const result = await submitAresV6Feedback(parsed.data);
    logAresV6Event({
      type: 'ares_v6.feedback_received',
      ctx,
      data: { rating: parsed.data.rating, outcome: parsed.data.outcome, qualityFlag: result.qualityFlag },
    });

    return NextResponse.json(
      {
        success: true as const,
        data: { feedbackId: result.id, qualityFlag: result.qualityFlag },
        meta: {
          requestId: ctx.requestId,
          rateLimit: { limit: rate.limit, remaining: rate.remaining, resetAt: rate.resetAt.toISOString() },
        },
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': String(rate.limit),
          'X-RateLimit-Remaining': String(rate.remaining),
        },
      },
    );
  } catch (error) {
    if (error instanceof AresError) {
      logAresV6Event({ type: 'ares_v6.feedback_rejected', ctx, data: { code: error.code } });
      const message =
        error.statusCode === 409
          ? 'Ya existe feedback para esta generación.'
          : error.statusCode === 404
            ? 'Generación no encontrada.'
            : 'No se pudo procesar el feedback.';
      return aresV6ErrorResponse(error.code, message, error.statusCode, { ctx });
    }
    logAresV6Event({ type: 'ares_v6.failed', ctx, data: { error: 'internal' } });
    return aresV6ErrorResponse('INTERNAL_ERROR', 'Error interno del servidor.', 500, { ctx });
  }
}
