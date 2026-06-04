import { buildConfidence } from './confidence';
import { buildDpiRecommendation, resolveDeviceProfile } from './device-profile';
import { buildExplanation } from './explain';
import { buildFireButton } from './fire-button';
import { buildGyroscope } from './gyro';
import { buildHud } from './hud';
import { applyDelta } from './math';
import { getAresV6Preset } from './presets';
import {
  applyPresetToSensitivity,
  applyWeaponToSensitivity,
  finalizeSensitivity,
  generateBaseSensitivity,
} from './sensitivity';
import { buildTuningSteps } from './tuning';
import type { AresV6GenerationInput, AresV6GenerationOutput } from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Orchestrator
//
// This file is intentionally thin. It wires the modules together and owns no
// calibration logic of its own. Every number comes from a dedicated module so
// each concern can be audited and tested in isolation.
// ═══════════════════════════════════════════════════════════════

export function generateAresV6(input: AresV6GenerationInput): AresV6GenerationOutput {
  const preset = getAresV6Preset(input.presetId);
  const profile = resolveDeviceProfile(input.device);
  const { effectivePpi } = profile;

  // Sensitivity pipeline: base → device signals → preset → weapon → finalize.
  const base = generateBaseSensitivity(effectivePpi.ppi);
  const withDevice = applyDelta(base, profile.signalDelta);
  const withPreset = applyPresetToSensitivity(withDevice, preset);
  const withWeapon = applyWeaponToSensitivity(withPreset, input.player.primaryWeaponCategory);
  const sensitivity = finalizeSensitivity(withWeapon);

  return {
    algorithmVersion: 'ARES-v6-refoundation',
    presetId: input.presetId,
    sensitivity,
    gyroscope: buildGyroscope(input, sensitivity),
    dpi: buildDpiRecommendation(effectivePpi),
    fireButton: buildFireButton(input),
    hud: buildHud(input),
    confidence: buildConfidence(input, effectivePpi, profile.confidencePenalty),
    explanation: buildExplanation(input, {
      preset,
      effectivePpi,
      sensitivity,
      deviceProfile: profile,
    }),
    firstTuningSteps: buildTuningSteps(input),
  };
}
