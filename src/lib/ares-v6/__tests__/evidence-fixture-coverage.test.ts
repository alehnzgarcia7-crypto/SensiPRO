import { describe, expect, it } from 'vitest';

import {
  ARES_V6_TOTAL_FIXTURES,
  calculateComparisonFixtureCoverage,
  calculateEvidenceFixtureCoverage,
  matchAresV6FixtureFromGeneration,
} from '../evidence-fixture-coverage';

describe('matchAresV6FixtureFromGeneration', () => {
  it('matches by slug === fixtureId', () => {
    expect(matchAresV6FixtureFromGeneration({ deviceSlug: 'redmi-note-13' })).toBe('redmi-note-13');
    expect(matchAresV6FixtureFromGeneration({ deviceSlug: 'REDMI-NOTE-13' })).toBe('redmi-note-13');
  });

  it('matches by brand + model (case-insensitive)', () => {
    expect(matchAresV6FixtureFromGeneration({ deviceBrand: 'samsung', deviceModel: 'galaxy a14' })).toBe(
      'samsung-galaxy-a14',
    );
  });

  it('returns null for unknown devices', () => {
    expect(matchAresV6FixtureFromGeneration({ deviceBrand: 'Nokia', deviceModel: 'XYZ-9000' })).toBeNull();
    expect(matchAresV6FixtureFromGeneration({})).toBeNull();
  });
});

describe('calculateEvidenceFixtureCoverage', () => {
  it('counts distinct fixtures with real generations', () => {
    const cov = calculateEvidenceFixtureCoverage([
      { deviceSlug: 'redmi-note-13', generations: 10 },
      { deviceSlug: 'samsung-galaxy-a14', generations: 5 },
      { deviceSlug: 'redmi-note-13', generations: 3 }, // duplicate fixture → counted once
    ]);
    expect(cov.coveredFixtures).toBe(2);
    expect(cov.totalFixtures).toBe(ARES_V6_TOTAL_FIXTURES);
    expect(cov.coverage).toBeCloseTo(2 / ARES_V6_TOTAL_FIXTURES, 4);
  });

  it('excludes zero-generation cells and unknown devices', () => {
    const cov = calculateEvidenceFixtureCoverage([
      { deviceSlug: 'redmi-note-13', generations: 0 },
      { deviceBrand: 'Nokia', deviceModel: 'XYZ-9000', generations: 5 },
    ]);
    expect(cov.coveredFixtures).toBe(0);
    expect(cov.unknownCount).toBe(1);
  });
});

describe('calculateComparisonFixtureCoverage', () => {
  it('counts distinct fixtureIds from comparison rows', () => {
    const cov = calculateComparisonFixtureCoverage([{ fixtureId: 'a' }, { fixtureId: 'b' }, { fixtureId: 'a' }]);
    expect(cov.coveredFixtures).toBe(2);
    expect(cov.totalFixtures).toBe(ARES_V6_TOTAL_FIXTURES);
  });
});
