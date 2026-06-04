import {
  ARES_V6_LATAM_CALIBRATION_FIXTURES,
  generateAresV6,
  type AresV6CalibrationFixture,
  type AresV6GenerationInput,
  type AresV6GenerationOutput,
  type AresV6PresetId,
} from '@ares/algorithms/engine-v6';

import {
  generateLegacyComparableForFixture,
  normalizeAresV6Output,
  type AresV6ComparableSensitivity,
} from './legacy-output-adapter';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Legacy-vs-v6 comparator (Fase 3D)
//
// Computes per fixture×preset deltas between the frozen legacy engine and v6,
// classifies each by magnitude/direction, and judges whether a difference is
// EXPECTED, NEEDS_REVIEW or DANGEROUS. PURE + fixtures-only: no DB, no HTTP, no
// env. It NEVER edits the engine — it only flags rows for human review.
//
// Calibrated against real v6 output (clean descending cascade gen>red>2x>4x>awm;
// headshot presets narrow gen−red to ~8-10; mainstream v6 general ~175 vs legacy
// ~100 is the EXPECTED recalibration, not a defect).
// ═══════════════════════════════════════════════════════════════

export type AresV6Slider = 'general' | 'redPoint' | 'scope2x' | 'scope4x' | 'sniperScope' | 'freeView';
export type AresV6ComparisonDirection = 'V6_HIGHER' | 'V6_LOWER' | 'SAME';
export type AresV6DeltaSeverity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type AresV6Expectedness = 'EXPECTED' | 'NEEDS_REVIEW' | 'DANGEROUS';

export const ARES_V6_COMPARISON_SLIDERS: readonly AresV6Slider[] = [
  'general',
  'redPoint',
  'scope2x',
  'scope4x',
  'sniperScope',
  'freeView',
];

// Severity by absolute delta (Free Fire 1–200 scale, shared by both engines).
const SAME_EPSILON = 3; // |delta| ≤ 3 → SAME / NONE
const LOW_MAX = 8;
const MEDIUM_MAX = 15;

// Headshot presets should keep Red Point close to General.
const HEADSHOT_PRESETS: ReadonlySet<AresV6PresetId> = new Set([
  'TODO_ROJO',
  'X_METHOD',
  'ONE_TAP',
  'BRAZIL_RUSH',
  'SHOTGUN_DRAG',
  'FREESTYLE_CLIPS',
]);
const HEADSHOT_GAP_REVIEW = 20; // general − redPoint above this is suspicious for a headshot preset
const HEADSHOT_GAP_DANGER = 32;

// Mainstream FHD+ PPI band where v6's higher General is the documented improvement.
const MAINSTREAM_PPI_MIN = 390;
const MAINSTREAM_PPI_MAX = 449;

type SliderRecord<T> = Record<AresV6Slider, T>;

export interface AresV6ComparisonRow {
  fixtureId: string;
  brand: string;
  model: string;
  presetId: AresV6PresetId;
  ppi: number;
  ppiSource: string;
  fallbackPpi: boolean;
  legacyEquivalent: boolean;
  legacy: AresV6ComparableSensitivity | null;
  v6: AresV6ComparableSensitivity;
  deltas: SliderRecord<number | null>;
  relativeDeltas: SliderRecord<number | null>;
  severities: SliderRecord<AresV6DeltaSeverity>;
  directions: SliderRecord<AresV6ComparisonDirection>;
  expectedness: AresV6Expectedness;
  rationale: string[];
  requiresHumanReview: boolean;
}

export interface AresV6ComparatorDeps {
  generateV6: (input: AresV6GenerationInput) => AresV6GenerationOutput;
  generateLegacy: (
    fixture: AresV6CalibrationFixture,
    presetId: AresV6PresetId,
  ) => AresV6ComparableSensitivity | null;
}

const DEFAULT_DEPS: AresV6ComparatorDeps = {
  generateV6: generateAresV6,
  generateLegacy: generateLegacyComparableForFixture,
};

// Neutral player so the PRESET is the only variable in the comparison.
const NEUTRAL_PLAYER = {
  fingers: 3,
  playstyle: 'STANDARD',
  mode: 'BATTLE_ROYALE',
  usesGyroscope: false,
} as const;

function fixturePpi(fixture: AresV6CalibrationFixture): number {
  return fixture.device.ppi ?? fixture.device.screenDpi ?? 0;
}

function severityOf(absDelta: number): AresV6DeltaSeverity {
  if (absDelta <= SAME_EPSILON) return 'NONE';
  if (absDelta <= LOW_MAX) return 'LOW';
  if (absDelta <= MEDIUM_MAX) return 'MEDIUM';
  return 'HIGH';
}

function directionOf(delta: number): AresV6ComparisonDirection {
  if (Math.abs(delta) <= SAME_EPSILON) return 'SAME';
  return delta > 0 ? 'V6_HIGHER' : 'V6_LOWER';
}

function emptyDirections(): SliderRecord<AresV6ComparisonDirection> {
  return { general: 'SAME', redPoint: 'SAME', scope2x: 'SAME', scope4x: 'SAME', sniperScope: 'SAME', freeView: 'SAME' };
}
function emptySeverities(): SliderRecord<AresV6DeltaSeverity> {
  return { general: 'NONE', redPoint: 'NONE', scope2x: 'NONE', scope4x: 'NONE', sniperScope: 'NONE', freeView: 'NONE' };
}
function nullRecord(): SliderRecord<number | null> {
  return { general: null, redPoint: null, scope2x: null, scope4x: null, sniperScope: null, freeView: null };
}

function worst(a: AresV6Expectedness, b: AresV6Expectedness): AresV6Expectedness {
  const rank: Record<AresV6Expectedness, number> = { EXPECTED: 0, NEEDS_REVIEW: 1, DANGEROUS: 2 };
  return rank[a] >= rank[b] ? a : b;
}

/** Build the comparison for a single fixture × preset. */
export function buildAresV6ComparisonRow(
  fixture: AresV6CalibrationFixture,
  presetId: AresV6PresetId,
  deps: AresV6ComparatorDeps = DEFAULT_DEPS,
): AresV6ComparisonRow {
  const generation = deps.generateV6({ device: fixture.device, presetId, player: NEUTRAL_PLAYER });
  const v6 = normalizeAresV6Output(generation.sensitivity);
  const ppiSource = generation.dpi.source;
  const fallbackPpi = ppiSource === 'TIER_FALLBACK' || generation.dpi.detectedPpi === null;

  const legacy = deps.generateLegacy(fixture, presetId);
  const legacyEquivalent = legacy !== null;

  const deltas = nullRecord();
  const relativeDeltas = nullRecord();
  const severities = emptySeverities();
  const directions = emptyDirections();

  if (legacy) {
    for (const slider of ARES_V6_COMPARISON_SLIDERS) {
      const delta = v6[slider] - legacy[slider];
      deltas[slider] = delta;
      relativeDeltas[slider] = legacy[slider] !== 0 ? Math.round((delta / legacy[slider]) * 10000) / 10000 : null;
      severities[slider] = severityOf(Math.abs(delta));
      directions[slider] = directionOf(delta);
    }
  }

  const { expectedness, rationale } = classifyRow({
    presetId,
    ppi: fixturePpi(fixture),
    fallbackPpi,
    legacy,
    v6,
    deltas,
    severities,
    directions,
  });

  const requiresHumanReview = expectedness !== 'EXPECTED' || fallbackPpi || !legacyEquivalent;

  return {
    fixtureId: fixture.id,
    brand: fixture.device.brand,
    model: fixture.device.model,
    presetId,
    ppi: fixturePpi(fixture),
    ppiSource,
    fallbackPpi,
    legacyEquivalent,
    legacy,
    v6,
    deltas,
    relativeDeltas,
    severities,
    directions,
    expectedness,
    rationale,
    requiresHumanReview,
  };
}

interface ClassifyInput {
  presetId: AresV6PresetId;
  ppi: number;
  fallbackPpi: boolean;
  legacy: AresV6ComparableSensitivity | null;
  v6: AresV6ComparableSensitivity;
  deltas: SliderRecord<number | null>;
  severities: SliderRecord<AresV6DeltaSeverity>;
  directions: SliderRecord<AresV6ComparisonDirection>;
}

/** Apply the OB53-aware expectedness rules. Returns the worst level + rationale. */
function classifyRow(input: ClassifyInput): { expectedness: AresV6Expectedness; rationale: string[] } {
  const { presetId, ppi, fallbackPpi, legacy, v6, severities, directions } = input;
  const rationale: string[] = [];
  let level: AresV6Expectedness = 'EXPECTED';

  // 1. Intra-v6 scope cascade (independent of legacy). The engine should already
  // enforce this; the tribunal verifies it instead of trusting it.
  if (v6.sniperScope > v6.scope4x) {
    level = worst(level, 'DANGEROUS');
    rationale.push('PELIGRO: sniperScope (AWM) > scope4x — cascada de miras invertida.');
  }
  if (v6.scope4x > v6.scope2x) {
    level = worst(level, 'DANGEROUS');
    rationale.push('PELIGRO: scope4x > scope2x — 4x demasiado alto frente a 2x.');
  }

  // 2. Headshot presets must keep Red Point near General.
  if (HEADSHOT_PRESETS.has(presetId)) {
    const gap = v6.general - v6.redPoint;
    if (gap > HEADSHOT_GAP_DANGER) {
      level = worst(level, 'DANGEROUS');
      rationale.push(`PELIGRO: redPoint muy por debajo de general (gap ${gap}) en preset de headshot.`);
    } else if (gap > HEADSHOT_GAP_REVIEW) {
      level = worst(level, 'NEEDS_REVIEW');
      rationale.push(`Revisar: gap general−redPoint (${gap}) alto para un preset de headshot.`);
    }
  }

  // 3. Positive expectations (only annotate; never escalate).
  if (v6.sniperScope < v6.redPoint) {
    rationale.push('Esperado: AWM por debajo de redPoint.');
  }
  if (legacy && ppi >= MAINSTREAM_PPI_MIN && ppi <= MAINSTREAM_PPI_MAX && directions.general === 'V6_HIGHER') {
    rationale.push('Esperado: v6 General más alto que legacy en PPI mainstream (recalibración v6).');
  }

  // 4. Unexpected regression vs legacy: v6 should not drop well below legacy on
  // close-range sliders (the recalibration raises, not lowers, these).
  if (legacy) {
    for (const slider of ['general', 'redPoint'] as const) {
      if (directions[slider] === 'V6_LOWER' && (severities[slider] === 'MEDIUM' || severities[slider] === 'HIGH')) {
        level = worst(level, 'NEEDS_REVIEW');
        rationale.push(`Revisar: v6 ${slider} por debajo de legacy con delta ${severities[slider]} (regresión inesperada).`);
      }
    }
  }

  // 5. Fallback PPI + a big delta → review, never an automatic proposal.
  if (fallbackPpi) {
    const hasHigh = ARES_V6_COMPARISON_SLIDERS.some((s) => severities[s] === 'HIGH');
    if (hasHigh) {
      level = worst(level, 'NEEDS_REVIEW');
      rationale.push('Revisar: PPI fallback (TIER) + delta alto — corregir specs del device antes de proponer.');
    } else {
      rationale.push('Nota: PPI fallback (TIER) — confianza reducida.');
    }
  }

  // 6. No legacy analog → cannot compare; defer to human.
  if (!legacy) {
    rationale.push('Sin equivalente legacy (NO_LEGACY_EQUIVALENT): comparación de deltas no disponible.');
  }

  if (rationale.length === 0) {
    rationale.push('Cascada y deltas dentro de lo esperado.');
  }
  return { expectedness: level, rationale };
}

export interface AresV6ComparisonMatrixOptions {
  /** Limit to one fixture id (default: all calibration fixtures). */
  fixtureId?: string;
  /** Limit to one preset (default: each fixture's primaryPresets). */
  presetId?: AresV6PresetId;
  /** Use STANDARD_PRO only instead of each fixture's primaryPresets. */
  standardOnly?: boolean;
}

function presetsForFixture(fixture: AresV6CalibrationFixture, options: AresV6ComparisonMatrixOptions): AresV6PresetId[] {
  if (options.presetId) return [options.presetId];
  if (options.standardOnly) return ['STANDARD_PRO'];
  return [...fixture.primaryPresets];
}

/** Build the full comparison matrix over fixtures × presets (fixtures-only, pure). */
export function buildAresV6ComparisonMatrix(
  options: AresV6ComparisonMatrixOptions = {},
  deps: AresV6ComparatorDeps = DEFAULT_DEPS,
): AresV6ComparisonRow[] {
  const fixtures = options.fixtureId
    ? ARES_V6_LATAM_CALIBRATION_FIXTURES.filter((f) => f.id === options.fixtureId)
    : [...ARES_V6_LATAM_CALIBRATION_FIXTURES];

  const rows: AresV6ComparisonRow[] = [];
  for (const fixture of fixtures) {
    for (const presetId of presetsForFixture(fixture, options)) {
      rows.push(buildAresV6ComparisonRow(fixture, presetId, deps));
    }
  }
  return rows;
}

export interface AresV6ComparisonSummary {
  total: number;
  legacyComparable: number;
  noLegacyEquivalent: number;
  expected: number;
  needsReview: number;
  dangerous: number;
  requiresHumanReview: number;
  fallbackPpiRows: number;
  byPreset: Record<string, { total: number; dangerous: number; needsReview: number }>;
}

/** Aggregate counts over a set of comparison rows. */
export function summarizeAresV6Comparison(rows: readonly AresV6ComparisonRow[]): AresV6ComparisonSummary {
  const byPreset: Record<string, { total: number; dangerous: number; needsReview: number }> = {};
  let expected = 0;
  let needsReview = 0;
  let dangerous = 0;
  let requiresHumanReview = 0;
  let legacyComparable = 0;
  let fallbackPpiRows = 0;

  for (const row of rows) {
    const bucket = byPreset[row.presetId] ?? { total: 0, dangerous: 0, needsReview: 0 };
    bucket.total += 1;
    if (row.expectedness === 'DANGEROUS') {
      dangerous += 1;
      bucket.dangerous += 1;
    } else if (row.expectedness === 'NEEDS_REVIEW') {
      needsReview += 1;
      bucket.needsReview += 1;
    } else {
      expected += 1;
    }
    byPreset[row.presetId] = bucket;
    if (row.legacyEquivalent) legacyComparable += 1;
    if (row.requiresHumanReview) requiresHumanReview += 1;
    if (row.fallbackPpi) fallbackPpiRows += 1;
  }

  return {
    total: rows.length,
    legacyComparable,
    noLegacyEquivalent: rows.length - legacyComparable,
    expected,
    needsReview,
    dangerous,
    requiresHumanReview,
    fallbackPpiRows,
    byPreset,
  };
}

/** Rows that a human must look at (dangerous / needs-review / fallback / no-legacy). */
export function selectHighRiskRows(rows: readonly AresV6ComparisonRow[]): AresV6ComparisonRow[] {
  return rows.filter((row) => row.requiresHumanReview);
}
