// ══════════════════════════════════════════════════════════
// ARES — Constantes globales del proyecto
// ══════════════════════════════════════════════════════════

// App
export const APP_NAME = 'Sensibilidades PRO';
export const APP_CODENAME = 'ARES';
export const APP_DOMAIN = 'sensibilidadespro.com';

// Sensitivity ranges (Free Fire escala 0-200 desde OB50)
export const SENSITIVITY_MIN = 0;
export const SENSITIVITY_MAX = 200;

// Gyroscope range (giroscopio usa escala 0-100, pros usan 20-40)
export const GYRO_MIN = 0;
export const GYRO_MAX = 100;

// BASE: valores para un dispositivo MEDIO (4GB RAM, 60Hz, IPS, MID tier)
// Sigue el tapering principle: General > FreeLook > RedDot > 2x > 4x > Sniper
export const BASE_SENSITIVITY = {
  general: 170,
  redPoint: 160,
  scope2x: 145,
  scope4x: 125,
  sniperScope: 75,
  freeView: 155,
} as const;

// RAM: MÁS RAM = MENOS sensibilidad necesaria (hardware compensa)
// MENOS RAM = MÁS sensibilidad necesaria (compensar input lag, touch delay)
export const RAM_OPTIONS = [2, 3, 4, 6, 8, 12, 16] as const;
export const RAM_FACTORS: Record<number, number> = {
  2: +15,
  3: +10,
  4: +5,
  6: 0,
  8: -5,
  12: -8,
  16: -10,
};

// CALIBRACIÓN: offsets por estilo de juego
// ALTA = agresivo/rush: valores más altos para reacciones rápidas
// MEDIA = balanceado: sin cambio, baseline
// BAJA = precisión/defensivo: valores más bajos para control
export const CALIBRATION_OFFSETS = {
  BAJA: -25,
  MEDIA: 0,
  ALTA: +15,
} as const;

// DPI: reduce sensibilidad porque pantalla ya es más densa (Smallest Width mod)
export const DPI_OFFSET = 12;

// DPI precision bonus (CON DPI = more precise, higher precisionScore)
export const DPI_PRECISION_BONUS = 8;

// DPI calculation constants
export const DPI_FORMULA_FACTOR = 4.2;
export const DPI_FORMULA_BASE = 180;
export const DPI_MIN = 200;
export const DPI_MAX = 800;

// Button size thresholds (screenSize en pulgadas → mm)
export const BUTTON_SIZE_MAP: readonly { maxScreen: number; sizeMm: number }[] = [
  { maxScreen: 5.5, sizeMm: 42 },
  { maxScreen: 6.2, sizeMm: 46 },
  { maxScreen: 6.7, sizeMm: 50 },
  { maxScreen: Infinity, sizeMm: 54 },
] as const;

// HUD recommendation thresholds
export const HUD_THRESHOLD_SMALL = 5.8;
export const HUD_THRESHOLD_LARGE = 6.4;

// Tier limits
export const FREE_SEARCH_LIMIT = 5;
export const FREE_FAVORITE_LIMIT = 3;
export const FREE_HISTORY_LIMIT = 10;
export const FREE_BRANDS = ['Samsung', 'Apple', 'Redmi'];
export const FREE_STYLES = ['BALANCED'] as const;

// Pricing (centavos MXN)
export const PREMIUM_MONTHLY_PRICE = 4900;    // $49 MXN
export const PREMIUM_ANNUAL_PRICE = 39900;    // $399 MXN
export const VIP_MONTHLY_PRICE = 9900;        // $99 MXN
export const VIP_ANNUAL_PRICE = 79900;        // $799 MXN

// Code format
export const CODE_PREFIX = 'ARES';
export const CODE_SEGMENT_LENGTH = 4;
export const CODE_SEGMENTS = 3;

// Durations (days)
export const TIER_DURATIONS: Record<string, number> = {
  PREMIUM_30: 30,
  PREMIUM_90: 90,
  PREMIUM_365: 365,
  VIP_30: 30,
  VIP_90: 90,
  VIP_365: 365,
};

// Referral reward
export const REFERRAL_REWARD_DAYS = 7;
export const REFERRAL_REWARD_TIER = 'PREMIUM';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Rate limiting
export const RATE_LIMIT_WINDOW_SECONDS = 86400; // 24 hours

// ════════════════ HEADSHOT MODE ════════════════

// Modificadores multiplicativos sobre sensibilidad base (escala 0-200)
// Red Dot sube MUCHO (el drag headshot depende del red dot)
// General sube (giros rápidos para adquirir target)
// Scopes bajan (headshots a distancia = más estabilidad)
export const HEADSHOT_SENSITIVITY_MODIFIERS = {
  general: 1.07,
  redPoint: 1.18,
  scope2x: 1.10,
  scope4x: 0.92,
  sniperScope: 0.88,
  freeView: 1.05,
} as const;

export const HEADSHOT_GYRO_MODIFIERS = {
  gyroGeneral: 1.05,
  gyroRedPoint: 1.15,
  gyroScope2x: 1.08,
  gyroScope4x: 0.95,
  gyroSniper: 0.90,
  gyroFreeView: 1.0,
} as const;

// Fire button % por tamaño de pantalla y número de dedos
export const FIRE_BUTTON_CONFIG = {
  SMALL_SCREEN: { max: 5.8, twoFinger: 75, threeFinger: 68, fourFinger: 62 },
  MEDIUM_SCREEN: { max: 6.5, twoFinger: 65, threeFinger: 60, fourFinger: 55 },
  LARGE_SCREEN: { max: 99, twoFinger: 60, threeFinger: 55, fourFinger: 50 },
} as const;

// ═══ ARSENAL DE ARMAS PARA HEADSHOT ═══
export const HEADSHOT_WEAPONS = {
  close: [
    {
      id: 'm1887',
      name: 'M1887',
      type: 'Escopeta',
      tier: 'S' as const,
      damage: 94,
      headshotDamage: 188,
      headshotMultiplier: 2.0,
      rpm: 55,
      range: 15,
      dragType: 'rotation' as const,
      sensAdjust: { general: 1.03, redPoint: 1.06 },
      attachments: ['Sin attachments — raw power'],
      tip: 'El REY del one-tap. J-drag rapidísimo. Apunta al pecho y hace la J. En close range, un headshot = muerte instantánea sin importar chaleco.',
      proTip: 'Los pros hacen jump + J-drag para esquivar mientras disparan. Practica en Training Ground con el maniquí a 3-5 metros.',
    },
    {
      id: 'desert-eagle',
      name: 'Desert Eagle',
      type: 'Pistola',
      tier: 'S' as const,
      damage: 90,
      headshotDamage: 198,
      headshotMultiplier: 2.2,
      rpm: 40,
      range: 45,
      dragType: 'rotation' as const,
      sensAdjust: { redPoint: 1.08, scope2x: 1.05 },
      attachments: ['Silenciador — para flanqueos sigilosos'],
      tip: 'La pistola más letal del juego. One-tap a media distancia con headshot. J-drag preciso. Favorita para 1v1 y clips.',
      proTip: 'Usa Desert Eagle como sidearm con cualquier AR. Switch rápido para finish con headshot. Practica 50 one-taps diarios.',
    },
    {
      id: 'mp40',
      name: 'MP40',
      type: 'SMG',
      tier: 'A' as const,
      damage: 48,
      headshotDamage: 72,
      headshotMultiplier: 1.5,
      rpm: 830,
      range: 22,
      dragType: 'vertical' as const,
      sensAdjust: { general: 0.98, redPoint: 0.97 },
      attachments: ['Cargador extendido', 'Foregrip'],
      tip: 'Cadencia BRUTAL. No necesitas one-tap — spray al pecho y el retroceso natural sube a la cabeza. El drag vertical es SUAVE.',
      proTip: 'Con 830 RPM, 3-4 balas llegan a la cabeza si apuntas al cuello. Daño máximo en <10m.',
    },
    {
      id: 'm1014',
      name: 'M1014',
      type: 'Escopeta',
      tier: 'A' as const,
      damage: 78,
      headshotDamage: 140,
      headshotMultiplier: 1.8,
      rpm: 80,
      range: 18,
      dragType: 'vertical' as const,
      sensAdjust: { redPoint: 1.04 },
      attachments: ['Sin attachments'],
      tip: 'Doble disparo rápido. Más perdón que M1887 porque puedes corregir el segundo tiro. Drag vertical rápido.',
      proTip: 'Primer tiro al pecho, segundo tiro con drag a la cabeza. El patrón doble es más consistente que el one-tap de M1887.',
    },
    {
      id: 'mac10',
      name: 'MAC10',
      type: 'SMG',
      tier: 'A' as const,
      damage: 45,
      headshotDamage: 67,
      headshotMultiplier: 1.5,
      rpm: 900,
      range: 20,
      dragType: 'vertical' as const,
      sensAdjust: { general: 0.97, redPoint: 0.96 },
      attachments: ['Cargador extendido', 'Foregrip'],
      tip: 'Similar al MP40 pero AÚN más rápido. Spray devastador. Baja la sensi ligeramente para controlar el spread.',
      proTip: 'Con cadencia de 900 RPM es la SMG más rápida del juego.',
    },
  ],
  mid: [
    {
      id: 'm4a1',
      name: 'M4A1',
      type: 'AR',
      tier: 'S' as const,
      damage: 53,
      headshotDamage: 90,
      headshotMultiplier: 1.7,
      rpm: 560,
      range: 79,
      dragType: 'vertical' as const,
      sensAdjust: { redPoint: 1.0, scope2x: 1.02 },
      attachments: ['Foregrip', 'Muzzle', 'Cargador extendido', 'Stock'],
      tip: 'El AR MÁS CONSISTENTE del juego. Retroceso bajo, daño bueno, funciona a todas las distancias.',
      proTip: 'La mejor arma para APRENDER headshots. Drag vertical suave y constante. Si no puedes hacer headshots con M4A1, el problema es tu técnica.',
    },
    {
      id: 'scar',
      name: 'SCAR',
      type: 'AR',
      tier: 'S' as const,
      damage: 53,
      headshotDamage: 90,
      headshotMultiplier: 1.7,
      rpm: 540,
      range: 72,
      dragType: 'vertical' as const,
      sensAdjust: { redPoint: 1.0, scope2x: 1.03 },
      attachments: ['Foregrip', 'Muzzle', 'Stock'],
      tip: 'Alternativa premium al M4. Primer disparo MUY preciso — ideal para one-tap con tap-fire.',
      proTip: 'Usa tap-fire a distancia para headshots limpios. En close range puedes spray.',
    },
    {
      id: 'ak',
      name: 'AK',
      type: 'AR',
      tier: 'A' as const,
      damage: 61,
      headshotDamage: 110,
      headshotMultiplier: 1.8,
      rpm: 480,
      range: 68,
      dragType: 'vertical' as const,
      sensAdjust: { general: 0.96, redPoint: 0.95, scope2x: 0.93 },
      attachments: ['Foregrip (OBLIGATORIO)', 'Muzzle', 'Stock'],
      tip: 'MÁS DAÑO que M4/SCAR pero MÁS RETROCESO. Solo para expertos. Baja la sensibilidad para compensar.',
      proTip: 'El AK headshot mata en 2 balas con casco nivel 2. Si lo dominas, es devastador.',
    },
    {
      id: 'woodpecker',
      name: 'Woodpecker',
      type: 'AR',
      tier: 'S' as const,
      damage: 65,
      headshotDamage: 130,
      headshotMultiplier: 2.0,
      rpm: 360,
      range: 85,
      dragType: 'vertical' as const,
      sensAdjust: { scope2x: 1.05, scope4x: 1.03 },
      attachments: ['Scope 2x/4x', 'Foregrip', 'Muzzle'],
      tip: 'AR con ALMA DE SNIPER. Headshot multiplier de 2.0x = daño devastador. Tap-fire obligatorio.',
      proTip: 'Con scope 2x y tap-fire, cada headshot hace 130 de daño. Dos headshots = kill garantizado.',
    },
    {
      id: 'ump',
      name: 'UMP',
      type: 'SMG',
      tier: 'A' as const,
      damage: 46,
      headshotDamage: 74,
      headshotMultiplier: 1.6,
      rpm: 720,
      range: 35,
      dragType: 'direction' as const,
      sensAdjust: { redPoint: 1.02, scope2x: 1.0 },
      attachments: ['Foregrip', 'Cargador extendido'],
      tip: 'SMG precisa para media distancia. Usa Direction Drag para seguir enemigos en movimiento.',
      proTip: 'El UMP es la mejor SMG para headshots a 15-30m. Su retroceso predecible permite drag constante.',
    },
  ],
  long: [
    {
      id: 'awm',
      name: 'AWM',
      type: 'Sniper',
      tier: 'S' as const,
      damage: 90,
      headshotDamage: 225,
      headshotMultiplier: 2.5,
      rpm: 25,
      range: 91,
      dragType: 'vertical' as const,
      sensAdjust: { sniperScope: 0.92 },
      attachments: ['Scope 8x (viene incluido)', 'Silenciador'],
      tip: 'ONE-SHOT HEADSHOT GARANTIZADO con cualquier casco incluyendo nivel 3. Solo de airdrop.',
      proTip: 'El quickscope con AWM es la técnica más respetada del juego. Scope in, micro-drag de 2mm, dispara en <0.5s.',
    },
    {
      id: 'svd',
      name: 'SVD (Dragunov)',
      type: 'Tirador Designado',
      tier: 'A' as const,
      damage: 73,
      headshotDamage: 146,
      headshotMultiplier: 2.0,
      rpm: 120,
      range: 82,
      dragType: 'vertical' as const,
      sensAdjust: { scope4x: 1.05, sniperScope: 0.95 },
      attachments: ['Scope 4x', 'Silenciador', 'Cargador extendido'],
      tip: 'Semi-auto sniper. Headshots rápidos consecutivos sin bolt action. Tap-tap-tap.',
      proTip: 'Dos headshots consecutivos con SVD mata cualquier enemigo. La cadencia semi-auto es la ventaja.',
    },
    {
      id: 'parafal',
      name: 'Parafal',
      type: 'AR',
      tier: 'A' as const,
      damage: 58,
      headshotDamage: 104,
      headshotMultiplier: 1.8,
      rpm: 400,
      range: 78,
      dragType: 'vertical' as const,
      sensAdjust: { scope2x: 1.03, scope4x: 1.02 },
      attachments: ['Scope 2x/4x', 'Foregrip', 'Muzzle'],
      tip: 'Semi-auto preciso. Tap shots a larga distancia como un sniper ligero.',
      proTip: 'El Parafal compite con snipers a 50-80m. Tap-fire headshots con scope 4x.',
    },
    {
      id: 'kar98k',
      name: 'Kar98K',
      type: 'Sniper',
      tier: 'B' as const,
      damage: 90,
      headshotDamage: 198,
      headshotMultiplier: 2.2,
      rpm: 30,
      range: 84,
      dragType: 'vertical' as const,
      sensAdjust: { sniperScope: 0.90 },
      attachments: ['Scope 8x', 'Silenciador'],
      tip: 'Alternativa al AWM cuando no hay airdrop. NO mata con casco nivel 3 en un tiro.',
      proTip: 'Usala como warmup para AWM. Misma mecánica de quickscope pero con menos daño.',
    },
    {
      id: 'm82b',
      name: 'M82B',
      type: 'Sniper',
      tier: 'A' as const,
      damage: 82,
      headshotDamage: 164,
      headshotMultiplier: 2.0,
      rpm: 35,
      range: 88,
      dragType: 'vertical' as const,
      sensAdjust: { sniperScope: 0.93 },
      attachments: ['Scope 8x'],
      tip: 'Anti-material: penetra Gloo Walls y vehículos. Headshot a través de cobertura.',
      proTip: 'El M82B es la counter definitiva a los campers detrás de Gloo Walls.',
    },
  ],
} as const;

// ═══ TÉCNICAS DE DRAG ═══
export const DRAG_TECHNIQUES = [
  {
    id: 'vertical',
    name: 'Vertical Drag',
    emoji: '⬆️',
    subtitle: 'El Básico',
    difficulty: 1,
    color: '#22c55e',
    description: 'Apunta al pecho del enemigo y arrastra el botón de disparo RECTO hacia arriba. El crosshair sube del pecho a la cabeza.',
    when: 'Enemigo frente a ti, sin moverse mucho, distancia media (10-30m)',
    howTo: ['Apunta al centro del pecho', 'Toca el botón de disparo', 'Arrastra RECTO hacia arriba sin soltar', 'Suelta cuando el crosshair llegue a la cabeza', 'Todo en <0.5 segundos'],
    weapons: ['M4A1', 'SCAR', 'AK', 'MP40', 'UMP', 'AWM'],
    commonMistake: 'Arrastrar demasiado y pasar por encima de la cabeza. El drag debe ser CORTO y PRECISO.',
    svgPath: 'M 50 80 L 50 30',
  },
  {
    id: 'rotation',
    name: 'Rotation Drag',
    emoji: '🔄',
    subtitle: 'Forma de J',
    difficulty: 2,
    color: '#f97316',
    description: 'Arrastra el botón de disparo hacia el LADO del enemigo y luego SUBE formando una J. Para snap headshots laterales.',
    when: 'Enemigo al costado, combate cercano (<10m), escopetas y pistolas',
    howTo: ['Mira al enemigo que está a tu lado', 'Toca el botón de disparo', 'Arrastra en dirección al enemigo (horizontal)', 'SIN SOLTAR, curva hacia arriba formando una J', 'Suelta al llegar a la cabeza'],
    weapons: ['M1887', 'M1014', 'Desert Eagle'],
    commonMistake: 'Hacer la J demasiado ancha. La curva debe ser AJUSTADA, como una J estrecha.',
    svgPath: 'M 30 80 Q 30 50 50 30',
  },
  {
    id: 'direction',
    name: 'Direction Drag',
    emoji: '↗️',
    subtitle: 'Seguir al Enemigo',
    difficulty: 3,
    color: '#06b6d4',
    description: 'Arrastra en la MISMA DIRECCIÓN que se mueve el enemigo mientras subes. Tu drag intercepta la cabeza en movimiento.',
    when: 'Enemigo corriendo, escapando de zona, saltando de vehículo',
    howTo: ['Observa la dirección del enemigo', 'Anticipa su posición en 0.3 segundos', 'Arrastra en ESA dirección + hacia arriba (diagonal)', 'El crosshair intercepta la cabeza en su trayectoria', 'Timing es TODO'],
    weapons: ['UMP', 'M4A1', 'AK', 'SCAR'],
    commonMistake: 'Perseguir al enemigo en vez de ANTICIPAR. Apunta a donde VA a estar, no donde está.',
    svgPath: 'M 20 80 L 70 25',
  },
  {
    id: 'situp',
    name: 'Situp Headshot',
    emoji: '🏋️',
    subtitle: 'Desde Cobertura',
    difficulty: 3,
    color: '#a855f7',
    description: 'Agachado detrás de cobertura → abrir scope → pararte → disparar INSTANTÁNEAMENTE.',
    when: 'Detrás de Gloo Wall, cajas, rocas. Con snipers y escopetas.',
    howTo: ['Agáchate detrás de cobertura', 'Pre-apunta a nivel de cabeza', 'Abre scope mientras estás agachado', 'PÁRATE y dispara en el MISMO instante', 'Todo el movimiento es UN SOLO gesto fluido'],
    weapons: ['AWM', 'SVD', 'M1887', 'Kar98K'],
    commonMistake: 'Pararse ANTES de disparar. El pararse y el disparo deben ser SIMULTÁNEOS.',
    svgPath: 'M 50 80 L 50 55 L 50 30',
  },
  {
    id: 'jumpdrag',
    name: 'Jump Drag',
    emoji: '🦅',
    subtitle: 'Headshot Aéreo',
    difficulty: 4,
    color: '#ef4444',
    description: 'Salta y arrastra el fire button SIMULTÁNEAMENTE. Headshot en el aire. La técnica más difícil pero más ESPECTACULAR.',
    when: 'Rush agresivo, 1v1 flexing, montajes para clips',
    howTo: ['Corre hacia el enemigo', 'SALTA con el botón de salto', 'EN EL AIRE, arrastra el fire button hacia arriba', 'El drag debe completarse antes de aterrizar', 'Practica 100+ veces antes de usarlo en ranked'],
    weapons: ['Desert Eagle', 'M1887', 'M1014'],
    commonMistake: 'Intentar esto en ranked sin practicar. Usa Training Ground MÍNIMO 30 minutos antes.',
    svgPath: 'M 20 80 Q 50 10 80 80',
  },
] as const;

// ═══ TRAINING DRILLS ═══
export const HEADSHOT_DRILLS = [
  { id: 'warmup', name: 'Warmup', duration: 180, weapon: 'Desert Eagle', reps: 50, objective: '70% headshots', description: 'Disparos a maniquíes estáticos. Solo headshots. Cambia distancia cada 10 disparos.', emoji: '🔥' },
  { id: 'vertical', name: 'Vertical Drag', duration: 180, weapon: 'M4A1', reps: 30, objective: '60% accuracy', description: 'Apunta al pecho del maniquí → drag vertical → headshot. Repite 30 veces.', emoji: '⬆️' },
  { id: 'rotation', name: 'Rotation Drag', duration: 180, weapon: 'M1887', reps: 20, objective: '40% accuracy', description: 'Posiciónate lateral al maniquí → J-drag → headshot. La J debe ser ajustada.', emoji: '🔄' },
  { id: 'moving', name: 'Moving Target', duration: 180, weapon: 'UMP', reps: 20, objective: '30% accuracy', description: 'Direction drag a maniquíes móviles o practica 1v1 custom contra amigo.', emoji: '↗️' },
  { id: 'rotation_weapons', name: 'Rotación de Armas', duration: 180, weapon: 'Varias', reps: 40, objective: '10 headshots c/u', description: 'Rota: Desert Eagle → M1887 → M4A1 → AWM. 10 headshots con cada una.', emoji: '🔄' },
] as const;

// ═══ CROSSHAIR TIPS ═══
export const CROSSHAIR_TIPS = [
  'SIEMPRE mantén el crosshair a nivel de CABEZA. Nunca al pecho, nunca al suelo.',
  'Pre-apunta a nivel de cabeza ANTES de ver al enemigo. Cuando aparezca, solo dispara.',
  'El aim assist de Free Fire favorece BODY SHOTS. El drag manual es ESENCIAL para headshots.',
  'Activa "Precise on Scope" en Ajustes → En Partida para headshots más limpios.',
  'Activa "Quick Weapon Switch" para combos: disparo → switch → disparo headshot.',
  'Gráficos en Smooth + High FPS = mejor respuesta táctil = mejores headshots.',
  'DPI del sistema entre 480-600 es óptimo para drag headshots.',
  'El tamaño del botón de disparo importa: 50-70% es el sweet spot para drag.',
  'Practica 10-15 minutos DIARIOS en Training Ground. Músculo memoria > sensibilidad.',
  'En combate cercano, apunta al cuello. El retroceso natural sube al headshot.',
] as const;
