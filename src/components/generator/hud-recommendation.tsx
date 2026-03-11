'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — HUD Recommendation Panel — Versión PREMIUM ESPORTS
// Ahora con códigos HUD REALES de Free Fire desde la base de datos.
// Mini-selector de códigos, badge de pro player, instrucciones
// de importación reales para el juego.
// ═══════════════════════════════════════════════════════════════

import type { HudRecommendation } from '@ares/algorithms';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Gamepad2, Import, Trophy, Zap, Target, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { useHudCodes } from '@/hooks/use-hud-codes';
import { cn } from '@/lib/cn';

import { FingerLayoutSvg } from './finger-layout-svg';
import { HudCodeBlock } from './hud-code-block';

// Capturas reales de Free Fire por cantidad de dedos
const FINGER_SCREENSHOTS: Partial<Record<2 | 3 | 4 | 5, string>> = {
  2: '/images/hud-codes/hud-2d-clasico.png',
  3: '/images/hud-codes/hud-3d-velocidad.png',
  4: '/images/hud-codes/hud-4d-garra-tactica.png',
};

interface HudRecommendationPanelProps {
  data: HudRecommendation;
  screenSize?: number;
}

const FINGER_META: Record<2 | 3 | 4 | 5, { emoji: string; title: string; subtitle: string; icon: typeof Gamepad2 }> = {
  2: {
    emoji: '✌️',
    title: '2 DEDOS — CLÁSICO',
    subtitle: 'Ideal para principiantes y juego casual',
    icon: Gamepad2,
  },
  3: {
    emoji: '🤟',
    title: '3 DEDOS — VERSÁTIL',
    subtitle: 'Buen balance entre control y velocidad',
    icon: Zap,
  },
  4: {
    emoji: '🖐️',
    title: '4 DEDOS — GARRA',
    subtitle: 'Para jugadores competitivos que quieren todo',
    icon: Trophy,
  },
  5: {
    emoji: '🖐️',
    title: '5 DEDOS — FULL CONTROL',
    subtitle: 'Control total. Para los más pro',
    icon: Target,
  },
};

const STAT_CONFIG: { key: 'precision' | 'speed' | 'playability'; label: string; icon: typeof Target }[] = [
  { key: 'precision', label: 'Precisión', icon: Target },
  { key: 'speed', label: 'Velocidad', icon: Zap },
  { key: 'playability', label: 'Jugabilidad', icon: Gamepad2 },
];

function StatBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="relative h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, #f97316 0%, #06b6d4 ${Math.max(value, 30)}%)`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute top-0 bottom-0 w-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, transparent 70%)',
        }}
        initial={{ left: '0%' }}
        animate={{ left: `${Math.max(value - 1, 0)}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

/**
 * Muestra captura real de Free Fire para 2/3/4 dedos,
 * o el diagrama SVG interactivo para 5 dedos.
 */
function HudVisualSection({ fingers, screenSize, isRec }: { fingers: 2 | 3 | 4 | 5; screenSize?: number; isRec: boolean }) {
  const screenshot = FINGER_SCREENSHOTS[fingers];

  // 5 dedos: mantener diagrama interactivo (no tiene captura real)
  if (!screenshot) {
    return (
      <div
        className={cn(
          'rounded-lg overflow-hidden border',
          isRec ? 'border-white/10' : 'border-white/5',
        )}
      >
        <FingerLayoutSvg fingers={fingers} screenSize={screenSize} />
      </div>
    );
  }

  // 2/3/4 dedos: mostrar captura real de Free Fire
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div
        className="relative rounded-[20px] overflow-hidden"
        style={{
          border: '1px solid rgba(0,255,255,0.15)',
          boxShadow: '0 0 30px rgba(0,255,255,0.06), 0 12px 40px rgba(0,0,0,0.4)',
          background: '#000',
        }}
      >
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={screenshot}
            alt={`HUD ${fingers} dedos — Captura real de Free Fire`}
            fill
            className="object-cover rounded-[18px]"
            sizes="(max-width: 640px) 100vw, 480px"
          />
          {/* Reflejo de vidrio */}
          <div
            className="absolute inset-0 rounded-[18px] pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)',
            }}
          />
        </div>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] rounded-b-full bg-white/[0.06]" />
      </div>

      {/* Badge CAPTURA REAL */}
      <div
        className="absolute -top-2 right-3 z-10 px-2 py-0.5 rounded-md"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span className="text-[8px] font-ui font-bold uppercase tracking-[0.15em] text-cyan-300/90">
          CAPTURA REAL
        </span>
      </div>
    </div>
  );
}

function HudCodeSection({ fingers, screenSize }: { fingers: 2 | 3 | 4 | 5; screenSize?: number }) {
  const { codes, recommended, isLoading, error } = useHudCodes({ fingers, screenSize });
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Determinar código activo: selección manual > recomendado > primer código
  const activeCode = selectedIdx !== null ? codes[selectedIdx] : recommended ?? codes[0] ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <Loader2 size={14} className="animate-spin text-ice-400" />
        <span className="text-[11px] text-slate-500">Cargando códigos HUD...</span>
      </div>
    );
  }

  if (error || !activeCode) {
    return (
      <div className="py-2">
        <p className="text-[11px] text-red-400/70">No se pudieron cargar los códigos HUD</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Mini-selector si hay múltiples códigos */}
      {codes.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {codes.map((c, idx) => {
            const isActive = activeCode.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedIdx(idx)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[10px] font-ui font-semibold transition-all min-h-[28px]',
                  'border',
                  isActive
                    ? 'bg-ice-500/15 border-ice-500/40 text-ice-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400',
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Descripción del código activo */}
      {activeCode.description && (
        <p className="text-[10px] text-slate-500 leading-relaxed">
          {activeCode.description}
        </p>
      )}

      {/* Bloque de código real */}
      <HudCodeBlock
        code={activeCode.code}
        label={activeCode.label}
        playerName={activeCode.playerName}
      />
    </div>
  );
}

export function HudRecommendationPanel({ data, screenSize }: HudRecommendationPanelProps) {
  const [expandedPros, setExpandedPros] = useState<Record<number, boolean>>({});

  const togglePros = (fingers: number) => {
    setExpandedPros((prev) => ({ ...prev, [fingers]: !prev[fingers] }));
  };

  return (
    <div className="space-y-4">
      {/* ═══ HEADER ═══ */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-fire-500/10 border border-fire-500/20">
            <Gamepad2 size={18} className="text-fire-400" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white tracking-wide">
              CUSTOM HUD
            </h3>
            <p className="text-xs text-slate-500">
              Códigos HUD reales de Free Fire • Copia y pega directo en el juego
            </p>
          </div>
        </div>

        {/* Instrucción de importación */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-ice-500/[0.04] border border-ice-500/10">
          <Import size={14} className="text-ice-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <span className="text-ice-300 font-semibold">Copia el código</span>{' '}
            → Ajustes → En Partida → Usar código compartido → Pegar → Aplicar
          </p>
        </div>
      </div>

      {/* ═══ CARDS DE CADA LAYOUT ═══ */}
      <div className="space-y-4">
        {data.options.map((option, cardIdx) => {
          const meta = FINGER_META[option.fingers];
          const prosOpen = expandedPros[option.fingers] ?? false;
          const isRec = option.isRecommended;

          return (
            <motion.div
              key={option.fingers}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: cardIdx * 0.12 }}
              className={cn(
                'relative rounded-xl border overflow-hidden transition-all',
                'backdrop-blur-sm',
                isRec
                  ? 'bg-white/[0.03] border-transparent'
                  : 'bg-white/[0.015] border-white/5 opacity-[0.85]',
              )}
              style={
                isRec
                  ? {
                      backgroundImage:
                        'linear-gradient(135deg, rgba(6,182,212,0.04), rgba(249,115,22,0.04))',
                      boxShadow:
                        '0 0 0 1px rgba(6,182,212,0.15), 0 0 30px rgba(6,182,212,0.06), 0 0 60px rgba(249,115,22,0.03)',
                    }
                  : undefined
              }
            >
              {/* Badge recomendado con glow animado */}
              {isRec && (
                <div className="relative flex items-center justify-center gap-1.5 py-2 overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(6,182,212,0.08), rgba(249,115,22,0.06), transparent)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['100% 0%', '-100% 0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                  <Check size={12} className="relative text-ice-400" />
                  <span className="relative text-[10px] font-ui font-bold text-ice-300 uppercase tracking-[0.15em]">
                    Recomendado para tu dispositivo
                  </span>
                </div>
              )}

              <div className="p-4 space-y-4">
                {/* Header del card */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm md:text-base font-display font-bold text-white">
                      {meta.emoji} {meta.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{meta.subtitle}</p>
                  </div>
                  {isRec && (
                    <div className="shrink-0 px-2 py-1 rounded-md bg-ice-500/10 border border-ice-500/20">
                      <span className="text-[9px] font-ui font-bold text-ice-400 uppercase tracking-wider">
                        Best
                      </span>
                    </div>
                  )}
                </div>

                {/* ═══ VISUAL: Screenshot real o diagrama SVG ═══ */}
                <HudVisualSection fingers={option.fingers} screenSize={screenSize} isRec={isRec} />

                {/* ═══ STATS BARS — Fila horizontal ═══ */}
                <HudStatsSection fingers={option.fingers} screenSize={screenSize} cardIdx={cardIdx} />

                {/* ═══ CÓDIGO HUD REAL ═══ */}
                <HudCodeSection fingers={option.fingers} screenSize={screenSize} />

                {/* ═══ PROS Y CONTRAS — Colapsable ═══ */}
                <div>
                  <button
                    onClick={() => togglePros(option.fingers)}
                    className={cn(
                      'flex items-center gap-1.5 py-1.5 text-[11px] font-ui transition-colors min-h-[32px]',
                      prosOpen ? 'text-slate-300' : 'text-slate-600 hover:text-slate-400',
                    )}
                  >
                    <motion.div
                      animate={{ rotate: prosOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={12} />
                    </motion.div>
                    {prosOpen ? 'Ocultar' : 'Ver'} pros y contras
                  </button>

                  <AnimatePresence>
                    {prosOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-3 pt-2 pb-1">
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-ui font-bold text-emerald-500 uppercase tracking-wider mb-1">
                              Ventajas
                            </p>
                            {option.pros.map((pro) => (
                              <p
                                key={pro}
                                className="text-[10px] text-emerald-400/80 flex items-start gap-1.5 leading-relaxed"
                              >
                                <span className="shrink-0 text-emerald-500 mt-px">+</span>
                                <span>{pro}</span>
                              </p>
                            ))}
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[9px] font-ui font-bold text-red-500 uppercase tracking-wider mb-1">
                              Desventajas
                            </p>
                            {option.cons.map((con) => (
                              <p
                                key={con}
                                className="text-[10px] text-red-400/80 flex items-start gap-1.5 leading-relaxed"
                              >
                                <span className="shrink-0 text-red-500 mt-px">&minus;</span>
                                <span>{con}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Muestra las barras de stats usando datos del código activo de la DB,
 * con fallback a los valores estáticos por defecto.
 */
function HudStatsSection({ fingers, screenSize, cardIdx }: { fingers: 2 | 3 | 4 | 5; screenSize?: number; cardIdx: number }) {
  const { recommended } = useHudCodes({ fingers, screenSize });

  // Usar stats del código recomendado si está disponible, fallback a valores estáticos
  const FALLBACK_STATS: Record<2 | 3 | 4 | 5, { precision: number; speed: number; playability: number }> = {
    2: { precision: 60, speed: 40, playability: 95 },
    3: { precision: 75, speed: 70, playability: 70 },
    4: { precision: 95, speed: 90, playability: 45 },
    5: { precision: 90, speed: 87, playability: 90 },
  };

  const stats = recommended
    ? { precision: recommended.precision, speed: recommended.velocity, playability: recommended.playability }
    : FALLBACK_STATS[fingers];

  return (
    <div className="grid grid-cols-3 gap-3">
      {STAT_CONFIG.map((stat, statIdx) => {
        const StatIcon = stat.icon;
        return (
          <div key={stat.key} className="space-y-1.5">
            <div className="flex items-center gap-1">
              <StatIcon size={10} className="text-slate-500" />
              <span className="text-[10px] text-slate-500 font-ui truncate">
                {stat.label}
              </span>
            </div>
            <StatBar
              value={stats[stat.key]}
              delay={cardIdx * 0.15 + statIdx * 0.08}
            />
            <span className="text-[11px] font-mono font-bold text-white">
              {stats[stat.key]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
