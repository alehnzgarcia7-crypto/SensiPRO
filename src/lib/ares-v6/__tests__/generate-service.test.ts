import { NotFoundError } from '@ares/errors';
import { describe, expect, it } from 'vitest';

import {
  generateAresV6ForDeviceId,
  type AresV6GenerateServiceDeps,
  type AresV6GenerateServiceInput,
  type AresV6ServiceDevice,
} from '../generate-service';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Generation service (device finder is injected, no DB)
// ═══════════════════════════════════════════════════════════════

const DEVICE_ID = 'ckdevicea1b2c3d4e5f6g7h8';

function sampleServiceDevice(): AresV6ServiceDevice {
  return {
    id: DEVICE_ID,
    brand: 'Redmi',
    model: 'Note 13',
    slug: 'redmi-note-13',
    screenSize: 6.67,
    ramGb: 6,
    screenHz: 120,
    panelType: 'AMOLED',
    tier: 'MID',
    screenDpi: 395,
    chipset: 'Snapdragon 685',
    releaseYear: 2024,
  };
}

function input(overrides?: AresV6GenerateServiceInput['overrides']): AresV6GenerateServiceInput {
  return {
    deviceId: DEVICE_ID,
    presetId: 'STANDARD_PRO',
    player: { fingers: 3, playstyle: 'STANDARD', mode: 'BATTLE_ROYALE', usesGyroscope: false },
    overrides,
  };
}

function depsReturning(device: AresV6ServiceDevice | null): AresV6GenerateServiceDeps {
  return { findDevice: () => Promise.resolve(device) };
}

describe('generateAresV6ForDeviceId', () => {
  it('uses the DB screenDpi as the detected PPI', async () => {
    const result = await generateAresV6ForDeviceId(input(), depsReturning(sampleServiceDevice()));
    expect(result.generation.dpi.detectedPpi).toBe(395);
  });

  it('lets an override ppi win over the DB screenDpi', async () => {
    const result = await generateAresV6ForDeviceId(input({ ppi: 460 }), depsReturning(sampleServiceDevice()));
    expect(result.generation.dpi.detectedPpi).toBe(460);
  });

  it('throws NotFoundError when the device does not exist', async () => {
    await expect(generateAresV6ForDeviceId(input(), depsReturning(null))).rejects.toThrow(NotFoundError);
  });

  it('denies an inactive device as NotFound (anti-enumeration access policy)', async () => {
    const inactive = { ...sampleServiceDevice(), isActive: false };
    await expect(generateAresV6ForDeviceId(input(), depsReturning(inactive))).rejects.toThrow(NotFoundError);
  });

  it('returns a complete generation package with the resolved device', async () => {
    const result = await generateAresV6ForDeviceId(input(), depsReturning(sampleServiceDevice()));
    const g = result.generation;

    expect(g.sensitivity.general).toBeGreaterThan(0);
    expect(g.confidence.grade).toBeTruthy();
    expect(g.explanation.bullets.length).toBeGreaterThan(0);
    expect(g.hud.priorityButtons.length).toBeGreaterThan(0);
    expect(g.fireButton.sizePercent).toBeGreaterThan(0);
    expect(Array.isArray(g.firstTuningSteps)).toBe(true);
    expect(result.device.id).toBe(DEVICE_ID);
    expect(result.device.slug).toBe('redmi-note-13');
  });
});
