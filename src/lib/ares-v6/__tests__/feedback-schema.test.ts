import { describe, expect, it } from 'vitest';

import { aresV6FeedbackRequestSchema } from '../feedback-schema';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Feedback request schema (Fase 3C)
// ═══════════════════════════════════════════════════════════════

const GEN_ID = 'ckgenerationa1b2c3d4e5f6';

function baseBody(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { generationId: GEN_ID, rating: 4, outcome: 'BETTER', ...extra };
}

describe('aresV6FeedbackRequestSchema', () => {
  it('accepts a valid minimal body', () => {
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody()).success).toBe(true);
  });

  it('rejects unknown keys (strict)', () => {
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody({ injected: 1 })).success).toBe(false);
  });

  it('rejects an out-of-range rating', () => {
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody({ rating: 0 })).success).toBe(false);
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody({ rating: 6 })).success).toBe(false);
  });

  it('rejects an invalid outcome', () => {
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody({ outcome: 'NOPE' })).success).toBe(false);
  });

  it('rejects a too-long comment and a PII comment', () => {
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody({ comment: 'a'.repeat(300) })).success).toBe(false);
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody({ comment: 'escribeme a a@b.com' })).success).toBe(false);
  });

  it('accepts and sanitizes a clean comment', () => {
    const parsed = aresV6FeedbackRequestSchema.safeParse(baseBody({ comment: '  subio el punto rojo  ' }));
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.comment).toBe('subio el punto rojo');
  });

  it('deduplicates symptoms and rejects more than five', () => {
    const deduped = aresV6FeedbackRequestSchema.safeParse(baseBody({ symptoms: ['AIM_SHAKES', 'AIM_SHAKES'] }));
    expect(deduped.success).toBe(true);
    if (deduped.success) expect(deduped.data.symptoms).toEqual(['AIM_SHAKES']);

    const tooMany = aresV6FeedbackRequestSchema.safeParse(
      baseBody({ symptoms: ['AIM_SHAKES', 'DEVICE_LAGS', 'CANNOT_TURN_FAST', 'RECOIL_TOO_HIGH', 'GLOO_WALL_SLOW', 'PHONE_HEATS_UP'] }),
    );
    expect(tooMany.success).toBe(false);
  });

  it('accepts a bounded adjustments record and rejects an oversized one', () => {
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody({ adjustmentsApplied: { general: 5, redPoint: -3 } })).success).toBe(true);
    const big: Record<string, number> = {};
    for (let i = 0; i < 30; i += 1) big[`k${i}`] = 1;
    expect(aresV6FeedbackRequestSchema.safeParse(baseBody({ adjustmentsApplied: big })).success).toBe(false);
  });
});
