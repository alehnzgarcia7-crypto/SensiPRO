import { describe, expect, it } from 'vitest';

import {
  blockedReasonLabel,
  buildGyroRows,
  buildSensitivityRows,
  clampPercent,
  expectednessLabel,
  formatCoverage,
  formatRate,
  goNoGoLabel,
  goNoGoTone,
  isBlockingRisk,
  isGoDecision,
  proposalStatusLabel,
  proposalTypeLabel,
  sensitivityBarPercent,
  structuralRiskLabel,
  structuralRiskTone,
  toneBadgeClass,
} from '../presenters';

// ═══════════════════════════════════════════════════════════════
// Fase 3E — presenter logic (pure). This is how the component LOGIC is proven
// in the node test env (the repo has no jsdom): tones, labels and bar shaping.
// ═══════════════════════════════════════════════════════════════

describe('GO/NO-GO mapping', () => {
  it('maps decisions to tones and labels', () => {
    expect(goNoGoTone('GO_INTERNAL_UI_EXPERIMENT')).toBe('ok');
    expect(goNoGoTone('NO_GO_INFRA')).toBe('danger');
    expect(goNoGoLabel('NO_GO_MORE_DATA')).toContain('NO-GO');
    expect(isGoDecision('GO_INTERNAL_UI_EXPERIMENT')).toBe(true);
    expect(isGoDecision('NO_GO_FIX_ENGINE')).toBe(false);
  });
});

describe('structural risk mapping', () => {
  it('maps risk decisions and flags BLOCKING', () => {
    expect(structuralRiskTone('CLEAR')).toBe('ok');
    expect(structuralRiskTone('BLOCKING')).toBe('danger');
    expect(structuralRiskLabel('REVIEW_REQUIRED')).toBe('Revisión requerida');
    expect(isBlockingRisk('BLOCKING')).toBe(true);
    expect(isBlockingRisk('CLEAR')).toBe(false);
  });
});

describe('label maps', () => {
  it('translates proposal + expectedness enums to Spanish', () => {
    expect(proposalStatusLabel('PENDING_HUMAN_REVIEW')).toContain('humana');
    expect(proposalTypeLabel('NO_CHANGE_RECOMMENDED')).toBe('Sin cambios recomendados');
    expect(blockedReasonLabel('EVIDENCE_COVERAGE_INSUFFICIENT')).toContain('Cobertura');
    expect(expectednessLabel('DANGEROUS')).toBe('Peligroso');
  });
});

describe('formatters', () => {
  it('clamps and formats rates/coverage', () => {
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(Number.NaN)).toBe(0);
    expect(formatRate(0.8)).toBe('80%');
    expect(formatCoverage(0.8, 4, 5)).toBe('80% (4/5)');
  });

  it('maps a 1–200 sensitivity value to a 0..100 bar', () => {
    expect(sensitivityBarPercent(200)).toBe(100);
    expect(sensitivityBarPercent(100)).toBe(50);
    expect(sensitivityBarPercent(0)).toBe(0);
    expect(sensitivityBarPercent(400)).toBe(100);
  });
});

describe('sensitivity / gyro rows', () => {
  it('builds exactly six sensitivity rows in order', () => {
    const rows = buildSensitivityRows({
      general: 175,
      redPoint: 170,
      scope2x: 130,
      scope4x: 100,
      sniperScope: 80,
      freeView: 180,
    });
    expect(rows).toHaveLength(6);
    expect(rows.map((row) => row.key)).toEqual([
      'general',
      'redPoint',
      'scope2x',
      'scope4x',
      'sniperScope',
      'freeView',
    ]);
    expect(rows[0]?.label).toBe('General');
    expect(rows[0]?.barPercent).toBeCloseTo(87.5);
  });

  it('builds six gyro rows, or none for null', () => {
    expect(buildGyroRows(null)).toHaveLength(0);
    const rows = buildGyroRows({
      gyroGeneral: 90,
      gyroRedPoint: 85,
      gyroScope2x: 70,
      gyroScope4x: 60,
      gyroSniper: 50,
      gyroFreeView: 95,
    });
    expect(rows).toHaveLength(6);
    expect(rows[0]?.label).toBe('Gyro General');
  });
});

describe('tone classes', () => {
  it('returns non-empty class strings for every tone', () => {
    for (const tone of ['ok', 'info', 'warn', 'danger', 'neutral'] as const) {
      expect(toneBadgeClass(tone).length).toBeGreaterThan(0);
    }
  });
});
