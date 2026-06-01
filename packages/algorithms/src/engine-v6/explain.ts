import type { AresV6DeviceProfile } from './device-profile';
import type { AresV6EffectivePpiResult } from './dpi-curve';
import type {
  AresV6Explanation,
  AresV6GenerationInput,
  AresV6Preset,
  AresV6SensitivityVector,
} from './types';
import { getWeaponTrainingFocus } from './weapons';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — Explanation
//
// Turns the calculation into plain Spanish the player can act on. The
// explanation MUST surface the preset, the game mode, the finger count and
// the PPI that drove the result, plus the test protocol.
// ═══════════════════════════════════════════════════════════════

export interface AresV6ExplanationContext {
  preset: AresV6Preset;
  effectivePpi: AresV6EffectivePpiResult;
  sensitivity: AresV6SensitivityVector;
  deviceProfile: AresV6DeviceProfile;
}

function ppiSourceLabel(source: AresV6EffectivePpiResult['source']): string {
  switch (source) {
    case 'PPI':
      return 'PPI confirmado';
    case 'SCREEN_DPI':
      return 'densidad de la base de datos';
    case 'TIER_FALLBACK':
    default:
      return 'estimación por gama del equipo';
  }
}

export function buildExplanation(
  input: AresV6GenerationInput,
  context: AresV6ExplanationContext,
): AresV6Explanation {
  const { preset, effectivePpi, sensitivity, deviceProfile } = context;
  const { device, player } = input;

  const bullets: string[] = [
    `Base calibrada con ${effectivePpi.ppi} PPI/DPI efectivo (${ppiSourceLabel(effectivePpi.source)}).`,
    `Preset ${preset.publicName}: ${preset.description}`,
    `Modo ${player.mode} con ${player.fingers} dedos.`,
    player.primaryWeaponCategory
      ? `Arma prioritaria ${player.primaryWeaponCategory}: ${getWeaponTrainingFocus(player.primaryWeaponCategory)}`
      : 'Sin arma prioritaria: se entrega una calibración general.',
    `Valores clave — General ${sensitivity.general}, Punto Rojo ${sensitivity.redPoint}, AWM ${sensitivity.sniperScope}.`,
    player.usesGyroscope
      ? 'Giroscopio activado: se calibró junto con el touch.'
      : 'Sin giroscopio: puedes activarlo después para micro-ajustes.',
  ];

  if (effectivePpi.warning) {
    bullets.push(`⚠️ ${effectivePpi.warning}`);
  }

  const technicalNotes: string[] = [
    `Fuente de PPI/DPI: ${effectivePpi.source}.`,
    deviceProfile.deviceAgeYears !== null
      ? `Antigüedad estimada del equipo: ${deviceProfile.deviceAgeYears} años.`
      : 'Año de lanzamiento desconocido: confírmalo para subir la precisión.',
    ...deviceProfile.riskNotes,
    'El motor v6 no reemplaza la generación legacy en producción todavía.',
    'Los síntomas generan pasos de tuning; no se cambia toda la sensibilidad de golpe.',
    'Protocolo de prueba: aplica en los ajustes oficiales, entrena y valida en 3 partidas antes de guardar.',
  ];

  return {
    headline: `${preset.publicName} para ${device.brand} ${device.model}`,
    bullets,
    technicalNotes,
  };
}
