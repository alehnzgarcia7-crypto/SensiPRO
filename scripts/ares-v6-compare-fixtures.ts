import { writeFileSync } from 'node:fs';

import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  generateAresV6,
  type AresV6CalibrationFixture,
} from '../packages/algorithms/src/engine-v6/index';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Fixture comparison (LAB ONLY)
//
// Prints the Standard Pro output for every calibration fixture straight from
// the engine. It does NOT hit the database or any API; it is a local
// laboratory tool for auditing the curve. Run with:
//   npx tsx scripts/ares-v6-compare-fixtures.ts [--out <file>]
// ═══════════════════════════════════════════════════════════════

const HEADER = [
  'fixture',
  'ppi',
  'general',
  'redPoint',
  'scope2x',
  'scope4x',
  'awm',
  'freeView',
  'score',
  'grade',
] as const;

function fixturePpi(fixture: AresV6CalibrationFixture): number {
  return fixture.device.ppi ?? fixture.device.screenDpi ?? 0;
}

function buildRows(): string[][] {
  return ARES_V6_LATAM_CALIBRATION_FIXTURES.map((fixture) => {
    const result = generateAresV6({
      device: fixture.device,
      presetId: 'STANDARD_PRO',
      player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
    });
    const s = result.sensitivity;
    return [
      fixture.id,
      String(fixturePpi(fixture)),
      String(s.general),
      String(s.redPoint),
      String(s.scope2x),
      String(s.scope4x),
      String(s.sniperScope),
      String(s.freeView),
      String(result.confidence.score),
      result.confidence.grade,
    ];
  });
}

function renderTable(rows: readonly string[][]): string {
  const all = [[...HEADER], ...rows];
  const widths = HEADER.map((_, col) => Math.max(...all.map((row) => (row[col] ?? '').length)));
  return all
    .map((row) => row.map((cell, col) => (cell ?? '').padEnd(widths[col] ?? 0)).join('  '))
    .join('\n');
}

function getOutPath(argv: readonly string[]): string | null {
  const index = argv.indexOf('--out');
  if (index === -1) return null;
  return argv[index + 1] ?? null;
}

const table = renderTable(buildRows());
process.stdout.write(`ARES v6 — Standard Pro fixture comparison (lab, no DB)\n\n${table}\n`);

const outPath = getOutPath(process.argv.slice(2));
if (outPath) {
  writeFileSync(outPath, `${table}\n`, 'utf8');
  process.stdout.write(`\nWrote table to ${outPath}\n`);
}
