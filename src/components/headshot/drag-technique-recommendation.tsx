'use client';

// ═══════════════════════════════════════════════════════════════
// Técnica de Drag Recomendada — 1 técnica según estilo + dedos
// ═══════════════════════════════════════════════════════════════

import type { FingerCount } from '@ares/algorithms';

type Playstyle = 'AGGRESSIVE' | 'BALANCED' | 'SNIPER';
type Difficulty = 'Fácil' | 'Media' | 'Avanzada';

interface DragTechnique {
  nombre: string;
  dificultad: Difficulty;
  distancia: string;
  descripcion: string;
  mejorCon: string[];
  timing: string;
}

const TECHNIQUE_MAP: Record<Playstyle, Record<FingerCount, DragTechnique>> = {
  AGGRESSIVE: {
    2: {
      nombre: 'Drag en J',
      dificultad: 'Media',
      distancia: 'Corta (0-10m)',
      descripcion: 'Arrastra formando una J — primero hacia el enemigo, luego SUBE. Perfecto para one-taps con escopeta.',
      mejorCon: ['M1887', 'M1014', 'Desert Eagle', 'MP40'],
      timing: '~0.3s',
    },
    3: {
      nombre: 'Drag en J + Peek & Fire',
      dificultad: 'Media',
      distancia: 'Corta (0-10m)',
      descripcion: 'J-Drag con tu pulgar mientras el índice hace peek (agacharse/levantarse). El enemigo no puede apuntarte bien porque te asomas y te escondes.',
      mejorCon: ['M1887', 'MP40', 'M1014', 'MAC10'],
      timing: '~0.4s',
    },
    4: {
      nombre: 'Jump Drag',
      dificultad: 'Avanzada',
      distancia: 'Media (10-30m)',
      descripcion: 'Saltas + disparas + arrastras la mira hacia arriba todo al mismo tiempo. El enemigo no puede predecir dónde vas a caer. Solo funciona bien con 4 dedos.',
      mejorCon: ['Desert Eagle', 'MP40', 'M1887', 'SCAR'],
      timing: '~0.5s',
    },
  },
  BALANCED: {
    2: {
      nombre: 'Drag Vertical',
      dificultad: 'Fácil',
      distancia: 'Media (10-30m)',
      descripcion: 'La técnica más básica y efectiva. Apunta al pecho, dispara, y arrastra RECTO HACIA ARRIBA. El crosshair sube del pecho a la cabeza mientras disparas.',
      mejorCon: ['SCAR', 'M4A1', 'MP40', 'AK47'],
      timing: '~0.5s',
    },
    3: {
      nombre: 'Direction Drag',
      dificultad: 'Media',
      distancia: 'Media (10-50m)',
      descripcion: 'Sigues la dirección del enemigo con el dedo y luego curvas hacia arriba. Perfecto cuando el enemigo corre de lado a lado.',
      mejorCon: ['M4A1', 'SCAR', 'AK47', 'Woodpecker'],
      timing: '~0.5s',
    },
    4: {
      nombre: 'Flick Shot',
      dificultad: 'Avanzada',
      distancia: 'Todas',
      descripcion: 'Mantienes la mira a nivel de la cabeza y esperas. Cuando el enemigo aparece, haces un micro-movimiento instantáneo para conectar. Requiere mucha práctica.',
      mejorCon: ['Desert Eagle', 'AWM', 'M4A1', 'SCAR'],
      timing: 'Instantáneo',
    },
  },
  SNIPER: {
    2: {
      nombre: 'Situp Headshot',
      dificultad: 'Fácil',
      distancia: 'Media (10-30m)',
      descripcion: 'Te agachas detrás de cobertura, abres la mira, te levantas y disparas. Al levantarte, la mira sube naturalmente del pecho a la cabeza. Simple y letal.',
      mejorCon: ['AWM', 'Woodpecker', 'M1887', 'Dragunov'],
      timing: '~0.5s',
    },
    3: {
      nombre: 'Situp + One-Tap',
      dificultad: 'Media',
      distancia: 'Media-Larga (20-50m+)',
      descripcion: 'Mismo que Situp pero sueltas el disparo inmediatamente después de levantarte. Un solo disparo. El índice hace el peek mientras el pulgar apunta.',
      mejorCon: ['AWM', 'Woodpecker', 'Desert Eagle', 'Kar98k'],
      timing: '~0.3s',
    },
    4: {
      nombre: 'Flick Shot',
      dificultad: 'Avanzada',
      distancia: 'Larga (50m+)',
      descripcion: 'Pre-apuntas a la cabeza y esperas. Cuando el enemigo se asoma, micro-flick instantáneo. Con 4 dedos puedes hacer scope + flick + agacharte en 1 movimiento.',
      mejorCon: ['AWM', 'Woodpecker', 'Desert Eagle', 'SCAR'],
      timing: 'Instantáneo',
    },
  },
};

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  'Fácil': 'bg-green-500/15 text-green-400 border-green-500/20',
  'Media': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Avanzada': 'bg-red-500/15 text-red-400 border-red-500/20',
};

interface DragTechniqueRecommendationProps {
  playstyle: Playstyle;
  fingers: FingerCount;
}

export function DragTechniqueRecommendation({ playstyle, fingers }: DragTechniqueRecommendationProps) {
  const tech = TECHNIQUE_MAP[playstyle][fingers];

  return (
    <div className="glass-card p-6">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-4">
        🎯 Tu Técnica de Drag
      </h3>

      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-lg font-heading font-bold text-white">{tech.nombre}</p>
        <span className={`text-[10px] font-ui font-bold uppercase px-2 py-1 rounded-full border shrink-0 ${DIFFICULTY_STYLES[tech.dificultad]}`}>
          {tech.dificultad}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-slate-500 font-body">{tech.distancia}</span>
        <span className="text-xs text-slate-600">·</span>
        <span className="text-xs text-slate-500 font-body">{tech.timing}</span>
      </div>

      <p className="text-sm text-slate-300 font-body leading-relaxed mb-4">
        {tech.descripcion}
      </p>

      <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <p className="text-[10px] text-slate-500 font-ui uppercase tracking-wider mb-1">Mejor con</p>
        <p className="text-xs text-slate-300 font-body">
          {tech.mejorCon.join(' · ')}
        </p>
      </div>
    </div>
  );
}
