import { resolveEffectivePpi, type AresV6EffectivePpiResult } from './dpi-curve';
import { mergeDelta, type AresV6SensitivityDelta } from './math';
import type { AresV6DeviceSignal, AresV6DpiRecommendation } from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Device Profile
//
// Turns raw device signals into a structured profile: effective PPI,
// hardware-driven sensitivity delta, deterministic device age, human risk
// notes and a confidence penalty for unstable hardware states.
// ═══════════════════════════════════════════════════════════════

/**
 * Reference "meta year" used for deterministic device-age math. The engine
 * must be pure (same input → same output), so it never reads the wall clock.
 */
export const ARES_V6_META_YEAR = 2026;

const PREMIUM_PANELS: readonly string[] = ['AMOLED', 'OLED', 'LTPO'];

export interface AresV6DeviceProfile {
  effectivePpi: AresV6EffectivePpiResult;
  deviceAgeYears: number | null;
  signalDelta: AresV6SensitivityDelta;
  riskNotes: readonly string[];
  confidencePenalty: number;
  isLowEnd: boolean;
  isHighRefresh: boolean;
  isPremiumPanel: boolean;
}

/**
 * Hardware-driven sensitivity delta. Ported verbatim from the v6 baseline so
 * the calibration curve is unchanged: RAM, refresh rate, panel, screen size,
 * thermal state, client, frame boost and ping all nudge the raw values.
 */
export function getDeviceSignalDelta(device: AresV6DeviceSignal): AresV6SensitivityDelta {
  let delta: AresV6SensitivityDelta = {};

  if (device.ramGb <= 2) {
    delta = mergeDelta(delta, { general: 8, redPoint: 6, scope4x: -4, sniperScope: -5 });
  } else if (device.ramGb <= 4) {
    delta = mergeDelta(delta, { general: 3, redPoint: 2, scope4x: -2, sniperScope: -3 });
  }

  if (device.screenHz <= 60) {
    delta = mergeDelta(delta, { general: 4, redPoint: 3, freeView: 2 });
  } else if (device.screenHz >= 120) {
    delta = mergeDelta(delta, { general: -2, redPoint: -1, scope4x: -2 });
  }

  if (PREMIUM_PANELS.includes(device.panelType)) {
    delta = mergeDelta(delta, { general: -1, redPoint: -1, scope4x: -1 });
  }

  if (device.screenSize >= 6.8) {
    delta = mergeDelta(delta, { general: -3, redPoint: -2, freeView: 2 });
  }

  if (device.thermalState === 'HOT' || device.thermalState === 'THROTTLING') {
    delta = mergeDelta(delta, { general: 3, redPoint: 2, scope4x: -4, sniperScope: -4 });
  }

  if (device.client === 'FREE_FIRE_MAX') {
    delta = mergeDelta(delta, { general: -2, redPoint: -1, scope4x: -2, sniperScope: -2 });
  }

  if (device.frameBoostEnabled) {
    delta = mergeDelta(delta, { general: -1, redPoint: -1, scope4x: -1 });
  }

  if (device.pingMs && device.pingMs >= 120) {
    delta = mergeDelta(delta, { general: 2, redPoint: 2, scope4x: -3 });
  }

  return delta;
}

/** Deterministic device age in years, or null when the release year is unknown. */
export function getDeviceAgeYears(device: AresV6DeviceSignal): number | null {
  if (!device.releaseYear) return null;
  return Math.max(0, ARES_V6_META_YEAR - device.releaseYear);
}

/** Human-readable warnings tied to the device hardware/network state. */
export function getDeviceRiskNotes(device: AresV6DeviceSignal): readonly string[] {
  const notes: string[] = [];

  if (device.ramGb <= 2) {
    notes.push('RAM muy baja (≤2GB): posible stutter; valida siempre en partida real.');
  } else if (device.ramGb <= 4) {
    notes.push('RAM ajustada (3-4GB): cierra apps en segundo plano antes de jugar.');
  }

  if (device.screenHz <= 60) {
    notes.push('Pantalla de 60Hz: se siente menos responsiva que 90/120Hz.');
  }

  if (device.thermalState === 'HOT' || device.thermalState === 'THROTTLING') {
    notes.push('Rendimiento térmico inestable: la sensibilidad no corrige el throttling.');
  }

  if (device.pingMs && device.pingMs >= 120) {
    notes.push('Ping alto (≥120ms): la sensibilidad no corrige el lag de red.');
  }

  if (device.inputLagHint === 'HIGH') {
    notes.push('Input lag alto reportado: baja gráficos y sube ligeramente el botón.');
  }

  if (device.hasScreenProtector) {
    notes.push('Mica/protector puede reducir la respuesta del touch; mantén la pantalla limpia.');
  }

  const age = getDeviceAgeYears(device);
  if (age !== null && age >= 5) {
    notes.push(`Equipo de ~${age} años: el rendimiento real puede estar por debajo de sus specs.`);
  }

  return notes;
}

/** Extra confidence penalty for unstable hardware/network states (not PPI). */
export function getDeviceConfidencePenalty(device: AresV6DeviceSignal): number {
  let penalty = 0;

  if (device.thermalState === 'THROTTLING') penalty += 8;
  else if (device.thermalState === 'HOT') penalty += 5;

  if (device.pingMs && device.pingMs >= 150) penalty += 5;
  else if (device.pingMs && device.pingMs >= 120) penalty += 3;

  if (device.inputLagHint === 'HIGH') penalty += 4;

  return penalty;
}

export function resolveDeviceProfile(device: AresV6DeviceSignal): AresV6DeviceProfile {
  return {
    effectivePpi: resolveEffectivePpi(device),
    deviceAgeYears: getDeviceAgeYears(device),
    signalDelta: getDeviceSignalDelta(device),
    riskNotes: getDeviceRiskNotes(device),
    confidencePenalty: getDeviceConfidencePenalty(device),
    isLowEnd: device.tier === 'LOW' || device.ramGb <= 4 || device.screenHz <= 60,
    isHighRefresh: device.screenHz >= 120,
    isPremiumPanel: PREMIUM_PANELS.includes(device.panelType),
  };
}

/** Map the resolved PPI into the public DPI recommendation block. */
export function buildDpiRecommendation(effective: AresV6EffectivePpiResult): AresV6DpiRecommendation {
  const isFallback = effective.source === 'TIER_FALLBACK';

  return {
    mode: 'NO_DPI',
    detectedPpi: isFallback ? null : effective.ppi,
    source: effective.source,
    confidence: 100 - effective.confidencePenalty,
    explanation: isFallback
      ? 'Se usó fallback por tier porque no llegó PPI/DPI real. Confirma el modelo para subir precisión.'
      : `Se usó ${effective.ppi} PPI/DPI como driver principal del motor v6.`,
  };
}
