import { describe, expect, it } from 'vitest';

import {
  ARES_V6_INTERNAL_UI_DEFAULT_PRESET,
  getAresV6DefaultFixtureId,
  getAresV6EvidencePanelData,
  getAresV6FixtureOptions,
  getAresV6GenerationPreview,
  getAresV6InternalDashboardData,
  getAresV6PresetOptions,
  getAresV6ReadOnlyProposalData,
  isAresV6FixtureId,
  isAresV6PresetId,
} from '../internal-ui-service';

// ═══════════════════════════════════════════════════════════════
// Fase 3E — internal UI service. Fixtures-only (no DB). Proves the view models
// are well-formed, summary-rows are SAFE (no vectors/deltas), proposals keep
// their invariants, and nothing leaks a token/secret.
// ═══════════════════════════════════════════════════════════════

const FIXED_NOW = () => 1_717_000_000_000;

describe('option lists', () => {
  it('exposes every fixture with a human label', () => {
    const fixtures = getAresV6FixtureOptions();
    expect(fixtures.length).toBeGreaterThanOrEqual(10);
    const a14 = fixtures.find((fixture) => fixture.id === 'samsung-galaxy-a14');
    expect(a14?.label).toBe('Samsung Galaxy A14');
    expect(a14?.primaryPresets).toContain('STANDARD_PRO');
  });

  it('exposes presets including STANDARD_PRO', () => {
    const presets = getAresV6PresetOptions();
    expect(presets.some((preset) => preset.id === 'STANDARD_PRO')).toBe(true);
  });

  it('default fixture is a real P0 fixture', () => {
    const id = getAresV6DefaultFixtureId();
    expect(isAresV6FixtureId(id)).toBe(true);
  });
});

describe('getAresV6GenerationPreview', () => {
  it('builds a full engine package for a known fixture × preset', () => {
    const preview = getAresV6GenerationPreview({
      fixtureId: getAresV6DefaultFixtureId(),
      presetId: ARES_V6_INTERNAL_UI_DEFAULT_PRESET,
    });
    const sensitivity = preview.generation.sensitivity;
    expect(Object.keys(sensitivity)).toHaveLength(6);
    expect(sensitivity.general).toBeGreaterThan(0);
    expect(preview.generation.fireButton.sizePercent).toBeGreaterThan(0);
    expect(preview.generation.confidence.grade).toBeDefined();
    expect(preview.generation.firstTuningSteps).toBeDefined();
  });

  it('throws on an unknown fixture or preset', () => {
    expect(() => getAresV6GenerationPreview({ fixtureId: 'nope', presetId: 'STANDARD_PRO' })).toThrow();
    expect(isAresV6PresetId('NOT_A_PRESET')).toBe(false);
  });
});

describe('getAresV6EvidencePanelData (fixtures-only)', () => {
  it('separates evidence vs comparison coverage and is summary-only safe', async () => {
    const data = await getAresV6EvidencePanelData({ now: FIXED_NOW });

    expect(data.source).toBe('FIXTURES_ONLY');
    expect(typeof data.coverage.evidence).toBe('number');
    expect(typeof data.coverage.comparison).toBe('number');
    // No persisted evidence yet → evidence coverage is 0; comparison ran on fixtures.
    expect(data.coverage.evidence).toBe(0);
    expect(data.goNoGo.decision).toBeDefined();
    expect(data.structuralRisk.decision).toBeDefined();

    const serializedRows = JSON.stringify(data.highRiskSummaryRows);
    expect(serializedRows).not.toContain('"deltas"');
    expect(serializedRows).not.toContain('"relativeDeltas"');
    expect(serializedRows).not.toContain('"v6"');
    expect(serializedRows).not.toContain('"legacy"');
  });
});

describe('getAresV6ReadOnlyProposalData', () => {
  it('keeps every proposal human-gated and never auto-applicable', async () => {
    const data = await getAresV6ReadOnlyProposalData({ now: FIXED_NOW });
    expect(data.posture.autoApplyAllowed).toBe(false);
    expect(data.posture.humanReviewRequired).toBe(true);
    expect(data.posture.readOnly).toBe(true);
    expect(data.proposals.length).toBeGreaterThanOrEqual(1);
    for (const proposal of data.proposals) {
      expect(proposal.autoApplyAllowed).toBe(false);
      expect(proposal.humanReviewRequired).toBe(true);
    }
  });
});

describe('getAresV6InternalDashboardData', () => {
  it('assembles a complete view model with no token/secret', async () => {
    const data = await getAresV6InternalDashboardData({ now: FIXED_NOW });

    expect(data.fixtures.length).toBeGreaterThanOrEqual(10);
    expect(data.presets.length).toBeGreaterThanOrEqual(10);
    expect(data.defaultSelection.presetId).toBe('STANDARD_PRO');
    expect(data.preview.generation.sensitivity.general).toBeGreaterThan(0);
    expect(data.evidence.goNoGo.decision).toBeDefined();
    expect(data.proposals.posture.autoApplyAllowed).toBe(false);
    expect(data.posture.readOnly).toBe(true);
    expect(data.posture.touchesEngine).toBe(false);

    const serialized = JSON.stringify(data);
    expect(serialized).not.toMatch(/sha256/i);
    expect(serialized).not.toMatch(/bearer /i);
    expect(serialized).not.toMatch(/x-ares-v6-lab-token/i);
  });
});
