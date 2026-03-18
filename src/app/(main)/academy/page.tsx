import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Swords,
  Video,
  Crosshair,
  Smartphone,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Academia | SensiPRO — Aprende a Dominar Free Fire',
  description:
    'Guías, tips, meta actual y videos para mejorar en Free Fire. Aprende de sensibilidad, HUD, headshots y estrategia.',
  keywords: [
    'guias free fire',
    'tips free fire',
    'meta free fire',
    'tutorial free fire',
    'academia free fire',
  ],
  openGraph: {
    title: 'Academia SensiPRO — Aprende a Dominar Free Fire',
    description:
      'Guías, tips, meta actual y videos para mejorar en Free Fire.',
  },
};

const SECTION_CARDS = [
  {
    href: '/academy/guides',
    icon: BookOpen,
    title: 'Guías Completas',
    description:
      'Guías paso a paso de sensibilidad, HUD, configuración gráfica y más. Desde principiante hasta pro.',
    badge: '11 guías',
    gradient: 'from-fire-500/20 to-orange-500/10',
    iconBg: 'bg-fire-500/15 border-fire-500/20',
    iconColor: 'text-fire-400',
    glowColor: 'rgba(255, 106, 0, 0.15)',
  },
  {
    href: '/academy/tips',
    icon: Lightbulb,
    title: 'Tips y Trucos',
    description:
      'Tips rápidos que puedes aplicar HOY para mejorar tu puntería, movimiento y toma de decisiones.',
    badge: 'Tips rápidos',
    gradient: 'from-yellow-500/20 to-amber-500/10',
    iconBg: 'bg-yellow-500/15 border-yellow-500/20',
    iconColor: 'text-yellow-400',
    glowColor: 'rgba(234, 179, 8, 0.15)',
  },
  {
    href: '/academy/meta',
    icon: Swords,
    title: 'Meta Actual',
    description:
      'Las armas, personajes y estrategias que dominan esta temporada. Actualizado cada patch.',
    badge: 'Temporada actual',
    gradient: 'from-ice-500/20 to-cyan-500/10',
    iconBg: 'bg-ice-500/15 border-ice-500/20',
    iconColor: 'text-ice-400',
    glowColor: 'rgba(6, 182, 212, 0.15)',
  },
  {
    href: '/academy/videos',
    icon: Video,
    title: 'Videos',
    description:
      'Tutoriales en video de configuración, gameplay y técnicas avanzadas.',
    badge: 'Video tutoriales',
    gradient: 'from-purple-500/20 to-violet-500/10',
    iconBg: 'bg-purple-500/15 border-purple-500/20',
    iconColor: 'text-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.15)',
  },
] as const;

const STATS = [
  { value: '537+', label: 'Dispositivos', icon: Smartphone },
  { value: '17', label: 'Features Headshot', icon: Crosshair },
  { value: '11', label: 'Guías completas', icon: BookOpen },
  { value: '24', label: 'Tips de pros', icon: Lightbulb },
] as const;

export default function AcademyHubPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden glass-card p-8 lg:p-12 academy-stagger">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-ice-500/15 border border-ice-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <GraduationCap className="w-8 h-8 text-ice-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
                <span className="bg-gradient-to-r from-cyan-400 via-ice-400 to-cyan-300 bg-clip-text text-transparent">
                  Academia SensiPRO
                </span>
              </h1>
            </div>
          </div>

          <p className="text-slate-300 max-w-2xl mb-6 leading-relaxed text-base">
            Todo lo que necesitas para mejorar en Free Fire. Guías, tips, meta y
            videos — creado por jugadores, para jugadores.
          </p>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-ice-500/8 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/6 rounded-full blur-[60px]" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-purple-500/5 rounded-full blur-[50px]" />
      </section>

      {/* 4 Section Cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTION_CARDS.map((card, index) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative glass-card p-6 academy-stagger overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{
                  boxShadow: `inset 0 0 40px ${card.glowColor}, 0 0 20px ${card.glowColor}`,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl ${card.iconBg} border shadow-lg`}
                  >
                    <card.icon className={`w-7 h-7 ${card.iconColor}`} />
                  </div>
                  <span className="text-[10px] font-[family-name:var(--font-rajdhani)] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-slate-400">
                    {card.badge}
                  </span>
                </div>

                <h3 className="font-[family-name:var(--font-orbitron)] font-bold text-white text-lg mb-2 uppercase tracking-wide">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {card.description}
                </p>

                <div className="flex items-center gap-1 text-sm text-fire-400 font-[family-name:var(--font-rajdhani)] font-semibold group-hover:gap-2 transition-all duration-200">
                  Explorar <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="glass-card p-6 academy-stagger" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <stat.icon className="w-5 h-5 text-ice-400" />
              </div>
              <div>
                <span className="font-[family-name:var(--font-orbitron)] font-black text-white text-lg">
                  {stat.value}
                </span>
                <p className="text-[11px] text-slate-500 font-[family-name:var(--font-rajdhani)]">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA to Generator */}
      <section className="glass-card p-6 text-center academy-stagger" style={{ animationDelay: '400ms' }}>
        <p className="text-slate-300 mb-4 text-sm">
          Ya leiste las guías y tips — ahora genera tu sensibilidad personalizada.
        </p>
        <Link
          href="/generator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all duration-200 min-h-[44px] hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #ff6a00, #06b6d4)' }}
        >
          Ir al Generador <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
