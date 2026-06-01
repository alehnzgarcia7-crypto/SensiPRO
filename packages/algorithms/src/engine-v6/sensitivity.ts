import { calculateBaseSensitivityFromPpi } from './dpi-curve';
import { applyDelta, enforceScopeCascade } from './math';
import type { AresV6Preset, AresV6SensitivityVector, AresV6WeaponCategory } from './types';
import { getWeaponDelta } from './weapons';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Sensitivity pipeline
//
// Four explicit stages instead of one opaque function:
//   base (PPI band) → device delta → preset → weapon → finalize (cascade).
// The orchestrator owns the device-delta step; the rest live here.
// ═══════════════════════════════════════════════════════════════

/** Stage 1 — base values interpolated from the effective PPI band. */
export function generateBaseSensitivity(ppi: number): AresV6SensitivityVector {
  return calculateBaseSensitivityFromPpi(ppi);
}

/** Stage 3 — apply the preset's additive bias. */
export function applyPresetToSensitivity(
  base: AresV6SensitivityVector,
  preset: AresV6Preset,
): AresV6SensitivityVector {
  return applyDelta(base, preset.sensitivityBias);
}

/** Stage 4 — apply the weapon-category bias (matrix rule or safe fallback). */
export function applyWeaponToSensitivity(
  base: AresV6SensitivityVector,
  category?: AresV6WeaponCategory,
): AresV6SensitivityVector {
  return applyDelta(base, getWeaponDelta(category));
}

/** Stage 5 — enforce the scope cascade so the output is always sane. */
export function finalizeSensitivity(
  sensitivity: AresV6SensitivityVector,
): AresV6SensitivityVector {
  return enforceScopeCascade(sensitivity);
}
