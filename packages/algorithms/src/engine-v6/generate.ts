import { getAresV6Preset } from './presets';
import {
  ARES_V6_DEVICE_SIGNAL_RULES,
  ARES_V6_SYMPTOM_TUNING_RULES,
  ARES_V6_WEAPON_CALIBRATION_RULES,
} from './research-matrix';
import type {
  AresV6DeviceSignal,
  AresV6FireButtonRecommendation,
  AresV6GenerationInput,
  AresV6GenerationOutput,
  AresV6GyroscopeVector,
  AresV6HudRecommendation,
  AresV6SensitivityVector,
  AresV6TuningStep,
  AresV6WeaponCategory,
} from './types';
import { calculateBaseSensitivityFromPpi, resolveEffectivePpi } from './dpi-curve';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — First Deterministic Scaffold
//
// This is intentionally pure and isolated. Phase 0 exposes the shape
// of the new engine without replacing legacy production routes.
// ═══════════════════════════════════════════════════════════════

const SENS_MIN = 1;
const SENS_MAX = 200;
const GYRO_MIN = 1;
const GYRO_MAX = 100;

function clamp(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function clampSensitivity(value: number): number {
  return clamp(value, SENS_MIN, SENS_MAX);
}

function applyDelta(
  base: AresV6SensitivityVector,
  delta: Partial<AresV6SensitivityVector>,
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

function getDeviceSignalDelta(device: AresV6DeviceSignal): Partial<AresV6SensitivityVector> {
  let delta: Partial<AresV6SensitivityVector> = {};

  const add = (next: Partial<AresV6SensitivityVector>) => {
    delta = {
      general: (delta.general ?? 0) + (next.general ?? 0),
      redPoint: (delta.redPoint ?? 0) + (next.redPoint ?? 0),
      scope2x: (delta.scope2x ?? 0) + (next.scope2x ?? 0),
      scope4x: (delta.scope4x ?? 0) + (next.scope4x ?? 0),
      sniperScope: (delta.sniperScope ?? 0) + (next.sniperScope ?? 0),
      freeView: (delta.freeView ?? 0) + (next.freeView ?? 0),
    };
  };

  if (device.ramGb <= 2) add(ARES_V6_DEVICE_SIGNAL_RULES[0].delta);
  else if (device.ramGb <= 4) add(ARES_V6_DEVICE_SIGNAL_RULES[1].delta);

  if (device.screenHz <= 60) add(ARES_V6_DEVICE_SIGNAL_RULES[2].delta);
  else if (device.screenHz >= 120) add(ARES_V6_DEVICE_SIGNAL_RULES[3].delta);

  if (['AMOLED', 'OLED', 'LTPO'].includes(device.panelType)) {
    add(ARES_V6_DEVICE_SIGNAL_RULES[4].delta);
  }

  if (device.screenSize >= 6.8) add(ARES_V6_DEVICE_SIGNAL_RULES[5].delta);

  if (device.thermalState === 'HOT' || device.thermalState === 'THROTTLING') {
    add(ARES_V6_DEVICE_SIGNAL_RULES[6].delta);
  }

  if (device.client === 'FREE_FIRE_MAX') {
    add({ general: -2, redPoint: -1, scope4x: -2, sniperScope: -2 });
  }

  if (device.frameBoostEnabled) {
    add({ general: -1, redPoint: -1, scope4x: -1 });
  }

  if (device.pingMs && device.pingMs >= 120) {
    add({ general: 2, redPoint: 2, scope4x: -3 });
  }

  return delta;
}

function getWeaponDelta(category?: AresV6WeaponCategory): Partial<AresV6SensitivityVector> {
  if (!category) return {};
  return ARES_V6_WEAPON_CALIBRATION_RULES.find((rule) => rule.category === category)?.sensitivityBias ?? {};
}

function getDragZone(category?: AresV6WeaponCategory): AresV6FireButtonRecommendation['dragZone'] {
  const preferred = ARES_V6_WEAPON_CALIBRATION_RULES.find((rule) => rule.category === category)?.preferredDrag;
  switch (preferred) {
    case 'ROTATION_J': return 'ROTATION_J';
    case 'DIRECTIONAL': return 'DIRECTIONAL';
    case 'HYBRID': return 'HYBRID';
    case 'VERTICAL':
    default:
      return 'VERTICAL';
  }
}

function getFireButtonBase(fingers: number, screenSize: number): number {
  const screenCat = screenSize < 6.0
    ? 'small'
    : screenSize <= 6.5
      ? 'medium'
      : screenSize <= 6.8
        ? 'large'
        : 'xlarge';

  const table = {
    2: { small: 70, medium: 65, large: 60, xlarge: 55 },
    3: { small: 60, medium: 55, large: 52, xlarge: 48 },
    4: { small: 55, medium: 50, large: 48, xlarge: 44 },
    5: { small: 50, medium: 46, large: 43, xlarge: 40 },
  } as const;

  const safeFingers = fingers === 2 || fingers === 3 || fingers === 4 || fingers === 5 ? fingers : 3;
  return table[safeFingers][screenCat];
}

function buildFireButton(input: AresV6GenerationInput): AresV6FireButtonRecommendation {
  const preset = getAresV6Preset(input.presetId);
  const weaponRule = ARES_V6_WEAPON_CALIBRATION_RULES.find(
    (rule) => rule.category === input.player.primaryWeaponCategory,
  );
  const base = getFireButtonBase(input.player.fingers, input.device.screenSize);
  const sizePercent = clamp(base + preset.fireButtonBias + (weaponRule?.fireButtonDelta ?? 0), 35, 80);

  const placement = input.player.fingers >= 4
    ? 'TOP_RIGHT'
    : input.player.fingers === 3
      ? 'MID_RIGHT'
      : 'LOW_RIGHT';

  return {
    sizePercent,
    opacityPercent: input.player.fingers >= 4 ? 50 : input.player.fingers === 3 ? 55 : 60,
    recommendedFinger: input.player.fingers,
    placement,
    dragZone: getDragZone(input.player.primaryWeaponCategory),
    explanation: `Botón calculado para ${input.player.fingers} dedos, pantalla ${input.device.screenSize}" y preset ${preset.publicName}.`,
  };
}

function buildHud(input: AresV6GenerationInput): AresV6HudRecommendation {
  const fingers = input.player.fingers;
  const layoutFamily = input.device.screenSize >= 7.2
    ? 'TABLET'
    : fingers === 5
      ? 'FIVE_FINGER'
      : fingers === 4
        ? 'FOUR_FINGER'
        : fingers === 3
          ? 'THREE_FINGER'
          : 'TWO_FINGER';

  const priorityButtons = fingers >= 4
    ? ['Disparo', 'Mira', 'Agacharse', 'Saltar', 'Gloo Wall', 'Cambio de arma']
    : fingers === 3
      ? ['Disparo', 'Mira', 'Gloo Wall', 'Cambio de arma']
      : ['Disparo', 'Gloo Wall', 'Saltar'];

  const riskNotes: string[] = [];
  if (input.device.screenSize < 6.0) riskNotes.push('Pantalla pequeña: evita botón demasiado grande o tapa enemigos.');
  if (input.player.fingers === 2) riskNotes.push('2 dedos limita acciones simultáneas; considera transición progresiva a 3 dedos.');
  if (input.player.fingers >= 4 && input.device.screenSize < 6.3) riskNotes.push('4 dedos en pantalla pequeña puede causar fatiga y mis-taps.');

  return {
    layoutFamily,
    priorityButtons,
    riskNotes,
    nextUpgradePath: fingers === 2
      ? 'Transición 2→3 dedos en 14 días.'
      : fingers === 3
        ? 'Transición 3→4 dedos en 28 días si buscas competitivo.'
        : undefined,
  };
}

function buildGyro(input: AresV6GenerationInput, sensitivity: AresV6SensitivityVector): AresV6GyroscopeVector | null {
  if (!input.player.usesGyroscope) return null;
  const preset = getAresV6Preset(input.presetId);
  const baseBias = preset.gyroBias;
  const hardwareBias = input.device.screenHz >= 120 ? 2 : input.device.screenHz <= 60 ? -2 : 0;
  const fingerBias = input.player.fingers >= 4 ? 4 : input.player.fingers === 3 ? 0 : -8;

  return {
    gyroGeneral: clamp(sensitivity.general * 0.18 + baseBias + hardwareBias + fingerBias, GYRO_MIN, GYRO_MAX),
    gyroRedPoint: clamp(sensitivity.redPoint * 0.18 + baseBias + fingerBias, GYRO_MIN, GYRO_MAX),
    gyroScope2x: clamp(sensitivity.scope2x * 0.18 + baseBias, GYRO_MIN, GYRO_MAX),
    gyroScope4x: clamp(sensitivity.scope4x * 0.17 + baseBias, GYRO_MIN, GYRO_MAX),
    gyroSniper: clamp(sensitivity.sniperScope * 0.16 + baseBias, GYRO_MIN, GYRO_MAX),
    gyroFreeView: clamp(sensitivity.freeView * 0.12 + baseBias, 5, 50),
  };
}

function buildTuningSteps(input: AresV6GenerationInput): AresV6TuningStep[] {
  const symptoms = input.player.symptoms ?? [];
  return symptoms.slice(0, 3).map((symptom) => {
    const rule = ARES_V6_SYMPTOM_TUNING_RULES.find((item) => item.symptom === symptom);
    return {
      symptom,
      adjustment: rule?.delta ?? {},
      instruction: rule
        ? `Aplica este ajuste solo si el síntoma persiste después de probar el preset base: ${rule.warning}`
        : 'Síntoma registrado. Requiere laboratorio adicional antes de automatizar ajuste.',
      testProtocol: rule?.testProtocol ?? 'Juega 3 partidas y registra si mejoró, empeoró o quedó igual.',
    };
  });
}

function buildConfidence(input: AresV6GenerationInput, ppiPenalty: number, ppiWarning: string | null) {
  const missingSignals: string[] = [];
  const warnings: string[] = [];
  let score = 100 - ppiPenalty;

  if (!input.device.ppi && !input.device.screenDpi) missingSignals.push('ppi/screenDpi');
  if (!input.device.releaseYear) missingSignals.push('releaseYear');
  if (!input.device.chipset) missingSignals.push('chipset');
  if (!input.player.primaryWeaponCategory) missingSignals.push('primaryWeaponCategory');
  if (!input.device.thermalState) missingSignals.push('thermalState');

  score -= missingSignals.length * 3;

  if (ppiWarning) warnings.push(ppiWarning);
  if (input.device.pingMs && input.device.pingMs >= 120) warnings.push('Ping alto: la sensibilidad no corrige lag de red.');
  if (input.device.thermalState === 'HOT' || input.device.thermalState === 'THROTTLING') {
    warnings.push('Rendimiento térmico inestable: validar en partida real, no solo training.');
  }

  const clampedScore = clamp(score, 0, 100);
  const grade = clampedScore >= 90
    ? 'LAB_VERIFIED'
    : clampedScore >= 75
      ? 'HIGH'
      : clampedScore >= 55
        ? 'MEDIUM'
        : 'LOW';

  return { score: clampedScore, grade, missingSignals, warnings };
}

export function generateAresV6(input: AresV6GenerationInput): AresV6GenerationOutput {
  const preset = getAresV6Preset(input.presetId);
  const effectivePpi = resolveEffectivePpi(input.device);
  let sensitivity = calculateBaseSensitivityFromPpi(effectivePpi.ppi);

  sensitivity = applyDelta(sensitivity, getDeviceSignalDelta(input.device));
  sensitivity = applyDelta(sensitivity, preset.sensitivityBias);
  sensitivity = applyDelta(sensitivity, getWeaponDelta(input.player.primaryWeaponCategory));

  // Preserve a sane cascade for scoped values while allowing headshot presets
  // to keep Red Point high. Free View remains independent.
  sensitivity = {
    ...sensitivity,
    scope2x: Math.min(sensitivity.scope2x, sensitivity.redPoint + 6),
    scope4x: Math.min(sensitivity.scope4x, sensitivity.scope2x),
    sniperScope: Math.min(sensitivity.sniperScope, sensitivity.scope4x),
  };

  const fireButton = buildFireButton(input);
  const hud = buildHud(input);
  const gyroscope = buildGyro(input, sensitivity);
  const confidence = buildConfidence(input, effectivePpi.confidencePenalty, effectivePpi.warning);
  const firstTuningSteps = buildTuningSteps(input);

  return {
    algorithmVersion: 'ARES-v6-refoundation',
    presetId: input.presetId,
    sensitivity,
    gyroscope,
    dpi: {
      mode: 'NO_DPI',
      detectedPpi: effectivePpi.source === 'TIER_FALLBACK' ? null : effectivePpi.ppi,
      confidence: 100 - effectivePpi.confidencePenalty,
      explanation: effectivePpi.source === 'TIER_FALLBACK'
        ? 'Se usó fallback por tier porque no llegó PPI/DPI real. Confirma el modelo para subir precisión.'
        : `Se usó ${effectivePpi.ppi} PPI/DPI como driver principal del motor v6.`,
    },
    fireButton,
    hud,
    confidence,
    explanation: {
      headline: `${preset.publicName} para ${input.device.brand} ${input.device.model}`,
      bullets: [
        `Base calculada por PPI/DPI efectivo: ${effectivePpi.ppi}.`,
        `Preset aplicado: ${preset.publicName}.`,
        `Modo: ${input.player.mode}. Dedos: ${input.player.fingers}.`,
        input.player.primaryWeaponCategory
          ? `Arma/categoría prioritaria: ${input.player.primaryWeaponCategory}.`
          : 'Sin arma prioritaria: se entrega calibración general.',
      ],
      technicalNotes: [
        'Engine v6 no reemplaza producción legacy todavía.',
        'Los síntomas generan pasos de tuning, no cambios ciegos sobre toda la sensibilidad.',
        'El resultado debe validarse en entrenamiento y 3 partidas reales antes de guardarse como final.',
      ],
    },
    firstTuningSteps,
  };
}
