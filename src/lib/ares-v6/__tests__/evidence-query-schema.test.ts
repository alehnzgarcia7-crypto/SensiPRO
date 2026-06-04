import { describe, expect, it } from 'vitest';

import {
  ARES_V6_EVIDENCE_WARNING_COMPARISON_NOT_FILTERED,
  parseAresV6EvidenceQuery,
} from '../evidence-query-schema';

const NOW = Date.parse('2026-06-02T00:00:00.000Z');

describe('parseAresV6EvidenceQuery', () => {
  it('applies safe defaults for an empty query', () => {
    const result = parseAresV6EvidenceQuery({}, NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.query.compareScope).toBe('filtered');
    expect(result.query.includeLegacyCompare).toBe(false);
    expect(result.query.includeRows).toBe(false);
    expect(result.query.includeSuspicious).toBe(false);
    expect(result.query.until.getTime()).toBe(NOW);
    expect(result.query.since.getTime()).toBe(NOW - 7 * 24 * 60 * 60 * 1000);
    expect(result.query.warnings).toEqual([]);
  });

  it('rejects an invalid presetId (field = presetId)', () => {
    const result = parseAresV6EvidenceQuery({ presetId: 'NOT_A_PRESET' }, NOW);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.field).toBe('presetId');
  });

  it('rejects an unknown query key (strict)', () => {
    const result = parseAresV6EvidenceQuery({ bogusKey: '1' }, NOW);
    expect(result.ok).toBe(false);
  });

  it('rejects compareScope=sideways as an INVALID ENUM VALUE, not an unknown key', () => {
    const result = parseAresV6EvidenceQuery({ compareScope: 'sideways' }, NOW);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    // Proves compareScope is a recognised enum field (an unknown key would have no field).
    expect(result.field).toBe('compareScope');
  });

  it('parses includeRows=true / includeLegacyCompare=true', () => {
    const result = parseAresV6EvidenceQuery({ includeRows: 'true', includeLegacyCompare: 'true' }, NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.query.includeRows).toBe(true);
    expect(result.query.includeLegacyCompare).toBe(true);
  });

  it('warns when compareScope=all ignores a presetId', () => {
    const result = parseAresV6EvidenceQuery({ presetId: 'STANDARD_PRO', compareScope: 'all' }, NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.query.warnings).toContain(ARES_V6_EVIDENCE_WARNING_COMPARISON_NOT_FILTERED);
  });

  it('does NOT warn when compareScope=filtered with a presetId', () => {
    const result = parseAresV6EvidenceQuery({ presetId: 'STANDARD_PRO', compareScope: 'filtered' }, NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.query.warnings).toEqual([]);
  });

  it('rejects until before since', () => {
    const result = parseAresV6EvidenceQuery(
      { since: '2026-06-10T00:00:00.000Z', until: '2026-06-01T00:00:00.000Z' },
      NOW,
    );
    expect(result.ok).toBe(false);
  });

  it('rejects a range greater than 90 days', () => {
    const result = parseAresV6EvidenceQuery(
      { since: '2026-01-01T00:00:00.000Z', until: '2026-06-01T00:00:00.000Z' },
      NOW,
    );
    expect(result.ok).toBe(false);
  });
});
