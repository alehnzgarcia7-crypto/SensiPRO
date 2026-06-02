import { ConflictError, NotFoundError } from '@ares/errors';
import type { Prisma } from '@prisma/client';

import {
  assessAresV6FeedbackQuality,
  type AresV6FeedbackQualityFlag,
} from './feedback-quality';
import type { AresV6FeedbackRequest } from './feedback-schema';
import { toAresV6Json } from './json-util';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Feedback service (Fase 3C)
//
// Orchestration: confirm the generation exists → reject duplicates (409) →
// derive device/preset FROM the stored generation (never trust the client) →
// assess quality → persist. All DB access is injected so the service is fully
// unit-testable without a database.
// ═══════════════════════════════════════════════════════════════

export type AresV6FeedbackRecord = Prisma.AresV6FeedbackCreateInput;

const LOW_RATING_WINDOW_MS = 10 * 60 * 1000;

export interface AresV6FeedbackServiceDeps {
  findGeneration(generationId: string): Promise<{ deviceId: string; presetId: string } | null>;
  findExistingFeedback(generationId: string): Promise<{ id: string } | null>;
  countRecentLowRatings(params: { deviceId: string; presetId: string; since: Date }): Promise<number>;
  createFeedback(data: AresV6FeedbackRecord): Promise<{ id: string }>;
  now(): number;
}

export interface AresV6FeedbackResult {
  id: string;
  qualityFlag: AresV6FeedbackQualityFlag;
  qualityReasons: string[];
}

async function defaultFindGeneration(generationId: string): Promise<{ deviceId: string; presetId: string } | null> {
  const { prisma } = await import('@ares/database');
  return prisma.aresV6Generation.findUnique({
    where: { id: generationId },
    select: { deviceId: true, presetId: true },
  });
}

async function defaultFindExistingFeedback(generationId: string): Promise<{ id: string } | null> {
  const { prisma } = await import('@ares/database');
  return prisma.aresV6Feedback.findUnique({ where: { generationId }, select: { id: true } });
}

async function defaultCountRecentLowRatings(params: {
  deviceId: string;
  presetId: string;
  since: Date;
}): Promise<number> {
  const { prisma } = await import('@ares/database');
  return prisma.aresV6Feedback.count({
    where: {
      deviceId: params.deviceId,
      presetId: params.presetId,
      rating: { lte: 2 },
      createdAt: { gte: params.since },
    },
  });
}

async function defaultCreateFeedback(data: AresV6FeedbackRecord): Promise<{ id: string }> {
  const { prisma } = await import('@ares/database');
  const row = await prisma.aresV6Feedback.create({ data, select: { id: true } });
  return { id: row.id };
}

const DEFAULT_DEPS: AresV6FeedbackServiceDeps = {
  findGeneration: defaultFindGeneration,
  findExistingFeedback: defaultFindExistingFeedback,
  countRecentLowRatings: defaultCountRecentLowRatings,
  createFeedback: defaultCreateFeedback,
  now: () => Date.now(),
};

/**
 * Submit internal feedback for a generation. Throws {@link NotFoundError} if
 * the generation is unknown and {@link ConflictError} if feedback already
 * exists (v0 allows one feedback per generation).
 */
export async function submitAresV6Feedback(
  input: AresV6FeedbackRequest,
  deps: AresV6FeedbackServiceDeps = DEFAULT_DEPS,
): Promise<AresV6FeedbackResult> {
  const generation = await deps.findGeneration(input.generationId);
  if (!generation) {
    throw new NotFoundError('Generation', input.generationId);
  }

  const existing = await deps.findExistingFeedback(input.generationId);
  if (existing) {
    throw new ConflictError('FEEDBACK_EXISTS', 'Ya existe feedback para esta generación.');
  }

  const recentLowRatingCount = await deps.countRecentLowRatings({
    deviceId: generation.deviceId,
    presetId: generation.presetId,
    since: new Date(deps.now() - LOW_RATING_WINDOW_MS),
  });

  const quality = assessAresV6FeedbackQuality(
    {
      rating: input.rating,
      outcome: input.outcome,
      problemResolved: input.problemResolved,
      symptoms: input.symptoms,
    },
    { recentLowRatingCount },
  );

  const record: AresV6FeedbackRecord = {
    generationId: input.generationId,
    requestId: input.requestId ?? null,
    // device/preset are taken from the stored generation, never the client.
    deviceId: generation.deviceId,
    presetId: generation.presetId,
    rating: input.rating,
    outcome: input.outcome,
    problemResolved: input.problemResolved ?? null,
    symptoms: input.symptoms ? toAresV6Json(input.symptoms) : undefined,
    adjustmentsApplied: input.adjustmentsApplied ? toAresV6Json(input.adjustmentsApplied) : undefined,
    comment: input.comment ?? null,
    qualityFlag: quality.qualityFlag,
    qualityReasons: quality.reasons.length > 0 ? toAresV6Json(quality.reasons) : undefined,
    source: 'INTERNAL_LAB',
  };

  const created = await deps.createFeedback(record);
  return { id: created.id, qualityFlag: quality.qualityFlag, qualityReasons: quality.reasons };
}
