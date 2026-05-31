// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Domain Contracts
// SensiPRO refoundation: the new source of truth starts here.
//
// This file intentionally contains types only. It does not depend on
// Prisma so the engine can be tested as a pure algorithmic core.
// ═══════════════════════════════════════════════════════════════

export type AresV6GameMode =
  | 'BATTLE_ROYALE'
  | 'CLASH_SQUAD'
  | 'LONE_WOLF'
  | 'TRAINING'
  | 'CUSTOM_ROOM'
  | 'TOURNAMENT';

export type AresV6Client = 'FREE_FIRE' | 'FREE_FIRE_MAX';

export type AresV6PanelType = 'LCD' | 'IPS' | 'AMOLED' | 'OLED' | 'LTPO';
export type AresV6DeviceTier = 'LOW' | 'MID' | 'HIGH' | 'ULTRA' | 'GAMING';

export type AresV6FingerCount = 2 | 3 | 4 | 5;
export type AresV6HandDominance = 'RIGHT' | 'LEFT' | 'AMBIDEXTROUS';

export type AresV6Playstyle =
  | 'STANDARD'
  | 'RUSH'
  | 'ONE_TAP'
  | 'TODO_ROJO'
  | 'SNIPER'
  | 'FREESTYLE'
  | 'LOW_END_STABLE'
  | 'GYRO_CONTROL'
  | 'FOUR_FINGER_PRO'
  | 'CUSTOM';

export type AresV6PresetId =
  | 'STANDARD_PRO'
  | 'TODO_ROJO'
  | 'X_METHOD'
  | 'ONE_TAP'
  | 'BRAZIL_RUSH'
  | 'CLASH_SQUAD'
  | 'BATTLE_ROYALE'
  | 'SNIPER_AWM'
  | 'LOW_END_STABLE'
  | 'ANDROID_BUDGET'
  | 'IPHONE_SMOOTH'
  | 'FOUR_FINGER_PRO'
  | 'THREE_FINGER_COMPETITIVE'
  | 'GYRO_LIGHT'
  | 'GYRO_PRO'
  | 'SMG_TRACKING'
  | 'SHOTGUN_DRAG'
  | 'AR_RECOIL_CONTROL'
  | 'FREESTYLE_CLIPS'
  | 'CUSTOM_LAB';

export type AresV6WeaponCategory =
  | 'SHOTGUN'
  | 'SMG'
  | 'AR_FAST'
  | 'AR_HEAVY'
  | 'MARKSMAN'
  | 'SNIPER'
  | 'PISTOL'
  | 'SPECIAL';

export type AresV6RangeProfile = 'CLOSE' | 'MID' | 'LONG' | 'ALL';

export type AresV6ThermalState = 'COLD' | 'NORMAL' | 'HOT' | 'THROTTLING';
export type AresV6GraphicsQuality = 'SMOOTH' | 'STANDARD' | 'ULTRA' | 'MAXED';

export type AresV6Symptom =
  | 'CROSSHAIR_DOES_NOT_REACH_HEAD'
  | 'CROSSHAIR_OVERSHOOTS_HEAD'
  | 'AIM_SHAKES'
  | 'RED_DOT_GOOD_SCOPES_BAD'
  | 'SCOPE_2X_UNSTABLE'
  | 'SCOPE_4X_UNCONTROLLABLE'
  | 'AWM_TOO_SLOW'
  | 'AWM_OVERSHOOTS'
  | 'CANNOT_TURN_FAST'
  | 'LOSES_CLOSE_RANGE'
  | 'LOSES_LONG_RANGE'
  | 'RECOIL_TOO_HIGH'
  | 'FIRE_BUTTON_TOO_BIG'
  | 'FIRE_BUTTON_TOO_SMALL'
  | 'GLOO_WALL_SLOW'
  | 'DEVICE_LAGS'
  | 'PHONE_HEATS_UP'
  | 'PING_SPIKES';

export interface AresV6DeviceSignal {
  brand: string;
  model: string;
  screenSize: number;
  ramGb: number;
  screenHz: number;
  panelType: AresV6PanelType;
  tier: AresV6DeviceTier;

  /** Physical screen pixel density. Highest-priority driver for v6. */
  ppi?: number;

  /** Historical alias kept because the current DB stores this as screenDpi. */
  screenDpi?: number;

  chipset?: string;
  releaseYear?: number;
  os?: 'ANDROID' | 'IOS' | 'HARMONY' | 'UNKNOWN';

  client?: AresV6Client;
  graphicsQuality?: AresV6GraphicsQuality;
  highFpsMode?: boolean;
  frameBoostEnabled?: boolean;
  thermalState?: AresV6ThermalState;
  pingMs?: number;
  hasScreenProtector?: boolean;
  inputLagHint?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AresV6PlayerSignal {
  fingers: AresV6FingerCount;
  handDominance?: AresV6HandDominance;
  playstyle: AresV6Playstyle;
  mode: AresV6GameMode;
  preferredRange?: AresV6RangeProfile;
  primaryWeaponCategory?: AresV6WeaponCategory;
  secondaryWeaponCategory?: AresV6WeaponCategory;
  usesGyroscope?: boolean;
  currentRank?:
    | 'BRONZE'
    | 'SILVER'
    | 'GOLD'
    | 'PLATINUM'
    | 'DIAMOND'
    | 'HEROIC'
    | 'GRANDMASTER'
    | 'PRO';
  symptoms?: readonly AresV6Symptom[];
}

export interface AresV6SensitivityVector {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

export interface AresV6GyroscopeVector {
  gyroGeneral: number;
  gyroRedPoint: number;
  gyroScope2x: number;
  gyroScope4x: number;
  gyroSniper: number;
  gyroFreeView: number;
}

export interface AresV6FireButtonRecommendation {
  sizePercent: number;
  opacityPercent: number;
  recommendedFinger: AresV6FingerCount;
  placement: 'LOW_RIGHT' | 'MID_RIGHT' | 'TOP_RIGHT' | 'CUSTOM';
  dragZone: 'VERTICAL' | 'ROTATION_J' | 'DIRECTIONAL' | 'HYBRID';
  explanation: string;
}

export interface AresV6DpiRecommendation {
  mode: 'NO_DPI' | 'DPI_SUGGESTED';
  detectedPpi: number | null;
  suggestedSmallestWidth?: number;
  confidence: number;
  explanation: string;
}

export interface AresV6HudRecommendation {
  layoutFamily: 'TWO_FINGER' | 'THREE_FINGER' | 'FOUR_FINGER' | 'FIVE_FINGER' | 'TABLET';
  priorityButtons: readonly string[];
  riskNotes: readonly string[];
  nextUpgradePath?: string;
}

export interface AresV6ConfidenceScore {
  score: number;
  grade: 'LOW' | 'MEDIUM' | 'HIGH' | 'LAB_VERIFIED';
  missingSignals: readonly string[];
  warnings: readonly string[];
}

export interface AresV6Explanation {
  headline: string;
  bullets: readonly string[];
  technicalNotes: readonly string[];
}

export interface AresV6TuningStep {
  symptom: AresV6Symptom;
  adjustment: Partial<AresV6SensitivityVector> & {
    fireButtonDelta?: number;
    presetFallback?: AresV6PresetId;
  };
  instruction: string;
  testProtocol: string;
}

export interface AresV6GenerationInput {
  device: AresV6DeviceSignal;
  player: AresV6PlayerSignal;
  presetId: AresV6PresetId;
}

export interface AresV6GenerationOutput {
  algorithmVersion: 'ARES-v6-refoundation';
  presetId: AresV6PresetId;
  sensitivity: AresV6SensitivityVector;
  gyroscope: AresV6GyroscopeVector | null;
  dpi: AresV6DpiRecommendation;
  fireButton: AresV6FireButtonRecommendation;
  hud: AresV6HudRecommendation;
  confidence: AresV6ConfidenceScore;
  explanation: AresV6Explanation;
  firstTuningSteps: readonly AresV6TuningStep[];
}

export interface AresV6Preset {
  id: AresV6PresetId;
  publicName: string;
  internalName: string;
  category: 'CORE' | 'HEADSHOT' | 'MODE' | 'DEVICE' | 'FINGERS' | 'GYRO' | 'WEAPON' | 'LAB';
  description: string;
  intendedFor: readonly string[];
  sensitivityBias: {
    general: number;
    redPoint: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeView: number;
  };
  fireButtonBias: number;
  gyroBias: number;
  recommendedModes: readonly AresV6GameMode[];
  recommendedWeapons: readonly AresV6WeaponCategory[];
  riskLevel: 'SAFE' | 'MEDIUM' | 'ADVANCED';
  validationStatus: 'RESEARCH_BACKED' | 'NEEDS_LAB_DATA' | 'EXPERIMENTAL';
}