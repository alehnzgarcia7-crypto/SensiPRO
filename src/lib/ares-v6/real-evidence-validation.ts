import { z } from 'zod';

import { getDefaultAresV6EvidenceThresholds } from './evidence-thresholds';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Real-evidence validation for the 3G session
//
// Two pure concerns, tooling-only (no `server-only`, no DB, no engine mutation):
//
//   1. resolveAresV6RealExecutionMode — derives the execution-mode descriptor
//      (real-http vs dry-run-local) the workflow persists as an artifact.
//
//   2. validateAresV6RealEvidence — an INDEPENDENT, skeptical auditor of the
//      produced artifacts (lab report / evidence summary / human packet / UI
//      smoke). It is the machine guard behind the human review: in real-http
//      mode it refuses fixtures-only evidence, evidenceFixtureCoverage=0,
//      totalGenerations=0, a missing packet, a FINAL packet without a human,
//      a closed-beta recommendation whose gates aren't met, or ANY secret that
//      leaked into an artifact. In dry-run-local mode it INSISTS the packet says
//      NO_GO_MORE_EVIDENCE and can never claim real evidence.
//
// "CI verde ≠ aprobación": this validates the EVIDENCE, never grants approval.
// ═══════════════════════════════════════════════════════════════

export type AresV6RealExecutionModeName = 'real-http' | 'dry-run-local';

export interface AresV6RealExecutionModeInput {
  targetUrlPresent: boolean;
  targetUrlRedacted: string | null;
  persistGenerations: boolean;
  feedbackEnabled: boolean;
}

export interface AresV6RealExecutionMode {
  mode: AresV6RealExecutionModeName;
  targetUrlPresent: boolean;
  targetUrlRedacted: string | null;
  feedbackEnabled: boolean;
  persistGenerations: boolean;
  requiresHumanDecision: true;
}

/** Real-http when (and only when) a targetUrl is present; otherwise a local dry-run. */
export function resolveAresV6RealExecutionMode(input: AresV6RealExecutionModeInput): AresV6RealExecutionMode {
  return {
    mode: input.targetUrlPresent ? 'real-http' : 'dry-run-local',
    targetUrlPresent: input.targetUrlPresent,
    targetUrlRedacted: input.targetUrlRedacted,
    feedbackEnabled: input.feedbackEnabled,
    persistGenerations: input.persistGenerations,
    requiresHumanDecision: true,
  };
}

// ── Artifact shapes (operator-provided JSON — validated, OWASP API1) ──────────

const labReportSchema = z
  .object({
    total: z.number().optional(),
    successCount: z.number().optional(),
    failureCount: z.number().optional(),
  })
  .passthrough();

const evidenceSummarySchema = z
  .object({
    mode: z.enum(['from-db', 'fixtures-only']),
    snapshot: z
      .object({
        evidenceFixtureCoverage: z.number(),
        comparisonFixtureCoverage: z.number(),
        structuralRisk: z.object({ decision: z.enum(['CLEAR', 'REVIEW_REQUIRED', 'BLOCKING']) }).passthrough(),
        metrics: z.object({ totalGenerations: z.number(), totalFeedback: z.number() }).passthrough(),
      })
      .passthrough(),
  })
  .passthrough();

const humanPacketSchema = z
  .object({
    decision: z
      .object({
        status: z.enum(['DRAFT', 'FINAL']),
        decision: z.string().nullable(),
        recommendedDecision: z.string(),
        decidedBy: z.string(),
        rationale: z.array(z.string()),
      })
      .passthrough(),
    readiness: z.object({ recommendedDecision: z.string() }).passthrough().optional(),
    evidence: z.object({ mode: z.enum(['from-db', 'fixtures-only']) }).passthrough().optional(),
    execution: z
      .object({
        executionMode: z.enum(['real-http', 'dry-run-local']).optional(),
        deploymentProtectionVerified: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
    smoke: z
      .object({ ran: z.boolean().optional(), passed: z.boolean() })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough();

const uiSmokeSchema = z.object({ ran: z.boolean().optional(), passed: z.boolean() }).passthrough();

const CLOSED_BETA_DECISION = 'GO_PREPARE_CLOSED_BETA_DESIGN';
const MORE_EVIDENCE_DECISION = 'NO_GO_MORE_EVIDENCE';

// ── Secret scanner (artifacts must NEVER carry a secret) ──────────────────────

const SHA256_RE = /^[a-f0-9]{64}$/i;
const BEARER_RE = /\bbearer\s+[A-Za-z0-9._~+/=-]{8,}/i;
const SENSITIVE_KEY_RE =
  /^(token|secret|password|passwd|pwd|authorization|cookie|api[_-]?key|access[_-]?token|client[_-]?secret|sha256|token_sha256)$/i;
const REDACTED = '[redacted]';

/** Walk a parsed artifact and report any secret-looking values/keys. */
export function findAresV6ArtifactSecrets(value: unknown, rootLabel = '$'): string[] {
  const hits: string[] = [];
  const walk = (node: unknown, path: string): void => {
    if (typeof node === 'string') {
      const trimmed = node.trim();
      if (trimmed !== REDACTED && SHA256_RE.test(trimmed)) hits.push(`${path}: posible hash/token SHA-256 (64 hex)`);
      else if (BEARER_RE.test(node)) hits.push(`${path}: posible bearer token`);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (node && typeof node === 'object') {
      for (const [key, val] of Object.entries(node)) {
        if (SENSITIVE_KEY_RE.test(key) && typeof val === 'string' && val.trim() !== '' && val !== REDACTED) {
          hits.push(`${path}.${key}: clave sensible con valor en claro`);
        }
        walk(val, `${path}.${key}`);
      }
    }
  };
  walk(value, rootLabel);
  return hits;
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface AresV6RealEvidenceArtifacts {
  /** Parsed lab report JSON, or null when the file is absent. */
  labReport: unknown | null;
  /** Parsed evidence summary JSON, or null when absent. */
  evidence: unknown | null;
  /** Parsed human-review packet JSON, or null when absent. */
  humanPacket: unknown | null;
  /** Parsed UI smoke JSON, or null when absent. */
  uiSmoke?: unknown | null;
}

export interface AresV6RealEvidenceValidationInput {
  mode: AresV6RealExecutionModeName;
  artifacts: AresV6RealEvidenceArtifacts;
  /** runUiSmoke=true ⇒ the UI smoke artifact must be present and have ran. */
  requireUiSmoke?: boolean;
  /** Closed-beta evidence-coverage floor (defaults to the shared threshold). */
  minEvidenceFixtureCoverage?: number;
}

export type AresV6CheckStatus = 'ok' | 'warning' | 'error';

export interface AresV6RealEvidenceCheck {
  name: string;
  status: AresV6CheckStatus;
  detail: string;
}

export interface AresV6RealEvidenceSummary {
  evidenceMode: 'from-db' | 'fixtures-only' | null;
  evidenceFixtureCoverage: number | null;
  comparisonFixtureCoverage: number | null;
  totalGenerations: number | null;
  structuralRisk: 'CLEAR' | 'REVIEW_REQUIRED' | 'BLOCKING' | null;
  recommendedDecision: string | null;
  decisionStatus: 'DRAFT' | 'FINAL' | null;
}

export interface AresV6RealEvidenceValidationResult {
  mode: AresV6RealExecutionModeName;
  passed: boolean;
  errors: string[];
  warnings: string[];
  checks: AresV6RealEvidenceCheck[];
  summary: AresV6RealEvidenceSummary;
}

/**
 * Validate the produced artifacts against the resolved execution mode. Pure and
 * deterministic. real-http demands real persisted evidence; dry-run-local must
 * stay NO_GO_MORE_EVIDENCE. Any leaked secret fails regardless of mode.
 */
export function validateAresV6RealEvidence(
  input: AresV6RealEvidenceValidationInput,
): AresV6RealEvidenceValidationResult {
  const minCoverage = input.minEvidenceFixtureCoverage ?? getDefaultAresV6EvidenceThresholds().minFixtureCoverage;
  const errors: string[] = [];
  const warnings: string[] = [];
  const checks: AresV6RealEvidenceCheck[] = [];
  const push = (name: string, status: AresV6CheckStatus, detail: string): void => {
    checks.push({ name, status, detail });
    if (status === 'error') errors.push(`${name}: ${detail}`);
    else if (status === 'warning') warnings.push(`${name}: ${detail}`);
  };

  const realMode = input.mode === 'real-http';

  // 0. Secrets must never appear in any artifact (both modes).
  const secretHits: string[] = [];
  const artifactPairs: Array<[string, unknown | null | undefined]> = [
    ['lab-report', input.artifacts.labReport],
    ['evidence-summary', input.artifacts.evidence],
    ['human-packet', input.artifacts.humanPacket],
    ['ui-smoke', input.artifacts.uiSmoke],
  ];
  for (const [label, artifact] of artifactPairs) {
    if (artifact == null) continue;
    for (const hit of findAresV6ArtifactSecrets(artifact, label)) secretHits.push(hit);
  }
  push(
    'no_secrets_in_artifacts',
    secretHits.length === 0 ? 'ok' : 'error',
    secretHits.length === 0 ? 'sin secretos detectados' : `secretos detectados: ${secretHits.join('; ')}`,
  );

  // 1. Parse the evidence summary.
  const evidenceParsed = input.artifacts.evidence == null ? null : evidenceSummarySchema.safeParse(input.artifacts.evidence);
  const evidence = evidenceParsed && evidenceParsed.success ? evidenceParsed.data : null;
  if (input.artifacts.evidence != null && evidenceParsed && !evidenceParsed.success) {
    push('evidence_parse', 'error', `evidence summary inválido: ${evidenceParsed.error.issues[0]?.message ?? 'estructura inesperada'}`);
  }

  // 2. Parse the human packet.
  const packetParsed = input.artifacts.humanPacket == null ? null : humanPacketSchema.safeParse(input.artifacts.humanPacket);
  const packet = packetParsed && packetParsed.success ? packetParsed.data : null;
  if (input.artifacts.humanPacket != null && packetParsed && !packetParsed.success) {
    push('packet_parse', 'error', `human packet inválido: ${packetParsed.error.issues[0]?.message ?? 'estructura inesperada'}`);
  }

  // 3. Parse the UI smoke (optional).
  const smokeParsed = input.artifacts.uiSmoke == null ? null : uiSmokeSchema.safeParse(input.artifacts.uiSmoke);
  const smoke = smokeParsed && smokeParsed.success ? smokeParsed.data : null;

  // 4. Lab report presence (errors only in real mode).
  const labParsed = input.artifacts.labReport == null ? null : labReportSchema.safeParse(input.artifacts.labReport);
  push(
    'lab_report_present',
    input.artifacts.labReport != null ? 'ok' : realMode ? 'error' : 'warning',
    input.artifacts.labReport != null ? 'presente' : 'ausente (requerido en modo real-http)',
  );
  if (labParsed && !labParsed.success) {
    push('lab_report_parse', 'warning', 'lab report con estructura inesperada (se ignora el contenido).');
  }

  const evidenceMode = evidence?.mode ?? null;
  const evCov = evidence?.snapshot.evidenceFixtureCoverage ?? null;
  const cmpCov = evidence?.snapshot.comparisonFixtureCoverage ?? null;
  const totalGenerations = evidence?.snapshot.metrics.totalGenerations ?? null;
  const structuralRisk = evidence?.snapshot.structuralRisk.decision ?? null;
  const recommendedDecision = packet?.decision.recommendedDecision ?? packet?.readiness?.recommendedDecision ?? null;
  const decisionStatus = packet?.decision.status ?? null;

  // 5. Evidence presence.
  push(
    'evidence_present',
    evidence != null ? 'ok' : realMode ? 'error' : 'warning',
    evidence != null ? `mode=${evidenceMode}` : 'ausente (requerido en modo real-http)',
  );

  // 6. Human packet presence + DRAFT/FINAL consistency.
  push(
    'human_packet_present',
    packet != null ? 'ok' : realMode ? 'error' : 'warning',
    packet != null ? `status=${decisionStatus}` : 'ausente (requerido en modo real-http)',
  );
  if (packet) {
    const hasHuman = packet.decision.decidedBy.trim().length > 0 && packet.decision.rationale.length > 0 && packet.decision.decision != null;
    push(
      'packet_final_requires_human',
      packet.decision.status === 'FINAL' && !hasHuman ? 'error' : 'ok',
      packet.decision.status === 'FINAL' && !hasHuman
        ? 'packet FINAL sin decidedBy + rationale + decision'
        : `status=${packet.decision.status}, human=${hasHuman}`,
    );
  }

  // 7. Closed-beta gate consistency (both modes; defense-in-depth vs a forged packet).
  const recommendsClosedBeta = recommendedDecision === CLOSED_BETA_DECISION || packet?.decision.decision === CLOSED_BETA_DECISION;
  if (recommendsClosedBeta) {
    const cbReasons: string[] = [];
    if (structuralRisk !== 'CLEAR') cbReasons.push(`structuralRisk=${structuralRisk ?? 'desconocido'} (requiere CLEAR)`);
    if (evCov == null || evCov < minCoverage) cbReasons.push(`evidenceFixtureCoverage=${evCov ?? 'n/a'} < ${minCoverage}`);
    if (packet?.execution?.deploymentProtectionVerified !== true) cbReasons.push('deploymentProtectionVerified != true');
    if (!(smoke?.passed === true) && !(packet?.smoke?.passed === true)) cbReasons.push('UI smoke no aprobada');
    push(
      'closed_beta_gates',
      cbReasons.length === 0 ? 'ok' : 'error',
      cbReasons.length === 0 ? 'gates de closed-beta satisfechos' : `closed-beta no permitido: ${cbReasons.join('; ')}`,
    );
  }

  if (realMode) {
    // ── real-http: demand REAL persisted evidence ──
    push(
      'evidence_mode_real',
      evidenceMode === 'from-db' ? 'ok' : 'error',
      evidenceMode === 'from-db' ? 'from-db' : `evidence mode=${evidenceMode ?? 'ausente'} (fixtures-only NO es evidencia real)`,
    );
    push(
      'total_generations_positive',
      typeof totalGenerations === 'number' && totalGenerations > 0 ? 'ok' : 'error',
      `totalGenerations=${totalGenerations ?? 'n/a'} (debe ser > 0)`,
    );
    push(
      'evidence_coverage_positive',
      typeof evCov === 'number' && evCov > 0 ? 'ok' : 'error',
      `evidenceFixtureCoverage=${evCov ?? 'n/a'} (debe ser > 0)`,
    );
    // The packet recommendation must be grounded in real (non-fixtures) evidence.
    const packetEvidenceMode = packet?.evidence?.mode ?? evidenceMode;
    push(
      'recommendation_grounded_in_real_evidence',
      packetEvidenceMode === 'from-db' && typeof evCov === 'number' && evCov > 0 ? 'ok' : 'error',
      packetEvidenceMode === 'from-db' && typeof evCov === 'number' && evCov > 0
        ? 'recomendación basada en evidencia real'
        : 'la recomendación dependería de evidencia fixtures-only',
    );
    if (input.requireUiSmoke) {
      const ran = smoke?.ran === true || packet?.smoke?.ran === true;
      push('ui_smoke_ran', ran ? 'ok' : 'error', ran ? 'la prueba de humo se ejecutó' : 'runUiSmoke=true pero el smoke no se ejecutó');
    }
  } else {
    // ── dry-run-local: can NEVER claim real evidence ──
    push(
      'dry_run_more_evidence',
      recommendedDecision === MORE_EVIDENCE_DECISION ? 'ok' : 'error',
      recommendedDecision === MORE_EVIDENCE_DECISION
        ? 'recomendación = NO_GO_MORE_EVIDENCE (correcto para dry-run)'
        : `dry-run-local debe recomendar NO_GO_MORE_EVIDENCE (got ${recommendedDecision ?? 'n/a'})`,
    );
    push(
      'dry_run_no_closed_beta',
      recommendsClosedBeta ? 'error' : 'ok',
      recommendsClosedBeta ? 'dry-run-local NO puede recomendar/decidir closed-beta' : 'sin recomendación de closed-beta',
    );
    if (evidenceMode === 'from-db' && (evCov ?? 0) > 0) {
      push('dry_run_evidence_note', 'warning', 'el modo es dry-run pero la evidencia parece real — revisa la coherencia del run.');
    }
  }

  return {
    mode: input.mode,
    passed: errors.length === 0,
    errors,
    warnings,
    checks,
    summary: {
      evidenceMode,
      evidenceFixtureCoverage: evCov,
      comparisonFixtureCoverage: cmpCov,
      totalGenerations,
      structuralRisk,
      recommendedDecision,
      decisionStatus,
    },
  };
}
