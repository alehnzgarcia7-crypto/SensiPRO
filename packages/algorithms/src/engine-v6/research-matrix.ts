import type { AresV6Symptom, AresV6SensitivityVector, AresV6WeaponCategory } from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Research Matrix
//
// This is not yet the final calculator. It is the calibration atlas
// used by Phase 1 to build the deterministic v6 engine.
// ═══════════════════════════════════════════════════════════════

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

/**
 * Modern Free Fire scale reference: 1-200.
 *
 * These bands are the v6 calibration north-star:
 * lower PPI/HD+ panels need more touch sensitivity; high-PPI/OLED devices
 * need less raw sensitivity and more controlled scope values.
 */
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
    notes: 'Very low density or missing PPI. Aggressive values compensate heavy-feeling touch, but confidence must be lowered if PPI is inferred.',
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
    notes: 'Common older iPhones and HD+/LCD Androids. Good for drag if red point is tuned carefully.',
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
    notes: 'Very common in LATAM mid-range devices. Should feel fast without being chaotic.',
  },
  {
    minInclusive: 390,
    maxInclusive: 449,
    label: 'FHD+ mainstream sweet spot',
    general: [168, 182],
    redPoint: [153, 167],
    scope2x: [142, 165],
    scope4x: [122, 148],
    sniperScope: [108, 122],
    freeView: [62, 84],
    notes: 'Core calibration band for Samsung A-series, Redmi Note, Moto G, POCO, Realme and many 2023-2026 Androids.',
  },
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
    notes: 'iPhones, premium OLED Androids and flagships. Lower raw values reduce jitter and overshoot.',
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
    notes: 'QHD/ultra flagships. High PPI punishes over-sensitivity; scope values must stay controlled.',
  },
] as const satisfies readonly PpiCalibrationBand[];

export interface SignalAdjustmentRule {
  signal: string;
  when: string;
  delta: Partial<AresV6SensitivityVector>;
  explanation: string;
}

export const ARES_V6_DEVICE_SIGNAL_RULES = [
  {
    signal: 'RAM',
    when: 'ramGb <= 2',
    delta: { general: 8, redPoint: 6, scope4x: -4, sniperScope: -5 },
    explanation: 'Very low RAM feels heavy and unstable; boost close-range response but protect long scopes.',
  },
  {
    signal: 'RAM',
    when: 'ramGb <= 4',
    delta: { general: 3, redPoint: 2, scope4x: -2, sniperScope: -3 },
    explanation: 'Budget RAM needs a small close-range boost with scope protection.',
  },
  {
    signal: 'Hz',
    when: 'screenHz <= 60',
    delta: { general: 4, redPoint: 3, freeView: 2 },
    explanation: '60Hz feels less responsive, so the player needs slightly faster camera response.',
  },
  {
    signal: 'Hz',
    when: 'screenHz >= 120',
    delta: { general: -2, redPoint: -1, scope4x: -2 },
    explanation: 'High refresh devices can run lower raw sensitivity with better stability.',
  },
  {
    signal: 'Panel',
    when: 'panelType is AMOLED/OLED/LTPO',
    delta: { general: -1, redPoint: -1, scope4x: -1 },
    explanation: 'Premium panels feel more precise; slightly lower values avoid overflick.',
  },
  {
    signal: 'Screen size',
    when: 'screenSize >= 6.8',
    delta: { general: -3, redPoint: -2, freeView: 2 },
    explanation: 'Large screens need less raw drag sensitivity but benefit from more camera awareness.',
  },
  {
    signal: 'Thermal',
    when: 'thermalState is HOT/THROTTLING',
    delta: { general: 3, redPoint: 2, scope4x: -4, sniperScope: -4 },
    explanation: 'Thermal throttling creates unstable fights; boost close-range while protecting zoom.',
  },
] as const satisfies readonly SignalAdjustmentRule[];

export interface SymptomTuningRule {
  symptom: AresV6Symptom;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  delta: Partial<AresV6SensitivityVector> & { fireButtonDelta?: number };
  testProtocol: string;
  warning: string;
}

export const ARES_V6_SYMPTOM_TUNING_RULES = [
  {
    symptom: 'CROSSHAIR_DOES_NOT_REACH_HEAD',
    priority: 'CRITICAL',
    delta: { redPoint: 5, general: 2 },
    testProtocol: 'Training Ground: 30 drags with red dot only. Do not touch 2x/4x until red dot lands consistently.',
    warning: 'Never raise every slider at once; Punto Rojo is the primary headshot correction.',
  },
  {
    symptom: 'CROSSHAIR_OVERSHOOTS_HEAD',
    priority: 'CRITICAL',
    delta: { redPoint: -5, general: -2 },
    testProtocol: 'Training Ground: 30 drags at chest-to-head height. If overshoot remains, repeat once only.',
    warning: 'Do not over-correct below the PPI band floor or close-range will feel dead.',
  },
  {
    symptom: 'AIM_SHAKES',
    priority: 'HIGH',
    delta: { general: -4, redPoint: -4, scope2x: -3, scope4x: -6 },
    testProtocol: 'Shoot a wall with AR bursts at 15m and 30m. Evaluate recoil before changing AWM.',
    warning: 'Shake can be caused by high sensitivity, heat, weak FPS or too-small fire button.',
  },
  {
    symptom: 'SCOPE_4X_UNCONTROLLABLE',
    priority: 'HIGH',
    delta: { scope4x: -8, sniperScope: -4 },
    testProtocol: 'Use 4x at 30m with AR. Fire 5 short bursts, not full spray.',
    warning: '4x tuning must not reduce Punto Rojo; close-range headshot and 4x are different systems.',
  },
  {
    symptom: 'AWM_TOO_SLOW',
    priority: 'MEDIUM',
    delta: { sniperScope: 5 },
    testProtocol: 'Run 20 quickscopes. If it starts overshooting, revert half the change.',
    warning: 'AWM is intentionally lower than red dot. Do not force AWM to red-dot levels.',
  },
  {
    symptom: 'AWM_OVERSHOOTS',
    priority: 'MEDIUM',
    delta: { sniperScope: -5 },
    testProtocol: 'Run 20 quickscopes at static targets, then 10 moving targets.',
    warning: 'If moving targets fail but static is fine, use Direction Drag training instead of lowering too much.',
  },
  {
    symptom: 'CANNOT_TURN_FAST',
    priority: 'MEDIUM',
    delta: { general: 6, freeView: 8 },
    testProtocol: 'Do ten 180-degree turns in training. Camera should turn without losing target level.',
    warning: 'If headshot starts overshooting after this, lower only redPoint by 2-3.',
  },
  {
    symptom: 'FIRE_BUTTON_TOO_BIG',
    priority: 'MEDIUM',
    delta: { fireButtonDelta: -4 },
    testProtocol: 'Play one CS round. Confirm you can drag without blocking enemy visibility.',
    warning: 'Button size affects aim as much as sensitivity. Do not ignore HUD ergonomics.',
  },
  {
    symptom: 'FIRE_BUTTON_TOO_SMALL',
    priority: 'MEDIUM',
    delta: { fireButtonDelta: 4 },
    testProtocol: 'Do 30 drags while moving. If mis-taps disappear, keep the change.',
    warning: 'Large buttons help budget devices but can block vision on small screens.',
  },
  {
    symptom: 'DEVICE_LAGS',
    priority: 'HIGH',
    delta: { general: 4, redPoint: 3, scope4x: -5, sniperScope: -5, fireButtonDelta: 3 },
    testProtocol: 'Test in a real CS match after closing background apps. Training Ground is not enough for lag validation.',
    warning: 'Do not recommend external GFX tools or APKs. Keep all advice inside legal/manual settings.',
  },
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
  {
    category: 'SHOTGUN',
    role: 'One-tap close-range burst',
    sensitivityBias: { general: 4, redPoint: 7, scope4x: -6, sniperScope: -8 },
    fireButtonDelta: 4,
    preferredDrag: 'ROTATION_J',
    trainingFocus: 'J-drag at 3m, 5m and 8m with M1887/M1014.',
  },
  {
    category: 'SMG',
    role: 'Close/mid tracking',
    sensitivityBias: { general: 3, redPoint: 4, scope2x: 3, scope4x: -3 },
    fireButtonDelta: 2,
    preferredDrag: 'VERTICAL',
    trainingFocus: 'MP40/UMP tracking while strafing; avoid full panic drag.',
  },
  {
    category: 'AR_HEAVY',
    role: 'High damage recoil control',
    sensitivityBias: { general: -1, scope2x: -2, scope4x: -8, sniperScope: -4 },
    fireButtonDelta: -2,
    preferredDrag: 'VERTICAL',
    trainingFocus: 'Short bursts at 25m and 35m. Never full spray first.',
  },
  {
    category: 'SNIPER',
    role: 'Quickscope and long-range precision',
    sensitivityBias: { general: -6, redPoint: -2, scope4x: -6, sniperScope: -12 },
    fireButtonDelta: -4,
    preferredDrag: 'DIRECTIONAL',
    trainingFocus: '20 static quickscopes + 10 moving target direction drags.',
  },
  {
    category: 'PISTOL',
    role: 'Sidearm one-tap reaction',
    sensitivityBias: { general: 4, redPoint: 6, scope2x: 2 },
    fireButtonDelta: 1,
    preferredDrag: 'ROTATION_J',
    trainingFocus: 'Desert Eagle one-tap from chest to head at 8m-15m.',
  },
] as const satisfies readonly WeaponCalibrationRule[];

export function getPpiCalibrationBand(ppi: number): PpiCalibrationBand {
  const band = ARES_V6_PPI_CALIBRATION_BANDS.find((item) => {
    const max = item.maxInclusive ?? Number.POSITIVE_INFINITY;
    return ppi >= item.minInclusive && ppi <= max;
  });

  return band ?? ARES_V6_PPI_CALIBRATION_BANDS[2];
}
