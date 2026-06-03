import { z } from 'zod';

import { ARES_V6_PRESETS, type AresV6PresetId } from '@ares/algorithms/engine-v6';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Shared evidence query contract (Fase 3D.1B)
//
// Single source of truth for the evidence endpoint query parsing/normalization
// so the route and any tooling share IDENTICAL semantics (OWASP API1: filter
// context must be preserved consistently). Strict schema, real preset enum,
// bounded window, machine-readable warning codes. Pure: no DB, no engine.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_EVIDENCE_COMPARE_SCOPES = ['filtered', 'all'] as const;
export type AresV6CompareScope = (typeof ARES_V6_EVIDENCE_COMPARE_SCOPES)[number];

export const ARES_V6_EVIDENCE_MAX_INCLUDED_ROWS = 100;

/** Machine-readable warning codes (never free text, so clients can branch on them). */
export const ARES_V6_EVIDENCE_WARNING_COMPARISON_NOT_FILTERED = 'comparison_not_filtered_by_preset';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_MS = 7 * DAY_MS;
const MAX_RANGE_MS = 90 * DAY_MS;

const VALID_PRESET_IDS: ReadonlySet<string> = new Set(ARES_V6_PRESETS.map((preset) => preset.id));

export function isAresV6PresetId(value: string): value is AresV6PresetId {
  return VALID_PRESET_IDS.has(value);
}

export const aresV6EvidencePresetIdSchema = z
  .string()
  .refine(isAresV6PresetId, 'presetId no es un preset válido de ARES v6');

export const aresV6EvidenceBooleanStringSchema = z.enum(['true', 'false']);

export const aresV6EvidenceQuerySchema = z
  .object({
    since: z.string().datetime({ message: 'since debe ser ISO 8601' }).optional(),
    until: z.string().datetime({ message: 'until debe ser ISO 8601' }).optional(),
    deviceId: z.string().max(64).optional(),
    presetId: aresV6EvidencePresetIdSchema.optional(),
    includeSuspicious: aresV6EvidenceBooleanStringSchema.optional(),
    includeLegacyCompare: aresV6EvidenceBooleanStringSchema.optional(),
    includeRows: aresV6EvidenceBooleanStringSchema.optional(),
    compareScope: z.enum(['filtered', 'all']).optional(),
  })
  .strict();

export type AresV6EvidenceQueryInput = z.infer<typeof aresV6EvidenceQuerySchema>;

export interface AresV6EvidenceQueryError {
  ok: false;
  code: 'VALIDATION_ERROR';
  field?: string;
  message: string;
}

export interface AresV6NormalizedEvidenceQuery {
  since: Date;
  until: Date;
  deviceId?: string;
  presetId?: AresV6PresetId;
  includeSuspicious: boolean;
  includeLegacyCompare: boolean;
  includeRows: boolean;
  compareScope: AresV6CompareScope;
  /** Machine-readable warning codes (e.g. comparison_not_filtered_by_preset). */
  warnings: string[];
}

export type AresV6EvidenceQueryResult =
  | { ok: true; query: AresV6NormalizedEvidenceQuery }
  | AresV6EvidenceQueryError;

function validationError(field: string | undefined, message: string): AresV6EvidenceQueryError {
  return { ok: false, code: 'VALIDATION_ERROR', ...(field ? { field } : {}), message };
}

/** Normalize a validated input into a typed query + window + warning codes. */
export function normalizeAresV6EvidenceQuery(
  input: AresV6EvidenceQueryInput,
  nowMs: number,
): AresV6EvidenceQueryResult {
  const until = input.until ? new Date(input.until) : new Date(nowMs);
  const since = input.since ? new Date(input.since) : new Date(until.getTime() - DEFAULT_WINDOW_MS);

  if (until.getTime() < since.getTime()) {
    return validationError('until', 'until no puede ser anterior a since.');
  }
  if (until.getTime() - since.getTime() > MAX_RANGE_MS) {
    return validationError('until', 'El rango máximo permitido es de 90 días.');
  }

  const presetId = input.presetId && isAresV6PresetId(input.presetId) ? input.presetId : undefined;
  const compareScope: AresV6CompareScope = input.compareScope ?? 'filtered';
  const warnings: string[] = [];
  // compareScope=all with a presetId means the comparison will NOT be filtered.
  if (compareScope === 'all' && presetId) {
    warnings.push(ARES_V6_EVIDENCE_WARNING_COMPARISON_NOT_FILTERED);
  }

  return {
    ok: true,
    query: {
      since,
      until,
      ...(input.deviceId ? { deviceId: input.deviceId } : {}),
      ...(presetId ? { presetId } : {}),
      includeSuspicious: input.includeSuspicious === 'true',
      includeLegacyCompare: input.includeLegacyCompare === 'true',
      includeRows: input.includeRows === 'true',
      compareScope,
      warnings,
    },
  };
}

/** Parse + normalize raw query params. Returns a typed query or a validation error. */
export function parseAresV6EvidenceQuery(
  searchParams: URLSearchParams | Record<string, string>,
  nowMs: number,
): AresV6EvidenceQueryResult {
  const raw =
    searchParams instanceof URLSearchParams ? Object.fromEntries(searchParams.entries()) : searchParams;
  const parsed = aresV6EvidenceQuerySchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue && issue.path.length > 0 ? issue.path.join('.') : undefined;
    return validationError(field, field ? `Parámetro inválido: "${field}".` : 'Parámetros inválidos.');
  }
  return normalizeAresV6EvidenceQuery(parsed.data, nowMs);
}
