import { describe, expect, it } from 'vitest';

import { aresV6GenerateRequestSchema } from '../request-schema';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Strict request schema (Phase 3A)
// ═══════════════════════════════════════════════════════════════

const DEVICE_ID = 'ckdevicea1b2c3d4e5f6g7h8';

interface PlayerShape {
  fingers: number;
  playstyle: string;
  mode: string;
  usesGyroscope?: boolean;
  symptoms?: string[];
  [key: string]: unknown;
}

function basePlayer(extra?: Partial<PlayerShape>): PlayerShape {
  return { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false, ...extra };
}

function baseBody(extra?: Record<string, unknown>): Record<string, unknown> {
  return { deviceId: DEVICE_ID, presetId: 'STANDARD_PRO', player: basePlayer(), ...extra };
}

describe('aresV6GenerateRequestSchema — happy path', () => {
  it('accepts a valid minimal body', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody());
    expect(parsed.success).toBe(true);
  });

  it('accepts valid overrides', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody({ overrides: { ppi: 460, ramGb: 8 } }));
    expect(parsed.success).toBe(true);
  });
});

describe('aresV6GenerateRequestSchema — strict object contracts', () => {
  it('rejects an unknown root key', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody({ hackerField: true }));
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0]?.code).toBe('unrecognized_keys');
  });

  it('rejects an unknown player key', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody({ player: basePlayer({ injected: 'x' }) }));
    expect(parsed.success).toBe(false);
  });

  it('rejects an unknown overrides key', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody({ overrides: { ppi: 400, sneaky: 1 } }));
    expect(parsed.success).toBe(false);
  });
});

describe('aresV6GenerateRequestSchema — symptoms', () => {
  it('deduplicates symptoms while preserving order', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(
      baseBody({ player: basePlayer({ symptoms: ['DEVICE_LAGS', 'DEVICE_LAGS', 'AIM_SHAKES', 'AIM_SHAKES'] }) }),
    );
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.player.symptoms).toEqual(['DEVICE_LAGS', 'AIM_SHAKES']);
  });

  it('rejects more than five symptoms', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(
      baseBody({
        player: basePlayer({
          symptoms: [
            'DEVICE_LAGS',
            'AIM_SHAKES',
            'CANNOT_TURN_FAST',
            'RECOIL_TOO_HIGH',
            'GLOO_WALL_SLOW',
            'PHONE_HEATS_UP',
          ],
        }),
      }),
    );
    expect(parsed.success).toBe(false);
  });
});

describe('aresV6GenerateRequestSchema — value validation', () => {
  it('rejects an out-of-range override ppi', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody({ overrides: { ppi: 100 } }));
    expect(parsed.success).toBe(false);
  });

  it('rejects an invalid enum value', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody({ player: basePlayer({ playstyle: 'NOPE' }) }));
    expect(parsed.success).toBe(false);
  });

  it('rejects an invalid deviceId', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody({ deviceId: 'not-a-cuid' }));
    expect(parsed.success).toBe(false);
  });

  it('rejects a missing required field', () => {
    const parsed = aresV6GenerateRequestSchema.safeParse(baseBody({ player: { playstyle: 'STANDARD', mode: 'BATTLE_ROYALE' } }));
    expect(parsed.success).toBe(false);
  });
});
