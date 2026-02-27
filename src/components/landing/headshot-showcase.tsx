'use client';

import { Crosshair, Check } from 'lucide-react';
import Link from 'next/link';

import { ScrollReveal } from './scroll-reveal';

// --- 5 técnicas de drag con datos ---

interface DragTechnique {
  name: string;
  difficulty: number; // 1-5 estrellas
  color: string;
  /** SVG path animation type */
  pathType: 'vertical' | 'rotation' | 'direction' | 'situp' | 'jump';
}

const TECHNIQUES: DragTechnique[] = [
  { name: 'Vertical', difficulty: 1, color: '#22c55e', pathType: 'vertical' },
  { name: 'Rotation', difficulty: 3, color: '#f97316', pathType: 'rotation' },
  { name: 'Direction', difficulty: 2, color: '#06b6d4', pathType: 'direction' },
  { name: 'Situp', difficulty: 4, color: '#a855f7', pathType: 'situp' },
  { name: 'Jump', difficulty: 5, color: '#ef4444', pathType: 'jump' },
];

const BULLETS = [
  'Sensibilidad adaptada a 2, 3 o 4 dedos con ajustes en tiempo real',
  'HUD personalizado con posición de botones por tipo de agarre',
  'Técnicas de drag (Vertical, Rotation, Direction) por nivel de dedos',
  'Tier list de armas S/A/B según tu estilo de agarre',
  'Plan de entrenamiento de 7 días con timer y repeticiones',
  'Ajuste de giroscopio, botón de disparo y tabla de armas por dedo',
  'Badge Pro Player para usuarios de 4 dedos (garra)',
  'Copiar toda la configuración al portapapeles con un toque',
];

// --- Mini SVG animado por técnica ---

function DragSvg({ technique }: { technique: DragTechnique }) {
  const { color, pathType } = technique;

  // Cada SVG tiene su propio path animado
  const pathMap: Record<string, string> = {
    vertical: 'M 75 130 L 75 30',
    rotation: 'M 30 120 Q 75 60 120 30',
    direction: 'M 30 130 L 120 30',
    situp: 'M 30 100 L 75 40 L 120 100',
    jump: 'M 30 120 Q 75 10 120 120',
  };

  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      {/* Crosshair center */}
      <circle cx="75" cy="75" r="35" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="75" y1="35" x2="75" y2="115" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <line x1="35" y1="75" x2="115" y2="75" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

      {/* Path animado */}
      <path
        d={pathMap[pathType]}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="200"
        strokeDashoffset="200"
        opacity="0.8"
        className="drag-path-animate"
      />

      {/* Punto start */}
      <circle
        cx={pathType === 'vertical' ? 75 : 30}
        cy={pathType === 'vertical' ? 130 : pathType === 'situp' ? 100 : 120}
        r="4"
        fill={color}
        opacity="0.6"
      />

      {/* Punto end */}
      <circle
        cx={pathType === 'vertical' ? 75 : 120}
        cy={pathType === 'vertical' ? 30 : pathType === 'situp' || pathType === 'jump' ? (pathType === 'jump' ? 120 : 100) : 30}
        r="5"
        fill={color}
        className="drag-endpoint-pulse"
      />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < count ? 'text-amber-400' : 'text-slate-700'}
          style={{ fontSize: '10px' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function HeadshotShowcase() {
  return (
    <section className="py-20 px-4 relative">
      {/* Fondo rojo tenue */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-500/[0.03] rounded-full blur-[200px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-ui font-bold uppercase tracking-wider mb-6 headshot-badge-pulse">
              Solo en SensiPRO
            </span>

            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              <Crosshair className="inline-block mr-2 text-red-500" size={32} />
              <span className="headshot-text-gradient">HEADSHOT MODE</span>
            </h2>
            <p className="mt-3 text-lg text-slate-400 font-ui">
              Dale la ventaja a tu squad
            </p>
          </div>
        </ScrollReveal>

        {/* Split layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Columna izquierda — texto de venta */}
          <ScrollReveal>
            <div>
              <p className="text-slate-300 font-body leading-relaxed mb-8">
                El 73% de las eliminaciones en ranked son por headshot. Si no estás
                calibrado para tiro a la cabeza, estás perdiendo peleas que deberías ganar.
              </p>

              <ul className="space-y-4">
                {BULLETS.map((bullet, i) => (
                  <ScrollReveal key={bullet} delay={i * 100}>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-success" />
                      </div>
                      <span className="text-sm text-slate-300 font-body">{bullet}</span>
                    </li>
                  </ScrollReveal>
                ))}
              </ul>

              <div className="mt-10">
                <Link
                  href="/generator/headshot"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-fire-500 text-white font-ui font-bold transition-all duration-300 hover:scale-[1.03] hover:shadow-glow-danger min-h-[48px]"
                >
                  <Crosshair size={18} />
                  IR AL HEADSHOT MODE
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Columna derecha — mini SVGs de las 5 técnicas */}
          <ScrollReveal delay={200}>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {TECHNIQUES.map((tech) => (
                <div
                  key={tech.name}
                  className="glass-card p-3 text-center group cursor-default transition-all duration-300 hover:scale-105"
                  style={{
                    ['--tech-color' as string]: tech.color,
                  }}
                >
                  <div className="w-full aspect-[3/2] mb-2">
                    <DragSvg technique={tech} />
                  </div>
                  <p className="text-xs font-ui font-bold text-white">{tech.name}</p>
                  <Stars count={tech.difficulty} />

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: `0 0 20px ${tech.color}15, inset 0 0 0 1px ${tech.color}30`,
                      borderRadius: '16px',
                    }}
                  />
                </div>
              ))}

              {/* Celda extra vacía para centrar el grid de 3+2 */}
              <div className="hidden sm:block" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
