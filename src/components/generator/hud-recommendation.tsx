'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Gamepad2, Info } from 'lucide-react';

import type { HudRecommendation } from '@ares/algorithms';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/card';
import { FingerLayoutSvg } from './finger-layout-svg';
import { HudCodeBlock } from './hud-code-block';

// ═══════════════════════════════════════════════════════════════
// HUD Recommendation Panel — Versión completa con códigos,
// visual de dedos, stats por layout y diseño gaming AAA
// ═══════════════════════════════════════════════════════════════

interface HudRecommendationPanelProps {
  data: HudRecommendation;
  deviceId: string;
  screenSize?: number;
}

const FINGER_NAMES: Record<2 | 3 | 4, { emoji: string; title: string; subtitle: string }> = {
  2: {
    emoji: '✌️',
    title: '2 DEDOS | CLÁSICO',
    subtitle: 'Ideal para principiantes y juego casual',
  },
  3: {
    emoji: '🤟',
    title: '3 DEDOS | VERSÁTIL',
    subtitle: 'Balance perfecto entre control y velocidad',
  },
  4: {
    emoji: '🖐️',
    title: '4 DEDOS | COMPETITIVO',
    subtitle: 'Máximo rendimiento para jugadores pro',
  },
};

interface LayoutStats {
  precision: number;
  speed: number;
  playability: number;
}

const LAYOUT_STATS: Record<2 | 3 | 4, LayoutStats> = {
  2: { precision: 60, speed: 40, playability: 95 },
  3: { precision: 75, speed: 70, playability: 70 },
  4: { precision: 95, speed: 90, playability: 45 },
};

const STAT_LABELS: { key: keyof LayoutStats; label: string }[] = [
  { key: 'precision', label: 'Precisión' },
  { key: 'speed', label: 'Velocidad' },
  { key: 'playability', label: 'Jugabilidad' },
];

function StatBar({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="relative h-2 w-full rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #f97316, #06b6d4)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

export function HudRecommendationPanel({ data, deviceId, screenSize }: HudRecommendationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedPros, setExpandedPros] = useState<Record<number, boolean>>({});

  const togglePros = (fingers: number) => {
    setExpandedPros((prev) => ({ ...prev, [fingers]: !prev[fingers] }));
  };

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Header colapsable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 min-h-[44px] hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Gamepad2 size={18} className="text-fire-400" />
          <div className="text-left">
            <p className="text-sm font-ui font-semibold text-white">
              CUSTOM HUD — Configuración de Controles
            </p>
            <p className="text-xs text-slate-500">
              Recomendado:{' '}
              <span className="text-ice-400 font-semibold">{data.recommended} dedos</span>
              {' · '}
              <span className="text-slate-600">Toca para expandir</span>
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-slate-500" />
        </motion.div>
      </button>

      {/* Contenido expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Instrucciones de importación */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-ice-500/5 border border-ice-500/10">
                <Info size={14} className="text-ice-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-ice-300 font-semibold">Cómo importar:</span>{' '}
                  Copia el código → Free Fire → Ajustes → Controles → Personalizar →
                  Importar diseño → Pegar código
                </p>
              </div>

              {/* Tarjetas de cada layout */}
              {data.options.map((option, cardIdx) => {
                const meta = FINGER_NAMES[option.fingers];
                const stats = LAYOUT_STATS[option.fingers];
                const prosOpen = expandedPros[option.fingers] ?? false;

                return (
                  <motion.div
                    key={option.fingers}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: cardIdx * 0.1 }}
                    className={cn(
                      'rounded-xl border overflow-hidden transition-all',
                      option.isRecommended
                        ? 'border-ice-500/30 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
                        : 'border-white/5',
                    )}
                  >
                    {/* Badge recomendado */}
                    {option.isRecommended && (
                      <motion.div
                        className="flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-ice-500/20 via-ice-400/10 to-ice-500/20"
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Check size={12} className="text-ice-400" />
                        <span className="text-[10px] font-ui font-bold text-ice-300 uppercase tracking-widest">
                          Recomendado para tu dispositivo
                        </span>
                      </motion.div>
                    )}

                    <div className={cn(
                      'p-4 space-y-4',
                      option.isRecommended ? 'bg-ice-500/[0.03]' : 'bg-white/[0.01]',
                    )}>
                      {/* Título */}
                      <div>
                        <h4 className="text-base font-display font-bold text-white">
                          {meta.emoji} {meta.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
                      </div>

                      {/* Visual de dedos SVG */}
                      <div className="py-2">
                        <FingerLayoutSvg fingers={option.fingers} screenSize={screenSize} />
                      </div>

                      {/* Stats con barras */}
                      <div className="space-y-2.5">
                        {STAT_LABELS.map((stat, statIdx) => (
                          <div key={stat.key} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 font-ui">
                                {stat.label}
                              </span>
                              <span className="text-xs font-mono font-bold text-white">
                                {stats[stat.key]}
                              </span>
                            </div>
                            <StatBar
                              value={stats[stat.key]}
                              delay={cardIdx * 0.1 + statIdx * 0.08}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Código HUD copiable */}
                      <HudCodeBlock fingers={option.fingers} deviceId={deviceId} />

                      {/* Pros y contras — expandible */}
                      <button
                        onClick={() => togglePros(option.fingers)}
                        className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors min-h-[32px]"
                      >
                        <motion.div
                          animate={{ rotate: prosOpen ? 180 : 0 }}
                          transition={{ duration: 0.15 }}
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
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div className="space-y-1">
                                {option.pros.map((pro) => (
                                  <p
                                    key={pro}
                                    className="text-[10px] text-emerald-400 flex items-start gap-1"
                                  >
                                    <span className="shrink-0 mt-0.5">+</span>
                                    <span>{pro}</span>
                                  </p>
                                ))}
                              </div>
                              <div className="space-y-1">
                                {option.cons.map((con) => (
                                  <p
                                    key={con}
                                    className="text-[10px] text-red-400 flex items-start gap-1"
                                  >
                                    <span className="shrink-0 mt-0.5">−</span>
                                    <span>{con}</span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
