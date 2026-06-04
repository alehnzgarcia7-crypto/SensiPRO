import type { AresV6SensitivityVector } from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Numeric core
//
// Pure, dependency-free math used across the engine. Every value the
// engine emits passes through these clamps so range guarantees live in
// exactly one place.
// ═══════════════════════════════════════════════════════════════

/** Free Fire modern sensitivity scale floor. */
export const ARES_V6_SENSITIVITY_MIN = 1;
/** Free Fire modern sensitivity scale ceiling. */
export const ARES_V6_SENSITIVITY_MAX = 200;
/** Gyroscope sliders use the legacy 1-100 scale. */
export const ARES_V6_GYRO_MIN = 1;
export const ARES_V6_GYRO_MAX = 100;

/**
 * How far the 2x scope may sit above the Red Point before it is considered
 * "exploding". Headshot presets raise Red Point, so a small positive gap is
 * healthy; anything beyond this is clamped by {@link enforceScopeCascade}.
 */
export const ARES_V6_SCOPE2X_OVER_REDPOINT = 6;

export type AresV6SensitivityDelta = Partial<AresV6SensitivityVector>;

export function round(value: number): number {
  return Math.round(value);
}

/** Clamp to an inclusive range and round to the nearest integer. */
export function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

/** Linear interpolation between `from` and `to` for `t` in [0, 1]. */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function clampSensitivity(value: number): number {
  return clamp(value, ARES_V6_SENSITIVITY_MIN, ARES_V6_SENSITIVITY_MAX);
}

export function clampGyro(value: number): number {
  return clamp(value, ARES_V6_GYRO_MIN, ARES_V6_GYRO_MAX);
}

/** Apply an additive delta to every sensitivity field, clamping each result. */
export function applyDelta(
  base: AresV6SensitivityVector,
  delta: AresV6SensitivityDelta,
): AresV6SensitivityVector {
  return {
    general: clampSensitivity(base.general + (delta.general ?? 0)),
    redPoint: clampSensitivity(base.redPoint + (delta.redPoint ?? 0)),
    scope2x: clampSensitivity(base.scope2x + (delta.scope2x ?? 0)),
    scope4x: clampSensitivity(base.scope4x + (delta.scope4x ?? 0)),
    sniperScope: clampSensitivity(base.sniperScope + (delta.sniperScope ?? 0)),
    freeView: clampSensitivity(base.freeView + (delta.freeView ?? 0)),
  };
}

/** Sum two deltas field-by-field into a single delta. */
export function mergeDelta(
  base: AresV6SensitivityDelta,
  next: AresV6SensitivityDelta,
): AresV6SensitivityDelta {
  return {
    general: (base.general ?? 0) + (next.general ?? 0),
    redPoint: (base.redPoint ?? 0) + (next.redPoint ?? 0),
    scope2x: (base.scope2x ?? 0) + (next.scope2x ?? 0),
    scope4x: (base.scope4x ?? 0) + (next.scope4x ?? 0),
    sniperScope: (base.sniperScope ?? 0) + (next.sniperScope ?? 0),
    freeView: (base.freeView ?? 0) + (next.freeView ?? 0),
  };
}

/**
 * Enforce a sane scope chain: redPoint(+headroom) >= 2x >= 4x >= AWM.
 *
 * This is a *true* sequential cascade — each scope is clamped against the
 * already-corrected value above it, so the invariant always holds. General
 * and freeView are left untouched (they are independent controls).
 */
export function enforceScopeCascade(
  sensitivity: AresV6SensitivityVector,
): AresV6SensitivityVector {
  const scope2x = Math.min(sensitivity.scope2x, sensitivity.redPoint + ARES_V6_SCOPE2X_OVER_REDPOINT);
  const scope4x = Math.min(sensitivity.scope4x, scope2x);
  const sniperScope = Math.min(sensitivity.sniperScope, scope4x);

  return { ...sensitivity, scope2x, scope4x, sniperScope };
}
