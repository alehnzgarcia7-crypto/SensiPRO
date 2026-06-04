import { prisma } from '../packages/database/src/client';
import { seedAresV6SmokeDevices } from '../src/lib/ares-v6/testing/seed-real-infra';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Smoke seed CLI (REAL INFRA ONLY)
//
// Seeds the two smoke devices using DATABASE_URL. Run ONLY against an ephemeral
// smoke DB (service container / local throwaway). Prints machine-readable IDs.
//   npm run ares:v6:seed:smoke
// ═══════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  const result = await seedAresV6SmokeDevices(prisma);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  process.stderr.write(`ares-v6-seed-smoke failed: ${String(error)}\n`);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
