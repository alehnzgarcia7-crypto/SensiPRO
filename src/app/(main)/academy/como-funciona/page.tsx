import {
  Cpu,
  Smartphone,
  Users,
  Zap,
  Target,
  Crosshair,
  Gamepad2,
  LayoutGrid,
  Gauge,
  BookOpen,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// Cómo Funciona SensiPRO — Contenido educativo, NO premium
// Explica el algoritmo ARES v5.0 para gamers
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: 'Cómo Funciona SensiPRO | La Ciencia de tu Sensibilidad',
  description:
    'Descubre cómo SensiPRO calcula tu sensibilidad perfecta usando datos reales de 610+ dispositivos y 271 fuentes de datos.',
  keywords: [
    'como funciona sensipro',
    'algoritmo sensibilidad free fire',
    'ares v5 free fire',
    'sensibilidad por dispositivo',
  ],
  openGraph: {
    title: 'Cómo Funciona SensiPRO — La Ciencia de tu Sensibilidad',
    description:
      'Algoritmo ARES v5.0: 610+ dispositivos, 271 fuentes de datos, sensibilidad calibrada para TU celular.',
  },
};

const FEATURES = [
  {
    icon: Target,
    title: 'Generador',
    description: 'Sensibilidad personalizada para 610+ dispositivos con 3 estilos y 3 calibraciones.',
    color: '#ff6a00',
  },
  {
    icon: Crosshair,
    title: 'Headshot Mode',
    description: 'Sensibilidad optimizada para headshots + técnica de drag + build de personaje con 18 combos.',
    color: '#ef4444',
  },
  {
    icon: LayoutGrid,
    title: 'Códigos HUD',
    description: 'Códigos reales de Free Fire para 2, 3 y 4 dedos que copias directo al juego.',
    color: '#a855f7',
  },
  {
    icon: Gauge,
    title: 'Botón de Disparo',
    description: 'Tamaño recomendado según tu pantalla, tus dedos y tu estilo.',
    color: '#22c55e',
  },
  {
    icon: BookOpen,
    title: 'Academia',
    description: 'Guías completas, tips, meta actual y contenido educativo premium.',
    color: '#06b6d4',
  },
] as const;

const STATS = [
  { value: '610+', label: 'Dispositivos en la base de datos', icon: Smartphone },
  { value: '21', label: 'Marcas de celulares', icon: Zap },
  { value: '271', label: 'Fuentes de datos', icon: Users },
  { value: 'v5.0', label: 'Versión del algoritmo ARES', icon: Cpu },
] as const;

export default function ComoFuncionaPage() {
  return (
    <div className="space-y-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <span>←</span> Volver al inicio
      </Link>

      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <Cpu className="w-6 h-6 text-ice-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Cómo Funciona SensiPRO
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm">
          La ciencia detrás de tu sensibilidad perfecta.
        </p>
      </div>

      {/* SECCIÓN 1: Tu celular NO es igual */}
      <section className="glass-card p-6 academy-stagger" style={{ animationDelay: '50ms' }}>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Tu celular NO es igual al de tu creador de contenido favorito
        </h2>
        <div className="section-heading-separator mb-4" />

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Cada creador de contenido te dice &quot;con esta sensi vas a pegar
            todo rojo&quot; y te da UN número. Para todos. El problema: tu Samsung
            A14 tiene una pantalla completamente diferente a su iPad Pro.
          </p>
          <p>
            La misma sensibilidad se siente distinta en cada celular por una
            razón: la densidad de píxeles (PPI). Si tu pantalla tiene 270 PPI y
            la de él tiene 460 PPI, cuando tú mueves el dedo 1cm se mueven menos
            píxeles que cuando él hace lo mismo.
          </p>
        </div>

        {/* Callout */}
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            Por eso copiar la sensi de un creador de contenido casi NUNCA funciona.
          </p>
        </div>
      </section>

      {/* SECCIÓN 2: Qué hace SensiPRO diferente */}
      <section className="glass-card p-6 academy-stagger" style={{ animationDelay: '100ms' }}>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Cpu className="w-5 h-5 text-ice-400" />
          Qué hace SensiPRO diferente
        </h2>
        <div className="section-heading-separator mb-4" />

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            SensiPRO tiene una base de datos de 610+ celulares con las
            especificaciones REALES verificadas contra GSMArena: tamaño de
            pantalla, densidad de píxeles, RAM, tasa de refresco, tipo de panel.
          </p>
          <p>
            El algoritmo ARES v5.0 toma TU celular específico y calcula una
            sensibilidad calibrada para TU hardware. No es un número random —
            son datos de 271 fuentes de datos de Free Fire.
          </p>
        </div>

        {/* Mini stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { value: '610+', label: 'Dispositivos verificados' },
            { value: '271', label: 'Fuentes de datos' },
            { value: 'v5.0', label: 'Versión del algoritmo' },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="font-[family-name:var(--font-orbitron)] font-black text-white text-lg">
                {s.value}
              </div>
              <div className="text-[10px] text-slate-500 font-[family-name:var(--font-rajdhani)] mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: Cómo calcula tu sensibilidad */}
      <section className="glass-card p-6 academy-stagger" style={{ animationDelay: '150ms' }}>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-fire-400" />
          Cómo calcula tu sensibilidad
        </h2>
        <div className="section-heading-separator mb-4" />

        <div className="space-y-4">
          {[
            {
              num: '1',
              text: 'Tu celular tiene una densidad de pantalla (PPI). Pantalla más densa = sensibilidad más baja porque cada pixel es más chico.',
            },
            {
              num: '2',
              text: 'Tu RAM afecta los FPS. Menos RAM = juego menos fluido = necesitas sensibilidad más controlada.',
            },
            {
              num: '3',
              text: 'Tus Hz (60/90/120) cambian cómo se siente la sensibilidad. 120Hz se siente más suave que 60Hz.',
            },
            {
              num: '4',
              text: 'Tu estilo de juego: Agresivo necesita más sensibilidad para giros rápidos. Francotirador necesita menos para precisión.',
            },
            {
              num: '5',
              text: 'Cada slider (Punto Rojo, Mira 2x, 4x, AWM, Vista Libre) se calcula con ratios independientes basados en datos de jugadores profesionales.',
            },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-fire-500/15 border border-fire-500/20 flex items-center justify-center font-[family-name:var(--font-orbitron)] text-xs font-black text-fire-400">
                {step.num}
              </span>
              <p className="text-sm text-slate-300 leading-relaxed pt-0.5">
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl border border-ice-500/20 bg-ice-500/5">
          <Info className="w-5 h-5 text-ice-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-ice-200">
            El resultado: una sensibilidad que funciona en TU celular, con TU
            estilo, para TUS dedos.
          </p>
        </div>
      </section>

      {/* SECCIÓN 4: Todo lo que incluye */}
      <section className="academy-stagger" style={{ animationDelay: '200ms' }}>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
          Todo lo que incluye SensiPRO
        </h2>
        <div className="section-heading-separator mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((feat, index) => (
            <div
              key={feat.title}
              className="glass-card p-4 academy-stagger"
              style={{ animationDelay: `${220 + index * 40}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="p-1.5 rounded-lg border"
                  style={{
                    backgroundColor: `${feat.color}15`,
                    borderColor: `${feat.color}30`,
                  }}
                >
                  <feat.icon className="w-4 h-4" style={{ color: feat.color }} />
                </div>
                <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm">
                  {feat.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 5: Los datos detrás del motor */}
      <section className="glass-card p-6 academy-stagger" style={{ animationDelay: '300ms' }}>
        <h2 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-1">
          <Smartphone className="w-5 h-5 text-green-400" />
          Los datos detrás del motor
        </h2>
        <div className="section-heading-separator mb-4" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <stat.icon className="w-5 h-5 text-ice-400 mx-auto mb-2" />
              <div className="font-[family-name:var(--font-orbitron)] font-black text-white text-xl">
                {stat.value}
              </div>
              <div className="text-[10px] text-slate-500 font-[family-name:var(--font-rajdhani)] mt-1 leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}
