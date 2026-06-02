import { describe, expect, it } from 'vitest';

import {
  computeAresV6CleanupCutoffs,
  runAresV6LabCleanup,
  type AresV6CleanupConfig,
  type AresV6CleanupDeps,
} from '../lab-cleanup';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Lab cleanup (Fase 3C)
// ═══════════════════════════════════════════════════════════════

const CONFIG: AresV6CleanupConfig = { generationRetentionDays: 90, feedbackRetentionDays: 180 };
const NOW = Date.UTC(2026, 5, 2);
const DAY = 24 * 60 * 60 * 1000;

interface TrackedDeps extends AresV6CleanupDeps {
  deleted: boolean;
}

function trackedDeps(counts: { gen: number; fb: number }): TrackedDeps {
  const deps: TrackedDeps = {
    deleted: false,
    countGenerationsBefore: () => Promise.resolve(counts.gen),
    countFeedbackBefore: () => Promise.resolve(counts.fb),
    deleteGenerationsBefore: () => {
      deps.deleted = true;
      return Promise.resolve(counts.gen);
    },
    deleteFeedbackBefore: () => {
      deps.deleted = true;
      return Promise.resolve(counts.fb);
    },
  };
  return deps;
}

describe('computeAresV6CleanupCutoffs', () => {
  it('computes retention cutoffs', () => {
    const cutoffs = computeAresV6CleanupCutoffs(NOW, CONFIG);
    expect(cutoffs.generationsBefore.getTime()).toBe(NOW - 90 * DAY);
    expect(cutoffs.feedbackBefore.getTime()).toBe(NOW - 180 * DAY);
  });
});

describe('runAresV6LabCleanup', () => {
  it('counts (and does not delete) in dry-run mode', async () => {
    const deps = trackedDeps({ gen: 7, fb: 3 });
    const result = await runAresV6LabCleanup({ dryRun: true, nowMs: NOW, config: CONFIG }, deps);
    expect(result.dryRun).toBe(true);
    expect(result.generations).toBe(7);
    expect(result.feedback).toBe(3);
    expect(deps.deleted).toBe(false);
  });

  it('deletes when executed', async () => {
    const deps = trackedDeps({ gen: 4, fb: 2 });
    const result = await runAresV6LabCleanup({ dryRun: false, nowMs: NOW, config: CONFIG }, deps);
    expect(result.dryRun).toBe(false);
    expect(result.generations).toBe(4);
    expect(deps.deleted).toBe(true);
  });
});
