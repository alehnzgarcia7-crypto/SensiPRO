'use client';

import {
  BookOpen,
  Clock,
  Crosshair,
  Gamepad2,
  Monitor,
  Smartphone,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════
// Guías hardcodeadas — contenido REAL de Free Fire
// ═══════════════════════════════════════════════════════════════

interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  readTime: number;
  icon: React.ElementType;
}

const GUIDES: Guide[] = [
  {
    slug: 'sensibilidad-perfecta',
    title: 'Cómo Encontrar tu Sensibilidad Perfecta',
    description:
      'Tu sensibilidad depende de tu celular, no de lo que usa un pro. Aprende a calibrarla paso a paso.',
    category: 'Sensibilidad',
    categoryLabel: 'Sensibilidad',
    difficulty: 'Principiante',
    readTime: 5,
    icon: Target,
  },
  {
    slug: 'configuracion-hud',
    title: 'Configuración de HUD para 2, 3 y 4 Dedos',
    description:
      'La posición de tus botones importa tanto como tu sensibilidad. Códigos HUD listos para copiar.',
    category: 'HUD',
    categoryLabel: 'HUD',
    difficulty: 'Intermedio',
    readTime: 8,
    icon: Gamepad2,
  },
  {
    slug: 'headshots-consistentes',
    title: 'Cómo Hacer Headshots Consistentes',
    description:
      'No es solo puntería — es sensibilidad + técnica de drag + posición del crosshair. Te explicamos todo.',
    category: 'Combate',
    categoryLabel: 'Combate',
    difficulty: 'Intermedio',
    readTime: 6,
    icon: Crosshair,
  },
  {
    slug: 'settings-graficos',
    title: 'Settings Gráficos para Máximo FPS',
    description:
      'FPS > gráficos bonitos. Siempre. Te decimos qué poner en bajo, medio y alto según tu cel.',
    category: 'Configuración',
    categoryLabel: 'Configuración',
    difficulty: 'Principiante',
    readTime: 4,
    icon: Monitor,
  },
  {
    slug: 'giroscopio-guia',
    title: 'Giroscopio: ¿Activarlo o No?',
    description:
      'El gyro no es para todos. Aprende cuándo conviene, cómo configurarlo, y cómo practicarlo.',
    category: 'Sensibilidad',
    categoryLabel: 'Sensibilidad',
    difficulty: 'Avanzado',
    readTime: 7,
    icon: Smartphone,
  },
  {
    slug: 'drag-shot-tecnicas',
    title: 'Técnicas de Drag Shot para Headshots',
    description:
      'Vertical drag, J-drag y rotation — las 3 técnicas que usan los pros. Con ejemplos por arma.',
    category: 'Combate',
    categoryLabel: 'Combate',
    difficulty: 'Avanzado',
    readTime: 8,
    icon: Crosshair,
  },
  {
    slug: 'dpi-sensibilidad',
    title: 'DPI: Qué Es y Cómo Afecta tu Sensibilidad',
    description:
      'Tu celular tiene un DPI que cambia cómo se siente la pantalla. Aprende a usarlo a tu favor.',
    category: 'Sensibilidad',
    categoryLabel: 'Sensibilidad',
    difficulty: 'Intermedio',
    readTime: 5,
    icon: Target,
  },
  {
    slug: 'armas-sensibilidad',
    title: 'Guía de Armas: Sensibilidad por Categoría',
    description:
      'No usas la misma sensi para una M4 que para una AWM. Te damos los ajustes por arma.',
    category: 'Armas',
    categoryLabel: 'Armas',
    difficulty: 'Intermedio',
    readTime: 6,
    icon: Target,
  },
];

const CATEGORIES = ['Todas', 'Sensibilidad', 'HUD', 'Combate', 'Configuración', 'Armas'] as const;

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Principiante: {
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  Intermedio: {
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  Avanzado: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Sensibilidad: '#06b6d4',
  HUD: '#f97316',
  Combate: '#ef4444',
  Configuración: '#22c55e',
  Armas: '#a855f7',
};

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const filtered =
    selectedCategory === 'Todas'
      ? GUIDES
      : GUIDES.filter((g) => g.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="academy-stagger">
        <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2 font-[family-name:var(--font-orbitron)] uppercase tracking-wide">
          <BookOpen className="w-6 h-6 text-fire-400" />
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Guías de Free Fire
          </span>
        </h1>
        <div className="section-heading-separator mb-3" />
        <p className="text-slate-400 text-sm">
          Guías completas de sensibilidad, HUD, configuración gráfica, headshots
          y más para Free Fire.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory md:snap-none academy-stagger" style={{ animationDelay: '50ms' }}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const color = cat === 'Todas' ? '#ff6a00' : CATEGORY_COLORS[cat] ?? '#ff6a00';

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'flex-shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-[family-name:var(--font-rajdhani)] font-semibold uppercase tracking-wide transition-all duration-200 min-h-[44px] flex items-center border',
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
              {cat}
            </button>
          );
        })}
      </div>

      {/* Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((guide, index) => {
          const diffStyle = DIFFICULTY_COLORS[guide.difficulty];
          const catColor = CATEGORY_COLORS[guide.category] ?? '#ff6a00';
          const Icon = guide.icon;

          return (
            <div
              key={guide.slug}
              className="group glass-card p-5 academy-stagger transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 60}ms`,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 30px ${catColor}15, 0 0 15px ${catColor}10`,
                }}
              />

              <div className="relative z-10">
                {/* Top row: icon + badges */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-2.5 rounded-lg border shadow-lg"
                    style={{
                      backgroundColor: `${catColor}15`,
                      borderColor: `${catColor}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: catColor }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-[family-name:var(--font-rajdhani)] font-bold uppercase tracking-wider px-2 py-1 rounded-md border',
                        diffStyle?.bg,
                        diffStyle?.text,
                        diffStyle?.border,
                      )}
                    >
                      {guide.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-numbers">
                      <Clock className="w-3 h-3" />
                      {guide.readTime} min
                    </span>
                  </div>
                </div>

                {/* Category badge */}
                <span
                  className="inline-block text-[10px] font-[family-name:var(--font-rajdhani)] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2"
                  style={{
                    backgroundColor: `${catColor}15`,
                    color: catColor,
                  }}
                >
                  {guide.categoryLabel}
                </span>

                {/* Title + description */}
                <h3 className="font-[family-name:var(--font-rajdhani)] font-bold text-white text-base mb-2 leading-tight">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {guide.description}
                </p>

                {/* Read link */}
                <span className="flex items-center gap-1 text-xs text-fire-400 font-[family-name:var(--font-rajdhani)] font-semibold group-hover:gap-2 transition-all duration-200">
                  Leer guía <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-[family-name:var(--font-rajdhani)] font-medium">
            No hay guías en esta categoría
          </p>
        </div>
      )}
    </div>
  );
}
