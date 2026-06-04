import { readFileSync, writeFileSync } from 'node:fs';

import {
  buildAresV6HumanReviewMarkdown,
  extractAresV6ReviewEvidence,
  extractAresV6ReviewSmoke,
  parseAresV6HumanReviewArgs,
} from '../src/lib/ares-v6/human-review-cli';
import {
  buildAresV6HumanReviewPacket,
  buildDefaultAresV6HumanReviewPlan,
  sanitizeAresV6HumanReviewPacket,
} from '../src/lib/ares-v6/human-review-session';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Human review packet CLI (Fase 3F). INTERNAL ONLY.
//
//   npm run ares:v6:human-review -- --evidence-json ares-v6-evidence-summary.json \
//     --operator alex --label fase-3f --json --markdown --output human-review-packet.json
// Reads the evidence/lab/smoke artifacts and produces a DRAFT operator packet.
// No DB writes, no secrets, no auto GO. A FINAL decision needs a human decidedBy.
// ═══════════════════════════════════════════════════════════════

function readJson(path: string): unknown {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    throw new Error(`No se pudo leer el archivo: ${path}`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`JSON inválido en: ${path}`);
  }
}

function labReportContext(path: string | null): { commitSha: string | null; environment: string | null } {
  if (!path) return { commitSha: null, environment: null };
  const json = readJson(path);
  if (json && typeof json === 'object') {
    const record = json as Record<string, unknown>;
    return {
      commitSha: typeof record.commitSha === 'string' ? record.commitSha : null,
      environment: typeof record.environment === 'string' ? record.environment : null,
    };
  }
  return { commitSha: null, environment: null };
}

function mdPathFor(output: string): string {
  return output.endsWith('.json') ? output.replace(/\.json$/, '.md') : `${output}.md`;
}

function main(): void {
  const options = parseAresV6HumanReviewArgs(process.argv.slice(2));

  const evidence = extractAresV6ReviewEvidence(readJson(options.evidenceJson as string));
  const smoke = options.uiSmokeJson ? extractAresV6ReviewSmoke(readJson(options.uiSmokeJson)) : null;
  const labCtx = labReportContext(options.labReportJson);

  const now = new Date().toISOString();
  const plan = buildDefaultAresV6HumanReviewPlan({
    label: options.label,
    operator: options.operator,
    createdAt: now,
    environment: labCtx.environment ?? 'local',
    commitSha: process.env.GITHUB_SHA ?? labCtx.commitSha ?? null,
    targetUrl: options.targetUrl,
  });

  const packet = sanitizeAresV6HumanReviewPacket(
    buildAresV6HumanReviewPacket({
      plan,
      readinessInput: {
        evidence,
        smoke,
        deploymentProtectionVerified: options.deploymentProtectionVerified,
      },
      generatedAt: now,
    }),
  );

  const markdown = buildAresV6HumanReviewMarkdown(packet);
  const jsonOut = `${JSON.stringify(packet, null, 2)}\n`;

  if (options.output && !options.dryRun) {
    writeFileSync(options.output, jsonOut, 'utf8');
    writeFileSync(mdPathFor(options.output), markdown, 'utf8');
    process.stdout.write(`Wrote human review packet to ${options.output} (+ .md)\n`);
  }

  if (options.markdown) process.stdout.write(markdown);
  if (options.json || (!options.markdown && !options.output)) process.stdout.write(jsonOut);

  process.stderr.write(
    `ARES v6 human review (${plan.label}): recommended=${packet.readiness.recommendedDecision} · ` +
      `status=${packet.decision.status} · evCov=${evidence.evidenceFixtureCoverage} · risk=${evidence.structuralRisk}\n`,
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`ares-v6-human-review-session failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
}
