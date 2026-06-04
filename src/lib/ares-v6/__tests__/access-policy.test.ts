import { NotFoundError } from '@ares/errors';
import { describe, expect, it } from 'vitest';

import { assertCanGenerateForDevice, canGenerateForDevice } from '../access-policy';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Access policy boundary (Phase 3A)
// ═══════════════════════════════════════════════════════════════

describe('canGenerateForDevice', () => {
  it('allows an active device', () => {
    expect(canGenerateForDevice({ device: { id: 'd1', isActive: true } })).toBe(true);
  });

  it('allows a device with unknown active state (back-compat)', () => {
    expect(canGenerateForDevice({ device: { id: 'd1' } })).toBe(true);
  });

  it('denies an explicitly inactive device', () => {
    expect(canGenerateForDevice({ device: { id: 'd1', isActive: false } })).toBe(false);
  });

  it('ignores the reserved user argument in Phase 3A', () => {
    expect(canGenerateForDevice({ device: { id: 'd1', isActive: true }, user: { id: 'u1', tier: 'FREE' } })).toBe(true);
  });
});

describe('assertCanGenerateForDevice', () => {
  it('does not throw for an active device', () => {
    expect(() => assertCanGenerateForDevice({ device: { id: 'd1', isActive: true } })).not.toThrow();
  });

  it('throws NotFoundError for an inactive device (anti-enumeration)', () => {
    expect(() => assertCanGenerateForDevice({ device: { id: 'd1', isActive: false } })).toThrow(NotFoundError);
  });
});
