import { ConflictError, NotFoundError } from '@ares/errors';
import { describe, expect, it, vi } from 'vitest';

import type { AresV6FeedbackRequest } from '../feedback-schema';
import { submitAresV6Feedback, type AresV6FeedbackServiceDeps } from '../feedback-service';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Feedback service (Fase 3C)
// ═══════════════════════════════════════════════════════════════

const GEN_ID = 'ckgenerationa1b2c3d4e5f6';

function input(extra: Partial<AresV6FeedbackRequest> = {}): AresV6FeedbackRequest {
  return { generationId: GEN_ID, rating: 4, outcome: 'BETTER', ...extra };
}

function deps(overrides: Partial<AresV6FeedbackServiceDeps> = {}): AresV6FeedbackServiceDeps {
  return {
    findGeneration: vi.fn().mockResolvedValue({ deviceId: 'dev-1', presetId: 'STANDARD_PRO' }),
    findExistingFeedback: vi.fn().mockResolvedValue(null),
    countRecentLowRatings: vi.fn().mockResolvedValue(0),
    createFeedback: vi.fn().mockResolvedValue({ id: 'fb-1' }),
    now: () => 1_000_000,
    ...overrides,
  };
}

describe('submitAresV6Feedback', () => {
  it('throws NotFound when the generation does not exist', async () => {
    await expect(
      submitAresV6Feedback(input(), deps({ findGeneration: vi.fn().mockResolvedValue(null) })),
    ).rejects.toThrow(NotFoundError);
  });

  it('throws Conflict for duplicate feedback', async () => {
    await expect(
      submitAresV6Feedback(input(), deps({ findExistingFeedback: vi.fn().mockResolvedValue({ id: 'fb-0' }) })),
    ).rejects.toThrow(ConflictError);
  });

  it('persists with device/preset taken from the generation (not the client)', async () => {
    const createFeedback = vi.fn().mockResolvedValue({ id: 'fb-1' });
    const result = await submitAresV6Feedback(input(), deps({ createFeedback }));
    expect(result.id).toBe('fb-1');
    expect(result.qualityFlag).toBe('TRUSTED');
    const record = createFeedback.mock.calls[0]?.[0] as { deviceId: string; presetId: string };
    expect(record.deviceId).toBe('dev-1');
    expect(record.presetId).toBe('STANDARD_PRO');
  });

  it('flags SUSPICIOUS on low-rating volume', async () => {
    const result = await submitAresV6Feedback(
      input({ rating: 1, outcome: 'WORSE' }),
      deps({ countRecentLowRatings: vi.fn().mockResolvedValue(5) }),
    );
    expect(result.qualityFlag).toBe('SUSPICIOUS');
    expect(result.qualityReasons).toContain('LOW_RATING_VOLUME');
  });
});
