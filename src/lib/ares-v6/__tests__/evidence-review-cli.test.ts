import { describe, expect, it } from 'vitest';

import {
  AresV6EvidenceArgError,
  defaultAresV6EvidenceReviewDeps,
  parseAresV6EvidenceReviewArgs,
  renderAresV6EvidenceJson,
  renderAresV6EvidenceMarkdown,
  renderAresV6EvidenceSummaryLine,
  runAresV6EvidenceReview,
  type AresV6EvidenceReviewOptions,
} from '../evidence-review-cli';

function options(overrides: Partial<AresV6EvidenceReviewOptions> = {}): AresV6EvidenceReviewOptions {
  return {
    fromDb: false,
    fixturesOnly: true,
    legacyCompare: true,
    proposals: false,
    json: false,
    markdown: false,
    summaryOnly: false,
    includeRows: false,
    compareScope: 'filtered',
    output: null,
    since: null,
    until: null,
    presetId: null,
    fixtureId: null,
    ...overrides,
  };
}

const deps = defaultAresV6EvidenceReviewDeps(() => 0);

describe('parseAresV6EvidenceReviewArgs', () => {
  it('defaults to fixtures-only when no source is given', () => {
    const parsed = parseAresV6EvidenceReviewArgs([]);
    expect(parsed.fixturesOnly).toBe(true);
    expect(parsed.fromDb).toBe(false);
  });

  it('parses the documented flags', () => {
    const parsed = parseAresV6EvidenceReviewArgs([
      '--from-db',
      '--legacy-compare',
      '--proposals',
      '--json',
      '--preset',
      'STANDARD_PRO',
      '--fixture',
      'samsung-galaxy-a14',
      '--since',
      '2026-06-01T00:00:00Z',
    ]);
    expect(parsed).toMatchObject({
      fromDb: true,
      legacyCompare: true,
      proposals: true,
      json: true,
      presetId: 'STANDARD_PRO',
      fixtureId: 'samsung-galaxy-a14',
      since: '2026-06-01T00:00:00Z',
    });
  });

  it('rejects an invalid preset, unknown args and bad dates', () => {
    expect(() => parseAresV6EvidenceReviewArgs(['--preset', 'BOGUS'])).toThrow(AresV6EvidenceArgError);
    expect(() => parseAresV6EvidenceReviewArgs(['--nope'])).toThrow(AresV6EvidenceArgError);
    expect(() => parseAresV6EvidenceReviewArgs(['--since', 'not-a-date'])).toThrow(AresV6EvidenceArgError);
  });
});

describe('runAresV6EvidenceReview (fixtures-only)', () => {
  it('produces a fixtures-only report with comparison rows and no proposals by default', async () => {
    const report = await runAresV6EvidenceReview(options(), deps);
    expect(report.mode).toBe('fixtures-only');
    expect(report.comparisonRows.length).toBeGreaterThan(0);
    expect(report.proposals).toBeNull();
    expect(report.snapshot.goNoGo.decision).toBe('NO_GO_MORE_DATA'); // no DB evidence
  });

  it('includes proposals only when --proposals is set', async () => {
    const without = await runAresV6EvidenceReview(options({ proposals: false }), deps);
    const within = await runAresV6EvidenceReview(options({ proposals: true }), deps);
    expect(without.proposals).toBeNull();
    expect(within.proposals).not.toBeNull();
    expect(within.proposals?.proposals[0]?.autoApplyAllowed).toBe(false);
  });
});

describe('renderers', () => {
  it('JSON output contains no tokens, authorization, cookies or raw IP', async () => {
    const report = await runAresV6EvidenceReview(options({ proposals: true }), deps);
    const json = renderAresV6EvidenceJson(report).toLowerCase();
    expect(/\btoken\b|authorization|cookie|iphash|x-forwarded-for|set-cookie/.test(json)).toBe(false);
  });

  it('markdown output has the report sections', async () => {
    const report = await runAresV6EvidenceReview(options({ markdown: true, proposals: true }), deps);
    const md = renderAresV6EvidenceMarkdown(report);
    expect(md).toContain('# ARES v6 — Evidence Review (Fase 3D.1)');
    expect(md).toContain('## GO/NO-GO');
    expect(md).toContain('## Riesgo estructural');
    expect(md).toContain('## Comparación legacy-vs-v6');
    expect(md).toContain('## Propuestas de calibración');
  });

  it('summary line reflects the mode and decision', async () => {
    const report = await runAresV6EvidenceReview(options(), deps);
    expect(renderAresV6EvidenceSummaryLine(report)).toContain('fixtures-only');
  });
});

describe('3D.1 — compare-scope, summary-only, include-rows', () => {
  it('parses the new flags with safe defaults', () => {
    const parsed = parseAresV6EvidenceReviewArgs(['--compare-scope', 'all', '--summary-only', '--include-rows']);
    expect(parsed.compareScope).toBe('all');
    expect(parsed.summaryOnly).toBe(true);
    expect(parsed.includeRows).toBe(true);
    expect(parseAresV6EvidenceReviewArgs([]).compareScope).toBe('filtered');
    expect(() => parseAresV6EvidenceReviewArgs(['--compare-scope', 'bogus'])).toThrow(AresV6EvidenceArgError);
  });

  it('compare-scope=filtered limits the comparison to the chosen preset', async () => {
    const report = await runAresV6EvidenceReview(
      options({ presetId: 'STANDARD_PRO', compareScope: 'filtered' }),
      deps,
    );
    expect(report.comparisonRows.every((row) => row.presetId === 'STANDARD_PRO')).toBe(true);
    expect(report.warnings).toHaveLength(0);
  });

  it('compare-scope=all ignores the preset filter and warns (machine code)', async () => {
    const report = await runAresV6EvidenceReview(options({ presetId: 'STANDARD_PRO', compareScope: 'all' }), deps);
    const presets = new Set(report.comparisonRows.map((row) => row.presetId));
    expect(presets.size).toBeGreaterThan(1);
    expect(report.warnings).toContain('comparison_not_filtered_by_preset');
  });

  it('--summary-only JSON omits full comparison rows and full high-risk rows', async () => {
    const report = await runAresV6EvidenceReview(options({ summaryOnly: true, proposals: true }), deps);
    const json = JSON.parse(renderAresV6EvidenceJson(report)) as Record<string, unknown> & {
      snapshot: Record<string, unknown>;
    };
    expect(json.comparisonRows).toBeUndefined();
    expect(json.snapshot.highRiskRows).toBeUndefined();
    expect(json.snapshot.highRiskSummaryRows).toBeDefined();
  });

  it('default (no summary-only) JSON keeps full comparison rows', async () => {
    const report = await runAresV6EvidenceReview(options(), deps);
    const json = JSON.parse(renderAresV6EvidenceJson(report)) as { comparisonRows: unknown[] };
    expect(Array.isArray(json.comparisonRows)).toBe(true);
  });
});
