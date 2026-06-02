import { z } from 'zod';

import { aresV6CommentContainsPii, sanitizeAresV6Comment } from './feedback-quality';
import { aresV6SymptomSchema, dedupeSymptoms } from './request-schema';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Feedback request schema (Zod, STRICT)
//
// Strict object: unknown keys rejected. Symptoms deduped (max 5). Comments are
// sanitized then rejected if they look like PII (URL/email/phone). Adjustments
// are a bounded numeric record.
// ═══════════════════════════════════════════════════════════════

const MAX_SYMPTOMS = 5;
const MAX_COMMENT_LENGTH = 280;
const MAX_ADJUSTMENTS = 24;

const outcomeSchema = z.enum(['BETTER', 'SAME', 'WORSE', 'UNSURE']);

const adjustmentsSchema = z
  .record(z.string().max(40), z.number().int().min(-200).max(200))
  .refine((value) => Object.keys(value).length <= MAX_ADJUSTMENTS, 'Demasiados ajustes');

const commentSchema = z
  .string()
  .max(MAX_COMMENT_LENGTH)
  .transform(sanitizeAresV6Comment)
  .refine((value) => value.length === 0 || !aresV6CommentContainsPii(value), 'Comentario inválido');

export const aresV6FeedbackRequestSchema = z
  .object({
    generationId: z.string().cuid('generationId inválido'),
    requestId: z.string().max(64).optional(),
    rating: z.number().int().min(1).max(5),
    outcome: outcomeSchema,
    problemResolved: z.boolean().optional(),
    symptoms: z.array(aresV6SymptomSchema).max(MAX_SYMPTOMS).transform(dedupeSymptoms).optional(),
    adjustmentsApplied: adjustmentsSchema.optional(),
    comment: commentSchema.optional(),
  })
  .strict();

export type AresV6FeedbackRequest = z.infer<typeof aresV6FeedbackRequestSchema>;
