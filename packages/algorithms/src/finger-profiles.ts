// ============================================================
// FINGER PROFILES — Forensically verified data from:
// BitTopup, EsportZone, Cashify, item4gamer, freefiremania,
// BlueStacks guides, ExploreMultiverse, Sportskeeda
// ============================================================

export type FingerCount = 2 | 3 | 4;

export interface FingerProfile {
  fingers: FingerCount;
  name: string;
  nameEs: string;
  icon: string;
  description: string;
  descriptionEs: string;
  competitiveLevel: 'casual' | 'competitive' | 'pro';
  competitiveLabelEs: string;

  // Sensitivity multipliers (applied on top of v4.0 DPI base)
  multipliers: {
    general: number;
    redPoint: number;
    scope2x: number;
    scope4x: number;
    sniperScope: number;
    freeView: number;
    gyroscope: number;
  };

  // Override tapering between scopes
  tapering: number;

  // Fire button recommendations
  fireButton: {
    sizeRange: { min: number; max: number };
    sizeByScreen: {
      small: number;   // < 6.0"
      medium: number;  // 6.0"-6.5"
      large: number;   // 6.5"-6.8"
      xlarge: number;  // > 6.8"
    };
    transparency: number;
    positionEs: string;
    dragTipEs: string;
  };

  // Gyroscope recommendations
  gyroscope: {
    enabled: boolean;
    range: { min: number; max: number };
    tipEs: string;
  };

  // Capabilities
  capabilities: {
    simultaneousActions: number;
    canJumpShoot: boolean;
    canPeekShoot: boolean;
    canCrouchSpam: boolean;
    freeLookImportance: 'critical' | 'important' | 'optional';
    bestWeaponCategories: string[];
    optimalRange: string;
    optimalRangeEs: string;
  };

  // Adaptation
  adaptationDays: number;
  transitionTipEs: string | null;
}

export const FINGER_PROFILES: Record<FingerCount, FingerProfile> = {

  // ==========================================
  // 2 FINGERS — THUMBS ONLY
  // ==========================================
  2: {
    fingers: 2,
    name: 'Thumbs',
    nameEs: '2 Dedos',
    icon: '✌️',
    description: 'Both thumbs handle everything',
    descriptionEs: 'Ambos pulgares hacen todo. Simple pero con multitarea limitada.',
    competitiveLevel: 'casual',
    competitiveLabelEs: 'Casual',

    multipliers: {
      general: 1.00,
      redPoint: 0.94,
      scope2x: 0.92,
      scope4x: 0.90,
      sniperScope: 0.88,
      freeView: 0.70,
      gyroscope: 0.00,
    },
    tapering: -14,

    fireButton: {
      sizeRange: { min: 55, max: 70 },
      sizeByScreen: { small: 70, medium: 65, large: 60, xlarge: 55 },
      transparency: 60,
      positionEs: 'Lado derecho, centro-bajo. Área grande para drag con pulgar.',
      dragTipEs: 'Arrastra RECTO HACIA ARRIBA con el pulgar derecho. Suave, no brusco.',
    },

    gyroscope: {
      enabled: false,
      range: { min: 0, max: 0 },
      tipEs: 'No recomendado para 2 dedos — ya tienes demasiado que manejar con los pulgares.',
    },

    capabilities: {
      simultaneousActions: 2,
      canJumpShoot: false,
      canPeekShoot: false,
      canCrouchSpam: false,
      freeLookImportance: 'critical',
      bestWeaponCategories: ['shotgun', 'smg', 'pistol'],
      optimalRange: 'close-medium',
      optimalRangeEs: 'Corta — Media',
    },

    adaptationDays: 3,
    transitionTipEs: null,
  },

  // ==========================================
  // 3 FINGERS — THE COMPETITIVE STANDARD
  // ==========================================
  3: {
    fingers: 3,
    name: '3-Finger',
    nameEs: '3 Dedos',
    icon: '🤟',
    description: 'Two thumbs + right index finger',
    descriptionEs: 'Dos pulgares + índice derecho. El estándar competitivo de FF LATAM.',
    competitiveLevel: 'competitive',
    competitiveLabelEs: 'Competitivo',

    multipliers: {
      general: 1.00,
      redPoint: 1.00,
      scope2x: 1.00,
      scope4x: 1.00,
      sniperScope: 1.00,
      freeView: 1.00,
      gyroscope: 1.00,
    },
    tapering: -15,

    fireButton: {
      sizeRange: { min: 48, max: 60 },
      sizeByScreen: { small: 60, medium: 55, large: 52, xlarge: 48 },
      transparency: 55,
      positionEs: 'Lado derecho, ligeramente más alto. Índice accede al scope arriba.',
      dragTipEs: 'Pulgar derecho para drag, índice para scope. J-Drag para corta distancia.',
    },

    gyroscope: {
      enabled: true,
      range: { min: 20, max: 30 },
      tipEs: 'Opcional. Ayuda con control de recoil. Empieza en 25 y ajusta ±5.',
    },

    capabilities: {
      simultaneousActions: 3,
      canJumpShoot: false,
      canPeekShoot: true,
      canCrouchSpam: false,
      freeLookImportance: 'important',
      bestWeaponCategories: ['ar_fast', 'smg', 'shotgun'],
      optimalRange: 'medium',
      optimalRangeEs: 'Media',
    },

    adaptationDays: 14,
    transitionTipEs: 'Si vienes de 2 dedos: mueve solo Agacharse arriba para tu índice. Mantén todo lo demás. Después de 1 semana, agrega Cambiar Arma.',
  },

  // ==========================================
  // 4 FINGERS — CLAW / GARRA
  // ==========================================
  4: {
    fingers: 4,
    name: '4-Finger Claw',
    nameEs: '4 Dedos (Garra)',
    icon: '🤘',
    description: 'Both thumbs + both index fingers',
    descriptionEs: 'Ambos pulgares + ambos índices. Control máximo. Usado por pros.',
    competitiveLevel: 'pro',
    competitiveLabelEs: 'Pro',

    multipliers: {
      general: 1.00,
      redPoint: 1.06,
      scope2x: 1.08,
      scope4x: 1.08,
      sniperScope: 1.05,
      freeView: 1.15,
      gyroscope: 1.10,
    },
    tapering: -16,

    fireButton: {
      sizeRange: { min: 44, max: 55 },
      sizeByScreen: { small: 55, medium: 50, large: 48, xlarge: 44 },
      transparency: 50,
      positionEs: 'Esquina superior derecha. Índice derecho dedicado a disparar.',
      dragTipEs: 'Índice derecho dispara, pulgar derecho apunta. Combo Saltar+Agacharse+Disparar desbloqueado.',
    },

    gyroscope: {
      enabled: true,
      range: { min: 25, max: 40 },
      tipEs: 'RECOMENDADO. Agrega un 3er eje de control con la inclinación. Empieza en 30 y sube gradualmente.',
    },

    capabilities: {
      simultaneousActions: 4,
      canJumpShoot: true,
      canPeekShoot: true,
      canCrouchSpam: true,
      freeLookImportance: 'optional',
      bestWeaponCategories: ['ar_fast', 'ar_heavy', 'sniper', 'smg', 'shotgun', 'pistol', 'special'],
      optimalRange: 'all',
      optimalRangeEs: 'Todas las distancias',
    },

    adaptationDays: 28,
    transitionTipEs: 'Si vienes de 3 dedos: mueve SOLO el Disparo a esquina superior derecha para tu índice. Practica 1 semana. Después mueve la Mira a esquina superior izquierda para el otro índice.',
  },
};

export function getFingerProfile(fingers: FingerCount): FingerProfile {
  return FINGER_PROFILES[fingers];
}
