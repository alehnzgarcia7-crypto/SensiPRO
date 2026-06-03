import { describe, expect, it, vi } from 'vitest';

import type { AresV6PresetId } from '@ares/algorithms/engine-v6';

import { previewAresV6Generation, type AresV6PreviewDeps } from '../internal-preview-service';
import type { AresV6InternalUiAccessState } from '../internal-ui-access';
import { getAresV6GenerationPreview } from '../internal-ui-service';

// ═══════════════════════════════════════════════════════════════
// Fase 3E — read-only preview service. Proves: access is enforced, untrusted
// ids are validated against the real enums, and no persistence path exists
// (the ONLY side effect is the injected pure builder).
// ═══════════════════════════════════════════════════════════════

const ALLOW: AresV6InternalUiAccessState = {
  ok: true,
  reason: 'OK',
  mode: 'LAB',
  environment: 'test',
  productionProtectionAcknowledged: false,
};
const DENY: AresV6InternalUiAccessState = {
  ok: false,
  reason: 'UI_FLAG_OFF',
  mode: 'OFF',
  environment: 'test',
  productionProtectionAcknowledged: false,
};

function makeDeps(access: AresV6InternalUiAccessState) {
  const buildPreview = vi.fn((input: { fixtureId: string; presetId: AresV6PresetId }) =>
    getAresV6GenerationPreview(input),
  );
  const deps: AresV6PreviewDeps = {
    getAccessState: () => access,
    buildPreview,
  };
  return { deps, buildPreview };
}

describe('previewAresV6Generation', () => {
  it('returns a preview for a valid fixture × preset when access is allowed', () => {
    const { deps, buildPreview } = makeDeps(ALLOW);
    const result = previewAresV6Generation({ fixtureId: 'samsung-galaxy-a14', presetId: 'STANDARD_PRO' }, deps);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.preview.generation.sensitivity.general).toBeGreaterThan(0);
    }
    expect(buildPreview).toHaveBeenCalledTimes(1);
  });

  it('denies (and never builds) when access is not allowed', () => {
    const { deps, buildPreview } = makeDeps(DENY);
    const result = previewAresV6Generation({ fixtureId: 'samsung-galaxy-a14', presetId: 'STANDARD_PRO' }, deps);
    expect(result).toEqual({ ok: false, code: 'ACCESS_DENIED', message: expect.any(String) });
    expect(buildPreview).not.toHaveBeenCalled();
  });

  it('rejects an unknown preset without building', () => {
    const { deps, buildPreview } = makeDeps(ALLOW);
    const result = previewAresV6Generation({ fixtureId: 'samsung-galaxy-a14', presetId: 'NOT_A_PRESET' }, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNKNOWN_PRESET');
    expect(buildPreview).not.toHaveBeenCalled();
  });

  it('rejects an unknown fixture without building', () => {
    const { deps, buildPreview } = makeDeps(ALLOW);
    const result = previewAresV6Generation({ fixtureId: 'totally-made-up', presetId: 'STANDARD_PRO' }, deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNKNOWN_FIXTURE');
    expect(buildPreview).not.toHaveBeenCalled();
  });
});
