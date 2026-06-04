import { writeFileSync } from 'node:fs';

import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  ARES_V6_PRESETS,
  generateAresV6,
  type AresV6CalibrationFixture,
  type AresV6PresetId,
} from '../packages/algorithms/src/engine-v6/index';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Fixture comparison harness (LAB ONLY)
//
// Audits the engine curve straight from code: NO database, NO API, NO env.
// Usage:
//   npx tsx scripts/ares-v6-compare-fixtures.ts                 # Standard Pro table
//   npx tsx scripts/ares-v6-compare-fixtures.ts --json          # JSON for tooling
//   npx tsx scripts/ares-v6-compare-fixtures.ts --preset TODO_ROJO
//   npx tsx scripts/ares-v6-compare-fixtures.ts --all-presets
//   npx tsx scripts/ares-v6-compare-fixtures.ts --fixture redmi-note-13
//   npx tsx scripts/ares-v6-compare-fixtures.ts --json --output out.json
// ═══════════════════════════════════════════════════════════════

const VALID_PRESET_IDS = new Set<string>(ARES_V6_PRESETS.map((preset) => preset.id));

interface CliOptions {
  json: boolean;
  allPresets: boolean;
  preset: AresV6PresetId | null;
  fixtureId: string | null;
  output: string | null;
}

interface ComparisonRow {
  fixture: string;
  device: string;
  ppi: number;
  ppiSource: string;
  preset: AresV6PresetId;
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  awm: number;
  freeView: number;
  score: number;
  grade: string;
  warnings: number;
  tuningSteps: number;
}

function fail(message: string): never {
  process.stderr.write(`ares-v6-compare-fixtures: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv: readonly string[]): CliOptions {
  const options: CliOptions = {
    json: false,
    allPresets: false,
    preset: null,
    fixtureId: null,
    output: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--json':
        options.json = true;
        break;
      case '--all-presets':
        options.allPresets = true;
        break;
      case '--preset': {
        const value = argv[i + 1];
        i += 1;
        if (!value || !VALID_PRESET_IDS.has(value)) fail(`--preset inválido: ${value ?? '(vacío)'}`);
        options.preset = value as AresV6PresetId;
        break;
      }
      case '--fixture': {
        const value = argv[i + 1];
        i += 1;
        if (!value) fail('--fixture requiere un id');
        options.fixtureId = value;
        break;
      }
      case '--output':
      case '--out': {
        const value = argv[i + 1];
        i += 1;
        if (!value) fail(`${arg} requiere una ruta de archivo`);
        options.output = value;
        break;
      }
      default:
        fail(`Argumento desconocido: ${arg ?? '(vacío)'}`);
    }
  }

  return options;
}

function fixturePpi(fixture: AresV6CalibrationFixture): number {
  return fixture.device.ppi ?? fixture.device.screenDpi ?? 0;
}

function presetsForFixture(fixture: AresV6CalibrationFixture, options: CliOptions): AresV6PresetId[] {
  if (options.preset) return [options.preset];
  if (options.allPresets) return [...fixture.primaryPresets];
  return ['STANDARD_PRO'];
}

function buildRow(fixture: AresV6CalibrationFixture, presetId: AresV6PresetId): ComparisonRow {
  const generation = generateAresV6({
    device: fixture.device,
    presetId,
    player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
  });
  const s = generation.sensitivity;

  return {
    fixture: fixture.id,
    device: `${fixture.device.brand} ${fixture.device.model}`,
    ppi: fixturePpi(fixture),
    ppiSource: generation.dpi.source,
    preset: presetId,
    general: s.general,
    redPoint: s.redPoint,
    scope2x: s.scope2x,
    scope4x: s.scope4x,
    awm: s.sniperScope,
    freeView: s.freeView,
    score: generation.confidence.score,
    grade: generation.confidence.grade,
    warnings: generation.confidence.warnings.length,
    tuningSteps: generation.firstTuningSteps.length,
  };
}

function buildRows(options: CliOptions): ComparisonRow[] {
  const fixtures = options.fixtureId
    ? ARES_V6_LATAM_CALIBRATION_FIXTURES.filter((fixture) => fixture.id === options.fixtureId)
    : [...ARES_V6_LATAM_CALIBRATION_FIXTURES];

  if (fixtures.length === 0) fail(`No existe el fixture: ${options.fixtureId ?? '(vacío)'}`);

  const rows: ComparisonRow[] = [];
  for (const fixture of fixtures) {
    for (const presetId of presetsForFixture(fixture, options)) {
      rows.push(buildRow(fixture, presetId));
    }
  }
  return rows;
}

const COLUMNS: ReadonlyArray<{ key: keyof ComparisonRow; label: string }> = [
  { key: 'fixture', label: 'fixture' },
  { key: 'device', label: 'device' },
  { key: 'ppi', label: 'ppi' },
  { key: 'ppiSource', label: 'src' },
  { key: 'preset', label: 'preset' },
  { key: 'general', label: 'gen' },
  { key: 'redPoint', label: 'red' },
  { key: 'scope2x', label: '2x' },
  { key: 'scope4x', label: '4x' },
  { key: 'awm', label: 'awm' },
  { key: 'freeView', label: 'free' },
  { key: 'score', label: 'score' },
  { key: 'grade', label: 'grade' },
  { key: 'warnings', label: 'warn' },
  { key: 'tuningSteps', label: 'tune' },
];

function renderTable(rows: readonly ComparisonRow[]): string {
  const header = COLUMNS.map((column) => column.label);
  const body = rows.map((row) => COLUMNS.map((column) => String(row[column.key])));
  const all = [header, ...body];
  const widths = COLUMNS.map((_, col) => Math.max(...all.map((row) => (row[col] ?? '').length)));

  return all
    .map((row) => row.map((cell, col) => (cell ?? '').padEnd(widths[col] ?? 0)).join('  '))
    .join('\n');
}

const options = parseArgs(process.argv.slice(2));
const rows = buildRows(options);
const rendered = options.json ? JSON.stringify(rows, null, 2) : renderTable(rows);

if (options.output) {
  writeFileSync(options.output, `${rendered}\n`, 'utf8');
  process.stdout.write(`Wrote ${rows.length} row(s) to ${options.output}\n`);
} else {
  if (!options.json) {
    process.stdout.write('ARES v6 — fixture comparison (lab, no DB, no API)\n\n');
  }
  process.stdout.write(`${rendered}\n`);
}
