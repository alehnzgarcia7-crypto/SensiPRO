import { runAresV6LabCleanup } from '../src/lib/ares-v6/lab-cleanup';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Lab data cleanup CLI (Fase 3C). INTERNAL ONLY.
//
// Default is --dry-run (counts only). Pass --execute to actually delete rows
// older than the retention windows (generations 90d, feedback 180d). Lab run
// summaries are kept. No automatic cron.
//   npm run ares:v6:lab:cleanup -- --dry-run
//   npm run ares:v6:lab:cleanup -- --execute
// ═══════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = !argv.includes('--execute');

  const result = await runAresV6LabCleanup({ dryRun, nowMs: Date.now() });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  const { prisma } = await import('../packages/database/src/client');
  await prisma.$disconnect();
}

main().catch((error) => {
  process.stderr.write(`ares-v6-lab-cleanup failed: ${String(error)}\n`);
  process.exit(1);
});
