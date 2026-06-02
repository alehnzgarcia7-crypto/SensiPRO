import { writeFileSync } from 'node:fs';

import { toAresV6Json } from '../src/lib/ares-v6/json-util';
import {
  parseAresV6LabRunnerArgs,
  resolveAresV6LabRunnerToken,
  runAresV6LocalLab,
  summarizeAresV6LabRun,
  type AresV6LabRunRow,
  type AresV6LabRunnerOptions,
} from '../src/lib/ares-v6/lab-runner';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal lab runner CLI (Fase 3C). INTERNAL ONLY.
//
//   local-service mode (default): runs the engine over fixtures × presets.
//   http mode (--url): calls the real POST /api/generate/v6 with an internal
//     token for up to N active DB devices.
// The token is NEVER written to the artifact. No UI, no public exposure.
//   npm run ares:v6:lab:run -- --all-fixtures --preset STANDARD_PRO --json
//   npm run ares:v6:lab:run -- --url https://preview/api/generate/v6 --token <t>
// ═══════════════════════════════════════════════════════════════

const HTTP_DEVICE_LIMIT = 25;

interface GenerationResponse {
  data?: {
    generation?: {
      dpi?: { source?: string; detectedPpi?: number | null };
      sensitivity?: { general?: number };
      confidence?: { score?: number; grade?: string };
    };
  };
}

async function runHttpLab(options: AresV6LabRunnerOptions, token: string | null): Promise<AresV6LabRunRow[]> {
  if (!options.url) return [];
  if (!token) {
    process.stderr.write('http mode requires --token or ARES_V6_INTERNAL_ACCESS_TOKEN\n');
    process.exit(1);
  }

  const { prisma } = await import('../packages/database/src/client');
  const devices = await prisma.device.findMany({
    where: { isActive: true },
    select: { id: true, brand: true, model: true },
    take: HTTP_DEVICE_LIMIT,
  });

  const preset = options.presetId ?? 'STANDARD_PRO';
  const rows: AresV6LabRunRow[] = [];

  for (const device of devices) {
    const start = Date.now();
    try {
      const response = await fetch(options.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({
          deviceId: device.id,
          presetId: preset,
          player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
        }),
      });
      const durationMs = Date.now() - start;
      const ok = response.status === 200;
      const json = ok ? ((await response.json()) as GenerationResponse) : undefined;
      const generation = json?.data?.generation;

      rows.push({
        fixture: device.id,
        device: `${device.brand} ${device.model}`,
        preset,
        ppi: 0,
        ppiSource: generation?.dpi?.source ?? 'HTTP',
        general: generation?.sensitivity?.general ?? 0,
        confidenceScore: generation?.confidence?.score ?? 0,
        confidenceGrade: generation?.confidence?.grade ?? `HTTP_${response.status}`,
        fallbackPpi: generation?.dpi?.detectedPpi === null,
        totalDurationMs: durationMs,
        ok,
        ...(ok ? {} : { error: `http ${response.status}` }),
      });
    } catch (error) {
      rows.push({
        fixture: device.id,
        device: `${device.brand} ${device.model}`,
        preset,
        ppi: 0,
        ppiSource: 'ERROR',
        general: 0,
        confidenceScore: 0,
        confidenceGrade: 'ERROR',
        fallbackPpi: false,
        totalDurationMs: Date.now() - start,
        ok: false,
        error: error instanceof Error ? error.message : 'fetch failed',
      });
    }
  }

  await prisma.$disconnect();
  return rows;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const options = parseAresV6LabRunnerArgs(argv);
  const token = resolveAresV6LabRunnerToken(argv, process.env);

  const startedAt = new Date().toISOString();
  const rows = options.url ? await runHttpLab(options, token) : runAresV6LocalLab(options);
  const completedAt = new Date().toISOString();

  const summary = summarizeAresV6LabRun(rows, {
    label: options.label,
    commitSha: process.env.GITHUB_SHA ?? null,
    environment: process.env.ARES_V6_LAB_ENVIRONMENT ?? (options.url ? 'http' : 'local-service'),
    startedAt,
    completedAt,
  });

  // Optionally record a lab-run summary row (guarded; never crashes the run).
  if (process.env.ARES_V6_PERSIST_GENERATIONS === 'true') {
    try {
      const { prisma } = await import('../packages/database/src/client');
      await prisma.aresV6LabRun.create({
        data: {
          label: summary.label,
          commitSha: summary.commitSha,
          environment: summary.environment,
          status: summary.failureCount > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED',
          startedAt: new Date(summary.startedAt),
          completedAt: new Date(summary.completedAt),
          summary: toAresV6Json(summary),
        },
      });
      await prisma.$disconnect();
    } catch (error) {
      process.stderr.write(`lab run persistence skipped: ${String(error)}\n`);
    }
  }

  if (options.output) {
    writeFileSync(options.output, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
    process.stdout.write(`Wrote lab run to ${options.output}\n`);
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    process.stdout.write(
      `ARES v6 lab run "${summary.label}" (${summary.environment}): ` +
        `${summary.successCount}/${summary.total} ok, p95=${summary.p95TotalDurationMs}ms, ` +
        `fallbackPpiRate=${summary.fallbackPpiRate}\n`,
    );
  }
}

main().catch((error) => {
  process.stderr.write(`ares-v6-internal-lab-runner failed: ${String(error)}\n`);
  process.exit(1);
});
