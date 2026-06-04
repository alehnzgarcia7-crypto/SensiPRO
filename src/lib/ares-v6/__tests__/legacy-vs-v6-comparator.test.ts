import { describe, expect, it } from 'vitest';

import {
  getAresV6CalibrationFixture,
  type AresV6GenerationOutput,
  type AresV6SensitivityVector,
} from '@ares/algorithms/engine-v6';

import type { AresV6ComparableSensitivity } from '../legacy-output-adapter';
import {
  buildAresV6ComparisonMatrix,
  buildAresV6ComparisonRow,
  summarizeAresV6Comparison,
  type AresV6ComparatorDeps,
} from '../legacy-vs-v6-comparator';

const a14 = getAresV6CalibrationFixture('samsung-galaxy-a14')!;

function v6Output(
  sensitivity: AresV6SensitivityVector,
  source: 'PPI' | 'SCREEN_DPI' | 'TIER_FALLBACK' = 'PPI',
  detectedPpi: number | null = 400,
): AresV6GenerationOutput {
  return {
    algorithmVersion: 'ARES-v6-refoundation',
    presetId: 'STANDARD_PRO',
    sensitivity,
    gyroscope: null,
    dpi: { mode: 'DPI_SUGGESTED', detectedPpi, source, confidence: 0.9, explanation: '' },
    fireButton: { sizePercent: 50, opacityPercent: 80, recommendedFinger: 3, placement: 'MID_RIGHT', dragZone: 'HYBRID', explanation: '' },
    hud: { layoutFamily: 'THREE_FINGER', priorityButtons: [], riskNotes: [] },
    confidence: { score: 80, grade: 'HIGH', missingSignals: [], warnings: [] },
    explanation: { headline: '', bullets: [], technicalNotes: [] },
    firstTuningSteps: [],
  };
}

function legacy(general: number): AresV6ComparableSensitivity {
  return { general, redPoint: 94, scope2x: 89, scope4x: 79, sniperScope: 59, freeView: 67, source: 'LEGACY' };
}

function deps(generation: AresV6GenerationOutput, legacyOut: AresV6ComparableSensitivity | null): AresV6ComparatorDeps {
  return { generateV6: () => generation, generateLegacy: () => legacyOut };
}

describe('buildAresV6ComparisonRow', () => {
  it('flags v6~178 vs legacy~99 on mainstream PPI as EXPECTED improvement', () => {
    const v6 = { general: 178, redPoint: 162, scope2x: 158, scope4x: 138, sniperScope: 112, freeView: 78 };
    const row = buildAresV6ComparisonRow(a14, 'STANDARD_PRO', deps(v6Output(v6), legacy(99)));
    expect(row.directions.general).toBe('V6_HIGHER');
    expect(row.severities.general).toBe('HIGH');
    expect(row.expectedness).toBe('EXPECTED');
    expect(row.rationale.join(' ')).toContain('Esperado');
    expect(row.requiresHumanReview).toBe(false);
  });

  it('flags sniperScope > scope4x as DANGEROUS', () => {
    const broken = { general: 178, redPoint: 162, scope2x: 158, scope4x: 110, sniperScope: 140, freeView: 78 };
    const row = buildAresV6ComparisonRow(a14, 'STANDARD_PRO', deps(v6Output(broken), legacy(99)));
    expect(row.expectedness).toBe('DANGEROUS');
    expect(row.requiresHumanReview).toBe(true);
    expect(row.rationale.join(' ')).toContain('AWM');
  });

  it('flags scope4x > scope2x as DANGEROUS', () => {
    const broken = { general: 178, redPoint: 162, scope2x: 120, scope4x: 150, sniperScope: 110, freeView: 78 };
    const row = buildAresV6ComparisonRow(a14, 'STANDARD_PRO', deps(v6Output(broken), legacy(99)));
    expect(row.expectedness).toBe('DANGEROUS');
  });

  it('flags a TODO_ROJO row whose redPoint is far below general as NEEDS_REVIEW', () => {
    const wide = { general: 190, redPoint: 160, scope2x: 150, scope4x: 130, sniperScope: 105, freeView: 82 };
    const row = buildAresV6ComparisonRow(a14, 'TODO_ROJO', deps(v6Output(wide), legacy(110)));
    expect(['NEEDS_REVIEW', 'DANGEROUS']).toContain(row.expectedness);
    expect(row.requiresHumanReview).toBe(true);
  });

  it('treats fallback-PPI rows as review (not auto-proposal) and marks them', () => {
    const v6 = { general: 200, redPoint: 150, scope2x: 145, scope4x: 125, sniperScope: 100, freeView: 80 };
    const row = buildAresV6ComparisonRow(a14, 'STANDARD_PRO', deps(v6Output(v6, 'TIER_FALLBACK', null), legacy(99)));
    expect(row.fallbackPpi).toBe(true);
    expect(row.requiresHumanReview).toBe(true);
    expect(row.rationale.join(' ')).toContain('fallback');
  });

  it('marks NO_LEGACY_EQUIVALENT rows for human review without deltas', () => {
    const v6 = { general: 175, redPoint: 160, scope2x: 156, scope4x: 136, sniperScope: 110, freeView: 78 };
    const row = buildAresV6ComparisonRow(a14, 'GYRO_PRO', deps(v6Output(v6), null));
    expect(row.legacyEquivalent).toBe(false);
    expect(row.legacy).toBeNull();
    expect(row.deltas.general).toBeNull();
    expect(row.requiresHumanReview).toBe(true);
  });
});

describe('buildAresV6ComparisonMatrix (real engines, fixtures-only)', () => {
  it('produces healthy rows for all fixtures with no false DANGEROUS', () => {
    const rows = buildAresV6ComparisonMatrix({ standardOnly: true });
    expect(rows.length).toBeGreaterThan(0);
    const summary = summarizeAresV6Comparison(rows);
    expect(summary.dangerous).toBe(0);
    // STANDARD_PRO maps to legacy BALANCED for every fixture → all comparable.
    expect(summary.noLegacyEquivalent).toBe(0);
  });

  it('marks v6-only presets as no-legacy when using primaryPresets', () => {
    const rows = buildAresV6ComparisonMatrix({ fixtureId: 'galaxy-s24-ultra' });
    const summary = summarizeAresV6Comparison(rows);
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.noLegacyEquivalent).toBeGreaterThan(0); // includes GYRO_PRO
  });
});
