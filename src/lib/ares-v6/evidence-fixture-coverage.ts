import { ARES_V6_LATAM_CALIBRATION_FIXTURES, findAresV6FixtureForDevice } from '@ares/algorithms/engine-v6';

import type { AresV6ComparisonRow } from './legacy-vs-v6-comparator';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Fixture coverage (Fase 3D.1)
//
// Two DIFFERENT coverages that 3D wrongly collapsed into one:
//   • EVIDENCE coverage   — fixtures that have REAL persisted generations (sample
//                           depth lives elsewhere; this is breadth of real data).
//   • COMPARISON coverage — fixtures covered by the fixtures-only legacy-vs-v6
//                           reference matrix (a pure reference, NOT evidence).
//
// GO/NO-GO must gate on EVIDENCE coverage. Comparison coverage only informs how
// much of the reference matrix was computed. Pure: no DB, no engine mutation.
// ═══════════════════════════════════════════════════════════════

export const ARES_V6_TOTAL_FIXTURES = ARES_V6_LATAM_CALIBRATION_FIXTURES.length;

const FIXTURE_IDS: ReadonlySet<string> = new Set(ARES_V6_LATAM_CALIBRATION_FIXTURES.map((f) => f.id));

export interface AresV6FixtureMatchInput {
  deviceBrand?: string | null;
  deviceModel?: string | null;
  deviceSlug?: string | null;
}

/**
 * Map a persisted-generation row to a known calibration fixture id, or null.
 * Tries slug === fixtureId first (cheapest, exact), then brand+model match.
 */
export function matchAresV6FixtureFromGeneration(input: AresV6FixtureMatchInput): string | null {
  const slug = input.deviceSlug?.trim().toLowerCase();
  if (slug && FIXTURE_IDS.has(slug)) return slug;
  if (input.deviceBrand && input.deviceModel) {
    const fixture = findAresV6FixtureForDevice(input.deviceBrand, input.deviceModel);
    if (fixture) return fixture.id;
  }
  return null;
}

export interface AresV6FixtureCoverage {
  coveredFixtures: number;
  totalFixtures: number;
  coverage: number;
  coveredFixtureIds: string[];
  /** Rows/cells that did not map to any known fixture (excluded from coverage). */
  unknownCount: number;
}

function buildCoverage(coveredIds: Iterable<string>, unknownCount: number): AresV6FixtureCoverage {
  const set = new Set<string>();
  for (const id of coveredIds) if (id) set.add(id);
  return {
    coveredFixtures: set.size,
    totalFixtures: ARES_V6_TOTAL_FIXTURES,
    coverage: ARES_V6_TOTAL_FIXTURES > 0 ? Math.round((set.size / ARES_V6_TOTAL_FIXTURES) * 10000) / 10000 : 0,
    coveredFixtureIds: [...set].sort(),
    unknownCount,
  };
}

/**
 * Evidence coverage from real persisted counts. A fixture counts as covered only
 * if it has at least one real generation AND maps to a known fixture. Unknown
 * devices (no slug/brand+model match) are excluded — they never inflate coverage.
 */
export function calculateEvidenceFixtureCoverage(
  cells: ReadonlyArray<AresV6FixtureMatchInput & { generations: number }>,
): AresV6FixtureCoverage {
  const covered: string[] = [];
  let unknown = 0;
  for (const cell of cells) {
    if (cell.generations <= 0) continue;
    const fixtureId = matchAresV6FixtureFromGeneration(cell);
    if (fixtureId) covered.push(fixtureId);
    else unknown += 1;
  }
  return buildCoverage(covered, unknown);
}

/** Comparison coverage from the fixtures-only reference matrix (reference, NOT evidence). */
export function calculateComparisonFixtureCoverage(
  rows: readonly Pick<AresV6ComparisonRow, 'fixtureId'>[],
): AresV6FixtureCoverage {
  return buildCoverage(
    rows.map((row) => row.fixtureId),
    0,
  );
}
