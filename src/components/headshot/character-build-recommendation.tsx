'use client';

// ═══════════════════════════════════════════════════════════════
// Build de Personaje — 18 combos (9 principal + 9 alternativo)
// según combinación de estilo + dedos del usuario
// ═══════════════════════════════════════════════════════════════

import type { FingerCount } from '@ares/algorithms';

type Playstyle = 'AGGRESSIVE' | 'BALANCED' | 'SNIPER';

interface CharacterEntry {
  nombre: string;
  activa?: boolean;
  descripcion: string;
}

interface MascotaEntry {
  nombre: string;
  descripcion: string;
}

interface CharacterCombo {
  nombre: string;
  personajes: CharacterEntry[];
  mascota: MascotaEntry;
  sinergia: string;
}

interface ComboSet {
  principal: CharacterCombo;
  alternativo: CharacterCombo;
}

const COMBO_MAP: Record<Playstyle, Record<FingerCount, ComboSet>> = {
  AGGRESSIVE: {
    2: {
      principal: {
        nombre: 'RUSHER IMPARABLE',
        personajes: [
          { nombre: 'Alok', activa: true, descripcion: 'Cura + velocidad para todo el equipo' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'D-Bee', descripcion: '+35% precisión al disparar moviéndote' },
          { nombre: 'Hayato', descripcion: 'Más penetración de armadura con poca vida' },
        ],
        mascota: { nombre: 'Detective Panda', descripcion: '+10 HP por cada kill' },
        sinergia: 'Activas Alok con un toque y te olvidas — cura + velocidad 10 segundos. Jota + Panda te dan ~50 HP por cada kill. D-Bee te da precisión mientras rusheas. Hayato rompe chalecos cuando te queda poca vida.',
      },
      alternativo: {
        nombre: 'HEADSHOT MACHINE',
        personajes: [
          { nombre: 'Alok', activa: true, descripcion: 'Cura + velocidad para todo el equipo' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'Kelly', descripcion: '+6% velocidad de sprint' },
          { nombre: 'Wolfrahh', descripcion: '+3% daño headshot por cada kill' },
        ],
        mascota: { nombre: 'Detective Panda', descripcion: '+10 HP por cada kill' },
        sinergia: 'Kelly te acerca rápido, Wolfrahh aumenta tu daño de headshot por cada kill. Más kills = más daño = más kills. Alok cura y Jota + Panda te mantienen vivo.',
      },
    },
    3: {
      principal: {
        nombre: 'DESTRUCTOR DE WALLS',
        personajes: [
          { nombre: 'Skyler', activa: true, descripcion: 'Destruye Gloo Walls con onda sónica' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'D-Bee', descripcion: '+35% precisión al disparar moviéndote' },
          { nombre: 'Hayato', descripcion: 'Más penetración de armadura con poca vida' },
        ],
        mascota: { nombre: 'Mr. Waggor', descripcion: 'Genera Gloo Walls gratis' },
        sinergia: 'Skyler destruye las Gloo Walls enemigas con tu índice sin dejar de apuntar. Mr. Waggor te genera walls gratis y Skyler cura cuando las pones. Jota te cura por kills. Eres un tanque que destruye coberturas.',
      },
      alternativo: {
        nombre: 'FANTASMA VELOZ',
        personajes: [
          { nombre: 'Tatsuya', activa: true, descripcion: 'Dash instantáneo que se resetea con cada kill' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'D-Bee', descripcion: '+35% precisión al disparar moviéndote' },
          { nombre: 'Dasha', descripcion: '+18% cadencia por knock + menos retroceso' },
        ],
        mascota: { nombre: 'Rockie', descripcion: 'Reduce cooldown de tu habilidad activa' },
        sinergia: 'Dash instantáneo con Tatsuya, eliminar, dash se resetea, repetir. Dasha te sube la cadencia de fuego con cada knock. Rockie reduce el cooldown del dash. Apareces y desapareces como fantasma.',
      },
    },
    4: {
      principal: {
        nombre: 'ELITE PRO',
        personajes: [
          { nombre: 'Tatsuya', activa: true, descripcion: 'Dash instantáneo que se resetea con cada kill' },
          { nombre: 'Wolfrahh', descripcion: '+3% daño headshot por cada kill' },
          { nombre: 'Luna', descripcion: 'Aumenta cadencia de fuego' },
          { nombre: 'D-Bee', descripcion: '+35% precisión al disparar moviéndote' },
        ],
        mascota: { nombre: 'Rockie', descripcion: 'Reduce cooldown de tu habilidad activa' },
        sinergia: 'El combo de mayor nivel del juego. Dash dirigido con 4 dedos, Wolfrahh amplifica headshots por cada kill, Luna dispara más rápido, D-Bee precisión moviéndote. Solo funciona si controlas 4 dedos bien.',
      },
      alternativo: {
        nombre: 'TANQUE DE ASALTO',
        personajes: [
          { nombre: 'Xayne', activa: true, descripcion: '+70 HP temporales + destroza Gloo Walls' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'Hayato', descripcion: 'Más penetración de armadura con poca vida' },
          { nombre: 'D-Bee', descripcion: '+35% precisión al disparar moviéndote' },
        ],
        mascota: { nombre: 'Detective Panda', descripcion: '+10 HP por cada kill' },
        sinergia: 'Xayne te da +70 HP temporales — entras con 270+ HP efectivos. Jota + Panda curan por kills. Hayato penetra chalecos. Entras como tanque y sales con más vida de la que entraste.',
      },
    },
  },
  BALANCED: {
    2: {
      principal: {
        nombre: 'RANKED ESTÁNDAR',
        personajes: [
          { nombre: 'Alok', activa: true, descripcion: 'Cura + velocidad para todo el equipo' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'Kelly', descripcion: '+6% velocidad de sprint' },
          { nombre: 'Andrew', descripcion: 'Protege tu armadura — dura más' },
        ],
        mascota: { nombre: 'Mr. Waggor', descripcion: 'Genera Gloo Walls gratis' },
        sinergia: 'El combo gold-standard para ranked. Alok cura al equipo, Kelly te mueve rápido, Andrew protege tu armadura en peleas largas. Mr. Waggor te salva con Gloo Walls en círculos finales. Simple y letal.',
      },
      alternativo: {
        nombre: 'PRECISIÓN TOTAL',
        personajes: [
          { nombre: 'Alok', activa: true, descripcion: 'Cura + velocidad para todo el equipo' },
          { nombre: 'Laura', descripcion: '+60% precisión cuando usas mira' },
          { nombre: 'Moco', descripcion: 'Marca enemigos que disparas — tu equipo los ve' },
          { nombre: 'Hayato', descripcion: 'Más penetración de armadura con poca vida' },
        ],
        mascota: { nombre: 'Rockie', descripcion: 'Reduce cooldown de tu habilidad activa' },
        sinergia: 'Laura te da +60% precisión con mira — headshots casi garantizados. Moco marca enemigos para tu equipo. Hayato penetra chalecos. Más enfocado en headshots que el principal.',
      },
    },
    3: {
      principal: {
        nombre: 'CONTROL TOTAL',
        personajes: [
          { nombre: 'Alok', activa: true, descripcion: 'Cura + velocidad para todo el equipo' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'Moco', descripcion: 'Marca enemigos que disparas — tu equipo los ve' },
          { nombre: 'D-Bee', descripcion: '+35% precisión al disparar moviéndote' },
        ],
        mascota: { nombre: 'Mr. Waggor', descripcion: 'Genera Gloo Walls gratis' },
        sinergia: 'Alok cura, Moco marca enemigos que tu equipo puede ver, Jota cura por kills, D-Bee precisión moviéndote. Equilibrio perfecto entre ataque y defensa. El combo más versátil del juego.',
      },
      alternativo: {
        nombre: 'OFENSIVO INTELIGENTE',
        personajes: [
          { nombre: 'Skyler', activa: true, descripcion: 'Destruye Gloo Walls con onda sónica' },
          { nombre: 'Laura', descripcion: '+60% precisión cuando usas mira' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'Hayato', descripcion: 'Más penetración de armadura con poca vida' },
        ],
        mascota: { nombre: 'Rockie', descripcion: 'Reduce cooldown de tu habilidad activa' },
        sinergia: 'Skyler destruye coberturas, Laura te da precisión brutal con mira, Jota sustain por kills, Hayato penetración. Más ofensivo que el principal pero igual de sólido.',
      },
    },
    4: {
      principal: {
        nombre: 'ESCUDO PERFECTO',
        personajes: [
          { nombre: 'Chrono', activa: true, descripcion: 'Escudo que bloquea 600 de daño' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'D-Bee', descripcion: '+35% precisión al disparar moviéndote' },
          { nombre: 'Hayato', descripcion: 'Más penetración de armadura con poca vida' },
        ],
        mascota: { nombre: 'Rockie', descripcion: 'Reduce cooldown de tu habilidad activa' },
        sinergia: 'Chrono crea un escudo que bloquea 600 de daño — tú disparas desde adentro. Con 4 dedos puedes activar Chrono en el momento exacto que te disparan. Jota cura, D-Bee precisión, Hayato daño extra.',
      },
      alternativo: {
        nombre: 'INTEL + DAÑO',
        personajes: [
          { nombre: 'Tatsuya', activa: true, descripcion: 'Dash instantáneo que se resetea con cada kill' },
          { nombre: 'Jota', descripcion: 'Recuperas HP cada vez que eliminas' },
          { nombre: 'Moco', descripcion: 'Marca enemigos que disparas — tu equipo los ve' },
          { nombre: 'Wolfrahh', descripcion: '+3% daño headshot por cada kill' },
        ],
        mascota: { nombre: 'Detective Panda', descripcion: '+10 HP por cada kill' },
        sinergia: 'Dash con Tatsuya, primer hit marca con Moco, tu equipo ve al enemigo, Wolfrahh amplifica cada kill. Intel + daño + movilidad. Combo para jugadores que piensan rápido.',
      },
    },
  },
  SNIPER: {
    2: {
      principal: {
        nombre: 'SOMBRA LETAL',
        personajes: [
          { nombre: 'Alok', activa: true, descripcion: 'Cura + velocidad para todo el equipo' },
          { nombre: 'Rafael', descripcion: 'Disparos de sniper silenciosos' },
          { nombre: 'Laura', descripcion: '+60% precisión cuando usas mira' },
          { nombre: 'Maro', descripcion: '+25% daño a larga distancia' },
        ],
        mascota: { nombre: 'Mr. Waggor', descripcion: 'Genera Gloo Walls gratis' },
        sinergia: 'Laura +60% precisión con scope. Rafael silencia tu sniper — nadie sabe de dónde disparas. Maro +25% daño a distancia. Alok te cura si te rushean. Un solo disparo letal desde la sombra.',
      },
      alternativo: {
        nombre: 'MARCADOR SILENCIOSO',
        personajes: [
          { nombre: 'Alok', activa: true, descripcion: 'Cura + velocidad para todo el equipo' },
          { nombre: 'Laura', descripcion: '+60% precisión cuando usas mira' },
          { nombre: 'Moco', descripcion: 'Marca enemigos que disparas — tu equipo los ve' },
          { nombre: 'Hayato', descripcion: 'Más penetración de armadura con poca vida' },
        ],
        mascota: { nombre: 'Rockie', descripcion: 'Reduce cooldown de tu habilidad activa' },
        sinergia: 'Moco marca al enemigo que golpeaste — si fallas el headshot, tu equipo sabe dónde está. Laura te da precisión, Hayato penetra chalecos. Alok cura si te rushean.',
      },
    },
    3: {
      principal: {
        nombre: 'SNIPER DEFINITIVO',
        personajes: [
          { nombre: 'Skyler', activa: true, descripcion: 'Destruye Gloo Walls con onda sónica' },
          { nombre: 'Maro', descripcion: '+25% daño a larga distancia' },
          { nombre: 'Moco', descripcion: 'Marca enemigos que disparas — tu equipo los ve' },
          { nombre: 'Rafael', descripcion: 'Disparos de sniper silenciosos' },
        ],
        mascota: { nombre: 'Mr. Waggor', descripcion: 'Genera Gloo Walls gratis' },
        sinergia: 'Moco marca al primer disparo, Maro activa +28% daño total contra marcados, Rafael te mantiene invisible en el minimapa, Skyler destruye Gloo Walls para que no se cubran. El combo sniper más devastador del juego.',
      },
      alternativo: {
        nombre: 'FRANCOTIRADOR CLÁSICO',
        personajes: [
          { nombre: 'Skyler', activa: true, descripcion: 'Destruye Gloo Walls con onda sónica' },
          { nombre: 'Laura', descripcion: '+60% precisión cuando usas mira' },
          { nombre: 'Rafael', descripcion: 'Disparos de sniper silenciosos' },
          { nombre: 'Hayato', descripcion: 'Más penetración de armadura con poca vida' },
        ],
        mascota: { nombre: 'Rockie', descripcion: 'Reduce cooldown de tu habilidad activa' },
        sinergia: 'Laura precisión con scope, Rafael sigilo, Hayato penetra armaduras a larga distancia. Skyler elimina coberturas. Más simple pero igual de letal que el principal.',
      },
    },
    4: {
      principal: {
        nombre: 'DOMINIO TOTAL',
        personajes: [
          { nombre: 'Skyler', activa: true, descripcion: 'Destruye Gloo Walls con onda sónica' },
          { nombre: 'Maro', descripcion: '+25% daño a larga distancia' },
          { nombre: 'Moco', descripcion: 'Marca enemigos que disparas — tu equipo los ve' },
          { nombre: 'Rafael', descripcion: 'Disparos de sniper silenciosos' },
        ],
        mascota: { nombre: 'Mr. Waggor', descripcion: 'Genera Gloo Walls gratis' },
        sinergia: 'Mismo que SNIPER DEFINITIVO pero con 4 dedos puedes usar Skyler + scope + reposicionar simultáneamente. Control total del campo de batalla.',
      },
      alternativo: {
        nombre: '4 PASIVAS — ZERO BOTONES',
        personajes: [
          { nombre: 'Rafael', descripcion: 'Disparos de sniper silenciosos' },
          { nombre: 'Moco', descripcion: 'Marca enemigos que disparas — tu equipo los ve' },
          { nombre: 'Rin Yagami', descripcion: 'Lanza kunai automáticamente que bajan HP' },
          { nombre: 'Maro', descripcion: '+25% daño a larga distancia' },
        ],
        mascota: { nombre: 'Mr. Waggor', descripcion: 'Genera Gloo Walls gratis' },
        sinergia: '4 pasivas, cero botones que activar. Los kunai de Rin bajan HP automáticamente. Moco marca. Maro amplifica daño. Rafael silencia. Todo funciona solo mientras tú solo apuntas y disparas.',
      },
    },
  },
};

// ═══ Render helpers ═══

function ComboCard({ combo, badge, badgeStyle }: { combo: CharacterCombo; badge: string; badgeStyle: string }) {
  return (
    <div className="glass-card p-5">
      <span className={`inline-block text-[10px] font-ui font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-3 ${badgeStyle}`}>
        {badge}
      </span>

      <p className="text-lg font-heading font-bold text-white mb-4">{combo.nombre}</p>

      {/* Personajes */}
      <div className="space-y-2.5 mb-4">
        {combo.personajes.map((p) => (
          <div key={p.nombre} className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-600 mt-2 shrink-0" />
            <div>
              <span className="text-sm font-ui font-semibold text-white">{p.nombre}</span>
              {p.activa && (
                <span className="ml-1.5 text-[9px] font-ui font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/20">
                  activa
                </span>
              )}
              <p className="text-xs text-slate-400 font-body mt-0.5">{p.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mascota */}
      <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-4">
        <p className="text-xs text-slate-400 font-body">
          <span className="text-slate-500 font-ui">Mascota:</span>{' '}
          <span className="text-white font-semibold">{combo.mascota.nombre}</span>
          {' — '}
          {combo.mascota.descripcion}
        </p>
      </div>

      {/* Sinergia */}
      <div className="px-3 py-2.5 rounded-lg bg-white/[0.015] border border-white/[0.03]">
        <p className="text-[10px] text-slate-500 font-ui uppercase tracking-wider mb-1">Por qué funciona</p>
        <p className="text-xs text-slate-300 font-body leading-relaxed">{combo.sinergia}</p>
      </div>
    </div>
  );
}

interface CharacterBuildRecommendationProps {
  playstyle: Playstyle;
  fingers: FingerCount;
}

export function CharacterBuildRecommendation({ playstyle, fingers }: CharacterBuildRecommendationProps) {
  const combos = COMBO_MAP[playstyle][fingers];

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm px-1">
        🛡️ Tu Build de Personaje
      </h3>

      <ComboCard
        combo={combos.principal}
        badge="Recomendado para ti"
        badgeStyle="bg-orange-500/15 text-orange-400 border-orange-500/20"
      />

      <ComboCard
        combo={combos.alternativo}
        badge="Alternativa"
        badgeStyle="bg-slate-500/15 text-slate-400 border-slate-500/20"
      />
    </div>
  );
}
