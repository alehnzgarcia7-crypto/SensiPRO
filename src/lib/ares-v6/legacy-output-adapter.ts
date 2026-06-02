import { generateSensitivity } from '@ares/algorithms';
import type { AlgorithmInput, AlgorithmOutput, DeviceSpecs, SensitivityOutput } from '@ares/algorithms';

import type {
  AresV6CalibrationFixture,
  AresV6DeviceSignal,
  AresV6PresetId,
  AresV6SensitivityVector,
} from '@ares/algorithms/engine-v6';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Legacy output adapter (Fase 3D)
//
// The ONE explicit, documented seam between the frozen legacy engine and the
// v6 evidence tribunal. It produces a legacy 6-slider vector for the SAME
// fixture a v6 generation uses, so legacy-vs-v6 deltas are apples-to-apples.
//
// IMPORT-DEBT EVALUATION (mission requirement):
//   We import the REAL legacy `generateSensitivity` instead of mirroring its
//   formula because the import is SAFE and ground-truth fidelity matters for an
//   evidence tribunal:
//     • `@ares/config` (SENSITIVITY_MIN/MAX) validates env LAZILY (Proxy), so
//       importing it triggers NO env validation — tests/CLI run without secrets.
//     • Legacy modules import `@prisma/client` ONLY as types (no runtime Prisma).
//     • No node:/database/network side effects on import.
//   The coupling is confined to this single file behind an injectable seam.
//
// LIMITATIONS (documented on purpose):
//   • Sensitivity-only: gyroscope, fire button, HUD and the legacy
//     headshot/calibration engines are NOT compared (different surfaces).
//   • Legacy is FROZEN by the refoundation; if it ever unfreezes, re-validate.
//   • Legacy has 3 styles; v6 has 20 presets. Presets without an honest legacy
//     analog return NO_LEGACY_EQUIVALENT rather than a misleading mapping.
//   • No DB, no HTTP, no env, no customDpi/userRam/userHz knobs: both engines
//     run deterministically from the fixture device specs only.
// ═══════════════════════════════════════════════════════════════

/** Legacy 3-style model (mirror of @prisma/client SensitivityStyle members). */
export type AresV6LegacyStyle = 'AGGRESSIVE' | 'BALANCED' | 'SNIPER';

export interface AresV6ComparableSensitivity {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
  source: 'LEGACY' | 'ARES_V6';
}

export type AresV6LegacyPresetMapping =
  | { mapped: true; legacyStyle: AresV6LegacyStyle; note: string }
  | { mapped: false; reason: 'NO_LEGACY_EQUIVALENT'; note: string };

// ── Preset → legacy style mapping ───────────────────────────────
// Conservative on purpose: a wrong mapping pollutes evidence, so genuinely
// v6-only concepts (gyro, finger layouts, the editable lab preset) map to
// NO_LEGACY_EQUIVALENT instead of being forced into a 3-style bucket.
const PRESET_TO_LEGACY: Record<AresV6PresetId, { style: AresV6LegacyStyle | null; note: string }> = {
  STANDARD_PRO: { style: 'BALANCED', note: 'v6 baseline ≈ legacy balanced.' },
  TODO_ROJO: { style: 'AGGRESSIVE', note: 'Red-dot headshot priority ≈ legacy aggressive.' },
  X_METHOD: { style: 'AGGRESSIVE', note: 'Aggressive DPI/drag headshot ≈ legacy aggressive.' },
  ONE_TAP: { style: 'AGGRESSIVE', note: 'One-tap shotgun/pistol ≈ legacy aggressive.' },
  BRAZIL_RUSH: { style: 'AGGRESSIVE', note: 'CQB rush ≈ legacy aggressive.' },
  SHOTGUN_DRAG: { style: 'AGGRESSIVE', note: 'Shotgun rotation drag ≈ legacy aggressive.' },
  FREESTYLE_CLIPS: { style: 'AGGRESSIVE', note: 'High-motion freestyle ≈ legacy aggressive.' },
  SMG_TRACKING: { style: 'BALANCED', note: 'Close-mid tracking, smoother than one-tap ≈ legacy balanced.' },
  CLASH_SQUAD: { style: 'BALANCED', note: 'Fast-round mode preset ≈ legacy balanced.' },
  BATTLE_ROYALE: { style: 'BALANCED', note: 'Rotation stability mode ≈ legacy balanced.' },
  THREE_FINGER_COMPETITIVE: { style: 'BALANCED', note: 'Mid competitive layout ≈ legacy balanced.' },
  IPHONE_SMOOTH: { style: 'BALANCED', note: 'High-PPI iOS smoothing mapped to legacy balanced.' },
  ANDROID_BUDGET: { style: 'BALANCED', note: 'Budget Android touch-delay tuning ≈ legacy balanced.' },
  LOW_END_STABLE: { style: 'BALANCED', note: 'Low-end stability ≈ legacy balanced (low-end note).' },
  SNIPER_AWM: { style: 'SNIPER', note: 'AWM long-range control ≈ legacy sniper.' },
  AR_RECOIL_CONTROL: { style: 'SNIPER', note: 'Heavy-AR long-range control mapped to legacy sniper.' },
  // No honest legacy analog: legacy has no gyro / finger-layout / editable-lab concepts.
  FOUR_FINGER_PRO: { style: null, note: 'Finger-layout preset has no legacy 3-style analog.' },
  GYRO_LIGHT: { style: null, note: 'Gyroscope preset has no legacy 3-style analog.' },
  GYRO_PRO: { style: null, note: 'Gyroscope preset has no legacy 3-style analog.' },
  CUSTOM_LAB: { style: null, note: 'Editable lab preset is intentionally uncalibrated; no legacy analog.' },
};

/** Map a v6 preset to its closest legacy style, or NO_LEGACY_EQUIVALENT. */
export function mapAresV6PresetToLegacyStyle(presetId: AresV6PresetId): AresV6LegacyPresetMapping {
  const entry = PRESET_TO_LEGACY[presetId];
  if (!entry || entry.style === null) {
    return {
      mapped: false,
      reason: 'NO_LEGACY_EQUIVALENT',
      note: entry?.note ?? 'Preset desconocido: sin equivalente legacy.',
    };
  }
  return { mapped: true, legacyStyle: entry.style, note: entry.note };
}

export function normalizeLegacyOutput(output: SensitivityOutput): AresV6ComparableSensitivity {
  return {
    general: output.general,
    redPoint: output.redPoint,
    scope2x: output.scope2x,
    scope4x: output.scope4x,
    sniperScope: output.sniperScope,
    freeView: output.freeView,
    source: 'LEGACY',
  };
}

export function normalizeAresV6Output(vector: AresV6SensitivityVector): AresV6ComparableSensitivity {
  return {
    general: vector.general,
    redPoint: vector.redPoint,
    scope2x: vector.scope2x,
    scope4x: vector.scope4x,
    sniperScope: vector.sniperScope,
    freeView: vector.freeView,
    source: 'ARES_V6',
  };
}

/** Build a legacy DeviceSpecs from a v6 device signal (panel/tier are identical literal unions). */
export function buildLegacyDeviceSpecs(device: AresV6DeviceSignal): DeviceSpecs {
  return {
    screenHz: device.screenHz,
    screenSize: device.screenSize,
    ramGb: device.ramGb,
    panelType: device.panelType,
    tier: device.tier,
    ppi: device.ppi,
    // Legacy's getEffectiveDpi reads screenDpi (not ppi); pass the best density we
    // have so legacy uses the real PPI instead of a tier fallback.
    screenDpi: device.screenDpi ?? device.ppi,
  };
}

/** Injectable legacy generator seam (default = the real frozen engine). */
export type AresV6LegacyGenerator = (input: AlgorithmInput) => Pick<AlgorithmOutput, 'sensitivity'>;

export interface AresV6LegacyAdapterDeps {
  generate: AresV6LegacyGenerator;
}

const DEFAULT_DEPS: AresV6LegacyAdapterDeps = { generate: generateSensitivity };

/**
 * Produce the legacy comparable vector for a fixture under the legacy style that
 * maps to the given v6 preset. Returns null when the preset has NO_LEGACY_EQUIVALENT.
 * Pure: no DB, no HTTP, sensitivity-only (includeGyro=false).
 */
export function generateLegacyComparableForFixture(
  fixture: AresV6CalibrationFixture,
  presetId: AresV6PresetId = 'STANDARD_PRO',
  deps: AresV6LegacyAdapterDeps = DEFAULT_DEPS,
): AresV6ComparableSensitivity | null {
  const mapping = mapAresV6PresetToLegacyStyle(presetId);
  if (!mapping.mapped) return null;

  const result = deps.generate({
    specs: buildLegacyDeviceSpecs(fixture.device),
    style: mapping.legacyStyle,
    includeGyro: false,
  });
  return normalizeLegacyOutput(result.sensitivity);
}
