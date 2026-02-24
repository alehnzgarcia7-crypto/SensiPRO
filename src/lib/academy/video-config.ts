// ═══════════════════════════════════════════════════════════════
// ARES-302 — Video Integration: configuración y catálogo de videos
// 12 tutoriales organizados por categoría y dificultad
// ═══════════════════════════════════════════════════════════════

export type VideoDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: string;
  duration: string;
  difficulty: VideoDifficulty;
  isPremium: boolean;
  tags: string[];
}

export const DIFFICULTY_LABELS: Record<VideoDifficulty, { label: string; color: string }> = {
  BEGINNER: { label: 'Principiante', color: 'text-green-400 bg-green-500/20' },
  INTERMEDIATE: { label: 'Intermedio', color: 'text-yellow-400 bg-yellow-500/20' },
  ADVANCED: { label: 'Avanzado', color: 'text-red-400 bg-red-500/20' },
};

export const VIDEO_TUTORIALS: VideoTutorial[] = [
  // ── SENSITIVITY ──────────────────────────────────────
  {
    id: 'vid-sens-01',
    title: 'Cómo Configurar la Sensibilidad Perfecta',
    description:
      'Tutorial paso a paso para encontrar tu sensibilidad ideal según tu dispositivo y estilo de juego.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'SENSITIVITY',
    duration: '12:34',
    difficulty: 'BEGINNER',
    isPremium: false,
    tags: ['sensibilidad', 'configuración', 'principiante'],
  },
  {
    id: 'vid-sens-02',
    title: 'Sensibilidad PRO: Técnica de los 3 Pasos',
    description:
      'El método que usan los jugadores profesionales para calibrar su sensibilidad en 15 minutos.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'SENSITIVITY',
    duration: '18:22',
    difficulty: 'ADVANCED',
    isPremium: true,
    tags: ['sensibilidad', 'pro', 'calibración'],
  },
  {
    id: 'vid-sens-03',
    title: 'Giroscopio para Principiantes',
    description: 'Aprende a usar el giroscopio desde cero con ejercicios prácticos.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'SENSITIVITY',
    duration: '15:45',
    difficulty: 'BEGINNER',
    isPremium: false,
    tags: ['giroscopio', 'principiante', 'tutorial'],
  },
  // ── AIM ──────────────────────────────────────────────
  {
    id: 'vid-aim-01',
    title: 'Aim Training: Rutina de 10 Minutos',
    description: 'Rutina diaria de práctica de aim que mejora tu puntería en 2 semanas.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'AIM',
    duration: '10:15',
    difficulty: 'BEGINNER',
    isPremium: false,
    tags: ['aim', 'práctica', 'rutina'],
  },
  {
    id: 'vid-aim-02',
    title: 'Headshot Masterclass',
    description: 'Técnicas avanzadas para subir tu headshot rate por encima del 40%.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'AIM',
    duration: '22:10',
    difficulty: 'ADVANCED',
    isPremium: true,
    tags: ['headshot', 'avanzado', 'masterclass'],
  },
  // ── MOVEMENT ─────────────────────────────────────────
  {
    id: 'vid-mov-01',
    title: 'Movimiento Básico que TODO Jugador Debe Saber',
    description: 'Drop shot, jiggle peek, side step y las bases del movimiento en FF.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'MOVEMENT',
    duration: '14:30',
    difficulty: 'BEGINNER',
    isPremium: false,
    tags: ['movimiento', 'básico', 'drop shot'],
  },
  {
    id: 'vid-mov-02',
    title: 'Gloo Wall Tricks que Nadie te Enseña',
    description: '10 trucos con gloo wall que te harán parecer un hacker.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'MOVEMENT',
    duration: '16:55',
    difficulty: 'INTERMEDIATE',
    isPremium: false,
    tags: ['gloo wall', 'trucos', 'intermedio'],
  },
  // ── STRATEGY ─────────────────────────────────────────
  {
    id: 'vid-strat-01',
    title: 'Cómo Subir a Heroico en una Semana',
    description:
      'Estrategia completa para subir de rango rápido: aterrizajes, rotaciones y endgame.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'STRATEGY',
    duration: '25:00',
    difficulty: 'INTERMEDIATE',
    isPremium: false,
    tags: ['ranked', 'heroico', 'estrategia'],
  },
  {
    id: 'vid-strat-02',
    title: 'IGL Masterclass: Lidera tu Squad',
    description:
      'Cómo ser el líder de tu equipo: callouts, decisiones y gestión del tilt.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'STRATEGY',
    duration: '20:40',
    difficulty: 'ADVANCED',
    isPremium: true,
    tags: ['IGL', 'liderazgo', 'squad'],
  },
  // ── META ─────────────────────────────────────────────
  {
    id: 'vid-meta-01',
    title: 'Tier List de Armas Actualizada',
    description:
      'Análisis de cada arma del juego con stats, pros, contras y recomendaciones.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'META',
    duration: '19:30',
    difficulty: 'BEGINNER',
    isPremium: false,
    tags: ['armas', 'tier list', 'meta'],
  },
  // ── DEVICE ───────────────────────────────────────────
  {
    id: 'vid-dev-01',
    title: 'Configuración PERFECTA de Gráficos',
    description:
      'Cómo configurar Free Fire para máximo FPS sin sacrificar visibilidad.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'DEVICE',
    duration: '11:20',
    difficulty: 'BEGINNER',
    isPremium: false,
    tags: ['gráficos', 'FPS', 'configuración'],
  },
  {
    id: 'vid-dev-02',
    title: 'Jugar con Controlador Bluetooth',
    description: 'Cómo conectar y configurar un controlador Bluetooth para Free Fire.',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'DEVICE',
    duration: '08:45',
    difficulty: 'INTERMEDIATE',
    isPremium: false,
    tags: ['controlador', 'bluetooth', 'setup'],
  },
];

export function getVideosByCategory(category?: string): VideoTutorial[] {
  if (!category) return VIDEO_TUTORIALS;
  return VIDEO_TUTORIALS.filter((v) => v.category === category);
}

export function getVideoById(id: string): VideoTutorial | undefined {
  return VIDEO_TUTORIALS.find((v) => v.id === id);
}

export function searchVideos(query: string): VideoTutorial[] {
  const lower = query.toLowerCase();
  return VIDEO_TUTORIALS.filter(
    (v) =>
      v.title.toLowerCase().includes(lower) ||
      v.description.toLowerCase().includes(lower) ||
      v.tags.some((t) => t.toLowerCase().includes(lower)),
  );
}
