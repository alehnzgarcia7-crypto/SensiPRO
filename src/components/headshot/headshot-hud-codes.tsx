'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — Headshot HUD Codes — Códigos HUD REALES de Free Fire
// personalizados por número de dedos (2/3/4) en Headshot Mode.
// Reutiliza HudCodeBlock del generador normal + useHudCodes hook.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Import,
  Target,
  Zap,
  ChevronDown,
  Crosshair,
} from 'lucide-react';

import type { FingerCount } from '@ares/algorithms';
import { cn } from '@/lib/cn';
import { useHudCodes } from '@/hooks/use-hud-codes';
import { HudCodeBlock } from '@/components/generator/hud-code-block';

// ─── Headshot-specific metadata per variant ───────────────────
// Mapea los códigos de la DB con contexto para Headshot Mode.
// Los "tags" identifican el label en la DB para hacer match.

interface HeadshotHudVariant {
  /** Coincide con el label de la DB */
  dbLabel: string;
  /** Nombre mostrado en el Headshot Mode */
  nameEs: string;
  /** Descripción corta para headshot */
  descriptionEs: string;
  /** Pros en contexto de headshot */
  prosEs: string[];
  /** Contras en contexto de headshot */
  consEs: string[];
}

const HEADSHOT_VARIANTS: Record<FingerCount, HeadshotHudVariant[]> = {
  2: [
    {
      dbLabel: 'Clásico Básico',
      nameEs: 'Clásico Básico',
      descriptionEs:
        'Layout equilibrado para empezar a practicar headshots con 2 dedos. Botones grandes y bien espaciados.',
      prosEs: [
        'Fácil de usar para principiantes',
        'Botón de disparo grande para headshots',
        'Transición suave desde el HUD por defecto',
      ],
      consEs: [
        'Sin botón dedicado de agacharse',
        'Difícil hacer peek + shoot simultáneo',
      ],
    },
    {
      dbLabel: 'Precisión Alta',
      nameEs: 'Precisión Alta',
      descriptionEs:
        'Sensibilidad más baja y botones más grandes. Ideal para entrenar puntería a la cabeza con armas de precisión.',
      prosEs: [
        'Ideal para AWM y SVD (headshots a distancia)',
        'Botón de mira aumentado para mejor control',
        'Menos errores de dedo al apuntar',
      ],
      consEs: [
        'Más lento en combate cercano',
        'No apto para rush agresivo',
      ],
    },
    {
      dbLabel: 'Casual Cómodo',
      nameEs: 'Casual Cómodo',
      descriptionEs:
        'Botones fáciles de alcanzar con menos toques accidentales. Perfecto para sesiones largas de entrenamiento.',
      prosEs: [
        'Cómodo para sesiones largas de práctica',
        'Mínimos toques accidentales',
        'Bueno para Clash Squad casual',
      ],
      consEs: [
        'Precisión limitada a media distancia',
        'No competitivo en ranked alto',
      ],
    },
  ],
  3: [
    {
      dbLabel: 'Balanceado',
      nameEs: 'Competitivo Estándar',
      descriptionEs:
        'El layout estándar de LATAM para 3 dedos. Equilibrio perfecto entre movilidad y disparo para headshots.',
      prosEs: [
        'Layout más usado en LATAM competitivo',
        'Permite mover + disparar simultáneamente',
        'Buen balance para headshots a toda distancia',
      ],
      consEs: [
        'Requiere adaptación si vienes de 2 dedos',
        'El tercer dedo puede cansarse al inicio',
      ],
    },
    {
      dbLabel: 'Precisión Sniper',
      nameEs: 'Peek Master',
      descriptionEs:
        'Optimizado para Peek & Fire — el botón de peek está posicionado para combinar con disparo instantáneo a la cabeza.',
      prosEs: [
        'Peek + headshot en un movimiento fluido',
        'Dominante en combates de esquina',
        'Ideal para AWM peek shots',
      ],
      consEs: [
        'Curva de aprendizaje media-alta',
        'Menos efectivo en campo abierto',
      ],
    },
    {
      dbLabel: 'Rush Master',
      nameEs: 'Rush Agresivo',
      descriptionEs:
        'Optimizado para combate cercano y rushes. Botón de disparo accesible para headshots rápidos en CQB.',
      prosEs: [
        'Disparo rápido para headshots en rush',
        'MP40/UMP dominante a corta distancia',
        'Perfecto para Factory y Clock Tower',
      ],
      consEs: [
        'Menos preciso a larga distancia',
        'Requiere reflejos rápidos',
      ],
    },
  ],
  4: [
    {
      dbLabel: 'Garra Estándar',
      nameEs: 'Garra Clásica',
      descriptionEs:
        'Distribución balanceada en 4 esquinas. Base sólida para headshots con control total de movimiento y disparo.',
      prosEs: [
        'Control completo: mover + apuntar + disparar + habilidad',
        'Headshots mientras te mueves = imparable',
        'Adaptable a cualquier arma',
      ],
      consEs: [
        'Requiere ~14 días de adaptación',
        'Puede ser incómodo en celulares pequeños',
      ],
    },
    {
      dbLabel: 'Garra Equilibrada',
      nameEs: 'Garra Pro (Two9 Style)',
      descriptionEs:
        'Optimizado para Jump-Crouch-Fire simultáneo. El layout que usan los pros para headshots en movimiento.',
      prosEs: [
        'Jump + crouch + fire = combo letal de headshot',
        'Estilo usado por jugadores élite LATAM',
        'Máxima tasa de headshot en ranked',
      ],
      consEs: [
        'Curva de aprendizaje alta (2-3 semanas)',
        'Necesita pantalla ≥6.1 pulgadas',
      ],
    },
    {
      dbLabel: 'Garra Precisión',
      nameEs: 'Sniper Garra',
      descriptionEs:
        'Optimizado para AWM + peek a larga distancia. Botones de mira y peek en posición premium para one-tap headshots.',
      prosEs: [
        'One-tap headshots con AWM consistentes',
        'Peek + scope fluido a larga distancia',
        'Domina en Kalahari y Bermuda',
      ],
      consEs: [
        'Menos efectivo en CQB (combate cercano)',
        'Requiere experiencia previa con garra',
      ],
    },
  ],
};

// ─── Stat bar reutilizable ────────────────────────────────────

const STAT_CONFIG: { key: 'precision' | 'velocity' | 'playability'; label: string; icon: typeof Target }[] = [
  { key: 'precision', label: 'Precisión', icon: Target },
  { key: 'velocity', label: 'Velocidad', icon: Zap },
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

// ─── Props ────────────────────────────────────────────────────

interface HeadshotHudCodesProps {
  fingers: FingerCount;
  screenSize?: number;
}

export function HeadshotHudCodes({ fingers, screenSize }: HeadshotHudCodesProps) {
  const { codes, isLoading, error } = useHudCodes({ fingers, screenSize });
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [expandedPros, setExpandedPros] = useState(false);

  // Reset selección cuando cambian los dedos
  const [prevFingers, setPrevFingers] = useState(fingers);
  if (fingers !== prevFingers) {
    setPrevFingers(fingers);
    setSelectedVariantIdx(0);
    setExpandedPros(false);
  }

  const variants = HEADSHOT_VARIANTS[fingers];

  // Mapear variantes headshot a códigos de la DB
  const variantCodes = useMemo(() => {
    return variants.map((variant) => {
      const match = codes.find((c) => c.label === variant.dbLabel);
      return { variant, code: match ?? null };
    });
  }, [variants, codes]);

  const active = variantCodes[selectedVariantIdx];
  if (!active) return null;

  return (
    <div className="space-y-4">
      {/* ═══ HEADER ═══ */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-fire-500/10 border border-fire-500/20">
            <Crosshair size={18} className="text-fire-400" />
          </div>
          <div>
            <h4 className="text-base font-display font-bold text-white tracking-wide">
              CÓDIGOS HUD — HEADSHOT MODE
            </h4>
            <p className="text-xs text-slate-500">
              Códigos reales de Free Fire optimizados para {fingers} dedos
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

      {/* ═══ VARIANT TABS ═══ */}
      <div className="flex gap-2">
        {variantCodes.map((vc, idx) => (
          <button
            key={vc.variant.dbLabel}
            onClick={() => {
              setSelectedVariantIdx(idx);
              setExpandedPros(false);
            }}
            className={cn(
              'flex-1 min-h-[44px] px-3 py-2.5 rounded-xl text-center transition-all',
              'border font-ui text-xs font-semibold',
              idx === selectedVariantIdx
                ? 'bg-ice-500/10 border-ice-500/30 text-ice-300 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400',
            )}
          >
            {vc.variant.nameEs}
          </button>
        ))}
      </div>

      {/* ═══ ACTIVE VARIANT CARD ═══ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${fingers}-${selectedVariantIdx}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="p-4 space-y-4">
            {/* Descripción */}
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              {active.variant.descriptionEs}
            </p>

            {/* Stats */}
            {active.code && (
              <div className="grid grid-cols-3 gap-3">
                {STAT_CONFIG.map((stat, statIdx) => {
                  const StatIcon = stat.icon;
                  const value = active.code![stat.key];
                  return (
                    <div key={stat.key} className="space-y-1.5">
                      <div className="flex items-center gap-1">
                        <StatIcon size={10} className="text-slate-500" />
                        <span className="text-[10px] text-slate-500 font-ui truncate">
                          {stat.label}
                        </span>
                      </div>
                      <StatBar value={value} delay={statIdx * 0.08} />
                      <span className="text-[11px] font-mono font-bold text-white">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Código HUD */}
            {isLoading ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-3 h-3 border-2 border-ice-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] text-slate-500">Cargando código HUD...</span>
              </div>
            ) : error || !active.code ? (
              <div className="py-2 px-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <p className="text-[11px] text-red-400/70">
                  No se encontró el código HUD para esta variante
                </p>
              </div>
            ) : (
              <HudCodeBlock
                code={active.code.code}
                label={active.code.label}
                playerName={active.code.playerName}
              />
            )}

            {/* Pros y Contras — Colapsable */}
            <div>
              <button
                onClick={() => setExpandedPros(!expandedPros)}
                className={cn(
                  'flex items-center gap-1.5 py-1.5 text-[11px] font-ui transition-colors min-h-[32px]',
                  expandedPros ? 'text-slate-300' : 'text-slate-600 hover:text-slate-400',
                )}
              >
                <motion.div
                  animate={{ rotate: expandedPros ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={12} />
                </motion.div>
                {expandedPros ? 'Ocultar' : 'Ver'} pros y contras
              </button>

              <AnimatePresence>
                {expandedPros && (
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
                        {active.variant.prosEs.map((pro) => (
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
                        {active.variant.consEs.map((con) => (
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
      </AnimatePresence>
    </div>
  );
}
