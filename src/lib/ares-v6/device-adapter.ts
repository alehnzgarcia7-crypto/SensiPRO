import type {
  AresV6Client,
  AresV6DeviceSignal,
  AresV6DeviceTier,
  AresV6GraphicsQuality,
  AresV6PanelType,
  AresV6ThermalState,
} from '@ares/algorithms/engine-v6';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Device adapter (Prisma/DB → engine signal)
//
// The single rule: the DB's screenDpi must never be lost. It maps to BOTH
// the engine's `ppi` (highest-priority driver) and `screenDpi` (historical
// alias). A user-confirmed `ppi` override wins over the DB value.
//
// This module is pure: it takes plain objects, never imports Prisma, and
// never mutates its inputs.
// ═══════════════════════════════════════════════════════════════

/**
 * The minimal device shape the adapter needs. A full Prisma `Device` is a
 * structural superset, so it can be passed directly.
 */
export interface AresV6AdaptableDevice {
  brand: string;
  model: string;
  screenSize: number;
  ramGb: number;
  screenHz: number;
  panelType: AresV6PanelType;
  tier: AresV6DeviceTier;
  screenDpi?: number | null;
  chipset?: string | null;
  releaseYear?: number | null;
}

/** Player/session-supplied overrides that refine the device signal. */
export interface AresV6DeviceOverrides {
  ramGb?: number;
  screenHz?: number;
  ppi?: number;
  client?: AresV6Client;
  graphicsQuality?: AresV6GraphicsQuality;
  highFpsMode?: boolean;
  frameBoostEnabled?: boolean;
  thermalState?: AresV6ThermalState;
  pingMs?: number;
  hasScreenProtector?: boolean;
  inputLagHint?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface NumericRange {
  min: number;
  max: number;
}

const OVERRIDE_RANGES = {
  ramGb: { min: 1, max: 32 },
  screenHz: { min: 30, max: 240 },
  ppi: { min: 200, max: 700 },
  pingMs: { min: 0, max: 999 },
} as const satisfies Record<string, NumericRange>;

function isInRange(value: number | undefined, range: NumericRange): value is number {
  return value !== undefined && Number.isFinite(value) && value >= range.min && value <= range.max;
}

/**
 * Return a sanitized copy of the overrides: numeric fields outside their safe
 * range are dropped (treated as not provided). The API layer rejects them
 * with Zod first; this is defense-in-depth for direct callers.
 */
export function normalizeAresV6Overrides(overrides?: AresV6DeviceOverrides): AresV6DeviceOverrides {
  if (!overrides) return {};

  const normalized: AresV6DeviceOverrides = {};

  if (isInRange(overrides.ramGb, OVERRIDE_RANGES.ramGb)) normalized.ramGb = overrides.ramGb;
  if (isInRange(overrides.screenHz, OVERRIDE_RANGES.screenHz)) normalized.screenHz = overrides.screenHz;
  if (isInRange(overrides.ppi, OVERRIDE_RANGES.ppi)) normalized.ppi = overrides.ppi;
  if (isInRange(overrides.pingMs, OVERRIDE_RANGES.pingMs)) normalized.pingMs = overrides.pingMs;

  if (overrides.client !== undefined) normalized.client = overrides.client;
  if (overrides.graphicsQuality !== undefined) normalized.graphicsQuality = overrides.graphicsQuality;
  if (overrides.highFpsMode !== undefined) normalized.highFpsMode = overrides.highFpsMode;
  if (overrides.frameBoostEnabled !== undefined) normalized.frameBoostEnabled = overrides.frameBoostEnabled;
  if (overrides.thermalState !== undefined) normalized.thermalState = overrides.thermalState;
  if (overrides.hasScreenProtector !== undefined) normalized.hasScreenProtector = overrides.hasScreenProtector;
  if (overrides.inputLagHint !== undefined) normalized.inputLagHint = overrides.inputLagHint;

  return normalized;
}

/** Map a DB device into an engine signal, preserving screenDpi as ppi + alias. */
export function toAresV6DeviceSignal(device: AresV6AdaptableDevice): AresV6DeviceSignal {
  return {
    brand: device.brand,
    model: device.model,
    screenSize: device.screenSize,
    ramGb: device.ramGb,
    screenHz: device.screenHz,
    panelType: device.panelType,
    tier: device.tier,
    ppi: device.screenDpi ?? undefined,
    screenDpi: device.screenDpi ?? undefined,
    chipset: device.chipset ?? undefined,
    releaseYear: device.releaseYear ?? undefined,
  };
}

/** Map a DB device + overrides into an engine signal. Overrides win. */
export function toAresV6DeviceSignalWithOverrides(
  device: AresV6AdaptableDevice,
  overrides?: AresV6DeviceOverrides,
): AresV6DeviceSignal {
  const base = toAresV6DeviceSignal(device);
  const o = normalizeAresV6Overrides(overrides);

  return {
    ...base,
    ramGb: o.ramGb ?? base.ramGb,
    screenHz: o.screenHz ?? base.screenHz,
    // override ppi ?? DB screenDpi (carried on base.ppi) ?? undefined
    ppi: o.ppi ?? base.ppi,
    ...(o.client !== undefined ? { client: o.client } : {}),
    ...(o.graphicsQuality !== undefined ? { graphicsQuality: o.graphicsQuality } : {}),
    ...(o.highFpsMode !== undefined ? { highFpsMode: o.highFpsMode } : {}),
    ...(o.frameBoostEnabled !== undefined ? { frameBoostEnabled: o.frameBoostEnabled } : {}),
    ...(o.thermalState !== undefined ? { thermalState: o.thermalState } : {}),
    ...(o.pingMs !== undefined ? { pingMs: o.pingMs } : {}),
    ...(o.hasScreenProtector !== undefined ? { hasScreenProtector: o.hasScreenProtector } : {}),
    ...(o.inputLagHint !== undefined ? { inputLagHint: o.inputLagHint } : {}),
  };
}
