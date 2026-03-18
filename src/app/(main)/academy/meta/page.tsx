import {
  Swords,
  Shield,
  Target,
  Zap,
  Calendar,
  PawPrint,
  Users,
  AlertTriangle,
} from 'lucide-react';
import type { Metadata } from 'next';

import { PremiumGuideContent } from '@/components/academy/premium-guide-content';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// Meta Actual de Free Fire — Parche OB52 (Marzo 2026)
// Contenido REAL: armas, personajes, mascotas, combos y estrategias
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: 'Meta Actual OB52 de Free Fire | SensiPRO Academia',
  description:
    'Las armas, personajes, mascotas y estrategias que dominan Free Fire en el parche OB52. Actualizado Marzo 2026.',
};

// — Tipos —
interface Weapon {
  name: string;
  reason: string;
}

interface Character {
  name: string;
  ability: string;
  when: string;
}

interface Pet {
  name: string;
  ability: string;
  when: string;
}

interface MetaCombo {
  name: string;
  characters: string;
  description: string;
}

interface Strategy {
  title: string;
  description: string;
}

// — Armas OB52 —
const TIER_S: Weapon[] = [
  { name: 'M4A1', reason: 'Versátil, buen daño, poco recoil. La reina del ranked. Buffed +3% daño en OB52.' },
  { name: 'MP40', reason: 'Mejor SMG para corta distancia. Rush meta. Cadencia brutal.' },
  { name: 'AWM', reason: 'Un headshot = una kill. La sniper definitiva.' },
  { name: 'PARAFAL', reason: 'Alto daño, buena para media distancia. Parafal-Flamer con granada cada 3 disparos es meta.' },
  { name: 'Winchester', reason: 'NUEVA OB52. Marksman de ráfagas de 2 disparos. Entró directamente a S-tier.' },
];

const TIER_A: Weapon[] = [
  { name: 'AK47', reason: 'Alto daño pero más recoil. Para jugadores con buena sensi.' },
  { name: 'SCAR', reason: 'Más estable que la AK, menos daño. Buffed +3% daño en OB52.' },
  { name: 'UMP', reason: 'Buena SMG alternativa a la MP40.' },
  { name: 'Kar98k', reason: 'Sniper rápida, buena para rotaciones.' },
  { name: 'MAC10', reason: 'Buffed en OB52: más daño y precisión hipfire. Cargador largo.' },
  { name: 'Thompson-X', reason: 'Buffed +8% tasa de fuego, +15% alcance. SMG versátil.' },
  { name: 'Desert Eagle', reason: 'Pistola letal. One-tap a media distancia con headshot.' },
];

const TIER_B: Weapon[] = [
  { name: 'M1887', reason: 'One-tap en close range pero solo 2 rondas. Requiere mucha precisión.' },
  { name: 'Groza', reason: 'Solo en airdrop. Bestia si la encuentras.' },
  { name: 'M14', reason: 'Semi-auto, difícil de controlar.' },
  { name: 'Woodpecker', reason: 'Marksman semi-auto. Rompe chalecos a distancia.' },
  { name: 'M60', reason: 'Buffed +3% daño en OB52. LMG pesada, buena para suppression.' },
];

const TIERS = [
  {
    label: 'S',
    subtitle: 'Las mejores',
    weapons: TIER_S,
    color: '#f59e0b',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: '0 0 16px rgba(245, 158, 11, 0.4)',
  },
  {
    label: 'A',
    subtitle: 'Muy buenas',
    weapons: TIER_A,
    color: '#06b6d4',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    glow: '0 0 16px rgba(6, 182, 212, 0.4)',
  },
  {
    label: 'B',
    subtitle: 'Situacionales',
    weapons: TIER_B,
    color: '#64748b',
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    glow: 'none',
  },
] as const;

// — Personajes OB52 —
const TOP_CHARACTERS: Character[] = [
  {
    name: 'Alok',
    ability: 'Drop the Beat — heal + velocidad en área',
    when: 'Cura + velocidad para todo el equipo. El más versátil del juego.',
  },
  {
    name: 'Chrono',
    ability: 'Time Turner — escudo frontal',
    when: 'Escudo que bloquea 600 de daño. Tú disparas desde adentro.',
  },
  {
    name: 'Xayne',
    ability: 'Xtreme Encounter — HP temporales + anti-gloo',
    when: 'BUFFED OB52: +70 HP temporales (antes 50). Destroza Gloo Walls. Meta de rush.',
  },
];

const META_CHARACTERS: Character[] = [
  {
    name: 'Tatsuya',
    ability: 'Rebel Dash — dash instantáneo',
    when: 'NERFEADO OB52: ventana de reset 10s. Sigue fuerte pero ya no es infinito.',
  },
  {
    name: 'K (Capitán Booyah)',
    ability: 'Master of All — EP + recuperación',
    when: '+250 EP, conversión EP a HP. Sustain infinito.',
  },
  {
    name: 'Hayato',
    ability: 'Bushido — penetración de armadura',
    when: 'Más daño cuando tienes poca vida. Clutch factor.',
  },
  {
    name: 'Jota',
    ability: 'Sustained Raids — HP por eliminación',
    when: 'Recuperas HP por cada kill. Esencial para rushers.',
  },
];

const NEW_CHARACTERS: Character[] = [
  {
    name: 'Nero',
    ability: 'Pulso de 150 HP',
    when: 'Zona de 8m, bloquea Gloo Walls, 12 HP/s de curación. Control de zona puro.',
  },
  {
    name: 'Morse',
    ability: 'Invisibilidad a 16m+',
    when: 'Indetectable por scans, +20% velocidad. No puede disparar. Flanqueo puro.',
  },
];

const NERFED_CHARACTERS: Character[] = [
  {
    name: 'Wukong',
    ability: 'Camouflage — arbusto',
    when: 'NERFEADO OB52: ventana de reset 10s. Ya no puedes limpiar squads infinitamente.',
  },
  {
    name: 'Ford',
    ability: 'Iron Will — curación pasiva',
    when: 'NERFEADO dos veces (OB51+OB52). Curación bajó de 40 a 30 HP.',
  },
];

// — Mascotas —
const TOP_PETS: Pet[] = [
  {
    name: 'Rockie',
    ability: '-15% cooldown habilidad activa',
    when: 'Esencial si usas Alok, Skyler o Tatsuya. Reduce enfriamiento de tu skill.',
  },
  {
    name: 'Mr. Waggor',
    ability: '1 Gloo Wall gratis cada 100s',
    when: 'Genera Gloo Wall cuando tienes 0. Te salva en círculos finales.',
  },
  {
    name: 'Detective Panda',
    ability: '+10 HP por cada kill',
    when: 'Con Jota = ~50 HP por eliminación. Roto para rushers.',
  },
];

const GOOD_PETS: Pet[] = [
  {
    name: 'Falco',
    ability: '+50% velocidad de planeo',
    when: '+45% paracaídas para todo el squad. Domina el early game.',
  },
  {
    name: 'Spirit Fox',
    ability: '+10 HP extra al usar medkit',
    when: 'Buena para builds de sustain y recuperación.',
  },
  {
    name: 'Beaston',
    ability: '+30% rango de lanzamiento',
    when: 'Más rango para granadas y Gloo Walls. Utility pura.',
  },
];

// — Combos —
const META_COMBOS: MetaCombo[] = [
  {
    name: 'Combo Rusher',
    characters: 'Tatsuya + Jota + D-Bee + Hayato | Panda',
    description: 'Dash, eliminar, curar, repetir. Máximo rush.',
  },
  {
    name: 'Combo Ranked',
    characters: 'Alok + Jota + Kelly + Andrew | Mr. Waggor',
    description: 'El estándar de ranked. Heal, movilidad, sustain.',
  },
  {
    name: 'Combo Sniper',
    characters: 'Skyler + Maro + Moco + Rafael | Mr. Waggor',
    description: 'Marca, amplifica daño, silencia, destruye walls.',
  },
  {
    name: 'Combo Headshot',
    characters: 'Alok + Laura + Wolfrahh + D-Bee | Rockie',
    description: 'Precisión + daño headshot escalable.',
  },
];

// — Estrategias —
const STRATEGIES: Strategy[] = [
  {
    title: 'Rush temprano con MP40 + Gloo',
    description:
      'Aterriza cerca de equipos, agarra MP40 y rushea antes de que se armen.',
  },
  {
    title: 'Zone edge rotations',
    description:
      'No vayas al centro de la zona. Quédate en el borde y rota con la zona. Menos peleas innecesarias.',
  },
  {
    title: 'Final zone: Gloo wall stack',
    description:
      'En la final zone, stackea 2-3 gloos y peekea. El que tiene más gloos gana.',
  },
];

// — Helpers —
function WeaponCards({ weapons, color }: { weapons: Weapon[]; color: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {weapons.map((weapon, index) => (
        <div
          key={weapon.name}
          className="relative glass-card p-4 pl-6 academy-stagger group"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200 group-hover:w-[5px]"
            style={{
              background: color,
              boxShadow: `0 0 8px ${color}40`,
            }}
          />
          <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-base mb-1">
            {weapon.name}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {weapon.reason}
          </p>
        </div>
      ))}
    </div>
  );
}

function CharacterCards({ characters, accentColor }: { characters: Character[]; accentColor: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {characters.map((char, index) => (
        <div
          key={char.name}
          className="glass-card p-4 academy-stagger"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white">
            {char.name}
          </h3>
          <p className="text-xs mb-1 font-[family-name:var(--font-rajdhani)] font-medium" style={{ color: accentColor }}>
            {char.ability}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {char.when}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function MetaPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <Swords className="w-6 h-6 text-fire-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Meta Actual
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm mb-4">
          Las armas, personajes, mascotas y estrategias que dominan Free Fire en el parche OB52.
        </p>

        {/* Updated badge */}
        <div className="inline-flex items-center gap-2 glass-card !rounded-lg px-3 py-1.5">
          <Calendar className="w-4 h-4 text-ice-400" />
          <span className="text-xs text-slate-300 font-numbers font-medium">
            Parche OB52 — Actualizado Marzo 2026
          </span>
        </div>
      </div>

      {/* Contenido premium — bloqueado para usuarios gratis */}
      <PremiumGuideContent>
      {/* SECCIÓN 1: Weapon Tier List */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-fire-400" />
          Tier List de Armas
        </h2>
        <div className="section-heading-separator mb-6" />

        {TIERS.map((tier) => (
          <div key={tier.label} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-black border',
                  tier.bg,
                  tier.text,
                  tier.border,
                )}
                style={{ boxShadow: tier.glow }}
              >
                Tier {tier.label}
              </span>
              <span className="text-xs text-slate-500 font-[family-name:var(--font-rajdhani)]">
                {tier.subtitle}
              </span>
            </div>
            <WeaponCards weapons={tier.weapons} color={tier.color} />
          </div>
        ))}
      </section>

      {/* SECCIÓN 2: Personajes Meta */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-purple-400" />
          Personajes Meta
        </h2>
        <div className="section-heading-separator mb-6" />

        {/* Top Tier */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Top Tier
            </span>
          </div>
          <CharacterCards characters={TOP_CHARACTERS} accentColor="#06b6d4" />
        </div>

        {/* Meta fuerte */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Meta Fuerte
            </span>
          </div>
          <CharacterCards characters={META_CHARACTERS} accentColor="#a855f7" />
        </div>

        {/* Nuevos OB52 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-green-500/15 text-green-400 border border-green-500/30">
              Nuevos OB52
            </span>
          </div>
          <CharacterCards characters={NEW_CHARACTERS} accentColor="#22c55e" />
        </div>

        {/* Nerfeados */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-red-500/15 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Nerfeados OB52
            </span>
          </div>
          <CharacterCards characters={NERFED_CHARACTERS} accentColor="#ef4444" />
        </div>
      </section>

      {/* SECCIÓN 3: Mascotas */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <PawPrint className="w-5 h-5 text-green-400" />
          Mascotas Meta
        </h2>
        <div className="section-heading-separator mb-6" />

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Top Mascotas
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TOP_PETS.map((pet, index) => (
              <div
                key={pet.name}
                className="glass-card p-4 academy-stagger"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white">
                  {pet.name}
                </h3>
                <p className="text-xs text-green-400 mb-1 font-[family-name:var(--font-rajdhani)] font-medium">
                  {pet.ability}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {pet.when}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Buenas Opciones
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {GOOD_PETS.map((pet, index) => (
              <div
                key={pet.name}
                className="glass-card p-4 academy-stagger"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white">
                  {pet.name}
                </h3>
                <p className="text-xs text-ice-400 mb-1 font-[family-name:var(--font-rajdhani)] font-medium">
                  {pet.ability}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {pet.when}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: Combos Meta */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-fire-400" />
          Combos Meta OB52
        </h2>
        <div className="section-heading-separator mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {META_COMBOS.map((combo, index) => (
            <div
              key={combo.name}
              className="relative glass-card p-5 pl-7 academy-stagger group"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200 group-hover:w-[5px]"
                style={{
                  background: '#ff6a00',
                  boxShadow: '0 0 8px rgba(255, 106, 0, 0.4)',
                }}
              />
              <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-base mb-1">
                {combo.name}
              </h3>
              <p className="text-xs text-fire-400 font-[family-name:var(--font-rajdhani)] font-medium mb-1">
                {combo.characters}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {combo.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 5: Estrategias Meta */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-yellow-400" />
          Estrategias Meta
        </h2>
        <div className="section-heading-separator mb-6" />

        <div className="grid grid-cols-1 gap-3">
          {STRATEGIES.map((strat, index) => (
            <div
              key={strat.title}
              className="relative glass-card p-5 pl-7 academy-stagger group"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200 group-hover:w-[5px]"
                style={{
                  background: '#eab308',
                  boxShadow: '0 0 8px rgba(234, 179, 8, 0.4)',
                }}
              />
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 font-[family-name:var(--font-orbitron)] font-black text-lg text-white/20 mt-[-2px]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-base mb-1">
                    {strat.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {strat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </PremiumGuideContent>
    </div>
  );
}
