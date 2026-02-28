'use client';

import { Lightbulb, Crosshair, PersonStanding, Settings } from 'lucide-react';
import { useState } from 'react';

import { PremiumBlur } from '@/components/paywall';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// Tips hardcodeados — contenido REAL y ÚTIL de Free Fire
// ═══════════════════════════════════════════════════════════════

interface Tip {
  id: number;
  title: string;
  content: string;
  category: 'Puntería' | 'Movimiento' | 'Configuración';
}

const TIPS: Tip[] = [
  // Puntería (4)
  {
    id: 1,
    title: 'Apunta al pecho, no a la cabeza',
    content:
      'El recoil sube natural. Si apuntas al pecho, las balas suben a la cabeza solas. Funciona con M4, SCAR, AK.',
    category: 'Puntería',
  },
  {
    id: 2,
    title: 'Practica drag shots en entrenamiento 10 min al día',
    content:
      'No en ranked. En el campo de entrenamiento. 10 minutos con AWM contra bots. En 2 semanas notas la diferencia.',
    category: 'Puntería',
  },
  {
    id: 3,
    title: 'Baja tu sensibilidad de scope 2x y 4x',
    content:
      'La mayoría de jugadores tienen estas demasiado altas. Bájala 10-15 puntos y verás que controlas mejor el spray.',
    category: 'Puntería',
  },
  {
    id: 4,
    title: 'El crosshair siempre a altura de cabeza',
    content:
      'Cuando caminas, mantén el crosshair donde estaría la cabeza del enemigo. Así cuando aparece, ya estás apuntando.',
    category: 'Puntería',
  },
  // Movimiento (4)
  {
    id: 5,
    title: 'Nunca te quedes quieto en un 1v1',
    content:
      'Agáchate, muévete lateral, salta. Un blanco quieto es un blanco muerto.',
    category: 'Movimiento',
  },
  {
    id: 6,
    title: 'Usa gloo walls ofensivamente, no solo defensivamente',
    content:
      'Pon una gloo y úsala para peekear. Es más útil que solo cubrirte.',
    category: 'Movimiento',
  },
  {
    id: 7,
    title: 'Practica el drop shot',
    content:
      'Agacharte mientras disparas confunde al enemigo. Funciona mejor con 3+ dedos.',
    category: 'Movimiento',
  },
  {
    id: 8,
    title: 'El jiggle peek gana 1v1s',
    content:
      'Asómate y escóndete rápido para ver al enemigo sin que te pegue. Luego peekea y dispara.',
    category: 'Movimiento',
  },
  // Configuración (4)
  {
    id: 9,
    title: 'Pon los gráficos en BAJO y el FPS en ALTO',
    content:
      'Más FPS = más suave = mejor puntería. Los gráficos bonitos no ganan partidas.',
    category: 'Configuración',
  },
  {
    id: 10,
    title: 'Tu sensibilidad NO debe ser igual a la de un pro',
    content:
      'Ellos juegan en iPad con 120Hz. Tú en un Redmi con 60Hz. Necesitas TU sensibilidad.',
    category: 'Configuración',
  },
  {
    id: 11,
    title: 'Revisa tu HUD cada mes',
    content:
      'Tus dedos se acostumbran y mejoran. Lo que funcionaba hace 2 meses puede mejorar hoy.',
    category: 'Configuración',
  },
  {
    id: 12,
    title: 'Activa las notificaciones de enemigos cercanos',
    content:
      'En ajustes de sonido. Te avisa cuando hay pasos cerca. Muchos no saben que existe.',
    category: 'Configuración',
  },
];

const CATEGORIES = ['Todos', 'Puntería', 'Movimiento', 'Configuración'] as const;

const CATEGORY_CONFIG: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  Puntería: { color: '#06b6d4', icon: Crosshair, label: 'Puntería' },
  Movimiento: { color: '#22c55e', icon: PersonStanding, label: 'Movimiento' },
  Configuración: { color: '#f97316', icon: Settings, label: 'Configuración' },
};

export default function TipsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const filtered =
    selectedCategory === 'Todos'
      ? TIPS
      : TIPS.filter((t) => t.category === selectedCategory);

  // Agrupar por categoría para mostrar secciones
  const grouped = filtered.reduce<Record<string, Tip[]>>((acc, tip) => {
    if (!acc[tip.category]) acc[tip.category] = [];
    acc[tip.category]!.push(tip);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Tips y Trucos
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm">
          Tips rápidos para mejorar tu puntería, movimiento y gameplay en Free
          Fire. Aplícalos hoy.
        </p>
      </div>

      {/* Category Filters */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory md:snap-none academy-stagger"
        style={{ animationDelay: '50ms' }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const config = cat === 'Todos' ? null : CATEGORY_CONFIG[cat];
          const color = config?.color ?? '#ff6a00';

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'flex-shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-[family-name:var(--font-rajdhani)] font-semibold uppercase tracking-wide transition-all duration-200 min-h-[44px] flex items-center gap-1.5 border',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent',
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `${color}20`,
                      borderColor: `${color}40`,
                      color,
                      boxShadow: `0 0 12px ${color}25`,
                    }
                  : undefined
              }
            >
              {config && <config.icon className="w-3.5 h-3.5" />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Tips por categoría — PREMIUM */}
      <PremiumBlur source="academy" intensity={12}>
      {Object.entries(grouped).map(([category, tips]) => {
        const config = CATEGORY_CONFIG[category];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <section key={category}>
            <div className="mb-2">
              <h2 className="font-[family-name:var(--font-orbitron)] text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Icon className="w-5 h-5" style={{ color: config.color }} />
                {config.label}
                <span className="font-numbers text-xs text-slate-500 font-normal normal-case tracking-normal">
                  ({tips.length})
                </span>
              </h2>
            </div>
            <div className="section-heading-separator mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tips.map((tip, index) => (
                <div
                  key={tip.id}
                  className="relative glass-card p-4 pl-6 academy-stagger group"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Category accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200 group-hover:w-[5px]"
                    style={{
                      background: config.color,
                      boxShadow: `0 0 8px ${config.color}40`,
                    }}
                  />

                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 font-[family-name:var(--font-orbitron)] font-black text-lg text-white/20 mt-[-2px]">
                      {tip.id}
                    </span>
                    <div>
                      <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-sm mb-1">
                        {tip.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {tip.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      </PremiumBlur>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-[family-name:var(--font-rajdhani)] font-medium">
            No se encontraron tips
          </p>
        </div>
      )}
    </div>
  );
}
