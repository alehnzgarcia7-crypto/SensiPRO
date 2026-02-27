import { Metadata } from 'next';
import {
  Swords,
  Shield,
  Target,
  Zap,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// Meta Actual de Free Fire — Febrero 2026
// Contenido REAL: armas, personajes y estrategias meta
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: 'Meta Actual de Free Fire | SensiPRO Academia',
  description:
    'Las armas, personajes y estrategias que dominan Free Fire esta temporada. Actualizado regularmente.',
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

interface Strategy {
  title: string;
  description: string;
}

// — Data —
const TIER_S: Weapon[] = [
  { name: 'M4A1', reason: 'Versátil, buen daño, poco recoil. La reina del ranked.' },
  { name: 'MP40', reason: 'Mejor SMG para corta distancia. Rush meta.' },
  { name: 'AWM', reason: 'Un headshot = una kill. La sniper definitiva.' },
  { name: 'PARAFAL', reason: 'Alto daño, buena para media distancia.' },
];

const TIER_A: Weapon[] = [
  { name: 'AK47', reason: 'Alto daño pero más recoil. Para jugadores con buena sensi.' },
  { name: 'SCAR', reason: 'Más estable que la AK, menos daño.' },
  { name: 'UMP', reason: 'Buena SMG alternativa a la MP40.' },
  { name: 'Kar98k', reason: 'Sniper rápida, buena para rotaciones.' },
];

const TIER_B: Weapon[] = [
  { name: 'M1887', reason: 'Shotgun meta en casas. Un tiro si estás cerca.' },
  { name: 'Groza', reason: 'Fuerte pero difícil de controlar.' },
  { name: 'M14', reason: 'Para media-larga distancia, semi-auto.' },
  { name: 'Vector', reason: 'Muy rápida pero se queda sin balas.' },
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

const CHARACTERS: Character[] = [
  {
    name: 'Alok',
    ability: 'Drop the Beat — heal + velocidad en área',
    when: 'El heal de su habilidad sigue siendo el mejor para squad.',
  },
  {
    name: 'Chrono',
    ability: 'Time Turner — escudo frontal',
    when: 'El escudo es clutch en 1v1s de final zone.',
  },
  {
    name: 'Wukong',
    ability: 'Camouflage — se transforma en arbusto',
    when: 'Bush meta. Sí, sigue funcionando en ranked.',
  },
  {
    name: 'K (Capitán Booyah)',
    ability: 'Master of All — EP + recuperación',
    when: 'EP + heal, buena combinación para sobrevivir.',
  },
  {
    name: 'Hayato',
    ability: 'Bushido — más daño con menos vida',
    when: 'Más daño cuando tienes poca vida. Clutch factor.',
  },
];

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
          Las armas, personajes y estrategias que dominan Free Fire esta temporada.
        </p>

        {/* Updated badge */}
        <div className="inline-flex items-center gap-2 glass-card !rounded-lg px-3 py-1.5">
          <Calendar className="w-4 h-4 text-ice-400" />
          <span className="text-xs text-slate-300 font-numbers font-medium">
            Última actualización: Febrero 2026
          </span>
        </div>
      </div>

      {/* SECCIÓN 1: Weapon Tier List */}
      <section>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-fire-400" />
          Tier List de Armas
        </h2>
        <div className="section-heading-separator mb-6" />

        {TIERS.map((tier) => (
          <div key={tier.label} className="mb-8">
            {/* Tier header */}
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

            {/* Weapon cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tier.weapons.map((weapon, index) => (
                <div
                  key={weapon.name}
                  className="relative glass-card p-4 pl-6 academy-stagger group"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200 group-hover:w-[5px]"
                    style={{
                      background: tier.color,
                      boxShadow: `0 0 8px ${tier.color}40`,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CHARACTERS.map((char, index) => (
            <div
              key={char.name}
              className="glass-card p-4 academy-stagger"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white">
                  {char.name}
                </h3>
              </div>
              <p className="text-xs text-ice-400 mb-1 font-[family-name:var(--font-rajdhani)] font-medium">
                {char.ability}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {char.when}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: Estrategias Meta */}
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
              {/* Accent bar */}
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
    </div>
  );
}
