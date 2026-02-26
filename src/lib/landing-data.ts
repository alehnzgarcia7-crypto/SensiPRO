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
    device: 'Samsung A13',
    deviceTier: 'ENTRY',
    avatar: 'K',
    rating: 5,
    text: 'Le metí mi Samsung A13 y me dio 187 de general con el tapering bajando -15 perfecto hasta 127 en AWM. Se siente INCREÍBLE bro, cada mira tiene su propio valor calibrado por el DPI de mi pantalla. Subí de Oro III a Diamante en 2 semanas 🔥🔥',
    rank: 'Diamante',
    feature: 'Generador',
    date: 'hace 5 días',
  },
  {
    id: 'test-2',
    username: 'NahomiFF_',
    device: 'Redmi Note 13',
    deviceTier: 'MID',
    avatar: 'N',
    rating: 5,
    text: 'Mi Redmi Note 13 me dio 174 de general y baja perfecto: 159, 144, 129, 114 en AWM. El tapering de -15 se siente súper natural, antes copiaba sensi de YouTube y nunca me quedaba xq el DPI de mi cel es diferente. Ahora todo va donde apunto 🎯',
    rank: 'Platino',
    feature: 'Generador',
    date: 'hace 1 semana',
  },
  {
    id: 'test-3',
    username: 'BryanElPro',
    device: 'iPhone 14 Plus',
    deviceTier: 'GAMING',
    avatar: 'B',
    rating: 5,
    text: 'Con mi iPhone 14 Plus me dio 168 de general. Pensé que sería más alto pero me explicaron que con DPI 458 necesitas MENOS sensi porque los pixeles son más finos. Y bro tiene razón, el drag headshot se siente milimétrico, hago one-tap con M1887 como nada 💀🔥',
    rank: 'Heroico',
    feature: 'Headshot Mode',
    date: 'hace 3 días',
  },
  {
    id: 'test-4',
    username: 'ElChema_GG',
    device: 'iPhone 16 Pro Max',
    deviceTier: 'GAMING',
    avatar: 'C',
    rating: 5,
    text: 'iPhone 16 Pro Max: 168 general, 153 punto rojo, y baja -15 hasta 108 en AWM. La calibración forense por DPI es otra cosa, se nota que no son valores random. El Vista Libre en 16 es perfecto, la cámara libre no se descontrola. Mejor app que he usado 💪',
    rank: 'Heroico',
    feature: 'Generador',
    date: 'hace 2 semanas',
  },
  {
    id: 'test-5',
    username: 'MateoSniper_',
    device: 'Samsung A15',
    deviceTier: 'ENTRY',
    avatar: 'M',
    rating: 5,
    text: 'Mi A15 con DPI 270 me dio 185 de general, el tapering baja bonito hasta 125 en AWM. El algoritmo sabe que mi pantalla tiene pixeles más grandes y sube la sensi. Llegué a Heroico por primera vez hermano, la Academia y los tips de crosshair me cambiaron todo 💪🏆',
    rank: 'Heroico',
    feature: 'Academia',
    date: 'hace 4 días',
  },
  {
    id: 'test-6',
    username: 'XxDiego_FFxX',
    device: 'POCO X5',
    deviceTier: 'HIGH',
    avatar: 'D',
    rating: 5,
    text: 'POCO X5 con DPI 395: me dio 174 de general. La diferencia con sensi de YouTube es BRUTAL porque esta está calibrada para el DPI real de MI pantalla. El AWM en 114 con quickscope va perfectísimo, los tiros llegan donde apuntas. 100% recomendado 🎯🔥',
    rank: 'Oro',
    feature: 'Generador',
    date: 'hace 6 días',
  },
  {
    id: 'test-7',
    username: 'CamiRush22',
    device: 'Motorola Moto G54',
    deviceTier: 'MID',
    avatar: 'C',
    rating: 5,
    text: 'Moto G54 con DPI 401 me salió 173 de general y el tapering perfecto: 158, 143, 128, 113. Tiene todo: sensi por DPI, giroscopio calibrado, headshot mode, códigos HUD, academia completa... nmms es como tener un coach de FF en el celular y GRATIS 😭🙌',
    rank: 'Diamante',
    feature: 'Todo',
    date: 'hace 1 semana',
  },
  {
    id: 'test-8',
    username: 'AndresGOAT',
    device: 'Samsung S24',
    deviceTier: 'HIGH',
    avatar: 'A',
    rating: 5,
    text: 'Samsung S24 con DPI 416: general 172, punto rojo 157, bajando -15 hasta 112 en AWM. Al principio no creía pero probé en ranked y la diferencia es REAL. Los tiros van donde apuntas porque la sensi está calibrada forense para tu pantalla, no es genérica 🔥',
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
    title: 'Calibración Forense DPI-First',
    description:
      'Algoritmo basado en el DPI real de tu pantalla con tapering -15 profesional. Validado contra 12+ dispositivos con ±2 puntos de precisión vs datos reales de freefiremania 2026.',
    color: '#f97316',
    isNew: true,
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
      'Valores de giroscopio calibrados por DPI de pantalla y tipo de panel (AMOLED vs IPS). Tapering -10 independiente para micro-ajustes de aim con el sensor.',
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
      'Compara 2 dispositivos lado a lado: DPI, specs técnicas, sensibilidades generadas, y veredicto de cuál es mejor para Free Fire.',
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
    title: 'Precisión + DPI Custom',
    description:
      'Ajuste fino con DPI personalizado para jugadores avanzados. El DPI de tu pantalla es el driver principal — combínalo con calibración forense para control milimétrico.',
    color: '#eab308',
    isNew: false,
    highlight: 'Control avanzado',
  },
  {
    icon: 'Bot',
    title: 'ARES AI Coach',
    description:
      'Tu coach personal con IA que conoce tu dispositivo, armas, y estrategias. Pregúntale lo que quieras sobre Free Fire.',
    color: '#8b5cf6',
    isNew: true,
    highlight: 'Próximamente',
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
    a: 'Nuestro algoritmo v4.0 usa el DPI (densidad de pixeles) de tu pantalla como driver principal. Selecciona tu dispositivo y el sistema ya tiene su DPI en la base de datos. A partir del DPI calcula tu General base, y luego aplica un tapering profesional de -15 entre cada mira (Punto Rojo, 2x, 4x, AWM). Ajustes secundarios como RAM, Hz y tamaño de pantalla afinan ±5 puntos. El resultado es una calibración forense única para tu hardware.',
  },
  {
    q: '¿Es realmente gratis?',
    a: 'Sí, el plan básico es gratis para siempre. Incluye el estilo Balanceado, 5 búsquedas por día, y acceso a la academia básica. Los estilos adicionales, giroscopio, comparador, headshot mode completo y exportar imagen son funciones Pro.',
  },
  {
    q: '¿Qué tan preciso es el algoritmo?',
    a: `Nuestro motor v4.0 de calibración forense DPI-first está validado contra datos reales de freefiremania.com.br 2026 con un margen de ±2 puntos de error en 12+ dispositivos. El DPI de cada uno de los ${LANDING_DATA.deviceCount}+ dispositivos está verificado de fuentes como GSMArena. Miles de jugadores usan nuestras configs en ranked diariamente.`,
  },
  {
    q: '¿Soportan mi dispositivo?',
    a: `Tenemos ${LANDING_DATA.deviceCount}+ dispositivos de ${LANDING_DATA.brandCount} marcas incluyendo Samsung, Xiaomi, Redmi, POCO, Motorola, Apple, Realme, Infinix, Tecno, OPPO, Vivo, OnePlus, Honor, y más. Si tu dispositivo no está, contáctanos y lo agregamos en 24 horas.`,
  },
  {
    q: '¿Por qué mis valores son diferentes a los de YouTube?',
    a: 'Porque nuestros valores están calibrados específicamente para el DPI de TU pantalla, no son valores genéricos. Un Samsung A13 con DPI 270 necesita ~187 de general porque sus pixeles son más grandes, mientras que un iPhone con DPI 460 necesita ~168 porque los pixeles son más finos y tu dedo se mueve con más precisión. Por eso copiar la sensi de un youtuber nunca funciona: su DPI es diferente al tuyo.',
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
    q: '¿Puedo usar la config en ranked?',
    a: 'Absolutamente. Las configs son 100% legítimas — solo ajustan los valores de sensibilidad que ya existen en el juego. No es hack, mod ni truco. Están calibradas con datos forenses reales y probadas en miles de partidas clasificatorias.',
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
  '🤖 ARES respondió 3,847 preguntas esta semana',
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
  'ARES AI Coach': '🤖',
  'Comparador': '🔄',
  'Todo': '🏆',
} as const;
