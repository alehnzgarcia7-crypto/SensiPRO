import { getPpiCalibrationBand } from './research-matrix';
import type { AresV6DeviceSignal, AresV6SensitivityVector } from './types';

const FALLBACK_PPI_BY_TIER: Record<AresV6DeviceSignal['tier'], number> = {
  LOW: 330,
  MID: 410,
  HIGH: 450,
  ULTRA: 460,
  GAMING: 480,
};

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function midpoint(range: readonly [number, number]): number {
  const [low, high] = range;
  return Math.round((low + high) / 2);
}

function inverseInterpolateInBand(
  ppi: number,
  minInclusive: number,
  maxInclusive: number | null,
): number {
  if (maxInclusive === null) {
    return Math.max(0, Math.min(1, (ppi - minInclusive) / 100));
  }

  if (maxInclusive <= minInclusive) return 0;
  return Math.max(0, Math.min(1, (ppi - minInclusive) / (maxInclusive - minInclusive)));
}

function valueFromRange(range: readonly [number, number], progress: number): number {
  const [low, high] = range;
  return clamp(high - (high - low) * progress, low, high);
}

export interface AresV6EffectivePpiResult {
  ppi: number;
  source: 'PPI' | 'SCREEN_DPI' | 'TIER_FALLBACK';
  confidencePenalty: number;
  warning: string | null;
}

export function resolveEffectivePpi(device: AresV6DeviceSignal): AresV6EffectivePpiResult {
  if (device.ppi && device.ppi > 0) {
    return { ppi: device.ppi, source: 'PPI', confidencePenalty: 0, warning: null };
  }

  if (device.screenDpi && device.screenDpi > 0) {
    return { ppi: device.screenDpi, source: 'SCREEN_DPI', confidencePenalty: 4, warning: null };
  }

  return {
    ppi: FALLBACK_PPI_BY_TIER[device.tier],
    source: 'TIER_FALLBACK',
    confidencePenalty: 18,
    warning: 'PPI/DPI no confirmado; confirma el dispositivo para subir precisión.',
  };
}

export function calculateBaseSensitivityFromPpi(ppi: number): AresV6SensitivityVector {
  const band = getPpiCalibrationBand(ppi);
  const progress = inverseInterpolateInBand(ppi, band.minInclusive, band.maxInclusive);

  return {
    general: valueFromRange(band.general, progress),
    redPoint: valueFromRange(band.redPoint, progress),
    scope2x: valueFromRange(band.scope2x, progress),
    scope4x: valueFromRange(band.scope4x, progress),
    sniperScope: valueFromRange(band.sniperScope, progress),
    freeView: valueFromRange(band.freeView, progress),
  };
}

export function calculateConservativeBaseFromPpi(ppi: number): AresV6SensitivityVector {
  const band = getPpiCalibrationBand(ppi);

  return {
    general: midpoint(band.general),
    redPoint: midpoint(band.redPoint),
    scope2x: midpoint(band.scope2x),
    scope4x: midpoint(band.scope4x),
    sniperScope: midpoint(band.sniperScope),
    freeView: midpoint(band.freeView),
  };
}