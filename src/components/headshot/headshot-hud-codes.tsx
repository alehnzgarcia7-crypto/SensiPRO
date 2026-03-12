'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — Headshot HUD Codes — Códigos HUD REALES de Free Fire
// personalizados por número de dedos (2/3/4) en Headshot Mode.
// Incluye screenshots reales con frame premium de celular,
// zoom modal, y fallback SVG para variantes sin foto.
// ═══════════════════════════════════════════════════════════════


import type { FingerCount } from '@ares/algorithms';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Target,
  Zap,
  ChevronDown,
  Crosshair,
  X,
  Maximize2,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, useMemo, useEffect } from 'react';

import { HudCodeBlock } from '@/components/generator/hud-code-block';
import { HudVisualization } from '@/components/headshot/hud-visualization';
import { useHudCodes } from '@/hooks/use-hud-codes';
import { cn } from '@/lib/cn';

// ─── Headshot-specific metadata per variant ───────────────────

interface HeadshotHudVariant {
  dbLabel: string;
  nameEs: string;
  descriptionEs: string;
  prosEs: string[];
  consEs: string[];
  /** Ruta a screenshot real de Free Fire (si existe) */
  screenshot?: string;
}

// ─── Mapeo de screenshots por código HUD ──────────────────────

const SCREENSHOT_BY_CODE: Record<string, string> = {
  // 2D — Clásico Básico (fingers: 2)
  '#FFHUDT6O3jSJjT59Po7eO': '/images/hud-codes/hud-2d-clasico.png',
  // 3D — Balanceado (fingers: 3)
  '#FFHUDT6O3jqVY6q1Po7eP': '/images/hud-codes/hud-3d-velocidad.png',
  // 4D — Garra Estándar (fingers: 4)
  '#FFHUDT6O3jqVY6q1Po7eO': '/images/hud-codes/hud-4d-garra-tactica.png',
  // 5D — Pro 5 Dedos (fingers: 5, fallback a 4D)
  '#FFHUDT6O3jAwzFJlPo7eO': '/images/hud-codes/hud-4d-garra-tactica.png',
};

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
      screenshot: '/images/hud-codes/hud-2d-clasico.png',
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
        'El layout estándar de LATAM para 3 dedos. Buen balance entre movilidad y disparo para headshots.',
      prosEs: [
        'Layout más usado en LATAM competitivo',
        'Permite mover + disparar simultáneamente',
        'Buen balance para headshots a toda distancia',
      ],
      consEs: [
        'Requiere adaptación si vienes de 2 dedos',
        'El tercer dedo puede cansarse al inicio',
      ],
      screenshot: '/images/hud-codes/hud-3d-velocidad.png',
    },
    {
      dbLabel: 'Precisión Sniper',
      nameEs: 'Peek Master',
      descriptionEs:
        'Hecho para Peek & Fire — el botón de peek queda donde puedes combinarlo con disparo instantáneo a la cabeza.',
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
        'Para combate cercano y rushes. Botón de disparo accesible para headshots rápidos en CQB.',
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
      screenshot: '/images/hud-codes/hud-4d-garra-tactica.png',
    },
    {
      dbLabel: 'Garra Equilibrada',
      nameEs: 'Garra Pro (Two9 Style)',
      descriptionEs:
        'Hecho para Jump-Crouch-Fire simultáneo. El layout que usan los pros para headshots en movimiento.',
      prosEs: [
        'Jump + crouch + fire = combo letal de headshot',
        'Estilo usado por los mejores de LATAM',
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
        'Hecho para AWM + peek a larga distancia. Botones de mira y peek bien colocados para one-tap headshots.',
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

// ─── Phone Frame con Screenshot Premium ───────────────────────

interface PhoneFrameProps {
  screenshot: string;
  variantName: string;
  onZoom: () => void;
}

function PhoneFrame({ screenshot, variantName, onZoom }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      {/* Frame del celular */}
      <motion.div
        className="relative rounded-[24px] overflow-hidden cursor-pointer group/frame"
        style={{
          border: '1px solid rgba(0,255,255,0.15)',
          boxShadow:
            '0 0 40px rgba(0,255,255,0.08), 0 20px 60px rgba(0,0,0,0.5)',
          background: '#000',
        }}
        whileHover={{
          y: -4,
          boxShadow:
            '0 0 60px rgba(0,255,255,0.15), 0 24px 70px rgba(0,0,0,0.6)',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onZoom}
      >
        {/* Imagen del screenshot */}
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={screenshot}
            alt={`HUD ${variantName} — Captura real de Free Fire`}
            fill
            className="object-cover rounded-[22px]"
            sizes="(max-width: 640px) 100vw, 480px"
            priority
          />

          {/* Reflejo de vidrio — gradiente diagonal */}
          <div
            className="absolute inset-0 rounded-[22px] pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)',
            }}
          />

          {/* Hover overlay con icono de zoom */}
          <div className="absolute inset-0 rounded-[22px] bg-black/0 group-hover/frame:bg-black/20 transition-colors duration-200 flex items-center justify-center">
            <motion.div
              className="opacity-0 group-hover/frame:opacity-100 transition-opacity duration-200"
              initial={false}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <Maximize2 size={12} className="text-white/80" />
                <span className="text-[10px] font-ui text-white/80 uppercase tracking-wider">
                  Ampliar
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Notch del celular */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[3px] rounded-b-full bg-white/[0.06]" />
      </motion.div>

      {/* Badge flotante — CAPTURA REAL */}
      <div
        className="absolute -top-2.5 right-3 z-10 px-2.5 py-1 rounded-lg"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <span className="text-[9px] font-ui font-bold uppercase tracking-[0.15em] text-cyan-300/90">
          CAPTURA REAL
        </span>
      </div>
    </div>
  );
}

// ─── SVG Preview Fallback ─────────────────────────────────────

interface SvgPreviewProps {
  fingers: FingerCount;
}

function SvgPreview({ fingers }: SvgPreviewProps) {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div
        className="relative rounded-[24px] overflow-hidden"
        style={{
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(2,6,23,0.98))',
        }}
      >
        <HudVisualization fingers={fingers} showLabels />
      </div>

      {/* Badge — Vista Previa */}
      <div
        className="absolute -top-2.5 right-3 z-10 px-2.5 py-1 rounded-lg"
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span className="text-[9px] font-ui font-bold uppercase tracking-[0.15em] text-slate-500">
          VISTA PREVIA
        </span>
      </div>
    </div>
  );
}

// ─── Zoom Modal Fullscreen ────────────────────────────────────

interface ZoomModalProps {
  screenshot: string;
  variantName: string;
  onClose: () => void;
}

function ZoomModal({ screenshot, variantName, onClose }: ZoomModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
      />

      {/* Imagen con animación de scale */}
      <motion.div
        className="relative z-10 w-[95vw] max-w-[900px] aspect-[16/9]"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Image
          src={screenshot}
          alt={`HUD ${variantName} — Vista ampliada`}
          fill
          className="object-contain rounded-xl"
          sizes="95vw"
          priority
        />

        {/* Nombre de la variante */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
          <span className="text-xs font-ui font-semibold text-white/90 tracking-wide">
            {variantName}
          </span>
        </div>
      </motion.div>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Cerrar vista ampliada"
      >
        <X size={20} />
      </button>
    </motion.div>
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
  const [zoomScreenshot, setZoomScreenshot] = useState<string | null>(null);
  const [zoomVariantName, setZoomVariantName] = useState('');

  // Reset selección cuando cambian los dedos
  const [prevFingers, setPrevFingers] = useState(fingers);
  if (fingers !== prevFingers) {
    setPrevFingers(fingers);
    setSelectedVariantIdx(0);
    setExpandedPros(false);
  }

  const variants = HEADSHOT_VARIANTS[fingers];

  // Mapear variantes headshot a códigos de la DB, resolviendo screenshot dinámico
  const variantCodes = useMemo(() => {
    return variants.map((variant) => {
      const match = codes.find((c) => c.label === variant.dbLabel);
      // Determinar screenshot: primero del mapeo por código, luego el estático de la variante
      const codeScreenshot = match ? SCREENSHOT_BY_CODE[match.code] : undefined;
      const resolvedScreenshot = codeScreenshot ?? variant.screenshot;
      return { variant: { ...variant, screenshot: resolvedScreenshot }, code: match ?? null };
    });
  }, [variants, codes]);

  const handleOpenZoom = useCallback((src: string, name: string) => {
    setZoomScreenshot(src);
    setZoomVariantName(name);
  }, []);

  const handleCloseZoom = useCallback(() => {
    setZoomScreenshot(null);
  }, []);

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
              Códigos reales de Free Fire para {fingers} dedos
            </p>
          </div>
        </div>

        {/* Espaciador */}
        <div />
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
            {/* ─── Screenshot / Preview (ARRIBA de todo) ─── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${fingers}-${selectedVariantIdx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {active.variant.screenshot ? (
                  <PhoneFrame
                    screenshot={active.variant.screenshot}
                    variantName={active.variant.nameEs}
                    onZoom={() =>
                      handleOpenZoom(active.variant.screenshot!, active.variant.nameEs)
                    }
                  />
                ) : (
                  <SvgPreview fingers={fingers} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Descripción */}
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              {active.variant.descriptionEs}
            </p>

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

      {/* ═══ ZOOM MODAL ═══ */}
      <AnimatePresence>
        {zoomScreenshot && (
          <ZoomModal
            screenshot={zoomScreenshot}
            variantName={zoomVariantName}
            onClose={handleCloseZoom}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
