import { NextResponse } from 'next/server';

import type { AresV6GenerationOutput } from '@ares/algorithms/engine-v6';

import type { AresV6RequestContext } from './observability';
import type { AresV6RateLimitResult } from './rate-limit';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Consistent API responses
//
// Centralises the success/error envelopes so every response carries the same
// shape, the requestId in `meta`, and (when known) standard rate-limit headers.
// Internal details (stack traces, raw Zod values, ipHash, key) never appear.
// ═══════════════════════════════════════════════════════════════

export interface AresV6ResponseDevice {
  id: string;
  brand: string;
  model: string;
  slug: string;
  screenDpi: number | null;
}

function rateLimitHeaders(rate?: AresV6RateLimitResult): Record<string, string> {
  if (!rate) return {};
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(rate.limit),
    'X-RateLimit-Remaining': String(rate.remaining),
    'X-RateLimit-Reset': String(Math.floor(rate.resetAt.getTime() / 1000)),
  };
  if (!rate.allowed && rate.retryAfterSeconds !== undefined) {
    headers['Retry-After'] = String(rate.retryAfterSeconds);
  }
  return headers;
}

/** Standard error envelope: `{ success:false, error, meta:{ requestId } }`. */
export function aresV6ErrorResponse(
  code: string,
  message: string,
  statusCode: number,
  opts?: { ctx?: AresV6RequestContext; rate?: AresV6RateLimitResult },
): NextResponse {
  return NextResponse.json(
    {
      success: false as const,
      error: { code, message, statusCode },
      meta: { requestId: opts?.ctx?.requestId ?? null },
    },
    { status: statusCode, headers: rateLimitHeaders(opts?.rate) },
  );
}

/** Standard success envelope for a completed generation. */
export function aresV6SuccessResponse(params: {
  ctx: AresV6RequestContext;
  rate: AresV6RateLimitResult;
  labMode: boolean;
  device: AresV6ResponseDevice;
  generation: AresV6GenerationOutput;
}): NextResponse {
  const { ctx, rate, labMode, device, generation } = params;

  const meta: Record<string, unknown> = {
    engine: generation.algorithmVersion,
    labMode,
    requestId: ctx.requestId,
    rateLimit: {
      limit: rate.limit,
      remaining: rate.remaining,
      resetAt: rate.resetAt.toISOString(),
    },
  };

  if (labMode) {
    meta.warnings = [...generation.confidence.warnings];
  }

  return NextResponse.json(
    { success: true as const, data: { device, generation }, meta },
    { status: 200, headers: rateLimitHeaders(rate) },
  );
}
