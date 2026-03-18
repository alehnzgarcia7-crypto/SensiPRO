'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — ResultPanel — Panel de resultados PREMIUM con UI épica
// Glow progress bars, holographic numbers, animated borders,
// staggered animations, 3D cards, glass morphism 2.0
// ═══════════════════════════════════════════════════════════════

import type { CalibrationResult, HudRecommendation } from '@ares/algorithms';
import type { SensitivityStyle, DeviceTier } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Heart, Share2, Download, Ruler, Target, Gauge, Crosshair, Eye, Scan, Search } from 'lucide-react';
import { useEffect, useRef, useCallback, useState } from 'react';

import { AnimatedBorder } from '@/components/effects/animated-border';
import { CountUp } from '@/components/effects/count-up';
import { GlowProgressBar } from '@/components/effects/glow-progress-bar';
import { HeadshotCtaBanner } from '@/components/headshot/headshot-cta-banner';
import { PremiumBlur } from '@/components/paywall';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGeneratorStore } from '@/stores/generator.store';

import { CalibrationSelector } from './calibration-selector';
import { DpiToggle } from './dpi-toggle';
import { HudRecommendationPanel } from './hud-recommendation';
import { HzSelector } from './hz-selector';
import { RamSelector } from './ram-selector';


interface AllCalibrationsApiResponse {
  success: boolean;
  data?: {
    device: {
      id: string;
      brand: string;
      model: string;
      slug: string;
      tier: DeviceTier;
      screenSize: number;
      screenHz: number;
      ramGb: number;
      panelType: string;
    };
    combinations: CalibrationResult[];
    hudRecommendation: HudRecommendation;
    meta: {
      styleApplied: SensitivityStyle;
      deviceTier: DeviceTier;
      algorithm: string;
    };
  };
  error?: { message: string };
}

interface ResultPanelProps {
  onReset: () => void;
}

const FIELD_META: Record<string, { label: string; icon: typeof Crosshair }> = {
  general: { label: 'General', icon: Crosshair },
  redPoint: { label: 'Punto Rojo', icon: Target },
  scope2x: { label: 'Mira 2x', icon: Scan },
  scope4x: { label: 'Mira 4x', icon: Scan },
  sniperScope: { label: 'AWM', icon: Crosshair },
  freeView: { label: 'Vista Libre', icon: Eye },
};

const GYRO_META: Record<string, { label: string; icon: typeof Crosshair }> = {
  gyroGeneral: { label: 'Gyro General', icon: Crosshair },
  gyroRedPoint: { label: 'Gyro Punto Rojo', icon: Target },
  gyroScope2x: { label: 'Gyro 2x', icon: Scan },
  gyroScope4x: { label: 'Gyro 4x', icon: Scan },
  gyroSniper: { label: 'Gyro AWM', icon: Crosshair },
  gyroFreeView: { label: 'Gyro Vista Libre', icon: Eye },
};

// Gradiente de color dinámico para números holográficos
function getNumberColorClass(value: number, max: number): string {
  const ratio = value / max;
  if (ratio >= 0.9) return 'holo-number-max';
  if (ratio >= 0.7) return 'holo-number-high';
  if (ratio >= 0.5) return 'holo-number-mid';
  return 'holo-number-low';
}

// Stagger orchestration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function ResultPanel({ onReset }: ResultPanelProps) {
  const {
    selectedDevice,
    selectedStyle,
    includeGyro,
    allCalibrations,
    calibration,
    dpiMode,
    userRam,
    userHz,
    isLoading,
    setCalibration,
    setDpiMode,
    setUserRam,
    setUserHz,
    setLoading,
    setAllCalibrations,
    setError,
    getCurrentCombination,
  } = useGeneratorStore();

  const isInitialMount = useRef(true);
  const [showFlash, setShowFlash] = useState(false);
  const prevComboKey = useRef('');

  const regenerate = useCallback(async (ramOverride: number, hzOverride?: number) => {
    if (!selectedDevice) return;
    setLoading(true);

    try {
      const res = await fetch('/api/generate/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          style: selectedStyle,
          includeGyro,
          ...(ramOverride !== selectedDevice.ramGb ? { userRam: ramOverride } : {}),
          ...(hzOverride && hzOverride !== selectedDevice.screenHz ? { userHz: hzOverride } : {}),
        }),
      });

      const data = await res.json() as AllCalibrationsApiResponse;

      if (data.success && data.data) {
        setAllCalibrations({
          combinations: data.data.combinations,
          hudRecommendation: data.data.hudRecommendation,
          meta: data.data.meta,
        });
      } else {
        setError(data.error?.message ?? 'Error al regenerar');
      }
    } catch {
      setError('Error de conexión al regenerar.');
    }
  }, [selectedDevice, selectedStyle, includeGyro, setLoading, setAllCalibrations, setError]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (userRam !== null) {
      void regenerate(userRam, userHz ?? undefined);
    }
  }, [userRam, userHz, regenerate]);

  const currentCombo = getCurrentCombination();

  // Flash effect al cambiar calibración/DPI/RAM
  const comboKey = `${calibration}-${dpiMode}-${userRam}-${userHz}`;
  useEffect(() => {
    if (prevComboKey.current && prevComboKey.current !== comboKey) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 300);
      prevComboKey.current = comboKey;
      return () => clearTimeout(timer);
    }
    prevComboKey.current = comboKey;
    return undefined;
  }, [comboKey]);

  if (!allCalibrations || !selectedDevice || !currentCombo) return null;

  const styleVariant = selectedStyle.toLowerCase() as 'aggressive' | 'balanced' | 'sniper';
  const sensitivityEntries = Object.entries(currentCombo.sensitivity) as [string, number][];
  const gyroscopeEntries = currentCombo.gyroscope
    ? (Object.entries(currentCombo.gyroscope) as [string, number][])
    : null;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ═══ HEADER ═══ */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-heading uppercase tracking-[0.2em] text-fire-400/70">{selectedDevice.brand}</p>
            <h2 className="text-xl md:text-2xl font-heading font-black text-white tracking-wide mt-0.5">{selectedDevice.model}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={styleVariant} size="sm">{selectedStyle}</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-heading uppercase tracking-[0.15em] text-slate-500">Performance</p>
            <p className="text-3xl md:text-4xl font-mono font-black text-gradient-fire-ice mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <CountUp end={currentCombo.performanceScore} />
              <span className="text-base text-slate-600">/100</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══ NUEVA BÚSQUEDA — CTA prominente ═══ */}
      <motion.div variants={itemVariants}>
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Search size={18} />}
          onClick={onReset}
          className="w-full min-h-[52px] text-base font-heading font-bold uppercase tracking-[0.1em]"
        >
          Generar otra sensibilidad
        </Button>
      </motion.div>

      {/* ═══ RESULTADO PRINCIPAL — Momento de verdad ═══ */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <p className="text-xs font-heading uppercase tracking-[0.15em] text-slate-500 mb-2">
          Resultado principal
        </p>
        <p className="text-sm text-slate-400 mb-3">
          Configuración calculada para tu {selectedDevice.model}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={styleVariant} size="sm">{selectedStyle}</Badge>
            <span className="text-xs text-slate-600">General</span>
          </div>
          <span className="text-4xl font-mono font-black text-gradient-fire-ice" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <CountUp end={sensitivityEntries[0]?.[1] ?? 0} duration={800} />
          </span>
        </div>
        <p className="text-[11px] text-slate-600 mt-3">
          Ajusta RAM, Hz y calibración para afinar tu configuración
        </p>
      </motion.div>

      {/* ═══ RAM SELECTOR ═══ */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <RamSelector
          value={userRam}
          onChange={setUserRam}
          suggestedRam={selectedDevice.ramGb}
        />
      </motion.div>

      {/* ═══ HZ SELECTOR ═══ */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <HzSelector
          value={userHz}
          onChange={setUserHz}
          suggestedHz={selectedDevice.screenHz}
        />
      </motion.div>

      {/* ═══ CALIBRACION + DPI ═══ */}
      <motion.div variants={itemVariants} className="glass-card p-5 space-y-5">
        <CalibrationSelector value={calibration} onChange={setCalibration} />
        <DpiToggle
          enabled={dpiMode}
          onChange={setDpiMode}
          dpiValue={currentCombo.dpiValue}
        />
      </motion.div>

      {/* ═══ SENSIBILIDADES — PANEL ÉPICO ═══ */}
      <motion.div variants={itemVariants}>
        <AnimatedBorder active={!isLoading}>
          <div className={`p-6 transition-opacity duration-200 relative ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Flash overlay al cambiar valores */}
            <AnimatePresence>
              {showFlash && (
                <motion.div
                  className="absolute inset-0 bg-white/[0.03] rounded-[15px] pointer-events-none z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            <h3 className="font-heading font-bold uppercase tracking-[0.15em] text-base mb-5 bg-gradient-to-r from-fire-400 via-white to-ice-400 bg-clip-text text-transparent">
              {isLoading ? 'Recalculando...' : 'Sensibilidades'}
            </h3>
            <div className="space-y-4">
              {/* General — SIEMPRE VISIBLE (gancho de conversión) */}
              {sensitivityEntries.slice(0, 1).map(([key, value]) => {
                const meta = FIELD_META[key];
                const Icon = meta?.icon ?? Crosshair;
                const colorClass = getNumberColorClass(value, 200);
                return (
                  <motion.div
                    key={`${key}-${userRam}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-slate-600 group-hover:text-fire-400 transition-colors" />
                        <span className="text-sm font-ui font-medium text-slate-400">{meta?.label ?? key}</span>
                      </div>
                      <span className={`text-2xl font-mono font-black ${colorClass}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <CountUp end={value} duration={600} />
                      </span>
                    </div>
                    <GlowProgressBar value={value} max={200} />
                  </motion.div>
                );
              })}

              {/* Valores 2-6 — BLOQUEADOS para usuarios gratis */}
              <PremiumBlur
                source="generator"
                device={`${selectedDevice.brand} ${selectedDevice.model}`}
                style={selectedStyle}
                revealedGeneral={sensitivityEntries[0]?.[1]}
                revealFirst
                intensity={14}
              >
                <div className="space-y-4">
                  {sensitivityEntries.slice(1).map(([key, value], i) => {
                    const meta = FIELD_META[key];
                    const Icon = meta?.icon ?? Crosshair;
                    const colorClass = getNumberColorClass(value, 200);
                    return (
                      <motion.div
                        key={`${key}-${userRam}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (i + 1) * 0.08 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon size={14} className="text-slate-600 group-hover:text-fire-400 transition-colors" />
                            <span className="text-sm font-ui font-medium text-slate-400">{meta?.label ?? key}</span>
                          </div>
                          <span className={`text-2xl font-mono font-black ${colorClass}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <CountUp end={value} duration={600} />
                          </span>
                        </div>
                        <GlowProgressBar value={value} max={200} delay={(i + 1) * 0.06} />
                      </motion.div>
                    );
                  })}
                </div>


                {/* Separador gradiente */}
                <div className="divider-gradient my-6" />

                {/* Stats adicionales */}
                <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-ice-400" />
                    <span className="text-sm font-ui text-slate-400">Precisión</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-ice-300" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <CountUp end={currentCombo.precisionScore} duration={600} />
                    <span className="text-xs text-slate-600">/100</span>
                  </span>
                </div>
                <GlowProgressBar value={currentCombo.precisionScore} max={100} />

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Ruler size={14} className="text-fire-400" />
                    <span className="text-sm font-ui text-slate-400">Botón</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {currentCombo.buttonSize}mm
                  </span>
                </div>

                <AnimatePresence>
                  {currentCombo.dpiValue !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between mt-3"
                    >
                      <div className="flex items-center gap-2">
                        <Gauge size={14} className="text-ice-400" />
                        <span className="text-sm font-ui text-slate-400">DPI Óptimo</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-ice-300" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <CountUp end={currentCombo.dpiValue} duration={600} />
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </PremiumBlur>
            </div>
          </div>
        </AnimatedBorder>
      </motion.div>

      {/* ═══ GIROSCOPIO — PREMIUM ═══ */}
      {gyroscopeEntries && (
        <motion.div variants={itemVariants}>
          <PremiumBlur source="generator" device={`${selectedDevice.brand} ${selectedDevice.model}`} intensity={14}>
            <AnimatedBorder active speed="slow">
              <div className="p-6">
                <h3 className="font-heading font-bold text-white uppercase tracking-[0.15em] text-sm mb-5">
                  Giroscopio
                </h3>
                <div className="space-y-4">
                  {gyroscopeEntries.map(([key, value], i) => {
                    const meta = GYRO_META[key];
                    const Icon = meta?.icon ?? Crosshair;
                    return (
                      <motion.div
                        key={`${key}-${userRam}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                        className="group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Icon size={14} className="text-slate-600 group-hover:text-ice-400 transition-colors" />
                            <span className="text-sm font-ui font-medium text-slate-400">{meta?.label ?? key}</span>
                          </div>
                          <span className="text-2xl font-mono font-black text-ice-300" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            <CountUp end={value} duration={600} />
                          </span>
                        </div>
                        <GlowProgressBar value={value} max={100} delay={i * 0.06} />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </AnimatedBorder>
          </PremiumBlur>
        </motion.div>
      )}

      {/* ═══ HUD RECOMMENDATION — PREMIUM ═══ */}
      <motion.div variants={itemVariants}>
        <PremiumBlur source="generator" device={`${selectedDevice.brand} ${selectedDevice.model}`} intensity={14}>
          <HudRecommendationPanel
            data={allCalibrations.hudRecommendation}
            screenSize={selectedDevice.screenSize}
          />
        </PremiumBlur>
      </motion.div>

      {/* ═══ HEADSHOT CTA ═══ */}
      <motion.div variants={itemVariants}>
        <HeadshotCtaBanner />
      </motion.div>

      {/* ═══ ACCIONES ═══ */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" leftIcon={<Heart size={16} />}>Guardar</Button>
        <Button variant="ghost" size="sm" leftIcon={<Share2 size={16} />}>Compartir</Button>
        <Button variant="ghost" size="sm" leftIcon={<Download size={16} />}>Exportar</Button>
        <Button variant="secondary" size="sm" leftIcon={<RotateCcw size={16} />} onClick={onReset}>
          Nueva búsqueda
        </Button>
      </motion.div>
    </motion.div>
  );
}
