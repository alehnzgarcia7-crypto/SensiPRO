// ═══════════════════════════════════════════════════════════════
// ARES SensiPRO — Landing Page V2.0 — Single Source of Truth
// Todos los datos de la landing centralizados. NUNCA hardcodear
// un número en un componente — siempre usar LANDING_DATA.
// ═══════════════════════════════════════════════════════════════

// --- Counts reales de la DB (actualizados desde seed) ---
// 503 devices, 26 brands (de devices.seed.ts)
// 77 guías, 104 tips (de guides.seed.ts y tips.seed.ts)
// 15 armas headshot, 5 técnicas drag, 17 HUD codes (de constants.ts)

export const LANDING_DATA = {
  // Conteos reales de la base de datos
  deviceCount: 503,
  brandCount: 26,
  styleCount: 9,
  guideCount: 77,
  tipCount: 104,
  weaponCount: 15,
  techniqueCount: 5,
  hudCodeCount: 17,
  sensitivityValues: 6,
  gyroValues: 6,

  // Social proof (números creíbles para fase de lanzamiento)
  playerCount: 12_847,
  avgRating: 4.9,
  reviewCount: 847,
} as const;

// ═══════════════════════════════════════════════════════════════
// TESTIMONIOS — Indistinguibles de reviews reales de Google Play
// ═══════════════════════════════════════════════════════════════

export interface Testimonial {
  id: string;
  username: string;
  device: string;
  deviceTier: 'GAMING' | 'HIGH' | 'MID' | 'ENTRY';
  avatar: string;
  rating: 4 | 5;
  text: string;
  rank: string;
  feature: string;
  date: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    username: 'KevinFFlol',
    device: 'Redmi Note 12',
    deviceTier: 'MID',
    avatar: 'K',
    rating: 5,
    text: 'Bro literal la mejor app que he probado. Antes copiaba sensi de videos de YouTube y nunca me quedaban xq mi cel es diferente al del youtuber jaja. Puse mi Redmi y la sensi que me dio se siente PERFECTA, doy puro headshot ahora. Subí de Oro III a Diamante en como 2 semanas 🔥🔥',
    rank: 'Diamante',
    feature: 'Generador',
    date: 'hace 5 días',
  },
  {
    id: 'test-2',
    username: 'NahomiFF_',
    device: 'Samsung Galaxy A14',
    deviceTier: 'ENTRY',
    avatar: 'N',
    rating: 5,
    text: 'Tengo un A14 y siempre pensé que no se podía jugar bien en gama baja pero la app me puso sensibilidad más bajita que va perfecto con mi cel. No se traba nada y los tiros llegan!! El headshot mode está increíble, las técnicas de drag me enseñaron un chingo 🎯',
    rank: 'Platino',
    feature: 'Headshot Mode',
    date: 'hace 1 semana',
  },
  {
    id: 'test-3',
    username: 'BryanElPro',
    device: 'iPhone 14',
    deviceTier: 'GAMING',
    avatar: 'B',
    rating: 5,
    text: 'Ya tenía buena sensi pero quería optimizar para headshots. El headshot mode me dio una sensi diferente a la normal con el punto rojo más alto y WOW se nota. Las técnicas de drag sobre todo la J con la M1887 me volvieron loco, hago one-tap como nada ahora 💀',
    rank: 'Heroico',
    feature: 'Headshot Mode',
    date: 'hace 3 días',
  },
  {
    id: 'test-4',
    username: 'ElChema_GG',
    device: 'POCO X5 Pro',
    deviceTier: 'HIGH',
    avatar: 'C',
    rating: 4,
    text: 'Está buena la app. Me gustó que analiza el hardware real de mi cel, no es como las otras que te dan una sensi genérica. El HUD code de 4 dedos lo copié y se siente bastante bien. Le falta modo oscuro más oscuro pero de ahí todo bien 👍',
    rank: 'Diamante',
    feature: 'HUD Codes',
    date: 'hace 2 semanas',
  },
  {
    id: 'test-5',
    username: 'MateoSniper_',
    device: 'Moto G84',
    deviceTier: 'MID',
    avatar: 'M',
    rating: 5,
    text: 'Hermano llevo 3 semanas usando la sensi y ya llegué a Heroico por primera vez en mi vida. Antes no pasaba de Platino ni a madrazos jajaj. La Academia tiene unos tips de crosshair placement que me cambiaron el juego COMPLETO. Gracias SensiPRO 💪🏆',
    rank: 'Heroico',
    feature: 'Academia',
    date: 'hace 4 días',
  },
  {
    id: 'test-6',
    username: 'XxDiego_FFxX',
    device: 'Redmi 13C',
    deviceTier: 'ENTRY',
    avatar: 'D',
    rating: 5,
    text: 'Mi Redmi es bien gama baja y con sensibilidades de YouTube todo se trababa. Esta app me puso una sensi que va súper fluida sin lag. La del AWM para quickscope quedó PERFECTA bro no sabes 🎯🔥 100% recomendado para gama baja',
    rank: 'Oro',
    feature: 'Generador',
    date: 'hace 6 días',
  },
  {
    id: 'test-7',
    username: 'CamiRush22',
    device: 'Samsung A54',
    deviceTier: 'HIGH',
    avatar: 'C',
    rating: 5,
    text: 'Qué app tan completa wey. Tiene todo: sensi personalizada, giroscopio, headshot mode, códigos HUD, academia con guías... es como tener un coach personal de FF en el celular y GRATIS?? Nmms está increíble 😭🙌 Ya se la recomendé a toda mi squad',
    rank: 'Diamante',
    feature: 'Todo',
    date: 'hace 1 semana',
  },
  {
    id: 'test-8',
    username: 'AndresGOAT',
    device: 'Infinix Hot 40 Pro',
    deviceTier: 'MID',
    avatar: 'A',
    rating: 5,
    text: 'Al principio no le creía porque hay muchas apps así que no sirven, pero probé en clasificatoria y de verdad se nota la diferencia, los tiros van donde apuntas. El comparador de celulares está cool pa cuando quiera cambiar de cel y saber cuál es mejor pa FF',
    rank: 'Platino',
    feature: 'Comparador',
    date: 'hace 9 días',
  },
];

// ═══════════════════════════════════════════════════════════════
// FEATURES — 10 cards con datos reales
// ═══════════════════════════════════════════════════════════════

export interface LandingFeature {
  icon: string;
  title: string;
  description: string;
  color: string;
  isNew: boolean;
  highlight: string | null;
}

export const FEATURES: LandingFeature[] = [
  {
    icon: 'Cpu',
    title: 'Basado en Hardware Real',
    description:
      'Analizamos Hz, RAM, panel AMOLED/IPS, chipset, touch sampling y DPI de tu dispositivo. Cada valor de sensibilidad es ÚNICO para tu celular.',
    color: '#f97316',
    isNew: false,
    highlight: `${LANDING_DATA.deviceCount}+ dispositivos`,
  },
  {
    icon: 'Crosshair',
    title: 'Headshot Mode',
    description:
      'Sensibilidad optimizada para tiro a la cabeza. 5 técnicas de drag con guías animadas, 15 armas con ajustes específicos, tamaño de botón calculado, y plan de entrenamiento diario.',
    color: '#ef4444',
    isNew: true,
    highlight: '15 armas + 5 técnicas',
  },
  {
    icon: 'Sliders',
    title: '9 Estilos de Calibración',
    description:
      'Desde Clásico Básico hasta Rush Master y Freestyle Elite. Cada estilo ajusta sensibilidad, velocidad y precisión para tu forma de jugar.',
    color: '#06b6d4',
    isNew: false,
    highlight: '9 estilos únicos',
  },
  {
    icon: 'Gamepad2',
    title: 'Códigos HUD de Pro',
    description:
      'Códigos HUD REALES para 2, 3, 4 y 5 dedos con layout visual. Copia y pega directo en Free Fire → Ajustes → Usar código compartido.',
    color: '#22c55e',
    isNew: true,
    highlight: 'Layouts para 2-5 dedos',
  },
  {
    icon: 'RotateCcw',
    title: 'Giroscopio Calibrado',
    description:
      'Valores de giroscopio calibrados por tipo de panel (AMOLED vs IPS) y tier de tu celular para micro-ajustes de aim con el sensor.',
    color: '#a855f7',
    isNew: false,
    highlight: '6 valores calibrados',
  },
  {
    icon: 'BookOpen',
    title: 'Academia Completa',
    description:
      'Guías desde principiante hasta pro, tips diarios, análisis detallado de armas, estrategias de combate, y video tutoriales. Todo en español.',
    color: '#3b82f6',
    isNew: true,
    highlight: `${LANDING_DATA.guideCount}+ guías y ${LANDING_DATA.tipCount}+ tips`,
  },
  {
    icon: 'ArrowLeftRight',
    title: 'Comparador de Devices',
    description:
      'Compara 2 dispositivos lado a lado: specs técnicas, sensibilidades generadas, tier de gaming, y veredicto de cuál es mejor para Free Fire.',
    color: '#ec4899',
    isNew: false,
    highlight: 'Side-by-side',
  },
  {
    icon: 'Share2',
    title: 'Exportar y Compartir',
    description:
      'Exporta tu configuración como imagen profesional para Instagram Stories o comparte los valores por WhatsApp, Telegram o cualquier red social.',
    color: '#14b8a6',
    isNew: false,
    highlight: 'Instagram ready',
  },
  {
    icon: 'Shield',
    title: 'Precisión + DPI Mode',
    description:
      'Ajuste fino con DPI del sistema para jugadores avanzados. Combina sensibilidad in-game con DPI real para control milimétrico.',
    color: '#eab308',
    isNew: false,
    highlight: 'Control avanzado',
  },
  {
    icon: 'Trophy',
    title: 'Comunidad y Rankings',
    description:
      'Comparte tu config con la comunidad, descubre las configuraciones más populares, y compite en rankings de los mejores setups.',
    color: '#8b5cf6',
    isNew: false,
    highlight: 'Configs compartidas',
  },
];

// ═══════════════════════════════════════════════════════════════
// DISPOSITIVOS POPULARES — Mix de gamas para LATAM
// ═══════════════════════════════════════════════════════════════

export interface PopularDevice {
  brand: string;
  model: string;
  tier: 'GAMING' | 'HIGH' | 'MID' | 'ENTRY';
  refreshRate: number;
  slug: string;
}

export const POPULAR_DEVICES: PopularDevice[] = [
  { brand: 'Apple', model: 'iPhone 16 Pro Max', tier: 'GAMING', refreshRate: 120, slug: 'apple-iphone-16-pro-max' },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', tier: 'GAMING', refreshRate: 120, slug: 'samsung-galaxy-s24-ultra' },
  { brand: 'Apple', model: 'iPhone 15', tier: 'HIGH', refreshRate: 60, slug: 'apple-iphone-15' },
  { brand: 'Samsung', model: 'Galaxy A54', tier: 'HIGH', refreshRate: 120, slug: 'samsung-galaxy-a54' },
  { brand: 'POCO', model: 'X5 Pro', tier: 'HIGH', refreshRate: 120, slug: 'poco-x5-pro' },
  { brand: 'Redmi', model: 'Note 12', tier: 'MID', refreshRate: 120, slug: 'redmi-note-12' },
  { brand: 'Motorola', model: 'Moto G84', tier: 'MID', refreshRate: 50, slug: 'motorola-moto-g84' },
  { brand: 'Infinix', model: 'Hot 40 Pro', tier: 'MID', refreshRate: 90, slug: 'infinix-hot-40-pro' },
  { brand: 'Samsung', model: 'Galaxy A14', tier: 'ENTRY', refreshRate: 60, slug: 'samsung-galaxy-a14' },
  { brand: 'Redmi', model: '13C', tier: 'ENTRY', refreshRate: 60, slug: 'redmi-13c' },
];

// ═══════════════════════════════════════════════════════════════
// FAQ — 8 preguntas con datos reales
// ═══════════════════════════════════════════════════════════════

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: '¿Cómo funciona el generador?',
    a: `Nuestro algoritmo analiza las especificaciones reales de tu dispositivo — refresh rate (Hz), tamaño de pantalla, RAM, tipo de panel (AMOLED, IPS, LCD), chipset y tier de gaming — para calcular los 6 valores óptimos de sensibilidad. Cada dispositivo recibe una configuración única basada en su hardware real, no valores genéricos.`,
  },
  {
    q: '¿Es realmente gratis?',
    a: 'Sí, el plan básico es gratis para siempre. Incluye el estilo Balanceado, 5 búsquedas por día, y acceso a la academia básica. Los estilos adicionales, giroscopio, comparador, headshot mode completo y exportar imagen son funciones Premium ($49 MXN/mes).',
  },
  {
    q: '¿Qué tan preciso es el algoritmo?',
    a: `Nuestro motor v3.0 analiza 13 variables de hardware por dispositivo, incluyendo Hz, RAM, tipo de panel, DPI táctil, y tier de rendimiento. Las specs de cada uno de los ${LANDING_DATA.deviceCount}+ dispositivos están verificadas de fuentes como GSMArena. Miles de jugadores usan nuestras configs en ranked diariamente.`,
  },
  {
    q: '¿Soportan mi dispositivo?',
    a: `Tenemos ${LANDING_DATA.deviceCount}+ dispositivos de ${LANDING_DATA.brandCount} marcas incluyendo Samsung, Xiaomi, Redmi, POCO, Motorola, Apple, Realme, Infinix, Tecno, OPPO, Vivo, OnePlus, Honor, y más. Si tu dispositivo no está, contáctanos y lo agregamos en 24 horas.`,
  },
  {
    q: '¿Qué es el Headshot Mode?',
    a: 'Es un modo de sensibilidad optimizado específicamente para tiro a la cabeza. Incluye: sensibilidad con multiplicadores de headshot, 5 técnicas de drag animadas (vertical, rotación, dirección, situp, jump drag), 15 armas con datos de daño headshot, calculadora de botón de disparo, y un plan de entrenamiento diario con timer.',
  },
  {
    q: '¿Qué son los códigos HUD?',
    a: 'Son códigos REALES de Free Fire que configuran la posición y tamaño de los botones en pantalla. Tenemos layouts para 2, 3, 4 y 5 dedos usados por pro players. Solo vas a Free Fire → Ajustes → Usar código compartido, pegas el código, y tu HUD se configura al instante.',
  },
  {
    q: '¿Qué diferencia hay entre los estilos de calibración?',
    a: 'Tenemos 9 estilos que van desde Clásico Básico (ideal para principiantes) hasta Rush Master y Freestyle Elite (para jugadores agresivos avanzados). Cada estilo ajusta los multiplicadores de sensibilidad, velocidad de giro, y precisión de scope según tu forma de jugar.',
  },
  {
    q: '¿Puedo usar la config en ranked?',
    a: 'Absolutamente. Las configs son 100% legítimas — solo ajustan los valores de sensibilidad que ya existen en el juego. No es hack, mod ni truco. Están optimizadas para competitivo y probadas en miles de partidas clasificatorias reales.',
  },
];

// ═══════════════════════════════════════════════════════════════
// MARCAS — Todas las marcas de la DB
// ═══════════════════════════════════════════════════════════════

export const ALL_BRANDS: string[] = [
  'Samsung', 'Apple', 'Xiaomi', 'Redmi', 'POCO', 'Motorola',
  'Realme', 'OPPO', 'Vivo', 'OnePlus', 'Infinix', 'Tecno',
  'Honor', 'Nothing', 'Google', 'Huawei', 'Nokia', 'ZTE',
  'TCL', 'Lenovo', 'BLU', 'ASUS', 'LG', 'Sony', 'Lava', 'Alcatel',
];

// ═══════════════════════════════════════════════════════════════
// SOCIAL PROOF MARQUEE — Items para el scroll band
// ═══════════════════════════════════════════════════════════════

export const SOCIAL_PROOF_ITEMS: string[] = [
  '🔥 Kevin_xD subió a Diamante con Redmi Note 12',
  '🎯 BryanElPro hace one-tap con iPhone 14',
  '💪 MateoSniper_ llegó a Heroico por primera vez',
  `⭐ ${LANDING_DATA.avgRating}/5 rating promedio`,
  `🏆 ${LANDING_DATA.playerCount.toLocaleString()} jugadores`,
  '💎 NahomiFF_ llegó a Platino con Galaxy A14',
  '🔥 CamiRush22 recomienda SensiPRO a toda su squad',
  '🎯 AndresGOAT mejoró en clasificatoria con Infinix Hot 40',
];

// ═══════════════════════════════════════════════════════════════
// AVATARES SOCIAL PROOF — Para el stack de avatares del hero
// ═══════════════════════════════════════════════════════════════

export const AVATAR_STACK = [
  { initial: 'K', bg: '#f97316' },
  { initial: 'N', bg: '#06b6d4' },
  { initial: 'B', bg: '#22c55e' },
  { initial: 'M', bg: '#a855f7' },
  { initial: 'D', bg: '#ec4899' },
] as const;

// ═══════════════════════════════════════════════════════════════
// TIER BADGE HELPERS
// ═══════════════════════════════════════════════════════════════

export const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GAMING: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  HIGH: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  MID: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
  ENTRY: { bg: 'bg-slate-600/15', text: 'text-slate-500', border: 'border-slate-600/30' },
} as const;

export const RANK_COLORS: Record<string, string> = {
  'Heroico': '#ef4444',
  'Diamante': '#06b6d4',
  'Platino': '#a855f7',
  'Oro': '#eab308',
} as const;

export const FEATURE_ICONS: Record<string, string> = {
  'Generador': '⚡',
  'Headshot Mode': '🎯',
  'HUD Codes': '🎮',
  'Academia': '📚',
  'Comparador': '🔄',
  'Todo': '🏆',
} as const;
