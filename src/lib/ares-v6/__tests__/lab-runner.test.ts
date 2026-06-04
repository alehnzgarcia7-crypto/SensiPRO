import { describe, expect, it } from 'vitest';

import {
  parseAresV6LabRunnerArgs,
  resolveAresV6LabRunnerToken,
  runAresV6LocalLab,
  selectAresV6LabFixtures,
  summarizeAresV6LabRun,
} from '../lab-runner';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Internal lab runner core (Fase 3C)
// ═══════════════════════════════════════════════════════════════

describe('parseAresV6LabRunnerArgs', () => {
  it('parses flags and never stores the token', () => {
    const options = parseAresV6LabRunnerArgs([
      '--all-fixtures',
      '--preset',
      'STANDARD_PRO',
      '--json',
      '--token',
      'super-secret',
      '--label',
      'run-x',
    ]);
    expect(options.allFixtures).toBe(true);
    expect(options.presetId).toBe('STANDARD_PRO');
    expect(options.json).toBe(true);
    expect(options.label).toBe('run-x');
    expect(JSON.stringify(options)).not.toContain('super-secret');
  });
});

describe('resolveAresV6LabRunnerToken', () => {
  it('reads the token from argv or env', () => {
    expect(resolveAresV6LabRunnerToken(['--token', 'tok-a'], {})).toBe('tok-a');
    expect(resolveAresV6LabRunnerToken([], { ARES_V6_INTERNAL_ACCESS_TOKEN: 'tok-b' } as NodeJS.ProcessEnv)).toBe('tok-b');
    expect(resolveAresV6LabRunnerToken([], {} as NodeJS.ProcessEnv)).toBeNull();
  });
});

describe('selectAresV6LabFixtures', () => {
  it('filters to a single fixture or returns all', () => {
    const single = selectAresV6LabFixtures(parseAresV6LabRunnerArgs(['--fixture', 'redmi-note-13']));
    expect(single).toHaveLength(1);
    const all = selectAresV6LabFixtures(parseAresV6LabRunnerArgs(['--all-fixtures']));
    expect(all.length).toBeGreaterThanOrEqual(12);
  });
});

describe('runAresV6LocalLab + summarizeAresV6LabRun', () => {
  it('runs the engine for a fixture and summarizes without leaking a token', () => {
    const options = parseAresV6LabRunnerArgs(['--fixture', 'redmi-note-13', '--preset', 'STANDARD_PRO']);
    const rows = runAresV6LocalLab(options);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.ok).toBe(true);
    expect(rows[0]?.confidenceGrade).toBeTruthy();

    const summary = summarizeAresV6LabRun(rows, {
      label: 'unit',
      commitSha: null,
      environment: 'test',
      startedAt: '2026-06-02T00:00:00.000Z',
      completedAt: '2026-06-02T00:00:01.000Z',
    });
    expect(summary.total).toBe(1);
    expect(summary.successCount).toBe(1);
    expect(summary.failureCount).toBe(0);
    expect(JSON.stringify(summary)).not.toContain('Bearer');
  });
});
