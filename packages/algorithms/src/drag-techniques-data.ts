// ============================================================
// DRAG TECHNIQUES — Finger-aware headshot techniques
// Personalized technique sets per finger count.
// Consumed by Headshot Mode technique section.
// ============================================================

import type { FingerCount } from './finger-profiles';

export type DragType = 'vertical' | 'rotation' | 'direction';

export interface DragTechniqueData {
  id: DragType;
  nameEs: string;
  descriptionEs: string;
  howToEs: string[];
  whenToUseEs: string;
  speedEs: string;
  difficultyEs: string;
  difficulty: 1 | 2 | 3;
  bestWeaponsEs: string[];
  bestRange: string;
  bestRangeEs: string;
  svgPath: string;
  svgDescription: string;
}

export interface FingerTechniqueSet {
  fingers: FingerCount;
  primaryTechnique: DragType;
  secondaryTechnique: DragType | null;
  advancedTechnique: string | null;
  advancedTechniqueEs: string | null;
  limitationEs: string | null;
  comboEs: string | null;
  summaryEs: string;
}

// --- THE 3 DRAG TECHNIQUES ---

export const HEADSHOT_DRAG_TECHNIQUES: Record<DragType, DragTechniqueData> = {
  vertical: {
    id: 'vertical',
    nameEs: 'Drag Vertical',
    descriptionEs: 'El drag más básico y efectivo. Arrastra el botón de disparo RECTO HACIA ARRIBA para subir el crosshair a la cabeza.',
    howToEs: [
      'Posiciona el crosshair a la altura del pecho del enemigo',
      'Toca el botón de disparo',
      'Arrastra RECTO HACIA ARRIBA en un movimiento suave',
      'El crosshair sube del pecho a la cabeza mientras disparas',
      'Suelta cuando veas números rojos (headshot)',
    ],
    whenToUseEs: 'Enemigo frente a ti, moviéndose en línea recta hacia ti o alejándose. Combates con SMGs y ARs.',
    speedEs: 'Suave y rápida — no lenta, no snap brusco',
    difficultyEs: 'Fácil',
    difficulty: 1,
    bestWeaponsEs: ['MP40', 'M4A1', 'SCAR', 'UMP', 'XM8'],
    bestRange: 'close-medium',
    bestRangeEs: 'Corta — Media',
    svgPath: 'M 50 80 L 50 30',
    svgDescription: 'Arrow going straight up from fire button position',
  },
  rotation: {
    id: 'rotation',
    nameEs: 'Rotation Drag (J-Drag)',
    descriptionEs: "Arrastras formando una 'J' — primero hacia el enemigo, luego SUBE. Perfecto para one-taps con escopeta a corta distancia.",
    howToEs: [
      'El enemigo está a tu lado (no directamente enfrente)',
      'Toca el botón de disparo',
      'Arrastra PRIMERO hacia la dirección del enemigo (horizontal)',
      'Luego SUBE formando una curva en J',
      'El crosshair se mueve al lado y sube a la cabeza en un solo movimiento fluido',
    ],
    whenToUseEs: 'Combate cercano, especialmente con escopetas. El enemigo está a un lado, necesitas snap lateral + subir a la cabeza.',
    speedEs: 'Rápida y decisiva — snap tipo flick',
    difficultyEs: 'Media',
    difficulty: 2,
    bestWeaponsEs: ['M1887', 'M1014', 'Desert Eagle', 'MP40'],
    bestRange: 'close',
    bestRangeEs: 'Corta',
    svgPath: 'M 30 80 Q 50 80 50 70 L 50 30',
    svgDescription: 'J-shaped curve: right then up',
  },
  direction: {
    id: 'direction',
    nameEs: 'Direction Drag (Drag Direccional)',
    descriptionEs: 'Arrastras en la MISMA DIRECCIÓN que se mueve el enemigo. Para enemigos corriendo lateralmente a media-larga distancia.',
    howToEs: [
      'El enemigo está corriendo de un lado a otro',
      'Identifica la DIRECCIÓN de su movimiento',
      'Toca el botón de disparo',
      'Arrastra siguiendo la dirección del enemigo',
      'Ajusta ligeramente hacia ARRIBA para compensar a la cabeza',
      'Requiere predicción del movimiento',
    ],
    whenToUseEs: 'Enemigos huyendo, saltando de un tren, corriendo entre coberturas. Media a larga distancia.',
    speedEs: 'Moderada — matching de la velocidad del enemigo',
    difficultyEs: 'Avanzada',
    difficulty: 3,
    bestWeaponsEs: ['AWM', 'Kar98k', 'SVD', 'SCAR', 'M4A1'],
    bestRange: 'medium-long',
    bestRangeEs: 'Media — Larga',
    svgPath: 'M 20 60 Q 40 50 60 35 L 70 25',
    svgDescription: 'Diagonal line following enemy movement with upward correction',
  },
};

// --- TECHNIQUE SETS PER FINGER COUNT ---

export const FINGER_TECHNIQUE_SETS: Record<FingerCount, FingerTechniqueSet> = {
  2: {
    fingers: 2,
    primaryTechnique: 'vertical',
    secondaryTechnique: 'rotation',
    advancedTechnique: null,
    advancedTechniqueEs: null,
    limitationEs: 'No puedes saltar y disparar al mismo tiempo. Enfócate en drag puro.',
    comboEs: null,
    summaryEs: 'Con 2 dedos tu arma principal es el Vertical Drag. Simple, efectivo, letal con escopetas y SMGs a corta distancia.',
  },
  3: {
    fingers: 3,
    primaryTechnique: 'rotation',
    secondaryTechnique: 'vertical',
    advancedTechnique: 'Peek & Fire',
    advancedTechniqueEs: 'Peek & Fire — asómate con el índice (agacharse/levantarse) mientras tu pulgar hace el drag. El enemigo no puede apuntarte bien porque te asomas y te escondes.',
    limitationEs: 'No puedes hacer Jump+Shoot simultáneo. El Peek & Fire compensa.',
    comboEs: 'Agacharse (índice) + Drag vertical (pulgar) = peek headshot',
    summaryEs: 'Con 3 dedos desbloqueas el Peek & Fire y el J-Drag se vuelve devastador. El índice te da una dimensión extra de control.',
  },
  4: {
    fingers: 4,
    primaryTechnique: 'rotation',
    secondaryTechnique: 'direction',
    advancedTechnique: 'Jump-Crouch-Fire (Two9 Technique)',
    advancedTechniqueEs: 'Jump-Crouch-Fire (Técnica Two9) — Salta (índice izq) para superar Gloo Walls, agáchate (índice der) para apretar el crosshair en el aire, dispara (índice der) en el pico del salto. Solo posible con 4 dedos. Es la técnica que le da a Two9 su 98% de headshot rate.',
    limitationEs: null,
    comboEs: 'Saltar (índice izq) + Agacharse (índice der) + Disparar (índice der) + Apuntar (pulgar der) = Jump-Crouch-Fire',
    summaryEs: 'Con 4 dedos tienes TODAS las técnicas desbloqueadas incluyendo la legendaria Jump-Crouch-Fire de Two9. Sin límites.',
  },
};

export function getDragTechniqueData(type: DragType): DragTechniqueData {
  return HEADSHOT_DRAG_TECHNIQUES[type];
}

export function getFingerTechniques(fingers: FingerCount): FingerTechniqueSet {
  return FINGER_TECHNIQUE_SETS[fingers];
}

export function getTechniquesForFingers(fingers: FingerCount): DragTechniqueData[] {
  const set = FINGER_TECHNIQUE_SETS[fingers];
  const techniques: DragTechniqueData[] = [HEADSHOT_DRAG_TECHNIQUES[set.primaryTechnique]];
  if (set.secondaryTechnique) {
    techniques.push(HEADSHOT_DRAG_TECHNIQUES[set.secondaryTechnique]);
  }
  return techniques;
}
