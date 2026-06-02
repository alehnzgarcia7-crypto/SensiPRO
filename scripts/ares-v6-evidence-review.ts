import { writeFileSync } from 'node:fs';

import {
  AresV6EvidenceArgError,
  parseAresV6EvidenceReviewArgs,
  renderAresV6EvidenceJson,
  renderAresV6EvidenceMarkdown,
  renderAresV6EvidenceSummaryLine,
  runAresV6EvidenceReview,
} from '../src/lib/ares-v6/evidence-review-cli';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Evidence review CLI (Fase 3D). INTERNAL / LAB ONLY.
//
// Cruza legacy-vs-v6, métricas y feedback TRUSTED en un reporte auditable.
// SAFE dry-run por defecto: sin escrituras a DB, sin mutación del motor.
// Las propuestas (--proposals) son DRAFT/PENDING_HUMAN_REVIEW; NUNCA se aplican.
//
//   npm run ares:v6:evidence -- --fixtures-only --legacy-compare --json --output evidence.json
//   npm run ares:v6:evidence -- --fixtures-only --legacy-compare --markdown --output evidence.md
//   npm run ares:v6:evidence -- --from-db --legacy-compare --proposals --json
//   npm run ares:v6:evidence -- --from-db --since 2026-06-01T00:00:00Z --preset STANDARD_PRO
// ═══════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  let options;
  try {
    options = parseAresV6EvidenceReviewArgs(process.argv.slice(2));
  } catch (error) {
    if (error instanceof AresV6EvidenceArgError) {
      process.stderr.write(`ares-v6-evidence-review: ${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }

  const report = await runAresV6EvidenceReview(options);

  const rendered = options.markdown
    ? renderAresV6EvidenceMarkdown(report)
    : renderAresV6EvidenceJson(report);

  if (options.output) {
    writeFileSync(options.output, options.markdown ? rendered : `${rendered}\n`, 'utf8');
    process.stdout.write(`Wrote evidence ${options.markdown ? 'markdown' : 'JSON'} to ${options.output}\n`);
    process.stdout.write(`${renderAresV6EvidenceSummaryLine(report)}\n`);
    return;
  }

  if (options.json || options.markdown) {
    process.stdout.write(options.markdown ? rendered : `${rendered}\n`);
  } else {
    process.stdout.write(`${renderAresV6EvidenceSummaryLine(report)}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`ares-v6-evidence-review failed: ${String(error)}\n`);
  process.exit(1);
});
