import 'server-only';

import { z } from 'zod';

import type {
  AresV6HumanReviewChecklistItem,
  AresV6HumanReviewFinding,
  AresV6HumanReviewPacket,
  AresV6ReviewEvidenceInput,
  AresV6ReviewExecutionMode,
  AresV6ReviewSmokeInput,
} from './human-review-session';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Human review CLI core (Fase 3F) — PURE
//
// Arg parsing, tolerant extraction of the evidence/smoke artifacts, and the
// Markdown renderer behind `npm run ares:v6:human-review`. No DB, no secrets,
// no engine import. Validates operator-provided JSON with Zod (OWASP API1).
// ═══════════════════════════════════════════════════════════════

export interface AresV6HumanReviewCliOptions {
  evidenceJson: string | null;
  labReportJson: string | null;
  uiSmokeJson: string | null;
  operator: string;
  label: string;
  targetUrl: string | null;
  output: string | null;
  json: boolean;
  markdown: boolean;
  dryRun: boolean;
  /** Operator assertion that deployment protection was verified (human checklist). */
  deploymentProtectionVerified: boolean;
  /** Execution mode override; defaults to real-http when targetUrl is present. */
  executionMode: AresV6ReviewExecutionMode | null;
}

export class AresV6HumanReviewArgError extends Error {}

function need(value: string | undefined, flag: string): string {
  if (!value) throw new AresV6HumanReviewArgError(`${flag} requiere un valor`);
  return value;
}

export function parseAresV6HumanReviewArgs(argv: readonly string[]): AresV6HumanReviewCliOptions {
  const options: AresV6HumanReviewCliOptions = {
    evidenceJson: null,
    labReportJson: null,
    uiSmokeJson: null,
    operator: 'unassigned',
    label: 'ares-v6-3f-review',
    targetUrl: null,
    output: null,
    json: false,
    markdown: false,
    dryRun: false,
    deploymentProtectionVerified: false,
    executionMode: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--evidence-json':
        options.evidenceJson = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--lab-report-json':
        options.labReportJson = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--ui-smoke-json':
        options.uiSmokeJson = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--operator':
        options.operator = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--label':
        options.label = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--target-url':
        options.targetUrl = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--output':
      case '--out':
        options.output = need(argv[i + 1], arg);
        i += 1;
        break;
      case '--json':
        options.json = true;
        break;
      case '--markdown':
        options.markdown = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--deployment-protection-verified':
        options.deploymentProtectionVerified = true;
        break;
      case '--execution-mode': {
        const value = need(argv[i + 1], arg);
        if (value !== 'real-http' && value !== 'dry-run-local') {
          throw new AresV6HumanReviewArgError('--execution-mode debe ser real-http|dry-run-local');
        }
        options.executionMode = value;
        i += 1;
        break;
      }
      default:
        throw new AresV6HumanReviewArgError(`Argumento desconocido: ${arg ?? '(vacío)'}`);
    }
  }

  if (!options.evidenceJson) {
    throw new AresV6HumanReviewArgError('--evidence-json es obligatorio');
  }
  return options;
}

// ── Evidence artifact extraction ─────────────────────────────────

const goNoGoDecisionSchema = z.enum([
  'GO_INTERNAL_UI_EXPERIMENT',
  'NO_GO_MORE_DATA',
  'NO_GO_FIX_ENGINE',
  'NO_GO_INFRA',
]);
const structuralRiskSchema = z.enum(['CLEAR', 'REVIEW_REQUIRED', 'BLOCKING']);

const highRiskRowSchema = z.object({
  fixtureId: z.string(),
  presetId: z.string(),
  expectedness: z.string(),
  ppi: z.number(),
  ppiSource: z.string(),
  rationale: z.array(z.string()),
});

const evidenceReportSchema = z.object({
  mode: z.enum(['from-db', 'fixtures-only']),
  proposals: z
    .object({ proposals: z.array(z.unknown()) })
    .nullable()
    .optional(),
  snapshot: z.object({
    goNoGo: z.object({ decision: goNoGoDecisionSchema }),
    structuralRisk: z.object({
      decision: structuralRiskSchema,
      dangerousRows: z.number(),
      needsReviewRows: z.number(),
    }),
    evidenceFixtureCoverage: z.number(),
    comparisonFixtureCoverage: z.number(),
    totalFixtures: z.number(),
    evidenceCoveredFixtures: z.number(),
    metrics: z.object({
      feedbackCoverageRate: z.number(),
      totalGenerations: z.number(),
      totalFeedback: z.number(),
    }),
    highRiskSummaryRows: z.array(highRiskRowSchema),
    recommendedNextActions: z.array(z.string()),
  }),
});

export class AresV6EvidenceParseError extends Error {}

/** Extract the review evidence input from a parsed evidence-review report JSON. */
export function extractAresV6ReviewEvidence(json: unknown): AresV6ReviewEvidenceInput {
  const parsed = evidenceReportSchema.safeParse(json);
  if (!parsed.success) {
    throw new AresV6EvidenceParseError(
      `evidence JSON inválido: ${parsed.error.issues[0]?.message ?? 'estructura inesperada'}`,
    );
  }
  const s = parsed.data.snapshot;
  return {
    mode: parsed.data.mode,
    goNoGoDecision: s.goNoGo.decision,
    structuralRisk: s.structuralRisk.decision,
    evidenceFixtureCoverage: s.evidenceFixtureCoverage,
    comparisonFixtureCoverage: s.comparisonFixtureCoverage,
    totalFixtures: s.totalFixtures,
    evidenceCoveredFixtures: s.evidenceCoveredFixtures,
    feedbackCoverageRate: s.metrics.feedbackCoverageRate,
    totalGenerations: s.metrics.totalGenerations,
    totalTrustedFeedback: s.metrics.totalFeedback,
    dangerousRows: s.structuralRisk.dangerousRows,
    needsReviewRows: s.structuralRisk.needsReviewRows,
    highRiskSummaryRows: s.highRiskSummaryRows,
    recommendedNextActions: s.recommendedNextActions,
    proposalsCount: parsed.data.proposals ? parsed.data.proposals.proposals.length : null,
  };
}

const smokeReportSchema = z.object({
  ran: z.boolean().optional(),
  passed: z.boolean(),
  checks: z.number().optional(),
  failures: z.array(z.string()).optional(),
});

/** Extract a UI smoke result from a parsed smoke artifact (lenient). */
export function extractAresV6ReviewSmoke(json: unknown): AresV6ReviewSmokeInput {
  const parsed = smokeReportSchema.safeParse(json);
  if (!parsed.success) {
    throw new AresV6EvidenceParseError('ui-smoke JSON inválido');
  }
  return {
    ran: parsed.data.ran ?? true,
    passed: parsed.data.passed,
    ...(parsed.data.checks !== undefined ? { checks: parsed.data.checks } : {}),
    ...(parsed.data.failures ? { failures: parsed.data.failures } : {}),
  };
}

// ── Markdown renderer ────────────────────────────────────────────

function mdList(items: readonly string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : '- (ninguno)';
}

function mdChecklist(items: readonly AresV6HumanReviewChecklistItem[]): string {
  return items
    .map((item) => {
      const box = item.status === 'PASS' ? '[x]' : item.status === 'FAIL' ? '[!]' : '[ ]';
      const tag = item.auto ? `(auto:${item.status})` : '(humano)';
      return `- ${box} ${tag} ${item.label}`;
    })
    .join('\n');
}

function mdFindings(findings: readonly AresV6HumanReviewFinding[]): string {
  if (findings.length === 0) return '- (ninguno)';
  return findings
    .map(
      (f) =>
        `- **[${f.severity}/${f.area}]** ${f.title}${f.blocksNextPhase ? ' ⛔' : ''}\n` +
        `  - ${f.detail}\n  - Acción: ${f.recommendedAction}`,
    )
    .join('\n');
}

export function buildAresV6HumanReviewMarkdown(packet: AresV6HumanReviewPacket): string {
  const ev = packet.evidence;
  const d = packet.decision;
  const lines: string[] = [];

  lines.push('# ARES v6 — Human Review Packet (Fase 3F)');
  lines.push('');
  lines.push(
    `**Sesión:** ${packet.session.label}  ·  **Operador:** ${packet.session.operator}  ·  ` +
      `**Entorno:** ${packet.session.environment}  ·  **Generado:** ${packet.generatedAt}  ·  **schema:** ${packet.schemaVersion}`,
  );
  if (packet.session.commitSha) lines.push(`**Commit:** ${packet.session.commitSha}`);
  lines.push(
    `**Modo de ejecución:** ${packet.execution.executionMode}  ·  ` +
      `**Target (redacted):** ${packet.execution.targetUrlRedacted ?? '(none)'}  ·  ` +
      `**Deployment protection:** ${packet.execution.deploymentProtectionVerified ? 'verificada (humano)' : 'NO verificada'}`,
  );
  lines.push('');

  lines.push('## 1. Evidencia · GO/NO-GO');
  lines.push('');
  lines.push(`- Modo: **${ev.mode}**`);
  lines.push(`- GO/NO-GO: **${ev.goNoGoDecision}**`);
  lines.push(`- Riesgo estructural: **${ev.structuralRisk}** (dangerous=${ev.dangerousRows}, review=${ev.needsReviewRows})`);
  lines.push('');

  lines.push('## 2. Cobertura (EVIDENCIA vs COMPARACIÓN)');
  lines.push('');
  lines.push(
    `- **evidenceFixtureCoverage** (gatea GO): ${ev.evidenceFixtureCoverage} (${ev.evidenceCoveredFixtures}/${ev.totalFixtures})`,
  );
  lines.push(`- comparisonFixtureCoverage (informativo): ${ev.comparisonFixtureCoverage}`);
  lines.push(`- generaciones=${ev.totalGenerations} · feedback TRUSTED=${ev.totalTrustedFeedback} · feedbackCoverage=${ev.feedbackCoverageRate}`);
  lines.push('');

  lines.push('## 3. Filas de alto riesgo (resumen, sin vectores)');
  lines.push('');
  if (ev.highRiskSummaryRows.length > 0) {
    lines.push('| fixture | preset | ppi | src | expectedness |');
    lines.push('|---|---|---|---|---|');
    for (const row of ev.highRiskSummaryRows.slice(0, 20)) {
      lines.push(`| ${row.fixtureId} | ${row.presetId} | ${row.ppi} | ${row.ppiSource} | ${row.expectedness} |`);
    }
  } else {
    lines.push('Sin filas de alto riesgo.');
  }
  lines.push('');

  lines.push('## 4. Prueba de humo de la UI');
  lines.push('');
  lines.push(
    packet.smoke
      ? `- ran=${packet.smoke.ran} · passed=${packet.smoke.passed}${packet.smoke.checks ? ` · checks=${packet.smoke.checks}` : ''}`
      : '- No ejecutada (adjunta `--ui-smoke-json`).',
  );
  lines.push('');

  lines.push('## 5. Checklist humano');
  lines.push('');
  lines.push(mdChecklist(packet.checklist));
  lines.push('');

  lines.push('## 6. Hallazgos');
  lines.push('');
  lines.push(mdFindings(packet.findings));
  lines.push('');

  lines.push('## 7. Próximas acciones (de la evidencia)');
  lines.push('');
  lines.push(mdList(ev.recommendedNextActions));
  lines.push('');

  lines.push('## 8. Decisión');
  lines.push('');
  lines.push(`- **Estado:** ${d.status}`);
  lines.push(`- **Recomendación del sistema:** ${d.recommendedDecision}`);
  lines.push(`- **Decisión humana:** ${d.decision ?? '(pendiente — requiere decidedBy + rationale)'}`);
  lines.push(`- **Decidido por:** ${d.decidedBy || '(pendiente)'}`);
  lines.push(`- **Fecha:** ${d.decidedAt || '(pendiente)'}`);
  if (packet.readiness.blockers.length > 0) {
    lines.push('');
    lines.push('**Bloqueadores:**');
    lines.push(mdList(packet.readiness.blockers));
  }
  if (packet.readiness.reasons.length > 0) {
    lines.push('');
    lines.push('**Falta evidencia:**');
    lines.push(mdList(packet.readiness.reasons));
  }
  if (packet.readiness.unmetClosedBetaGates.length > 0) {
    lines.push('');
    lines.push('**Gates de closed-beta no cumplidos:**');
    lines.push(mdList(packet.readiness.unmetClosedBetaGates));
  }
  if (d.finalizationBlockedReasons.length > 0) {
    lines.push('');
    lines.push('**Finalización bloqueada (no puede ser FINAL aún):**');
    lines.push(mdList(d.finalizationBlockedReasons));
  }
  lines.push('');
  lines.push('**Rationale (humano):**');
  lines.push(mdList(d.rationale));
  lines.push('');
  lines.push(
    '> El sistema RECOMIENDA, no aprueba. La decisión final es FINAL sólo con `decidedBy` + `rationale`. ' +
      'Ninguna propuesta se auto-aplica; el motor no se modifica.',
  );
  lines.push('');

  return `${lines.join('\n')}\n`;
}
