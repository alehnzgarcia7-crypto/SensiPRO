// ═══════════════════════════════════════════════════════════════
// ARES v6 — Feedback quality / anti-data-poisoning (Fase 3C)
//
// Feedback is EVIDENCE, never automatic truth. This module sanitizes comments,
// rejects PII-bearing comments, and flags suspicious feedback (volume of low
// ratings, outcome/symptom conflicts) so trusted metrics can exclude it. It
// never mutates the engine.
// ═══════════════════════════════════════════════════════════════

const MAX_COMMENT_LENGTH = 280;
const ASCII_CONTROL_MAX = 31;
const ASCII_DELETE = 127;

/** Strip ASCII control chars (by code point, no control-char regex), collapse, trim, clamp. */
export function sanitizeAresV6Comment(comment: string): string {
  let cleaned = '';
  for (const char of comment) {
    const code = char.codePointAt(0) ?? 0;
    cleaned += code <= ASCII_CONTROL_MAX || code === ASCII_DELETE ? ' ' : char;
  }
  return cleaned.replace(/\s+/g, ' ').trim().slice(0, MAX_COMMENT_LENGTH);
}

// Bounded, ReDoS-safe detectors.
const URL_RE = /(https?:\/\/|www\.)/i;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;

function hasManyDigits(value: string): boolean {
  return value.replace(/\D/g, '').length >= 7;
}

/** True when a comment looks like it contains PII / spam (URL, email, phone). */
export function aresV6CommentContainsPii(comment: string): boolean {
  return URL_RE.test(comment) || EMAIL_RE.test(comment) || hasManyDigits(comment);
}

export type AresV6FeedbackQualityFlag = 'TRUSTED' | 'SUSPICIOUS';

export interface AresV6FeedbackQualityInput {
  rating: number;
  outcome: 'BETTER' | 'SAME' | 'WORSE' | 'UNSURE';
  problemResolved?: boolean;
  symptoms?: readonly string[];
}

export interface AresV6FeedbackQualityContext {
  /** Count of recent low ratings (<=2) for the same device+preset in the window. */
  recentLowRatingCount?: number;
  lowRatingVolumeThreshold?: number;
}

export interface AresV6FeedbackQualityAssessment {
  qualityFlag: AresV6FeedbackQualityFlag;
  reasons: string[];
}

const DEFAULT_LOW_RATING_THRESHOLD = 5;

/** Assess feedback quality. PII comments are rejected earlier (at the schema). */
export function assessAresV6FeedbackQuality(
  input: AresV6FeedbackQualityInput,
  context: AresV6FeedbackQualityContext = {},
): AresV6FeedbackQualityAssessment {
  const reasons: string[] = [];
  const threshold = context.lowRatingVolumeThreshold ?? DEFAULT_LOW_RATING_THRESHOLD;

  if ((context.recentLowRatingCount ?? 0) >= threshold) {
    reasons.push('LOW_RATING_VOLUME');
  }

  // Obvious contradictions between outcome and reported state.
  if (input.outcome === 'BETTER' && input.problemResolved === true && (input.symptoms?.length ?? 0) > 0) {
    reasons.push('OUTCOME_SYMPTOM_CONFLICT');
  }
  if (input.outcome === 'WORSE' && input.problemResolved === true) {
    reasons.push('OUTCOME_RESOLVED_CONFLICT');
  }

  return { qualityFlag: reasons.length > 0 ? 'SUSPICIOUS' : 'TRUSTED', reasons };
}
