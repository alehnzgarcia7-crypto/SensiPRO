import { NotFoundError } from '@ares/errors';

import {
  generateAresV6,
  type AresV6GenerationOutput,
  type AresV6PlayerSignal,
  type AresV6PresetId,
} from '@ares/algorithms/engine-v6';

import {
  toAresV6DeviceSignalWithOverrides,
  type AresV6AdaptableDevice,
  type AresV6DeviceOverrides,
} from './device-adapter';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Generation service
//
// Pure orchestration: find device → adapt (preserving screenDpi) → run the
// engine. The device finder is injected so the service is fully testable
// without a database; the default lazily loads Prisma so unit tests that
// inject their own finder never touch @ares/database.
// ═══════════════════════════════════════════════════════════════

export interface AresV6GenerateServiceInput {
  deviceId: string;
  presetId: AresV6PresetId;
  player: AresV6PlayerSignal;
  overrides?: AresV6DeviceOverrides;
}

/** The device record the service needs: adapter fields plus id/slug for the response. */
export interface AresV6ServiceDevice extends AresV6AdaptableDevice {
  id: string;
  slug: string;
}

export interface AresV6GenerateServiceResult {
  device: AresV6ServiceDevice;
  generation: AresV6GenerationOutput;
}

export interface AresV6GenerateServiceDeps {
  findDevice(id: string): Promise<AresV6ServiceDevice | null>;
}

async function defaultFindDevice(id: string): Promise<AresV6ServiceDevice | null> {
  const { prisma } = await import('@ares/database');
  return prisma.device.findUnique({
    where: { id },
    select: {
      id: true,
      brand: true,
      model: true,
      slug: true,
      screenSize: true,
      ramGb: true,
      screenHz: true,
      panelType: true,
      tier: true,
      screenDpi: true,
      chipset: true,
      releaseYear: true,
    },
  });
}

const DEFAULT_DEPS: AresV6GenerateServiceDeps = { findDevice: defaultFindDevice };

/**
 * Resolve a device by id and generate a full ARES v6 package for it.
 * Throws {@link NotFoundError} when the device does not exist.
 */
export async function generateAresV6ForDeviceId(
  input: AresV6GenerateServiceInput,
  deps: AresV6GenerateServiceDeps = DEFAULT_DEPS,
): Promise<AresV6GenerateServiceResult> {
  const device = await deps.findDevice(input.deviceId);
  if (!device) {
    throw new NotFoundError('Device', input.deviceId);
  }

  const signal = toAresV6DeviceSignalWithOverrides(device, input.overrides);
  const generation = generateAresV6({
    device: signal,
    presetId: input.presetId,
    player: input.player,
  });

  return { device, generation };
}
