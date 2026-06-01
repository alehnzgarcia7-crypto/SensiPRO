import { z } from 'zod';

import {
  ARES_V6_PRESETS,
  type AresV6Client,
  type AresV6GameMode,
  type AresV6GraphicsQuality,
  type AresV6HandDominance,
  type AresV6Playstyle,
  type AresV6PresetId,
  type AresV6RangeProfile,
  type AresV6Symptom,
  type AresV6ThermalState,
  type AresV6WeaponCategory,
} from '@ares/algorithms/engine-v6';

// ═══════════════════════════════════════════════════════════════
// ARES v6 — Request schema (Zod)
//
// Validates the POST /api/generate/v6 body. Enums are kept exhaustive: the
// preset list is derived from the engine's source of truth, and the rest use
// a Record-keyed helper so a missing union member is a compile error.
// ═══════════════════════════════════════════════════════════════

const MAX_SYMPTOMS_PER_REQUEST = 5;

/** Build a Zod enum from a Record keyed by the full string union (forces completeness). */
function zEnumFromUnion<T extends string>(values: Record<T, true>): z.ZodEnum<[T, ...T[]]> {
  const keys = Object.keys(values) as [T, ...T[]];
  return z.enum(keys);
}

const presetIds = ARES_V6_PRESETS.map((preset) => preset.id) as [AresV6PresetId, ...AresV6PresetId[]];

const gameModeSchema = zEnumFromUnion<AresV6GameMode>({
  BATTLE_ROYALE: true,
  CLASH_SQUAD: true,
  LONE_WOLF: true,
  TRAINING: true,
  CUSTOM_ROOM: true,
  TOURNAMENT: true,
});

const playstyleSchema = zEnumFromUnion<AresV6Playstyle>({
  STANDARD: true,
  RUSH: true,
  ONE_TAP: true,
  TODO_ROJO: true,
  SNIPER: true,
  FREESTYLE: true,
  LOW_END_STABLE: true,
  GYRO_CONTROL: true,
  FOUR_FINGER_PRO: true,
  CUSTOM: true,
});

const weaponCategorySchema = zEnumFromUnion<AresV6WeaponCategory>({
  SHOTGUN: true,
  SMG: true,
  AR_FAST: true,
  AR_HEAVY: true,
  MARKSMAN: true,
  SNIPER: true,
  PISTOL: true,
  SPECIAL: true,
});

const rangeProfileSchema = zEnumFromUnion<AresV6RangeProfile>({
  CLOSE: true,
  MID: true,
  LONG: true,
  ALL: true,
});

const handDominanceSchema = zEnumFromUnion<AresV6HandDominance>({
  RIGHT: true,
  LEFT: true,
  AMBIDEXTROUS: true,
});

const currentRankSchema = z.enum([
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'HEROIC',
  'GRANDMASTER',
  'PRO',
]);

const symptomSchema = zEnumFromUnion<AresV6Symptom>({
  CROSSHAIR_DOES_NOT_REACH_HEAD: true,
  CROSSHAIR_OVERSHOOTS_HEAD: true,
  AIM_SHAKES: true,
  RED_DOT_GOOD_SCOPES_BAD: true,
  SCOPE_2X_UNSTABLE: true,
  SCOPE_4X_UNCONTROLLABLE: true,
  AWM_TOO_SLOW: true,
  AWM_OVERSHOOTS: true,
  CANNOT_TURN_FAST: true,
  LOSES_CLOSE_RANGE: true,
  LOSES_LONG_RANGE: true,
  RECOIL_TOO_HIGH: true,
  FIRE_BUTTON_TOO_BIG: true,
  FIRE_BUTTON_TOO_SMALL: true,
  GLOO_WALL_SLOW: true,
  DEVICE_LAGS: true,
  PHONE_HEATS_UP: true,
  PING_SPIKES: true,
});

const clientSchema = zEnumFromUnion<AresV6Client>({
  FREE_FIRE: true,
  FREE_FIRE_MAX: true,
});

const graphicsQualitySchema = zEnumFromUnion<AresV6GraphicsQuality>({
  SMOOTH: true,
  STANDARD: true,
  ULTRA: true,
  MAXED: true,
});

const thermalStateSchema = zEnumFromUnion<AresV6ThermalState>({
  COLD: true,
  NORMAL: true,
  HOT: true,
  THROTTLING: true,
});

const inputLagHintSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

const fingersSchema = z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

const playerSchema = z.object({
  fingers: fingersSchema,
  handDominance: handDominanceSchema.optional(),
  playstyle: playstyleSchema,
  mode: gameModeSchema,
  preferredRange: rangeProfileSchema.optional(),
  primaryWeaponCategory: weaponCategorySchema.optional(),
  secondaryWeaponCategory: weaponCategorySchema.optional(),
  usesGyroscope: z.boolean().optional(),
  currentRank: currentRankSchema.optional(),
  symptoms: z.array(symptomSchema).max(MAX_SYMPTOMS_PER_REQUEST).optional(),
});

const overridesSchema = z.object({
  ramGb: z.number().int().min(1).max(32).optional(),
  screenHz: z.number().int().min(30).max(240).optional(),
  ppi: z.number().int().min(200).max(700).optional(),
  client: clientSchema.optional(),
  graphicsQuality: graphicsQualitySchema.optional(),
  highFpsMode: z.boolean().optional(),
  frameBoostEnabled: z.boolean().optional(),
  thermalState: thermalStateSchema.optional(),
  pingMs: z.number().int().min(0).max(999).optional(),
  hasScreenProtector: z.boolean().optional(),
  inputLagHint: inputLagHintSchema.optional(),
});

export const aresV6GenerateRequestSchema = z.object({
  deviceId: z.string().cuid('deviceId inválido'),
  presetId: z.enum(presetIds),
  player: playerSchema,
  overrides: overridesSchema.optional(),
});

export type AresV6GenerateRequest = z.infer<typeof aresV6GenerateRequestSchema>;
