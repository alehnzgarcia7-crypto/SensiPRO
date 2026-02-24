// ═══════════════════════════════════════════════════════════════
// ARES-304 — Meta Analysis Configuration
// Datos del meta actual de Free Fire: armas, personajes, combos
// Editable desde admin API en /api/v1/admin/meta
// ═══════════════════════════════════════════════════════════════

export type WeaponTier = 'S' | 'A' | 'B' | 'C';
export type WeaponType = 'AR' | 'SMG' | 'SHOTGUN' | 'SNIPER' | 'PISTOL' | 'LMG';

export interface WeaponMeta {
  name: string;
  type: WeaponType;
  tier: WeaponTier;
  damage: number;
  fireRate: number;
  range: number;
  accuracy: number;
  magazine: number;
  recoilControl: number;
  description: string;
  bestFor: string;
  combo: string;
}

export interface CharacterMeta {
  name: string;
  tier: WeaponTier;
  ability: string;
  abilityType: 'ACTIVE' | 'PASSIVE';
  description: string;
  bestCombo: string[];
}

export interface MetaSnapshot {
  version: string;
  lastUpdated: string;
  patchNotes: string;
  weapons: WeaponMeta[];
  characters: CharacterMeta[];
  topCombos: {
    name: string;
    description: string;
    weapons: string[];
    style: string;
  }[];
}

export const TIER_COLORS: Record<WeaponTier, { bg: string; text: string; border: string }> = {
  S: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  A: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  B: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  C: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export const WEAPON_TYPE_LABELS: Record<WeaponType, string> = {
  AR: 'Rifle de Asalto',
  SMG: 'Subfusil',
  SHOTGUN: 'Escopeta',
  SNIPER: 'Francotirador',
  PISTOL: 'Pistola',
  LMG: 'Ametralladora',
};

export const CURRENT_META: MetaSnapshot = {
  version: 'OB45',
  lastUpdated: '2025-02-01',
  patchNotes: 'Nerf a MP5, buff a M4A1, nuevo personaje Luna agregado',
  weapons: [
    // Tier S
    {
      name: 'M4A1',
      type: 'AR',
      tier: 'S',
      damage: 53,
      fireRate: 76,
      range: 77,
      accuracy: 54,
      magazine: 30,
      recoilControl: 85,
      description:
        'El AR más consistente del juego. Buen daño, bajo retroceso, funciona a todas las distancias.',
      bestFor: 'Todas las distancias',
      combo: 'M4A1 + MP40 o M4A1 + Shotgun',
    },
    {
      name: 'MP40',
      type: 'SMG',
      tier: 'S',
      damage: 48,
      fireRate: 83,
      range: 22,
      accuracy: 17,
      magazine: 20,
      recoilControl: 60,
      description: 'TTK más bajo en close range. Domina combates a quemarropa.',
      bestFor: 'Combate cercano (<10m)',
      combo: 'MP40 + cualquier AR',
    },
    {
      name: 'AWM',
      type: 'SNIPER',
      tier: 'S',
      damage: 90,
      fireRate: 27,
      range: 91,
      accuracy: 90,
      magazine: 5,
      recoilControl: 20,
      description:
        'One-shot headshot garantizado con cualquier casco. El arma definitiva a distancia.',
      bestFor: 'Larga distancia (100m+)',
      combo: 'AWM + MP40',
    },
    {
      name: 'M1014',
      type: 'SHOTGUN',
      tier: 'S',
      damage: 94,
      fireRate: 40,
      range: 12,
      accuracy: 10,
      magazine: 6,
      recoilControl: 30,
      description: 'Devastadora en interiores. Un disparo a <3m elimina a casi cualquiera.',
      bestFor: 'Interiores y rush',
      combo: 'M1014 + AR',
    },
    // Tier A
    {
      name: 'AK47',
      type: 'AR',
      tier: 'A',
      damage: 61,
      fireRate: 63,
      range: 72,
      accuracy: 41,
      magazine: 30,
      recoilControl: 55,
      description:
        'Daño más alto de las AR pero retroceso fuerte. Para jugadores con control.',
      bestFor: 'Media distancia con buen aim',
      combo: 'AK47 + MP40',
    },
    {
      name: 'SCAR',
      type: 'AR',
      tier: 'A',
      damage: 53,
      fireRate: 61,
      range: 60,
      accuracy: 42,
      magazine: 30,
      recoilControl: 90,
      description:
        'El AR más fácil de usar. Retroceso mínimo, ideal para principiantes.',
      bestFor: 'Principiantes y media distancia',
      combo: 'SCAR + Shotgun',
    },
    {
      name: 'UMP',
      type: 'SMG',
      tier: 'A',
      damage: 48,
      fireRate: 75,
      range: 35,
      accuracy: 35,
      magazine: 30,
      recoilControl: 70,
      description:
        'SMG versátil con buen rango para su clase. Funciona a media-corta distancia.',
      bestFor: 'Corta-media distancia',
      combo: 'UMP + Sniper',
    },
    {
      name: 'Kar98k',
      type: 'SNIPER',
      tier: 'A',
      damage: 90,
      fireRate: 27,
      range: 84,
      accuracy: 90,
      magazine: 5,
      recoilControl: 25,
      description:
        'Sniper sólido con buen daño. No one-shot con casco 3 pero excelente a media-larga.',
      bestFor: 'Media-larga distancia',
      combo: 'Kar98k + SMG',
    },
    {
      name: 'M60',
      type: 'LMG',
      tier: 'A',
      damage: 55,
      fireRate: 72,
      range: 68,
      accuracy: 30,
      magazine: 60,
      recoilControl: 40,
      description: 'Cargador enorme para suppressive fire. Buena para squad cover.',
      bestFor: 'Supresión y squad',
      combo: 'M60 + Shotgun',
    },
    // Tier B
    {
      name: 'FAMAS',
      type: 'AR',
      tier: 'B',
      damage: 53,
      fireRate: 67,
      range: 62,
      accuracy: 48,
      magazine: 25,
      recoilControl: 65,
      description:
        'AR decente pero superada por M4A1 y AK en casi todo. Cargador pequeño.',
      bestFor: 'Opción secundaria',
      combo: 'FAMAS + MP40',
    },
    {
      name: 'P90',
      type: 'SMG',
      tier: 'B',
      damage: 46,
      fireRate: 80,
      range: 28,
      accuracy: 22,
      magazine: 50,
      recoilControl: 55,
      description: 'Cargador grande pero daño bajo. Funciona para spray and pray.',
      bestFor: 'Spray en close range',
      combo: 'P90 + AR',
    },
    {
      name: 'M1887',
      type: 'SHOTGUN',
      tier: 'B',
      damage: 100,
      fireRate: 25,
      range: 8,
      accuracy: 8,
      magazine: 2,
      recoilControl: 20,
      description:
        'Daño brutal pero solo 2 tiros. Si fallas ambos, estás muerto.',
      bestFor: 'One-shots arriesgados',
      combo: 'M1887 + AR',
    },
    // Tier C
    {
      name: 'M500',
      type: 'PISTOL',
      tier: 'C',
      damage: 60,
      fireRate: 30,
      range: 42,
      accuracy: 52,
      magazine: 5,
      recoilControl: 35,
      description: 'Pistola con daño alto pero lenta. Solo como último recurso.',
      bestFor: 'Emergencia',
      combo: 'No recomendado',
    },
    {
      name: 'Crossbow',
      type: 'SNIPER',
      tier: 'C',
      damage: 95,
      fireRate: 10,
      range: 55,
      accuracy: 75,
      magazine: 1,
      recoilControl: 10,
      description: 'Daño altísimo pero un solo tiro y recarga lenta. Muy nicho.',
      bestFor: 'Troll picks',
      combo: 'No competitivo',
    },
  ],
  characters: [
    {
      name: 'Alok',
      tier: 'S',
      ability: 'Drop the Beat',
      abilityType: 'ACTIVE',
      description:
        'Crea un aura que aumenta velocidad de movimiento y cura a aliados cercanos.',
      bestCombo: ['Jota', 'Hayato', 'Kelly'],
    },
    {
      name: 'Chrono',
      tier: 'S',
      ability: 'Time Turner',
      abilityType: 'ACTIVE',
      description: 'Crea un escudo temporal que bloquea daño frontal.',
      bestCombo: ['Alok', 'Shirou', 'Moco'],
    },
    {
      name: 'Wukong',
      tier: 'A',
      ability: 'Camouflage',
      abilityType: 'ACTIVE',
      description:
        'Se transforma en un arbusto para camuflarse. Ideal para emboscadas.',
      bestCombo: ['Alok', 'Kelly', 'Hayato'],
    },
    {
      name: 'Jota',
      tier: 'A',
      ability: 'Sustained Raids',
      abilityType: 'PASSIVE',
      description: 'Recupera HP al hacer kills con SMG o Shotgun.',
      bestCombo: ['Alok', 'Hayato', 'Kelly'],
    },
    {
      name: 'Hayato',
      tier: 'A',
      ability: 'Bushido',
      abilityType: 'PASSIVE',
      description:
        'Aumenta daño de penetración de armadura cuando HP es bajo.',
      bestCombo: ['Alok', 'Jota', 'Kelly'],
    },
    {
      name: 'Moco',
      tier: 'A',
      ability: "Hacker's Eye",
      abilityType: 'PASSIVE',
      description: 'Marca a enemigos impactados para todo el equipo.',
      bestCombo: ['Chrono', 'Shirou', 'Alok'],
    },
    {
      name: 'Kelly',
      tier: 'B',
      ability: 'Dash',
      abilityType: 'PASSIVE',
      description: 'Aumenta velocidad de sprint.',
      bestCombo: ['Alok', 'Hayato', 'Jota'],
    },
    {
      name: 'Shirou',
      tier: 'B',
      ability: 'Damage Delivered',
      abilityType: 'PASSIVE',
      description:
        'Marca a enemigos que te disparan, primer disparo tiene penetración extra.',
      bestCombo: ['Chrono', 'Moco', 'Alok'],
    },
  ],
  topCombos: [
    {
      name: 'Rush Agresivo',
      description: 'Máximo daño y velocidad para push enemigos',
      weapons: ['M4A1', 'MP40'],
      style: 'aggressive',
    },
    {
      name: 'Balanceado Competitivo',
      description: 'Versátil para todas las situaciones de ranked',
      weapons: ['SCAR', 'M1014'],
      style: 'balanced',
    },
    {
      name: 'Sniper Control',
      description: 'Domina el mapa a distancia, defiéndete de cerca',
      weapons: ['AWM', 'MP40'],
      style: 'sniper',
    },
    {
      name: 'Double AR',
      description: 'Dos rifles para máxima consistencia a media distancia',
      weapons: ['M4A1', 'AK47'],
      style: 'balanced',
    },
  ],
};
