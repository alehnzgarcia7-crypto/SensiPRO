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
      nombre: 'J-Drag (Puxada de Capa)',
      dificultad: 'Media',
      distancia: 'Corta (0-10m)',
      descripcion: 'Arrastra formando una J — primero lateral hacia el enemigo, luego SUBE a la cabeza. M1887 hace 188 de headshot (94×2.0x) — un J-Drag limpio a <10m es kill instantánea con cualquier casco excepto Nivel 3.',
      mejorCon: ['M1887', 'M1014', 'Desert Eagle', 'MP40'],
      timing: '~0.3s',
    },
    3: {
      nombre: 'J-Drag + Peek & Fire',
      dificultad: 'Media',
      distancia: 'Corta (0-10m)',
      descripcion: 'J-Drag con el pulgar mientras el índice hace peek (agacharse/levantarse). Minimizas tu exposición a <0.5s — el enemigo ve tu cabeza por un instante. La técnica definitiva de 3 dedos en rush.',
      mejorCon: ['M1887', 'MP40', 'M1014', 'MAC10'],
      timing: '~0.4s',
    },
    4: {
      nombre: 'Jump-Crouch-Fire',
      dificultad: 'Avanzada',
      distancia: 'Media (10-30m)',
      descripcion: 'Saltas (índice izq) → agáchate en el aire (índice der) → dispara en el pico del salto (pulgar). La técnica más respetada del juego — Two9 tiene ~98% de headshot rate con ella. Solo funciona con 4 dedos.',
      mejorCon: ['Desert Eagle', 'M1887', 'MP40', 'SCAR'],
      timing: '~0.5s',
    },
  },
  BALANCED: {
    2: {
      nombre: 'Drag Vertical',
      dificultad: 'Fácil',
      distancia: 'Media (10-30m)',
      descripcion: 'La base de TODO. Apunta al pecho/cuello, dispara, y arrastra RECTO HACIA ARRIBA. Con M4A1 (560 RPM) las balas suben del pecho a la cabeza naturalmente. Pre-aim reduce la distancia del drag un 50-70%.',
      mejorCon: ['SCAR', 'M4A1', 'MP40', 'AK47'],
      timing: '~0.5s',
    },
    3: {
      nombre: 'Direction Drag',
      dificultad: 'Media',
      distancia: 'Media (10-50m)',
      descripcion: 'Sigues la dirección del enemigo con el dedo y luego curvas hacia arriba a la cabeza. Para enemigos corriendo lateralmente a 20-60m. El touch sampling rate de tu cel (120-480Hz) determina qué tan suave se siente.',
      mejorCon: ['M4A1', 'SCAR', 'AK47', 'Woodpecker'],
      timing: '~0.5s',
    },
    4: {
      nombre: 'Flick Shot (Wait-and-Flick)',
      dificultad: 'Avanzada',
      distancia: 'Todas',
      descripcion: 'Mantienes la mira a nivel de cabeza y ESPERAS. Cuando el enemigo aparece, snap reflexivo instantáneo. La filosofía de Two9: alto-Y (sensi alta vertical), bajo-X (sensi baja horizontal). 4 dedos te dejan hacer scope + flick + agacharte en 1 movimiento.',
      mejorCon: ['Desert Eagle', 'AWM', 'M4A1', 'SCAR'],
      timing: 'Instantáneo',
    },
  },
  SNIPER: {
    2: {
      nombre: 'Situp Headshot',
      dificultad: 'Fácil',
      distancia: 'Media (10-30m)',
      descripcion: 'Te agachas detrás de cobertura → abres mira → te levantas → disparas. Al levantarte la mira sube del pecho a la cabeza SOLA. Con AWM (225 HS) es one-shot kill garantizado. Simple pero devastador.',
      mejorCon: ['AWM', 'Woodpecker', 'M1887', 'SVD'],
      timing: '~0.5s',
    },
    3: {
      nombre: 'Situp + One-Tap',
      dificultad: 'Media',
      distancia: 'Media-Larga (20-50m+)',
      descripcion: 'Situp Headshot pero sueltas UN SOLO DISPARO inmediatamente al levantarte. El índice hace el peek, el pulgar apunta y dispara. Filosofía one-tap: pre-aim + switch + ADS + tap. Nobru usa sensi 85-95 para esto.',
      mejorCon: ['AWM', 'Woodpecker', 'Desert Eagle', 'Kar98k'],
      timing: '~0.3s',
    },
    4: {
      nombre: 'Quickscope Flick',
      dificultad: 'Avanzada',
      distancia: 'Larga (50m+)',
      descripcion: 'Pre-apuntas a nivel de cabeza. Enemigo se asoma → scope in (índice izq) → micro-flick de 2mm (pulgar) → dispara en <0.5s (índice der) → scope out. AWM = 225 HS, mata a través de casco Nivel 3. La técnica más respetada del juego.',
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
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-1">
        🎯 Tu Técnica de Drag
      </h3>
      <p className="text-[10px] text-slate-500 font-body mb-4">
        9 técnicas calibradas por estilo + dedos — datos de hardware real
      </p>

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
