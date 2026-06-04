import type {
  AresV6GameMode,
  AresV6GenerationInput,
  AresV6HudRecommendation,
  AresV6Playstyle,
  AresV6WeaponCategory,
} from './types';

// ═══════════════════════════════════════════════════════════════
// ARES ENGINE V6 — HUD recommendation
//
// The layout family is driven by ergonomics (finger count + tablet screens).
// The priority buttons are driven by *intent*: the game mode, playstyle and
// weapon decide which controls deserve a finger first.
// ═══════════════════════════════════════════════════════════════

const TABLET_SCREEN_MIN = 7.2;

function layoutFamily(
  fingers: AresV6GenerationInput['player']['fingers'],
  screenSize: number,
): AresV6HudRecommendation['layoutFamily'] {
  if (screenSize >= TABLET_SCREEN_MIN) return 'TABLET';
  if (fingers === 5) return 'FIVE_FINGER';
  if (fingers === 4) return 'FOUR_FINGER';
  if (fingers === 3) return 'THREE_FINGER';
  return 'TWO_FINGER';
}

function modeButtons(mode: AresV6GameMode): readonly string[] {
  switch (mode) {
    case 'CLASH_SQUAD':
      return ['Disparo', 'Gloo Wall', 'Cambio de arma', 'Agacharse', 'Disparo rápido', 'Mira', 'Salto'];
    case 'BATTLE_ROYALE':
      return ['Disparo', 'Mira', 'Vista Libre', 'Minimapa', 'Cambio de arma', 'Agacharse', 'Salto'];
    case 'TOURNAMENT':
      return ['Disparo', 'Mira', 'Gloo Wall', 'Cambio de arma', 'Vista Libre', 'Agacharse', 'Salto'];
    case 'LONE_WOLF':
      return ['Disparo', 'Mira', 'Cambio de arma', 'Agacharse', 'Salto', 'Gloo Wall'];
    case 'CUSTOM_ROOM':
      return ['Disparo', 'Mira', 'Vista Libre', 'Cambio de arma', 'Gloo Wall', 'Agacharse', 'Salto'];
    case 'TRAINING':
    default:
      return ['Disparo', 'Mira', 'Cambio de arma', 'Recargar', 'Agacharse', 'Salto'];
  }
}

function intentButtons(playstyle: AresV6Playstyle, weapon?: AresV6WeaponCategory): readonly string[] {
  if (playstyle === 'SNIPER' || weapon === 'SNIPER' || weapon === 'MARKSMAN') {
    return ['Mira / AWM', 'Control de recoil'];
  }
  if (playstyle === 'ONE_TAP' || playstyle === 'TODO_ROJO' || weapon === 'SHOTGUN' || weapon === 'PISTOL') {
    return ['Disparo', 'Gloo Wall', 'Drag de mira'];
  }
  if (playstyle === 'RUSH' || weapon === 'SMG') {
    return ['Disparo', 'Vista Libre'];
  }
  return [];
}

function buttonBudget(
  family: AresV6HudRecommendation['layoutFamily'],
  fingers: AresV6GenerationInput['player']['fingers'],
): number {
  if (family === 'TABLET') return 6;
  if (fingers >= 5) return 7;
  if (fingers === 4) return 6;
  if (fingers === 3) return 4;
  return 3;
}

function dedupe(buttons: readonly string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const button of buttons) {
    if (!seen.has(button)) {
      seen.add(button);
      ordered.push(button);
    }
  }
  return ordered;
}

function buildRiskNotes(input: AresV6GenerationInput, family: AresV6HudRecommendation['layoutFamily']): string[] {
  const notes: string[] = [];
  const { fingers } = input.player;
  const { screenSize } = input.device;

  if (screenSize < 6.0) notes.push('Pantalla pequeña: evita un botón demasiado grande que tape enemigos.');
  if (fingers === 2) notes.push('2 dedos limita acciones simultáneas; planifica una transición a 3 dedos.');
  if (fingers >= 4 && screenSize < 6.3) notes.push('4 dedos en pantalla pequeña puede causar fatiga y mis-taps.');
  if (family === 'TABLET') notes.push('Pantalla grande: separa los botones para que el pulgar no haga mis-taps.');

  return notes;
}

export function buildHud(input: AresV6GenerationInput): AresV6HudRecommendation {
  const { fingers, mode, playstyle, primaryWeaponCategory } = input.player;
  const family = layoutFamily(fingers, input.device.screenSize);

  const priorityButtons = dedupe([
    ...intentButtons(playstyle, primaryWeaponCategory),
    ...modeButtons(mode),
  ]).slice(0, buttonBudget(family, fingers));

  const nextUpgradePath =
    fingers === 2
      ? 'Transición 2→3 dedos en 14 días.'
      : fingers === 3
        ? 'Transición 3→4 dedos en 28 días si buscas competitivo.'
        : undefined;

  return {
    layoutFamily: family,
    priorityButtons,
    riskNotes: buildRiskNotes(input, family),
    nextUpgradePath,
  };
}
