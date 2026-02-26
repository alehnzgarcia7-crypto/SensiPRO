// ============================================================
// WEAPON TIERS — S/A/B recommendations per finger count
// Consumed by Headshot Mode weapon tier section.
// ============================================================

import type { FingerCount } from './finger-profiles';

export interface WeaponTierEntry {
  name: string;
  reasonEs: string;
}

export interface WeaponTier {
  tier: 'S' | 'A' | 'B';
  weapons: WeaponTierEntry[];
}

export interface WeaponRecommendation {
  fingers: FingerCount;
  tiers: WeaponTier[];
  summaryEs: string;
}

export const WEAPON_RECOMMENDATIONS: Record<FingerCount, WeaponRecommendation> = {
  2: {
    fingers: 2,
    tiers: [
      {
        tier: 'S',
        weapons: [
          { name: 'M1887', reasonEs: 'One-tap a corta distancia. El drag vertical es suficiente.' },
          { name: 'MP40', reasonEs: 'Spray fácil con drag continuo. Perdona errores de puntería.' },
        ],
      },
      {
        tier: 'A',
        weapons: [
          { name: 'Desert Eagle', reasonEs: 'Flick rápido, alto daño. Buena secondary.' },
          { name: 'M1014', reasonEs: 'Escopeta de backup. Más fácil que la M1887.' },
          { name: 'UMP', reasonEs: 'SMG estable, fácil de controlar con pulgar.' },
        ],
      },
      {
        tier: 'B',
        weapons: [
          { name: 'SCAR', reasonEs: 'Versátil pero limitada por 2 dedos a media distancia.' },
          { name: 'M4A1', reasonEs: 'Buena pero necesitas drag rápido para headshots.' },
        ],
      },
    ],
    summaryEs: 'Con 2 dedos, enfócate en armas de ONE-TAP (un solo disparo letal) y SMGs de spray. Evita snipers y ARs pesados — necesitan más control del que 2 pulgares pueden dar.',
  },
  3: {
    fingers: 3,
    tiers: [
      {
        tier: 'S',
        weapons: [
          { name: 'M4A1', reasonEs: 'Versátil a toda distancia. El peek le da ventaja enorme.' },
          { name: 'SCAR', reasonEs: 'Estable, perfecto para peek & fire a media distancia.' },
          { name: 'MP40', reasonEs: 'Close range king. Peek + spray = devastador.' },
          { name: 'M1887', reasonEs: 'J-Drag + Peek = one-tap desde cobertura.' },
        ],
      },
      {
        tier: 'A',
        weapons: [
          { name: 'AK47', reasonEs: 'Daño alto + peek compensa el recoil fuerte.' },
          { name: 'XM8', reasonEs: 'Scope integrado + estabilidad a media distancia.' },
          { name: 'Trogon', reasonEs: 'Nuevo meta, Red Dot sensitivity baja ayuda.' },
          { name: 'Desert Eagle', reasonEs: 'Secondary perfecta para quick switch.' },
        ],
      },
      {
        tier: 'B',
        weapons: [
          { name: 'AWM', reasonEs: 'Posible pero difícil — no puedes hacer jump shot con sniper.' },
          { name: 'Kar98k', reasonEs: 'Similar al AWM. Necesitas paciencia.' },
        ],
      },
    ],
    summaryEs: 'Con 3 dedos, los ARs y SMGs son tu arsenal principal. El Peek & Fire hace que cualquier AR se vuelva letal. Snipers son posibles pero no ideales.',
  },
  4: {
    fingers: 4,
    tiers: [
      {
        tier: 'S',
        weapons: [
          { name: 'AWM', reasonEs: 'One-shot headshot + jump shot + peek. La combinación más letal.' },
          { name: 'Kar98k', reasonEs: 'Más rápido que AWM. Jump-Crouch-Fire es devastador.' },
          { name: 'M4A1', reasonEs: 'Versátil. Crouch spam + spray = headshot machine.' },
          { name: 'AC80', reasonEs: 'El arma meta de Two9. Ritmo \'one-two\' con jump shots.' },
          { name: 'M1887', reasonEs: 'Jump-Crouch-Fire + M1887 = eliminación instantánea.' },
        ],
      },
      {
        tier: 'A',
        weapons: [
          { name: 'SCAR', reasonEs: 'Todo lo bueno de 3 dedos + crouch spam + jump shot.' },
          { name: 'AK47', reasonEs: 'Crouch spam controla el recoil. Daño brutal.' },
          { name: 'MP40', reasonEs: 'Jump spray headshots a corta distancia.' },
          { name: 'SVD', reasonEs: 'Sniper semi-auto + quick peek = eliminaciones rápidas.' },
          { name: 'Desert Eagle', reasonEs: 'Jump-Crouch-Fire a larga distancia (estilo Two9).' },
        ],
      },
      {
        tier: 'B',
        weapons: [
          { name: 'N/A', reasonEs: 'Con 4 dedos puedes usar CUALQUIER arma de forma efectiva. No hay Tier B.' },
        ],
      },
    ],
    summaryEs: 'Con 4 dedos tienes control total. TODAS las armas son viables incluyendo snipers con jump shot. El AC80 con el ritmo Two9 y el AWM con Jump-Crouch-Fire son las combinaciones más letales del juego.',
  },
};

export function getWeaponRecommendation(fingers: FingerCount): WeaponRecommendation {
  return WEAPON_RECOMMENDATIONS[fingers];
}
