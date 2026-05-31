import type { AresV6SensitivityVector, AresV6Symptom, AresV6WeaponCategory } from './types';

export interface PpiCalibrationBand {
  minInclusive: number;
  maxInclusive: number | null;
  label: string;
  general: readonly [number, number];
  redPoint: readonly [number, number];
  scope2x: readonly [number, number];
  scope4x: readonly [number, number];
  sniperScope: readonly [number, number];
  freeView: readonly [number, number];
  notes: string;
}

export const ARES_V6_DEFAULT_PPI_BAND: PpiCalibrationBand = {
  minInclusive: 390,
  maxInclusive: 449,
  label: 'FHD+ mainstream sweet spot',
  general: [168, 182],
  redPoint: [153, 167],
  scope2x: [142, 165],
  scope4x: [122, 148],
  sniperScope: [108, 122],
  freeView: [62, 84],
  notes: 'Core calibration band for mainstream LATAM FHD+ phones.',
};

export const ARES_V6_PPI_CALIBRATION_BANDS = [
  {
    minInclusive: 0,
    maxInclusive: 319,
    label: 'HD+ / budget low-density',
    general: [190, 200],
    redPoint: [175, 190],
    scope2x: [160, 182],
    scope4x: [138, 165],
    sniperScope: [118, 145],
    freeView: [72, 95],
    notes: 'Low-density screens need higher touch sensitivity and careful scope protection.',
  },
  {
    minInclusive: 320,
    maxInclusive: 359,
    label: 'Low-mid density',
    general: [185, 200],
    redPoint: [170, 185],
    scope2x: [155, 178],
    scope4x: [135, 160],
    sniperScope: [125, 140],
    freeView: [70, 92],
    notes: 'Good for drag if Red Point is tuned carefully.',
  },
  {
    minInclusive: 360,
    maxInclusive: 389,
    label: 'Balanced mid density',
    general: [175, 190],
    redPoint: [160, 175],
    scope2x: [150, 172],
    scope4x: [130, 155],
    sniperScope: [117, 132],
    freeView: [66, 88],
    notes: 'Fast without being chaotic.',
  },
  ARES_V6_DEFAULT_PPI_BAND,
  {
    minInclusive: 450,
    maxInclusive: 519,
    label: 'High-density flagship',
    general: [155, 172],
    redPoint: [140, 157],
    scope2x: [132, 154],
    scope4x: [112, 138],
    sniperScope: [95, 112],
    freeView: [58, 78],
    notes: 'Lower raw values reduce jitter and overshoot.',
  },
  {
    minInclusive: 520,
    maxInclusive: null,
    label: 'Ultra high-density / QHD',
    general: [140, 152],
    redPoint: [125, 137],
    scope2x: [118, 134],
    scope4x: [98, 122],
    sniperScope: [80, 92],
    freeView: [50, 70],
    notes: 'Ultra high density requires controlled scope values.',
  },
] as const satisfies readonly PpiCalibrationBand[];

export interface SignalAdjustmentRule {
  signal: string;
  when: string;
  delta: Partial<AresV6SensitivityVector>;
  explanation: string;
}

export const ARES_V6_DEVICE_SIGNAL_RULES = [
  { signal: 'RAM', when: 'ramGb <= 2', delta: { general: 8, redPoint: 6, scope4x: -4, sniperScope: -5 }, explanation: 'Very low RAM needs close-range compensation.' },
  { signal: 'RAM', when: 'ramGb <= 4', delta: { general: 3, redPoint: 2, scope4x: -2, sniperScope: -3 }, explanation: 'Budget RAM needs a small boost with scope protection.' },
  { signal: 'Hz', when: 'screenHz <= 60', delta: { general: 4, redPoint: 3, freeView: 2 }, explanation: '60Hz feels less responsive.' },
  { signal: 'Hz', when: 'screenHz >= 120', delta: { general: -2, redPoint: -1, scope4x: -2 }, explanation: 'High refresh allows lower raw sensitivity.' },
  { signal: 'Panel', when: 'panelType is AMOLED/OLED/LTPO', delta: { general: -1, redPoint: -1, scope4x: -1 }, explanation: 'Premium panels can run slightly lower values.' },
  { signal: 'Screen size', when: 'screenSize >= 6.8', delta: { general: -3, redPoint: -2, freeView: 2 }, explanation: 'Large screens need less raw drag sensitivity.' },
  { signal: 'Thermal', when: 'thermalState is HOT/THROTTLING', delta: { general: 3, redPoint: 2, scope4x: -4, sniperScope: -4 }, explanation: 'Unstable performance needs close-range compensation.' },
] as const satisfies readonly SignalAdjustmentRule[];

export interface SymptomTuningRule {
  symptom: AresV6Symptom;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  delta: Partial<AresV6SensitivityVector> & { fireButtonDelta?: number };
  testProtocol: string;
  warning: string;
}

export const ARES_V6_SYMPTOM_TUNING_RULES = [
  { symptom: 'CROSSHAIR_DOES_NOT_REACH_HEAD', priority: 'CRITICAL', delta: { redPoint: 5, general: 2 }, testProtocol: 'Training: 30 red-dot drags before touching other sliders.', warning: 'Adjust Red Point first; never move all sliders at once.' },
  { symptom: 'CROSSHAIR_OVERSHOOTS_HEAD', priority: 'CRITICAL', delta: { redPoint: -5, general: -2 }, testProtocol: 'Training: 30 chest-to-head drags and re-check.', warning: 'Do not over-correct below the PPI band floor.' },
  { symptom: 'AIM_SHAKES', priority: 'HIGH', delta: { general: -4, redPoint: -4, scope2x: -3, scope4x: -6 }, testProtocol: 'Test AR bursts at 15m and 30m.', warning: 'Shake can come from sensitivity, heat, FPS or button size.' },
  { symptom: 'SCOPE_4X_UNCONTROLLABLE', priority: 'HIGH', delta: { scope4x: -8, sniperScope: -4 }, testProtocol: 'Test 4x short bursts at 30m.', warning: 'Do not reduce Red Point for a 4x-only issue.' },
  { symptom: 'AWM_TOO_SLOW', priority: 'MEDIUM', delta: { sniperScope: 5 }, testProtocol: 'Run 20 quickscopes and keep half-change if needed.', warning: 'AWM should stay lower than Red Point.' },
  { symptom: 'AWM_OVERSHOOTS', priority: 'MEDIUM', delta: { sniperScope: -5 }, testProtocol: 'Run static and moving quickscope checks.', warning: 'Do not over-lower if static shots are fine.' },
  { symptom: 'CANNOT_TURN_FAST', priority: 'MEDIUM', delta: { general: 6, freeView: 8 }, testProtocol: 'Do ten 180-degree turns in training.', warning: 'If headshot overshoots, lower only Red Point slightly.' },
  { symptom: 'FIRE_BUTTON_TOO_BIG', priority: 'MEDIUM', delta: { fireButtonDelta: -4 }, testProtocol: 'Play one CS round and check visibility.', warning: 'Button size affects aim as much as sensitivity.' },
  { symptom: 'FIRE_BUTTON_TOO_SMALL', priority: 'MEDIUM', delta: { fireButtonDelta: 4 }, testProtocol: 'Do 30 moving drags and check mis-taps.', warning: 'Large buttons help touch reliability but can block vision.' },
  { symptom: 'DEVICE_LAGS', priority: 'HIGH', delta: { general: 4, redPoint: 3, scope4x: -5, sniperScope: -5, fireButtonDelta: 3 }, testProtocol: 'Validate in a real CS match, not only training.', warning: 'Keep recommendations inside manual in-game settings.' },
] as const satisfies readonly SymptomTuningRule[];

export interface WeaponCalibrationRule {
  category: AresV6WeaponCategory;
  role: string;
  sensitivityBias: Partial<AresV6SensitivityVector>;
  fireButtonDelta: number;
  preferredDrag: 'VERTICAL' | 'ROTATION_J' | 'DIRECTIONAL' | 'HYBRID';
  trainingFocus: string;
}

export const ARES_V6_WEAPON_CALIBRATION_RULES = [
  { category: 'SHOTGUN', role: 'One-tap close-range burst', sensitivityBias: { general: 4, redPoint: 7, scope4x: -6, sniperScope: -8 }, fireButtonDelta: 4, preferredDrag: 'ROTATION_J', trainingFocus: 'J-drag at close range.' },
  { category: 'SMG', role: 'Close/mid tracking', sensitivityBias: { general: 3, redPoint: 4, scope2x: 3, scope4x: -3 }, fireButtonDelta: 2, preferredDrag: 'VERTICAL', trainingFocus: 'Tracking while strafing.' },
  { category: 'AR_HEAVY', role: 'High damage recoil control', sensitivityBias: { general: -1, scope2x: -2, scope4x: -8, sniperScope: -4 }, fireButtonDelta: -2, preferredDrag: 'VERTICAL', trainingFocus: 'Short bursts at mid range.' },
  { category: 'SNIPER', role: 'Quickscope and long-range precision', sensitivityBias: { general: -6, redPoint: -2, scope4x: -6, sniperScope: -12 }, fireButtonDelta: -4, preferredDrag: 'DIRECTIONAL', trainingFocus: 'Static and moving quickscope checks.' },
  { category: 'PISTOL', role: 'Sidearm one-tap reaction', sensitivityBias: { general: 4, redPoint: 6, scope2x: 2 }, fireButtonDelta: 1, preferredDrag: 'ROTATION_J', trainingFocus: 'One-tap chest-to-head drills.' },
] as const satisfies readonly WeaponCalibrationRule[];

export function getPpiCalibrationBand(ppi: number): PpiCalibrationBand {
  const band = ARES_V6_PPI_CALIBRATION_BANDS.find((item) => {
    const max = item.maxInclusive ?? Number.POSITIVE_INFINITY;
    return ppi >= item.minInclusive && ppi <= max;
  });

  return band ?? ARES_V6_DEFAULT_PPI_BAND;
}
