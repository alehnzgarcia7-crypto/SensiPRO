import type { AresV6EffectivePpiResult } from './dpi-curve';
import { findAresV6FixtureForDevice } from './fixtures';
import type {
  AresV6ConfidenceScore,
  AresV6DeviceSignal,
  AresV6GenerationInput,
} from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Confidence
//
// Confidence is a function of signal completeness. The grade is capped by the
// PPI source: a tier fallback can never be HIGH+, and only a confirmed-PPI
// generation on a known calibration fixture can reach LAB_VERIFIED.
// ═══════════════════════════════════════════════════════════════

const MISSING_SIGNAL_PENALTY = 3;
const LAB_VERIFIED_MIN_SCORE = 85;
const HIGH_MIN_SCORE = 75;
const MEDIUM_MIN_SCORE = 55;
const LAB_VERIFIED_MAX_MISSING = 1;

type Grade = AresV6ConfidenceScore['grade'];

function collectMissingSignals(input: AresV6GenerationInput): string[] {
  const { device, player } = input;
  const missing: string[] = [];

  if (!device.ppi && !device.screenDpi) missing.push('ppi/screenDpi');
  if (!device.releaseYear) missing.push('releaseYear');
  if (!device.chipset) missing.push('chipset');
  if (!player.primaryWeaponCategory) missing.push('primaryWeaponCategory');
  if (!device.thermalState) missing.push('thermalState');

  return missing;
}

function collectWarnings(device: AresV6DeviceSignal, effective: AresV6EffectivePpiResult): string[] {
  const warnings: string[] = [];

  if (effective.warning) warnings.push(effective.warning);
  if (device.pingMs && device.pingMs >= 120) {
    warnings.push('Ping alto: la sensibilidad no corrige el lag de red.');
  }
  if (device.thermalState === 'HOT' || device.thermalState === 'THROTTLING') {
    warnings.push('Rendimiento térmico inestable: valida en partida real, no solo en training.');
  }

  return warnings;
}

function deriveGrade(
  score: number,
  effective: AresV6EffectivePpiResult,
  device: AresV6DeviceSignal,
  missingCount: number,
): Grade {
  const hasConfirmedPpi = effective.source === 'PPI';
  const isCalibratedFixture = findAresV6FixtureForDevice(device.brand, device.model) !== undefined;

  if (
    hasConfirmedPpi &&
    isCalibratedFixture &&
    score >= LAB_VERIFIED_MIN_SCORE &&
    missingCount <= LAB_VERIFIED_MAX_MISSING
  ) {
    return 'LAB_VERIFIED';
  }

  // A tier fallback never claims better than MEDIUM.
  if (effective.source === 'TIER_FALLBACK') {
    return score >= MEDIUM_MIN_SCORE ? 'MEDIUM' : 'LOW';
  }

  // Confirmed PPI or DB screenDpi: cap at HIGH (LAB_VERIFIED handled above).
  if (score >= HIGH_MIN_SCORE) return 'HIGH';
  if (score >= MEDIUM_MIN_SCORE) return 'MEDIUM';
  return 'LOW';
}

export function buildConfidence(
  input: AresV6GenerationInput,
  effective: AresV6EffectivePpiResult,
  devicePenalty: number,
): AresV6ConfidenceScore {
  const missingSignals = collectMissingSignals(input);
  const warnings = collectWarnings(input.device, effective);

  const rawScore =
    100 - effective.confidencePenalty - devicePenalty - missingSignals.length * MISSING_SIGNAL_PENALTY;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const grade = deriveGrade(score, effective, input.device, missingSignals.length);

  return { score, grade, missingSignals, warnings };
}
