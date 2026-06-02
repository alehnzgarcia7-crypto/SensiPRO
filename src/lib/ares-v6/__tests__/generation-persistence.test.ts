import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateAresV6, getAresV6CalibrationFixture } from '@ares/algorithms/engine-v6';

import {
  buildAresV6GenerationRecord,
  isAresV6PersistenceRequired,
  persistAresV6Generation,
  shouldPersistAresV6Generations,
} from '../generation-persistence';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Generation persistence (Fase 3C)
// ═══════════════════════════════════════════════════════════════

const snapshot = new Map<string, string | undefined>();
function setEnv(name: string, value: string | undefined): void {
  if (!snapshot.has(name)) snapshot.set(name, process.env[name]);
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
afterEach(() => {
  for (const [name, value] of snapshot) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  snapshot.clear();
});

function sampleGeneration() {
  const fixture = getAresV6CalibrationFixture('redmi-note-13');
  if (!fixture) throw new Error('fixture missing');
  return generateAresV6({
    device: fixture.device,
    presetId: 'STANDARD_PRO',
    player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
  });
}

function recordInput() {
  return {
    requestId: 'req-123',
    device: { id: 'ckdevicea1b2c3d4e5f6g7h8', brand: 'Redmi', model: 'Note 13', slug: 'redmi-note-13' },
    generation: sampleGeneration(),
    player: { playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', fingers: 3 },
    rate: { scopesApplied: ['IP_GLOBAL'], degraded: false, proxyTrusted: true, proxyIpSource: 'FORWARDED_FOR' },
    timings: { dbDurationMs: 3, engineDurationMs: 1, totalDurationMs: 9 },
    labMode: true,
  };
}

describe('persistence flags', () => {
  it('defaults to off and reads the env flags', () => {
    setEnv('ARES_V6_PERSIST_GENERATIONS', undefined);
    expect(shouldPersistAresV6Generations()).toBe(false);
    setEnv('ARES_V6_PERSIST_GENERATIONS', 'true');
    expect(shouldPersistAresV6Generations()).toBe(true);
    setEnv('ARES_V6_PERSIST_GENERATIONS_REQUIRED', 'true');
    expect(isAresV6PersistenceRequired()).toBe(true);
  });
});

describe('buildAresV6GenerationRecord', () => {
  it('maps engine output without PII', () => {
    const record = buildAresV6GenerationRecord(recordInput());
    expect(record.requestId).toBe('req-123');
    expect(record.deviceId).toBe('ckdevicea1b2c3d4e5f6g7h8');
    expect(record.presetId).toBe('STANDARD_PRO');
    expect(record.source).toBe('INTERNAL_LAB');
    expect(record.detectedPpi).toBe(395);
    expect(record.confidenceGrade).toBeTruthy();
    const serialized = JSON.stringify(record);
    expect(serialized).not.toContain('ipHash');
    expect(serialized).not.toContain('userAgent');
  });
});

describe('persistAresV6Generation', () => {
  it('writes via the injected create dep', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'gen_1' });
    const result = await persistAresV6Generation(buildAresV6GenerationRecord(recordInput()), { create });
    expect(result.id).toBe('gen_1');
    expect(create).toHaveBeenCalledTimes(1);
  });
});
