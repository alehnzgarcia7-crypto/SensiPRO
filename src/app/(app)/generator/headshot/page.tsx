'use client';


import type { SensitivityOutput, GyroscopeOutput, FireButtonResult, HeadshotFingerResult, DeviceSpecs } from '@ares/algorithms';
import { calculateHeadshotFingerMode, calculateDpi, type FingerCount } from '@ares/algorithms';
import { DPI_OFFSET, SENSITIVITY_MIN, SENSITIVITY_MAX } from '@ares/config';
import type { DeviceTier, PanelType } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { DpiToggle } from '@/components/generator/dpi-toggle';
import { HzSelector } from '@/components/generator/hz-selector';
import { RamSelector } from '@/components/generator/ram-selector';
import { CopyAllButton } from '@/components/headshot/copy-all-button';
import { CrosshairGuide } from '@/components/headshot/crosshair-guide';
import { FingerSelector } from '@/components/headshot/finger-selector';
import { FingerTrainingPlan } from '@/components/headshot/finger-training-plan';
import { FireButtonRecommendation } from '@/components/headshot/fire-button-recommendation';
import { GyroscopeRecommendation } from '@/components/headshot/gyroscope-recommendation';
import { HeadshotHero } from '@/components/headshot/headshot-hero';
import { HeadshotScoreGauge } from '@/components/headshot/headshot-score-gauge';
import { HeadshotSensitivityPanel } from '@/components/headshot/headshot-sensitivity-panel';
import { HeadshotTechniques } from '@/components/headshot/headshot-techniques';
import { HudRecommendation } from '@/components/headshot/hud-recommendation';
import { ProBadge } from '@/components/headshot/pro-badge';
import { TrainingPlan } from '@/components/headshot/training-plan';
import { WeaponAdjustmentPanel } from '@/components/headshot/weapon-adjustment-panel';
import { WeaponGrid } from '@/components/headshot/weapon-grid';
import { WeaponTierDisplay } from '@/components/headshot/weapon-tier-display';
import { PremiumBlur } from '@/components/paywall';
import { useTrackEvent } from '@/hooks/use-track-event';
import { useGeneratorStore } from '@/stores/generator.store';

// ═══════════════════════════════════════════════════════════════
// ARES — Headshot Mode v4.1 — Finger-based sensitivity system
// ═══════════════════════════════════════════════════════════════

interface HeadshotApiDevice {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  screenSize: number;
  screenHz: number;
  ramGb: number;
  panelType: PanelType;
}

interface WeaponData {
  id: string;
  name: string;
  type: string;
  tier: string;
  damage: number;
  headshotDamage: number;
  headshotMultiplier: number;
  rpm: number;
  range: number;
  dragType: string;
  sensAdjust: Partial<Record<keyof SensitivityOutput, number>>;
  attachments: readonly string[];
  tip: string;
  proTip: string;
}

interface TechniqueData {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  difficulty: number;
  color: string;
  description: string;
  when: string;
  howTo: readonly string[];
  weapons: readonly string[];
  commonMistake: string;
  svgPath: string;
}

interface DrillData {
  id: string;
  name: string;
  duration: number;
  weapon: string;
  reps: number;
  objective: string;
  description: string;
  emoji: string;
}

interface HeadshotApiResponse {
  success: boolean;
  data?: {
    device: HeadshotApiDevice;
    sensitivity: SensitivityOutput;
    gyroscope: GyroscopeOutput;
    normalSensitivity: SensitivityOutput;
    normalGyroscope: GyroscopeOutput;
    fireButton: FireButtonResult;
    headshotScore: number;
    recommendedDrag: string;
    crosshairTip: string;
    weapons: {
      close: readonly WeaponData[];
      mid: readonly WeaponData[];
      long: readonly WeaponData[];
    };
    techniques: readonly TechniqueData[];
    drills: readonly DrillData[];
    tips: readonly string[];
  };
  error?: { message: string };
}

// Brand/device selection step components (inline, reuses store)
function DeviceSelector({ onGenerate }: { onGenerate: () => void }) {
  const { selectedBrand, selectedDevice, selectBrand, selectDevice } = useGeneratorStore();
  const [brands, setBrands] = useState<{ name: string; slug: string; count: number }[]>([]);
  const [devices, setDevices] = useState<{ id: string; brand: string; model: string; slug: string; tier: DeviceTier; screenHz: number; ramGb: number; screenSize?: number; panelType?: PanelType }[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [deviceSearch, setDeviceSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch brands
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/devices/brands');
        const json = await res.json() as { success: boolean; data?: { name: string; slug: string; count: number }[] };
        if (json.success && json.data) setBrands(json.data);
      } catch { /* ignore */ }
    })();
  }, []);

  // Fetch devices when brand selected
  useEffect(() => {
    if (!selectedBrand) return;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/devices?brand=${encodeURIComponent(selectedBrand)}&limit=100`);
        const json = await res.json() as { success: boolean; data?: typeof devices };
        if (json.success && json.data) setDevices(json.data);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [selectedBrand]);

  // Auto-trigger when device is selected
  useEffect(() => {
    if (selectedDevice) onGenerate();
  }, [selectedDevice, onGenerate]);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase()),
  );
  const filteredDevices = devices.filter((d) =>
    d.model.toLowerCase().includes(deviceSearch.toLowerCase()),
  );

  if (selectedDevice) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-heading uppercase tracking-[0.15em] text-fire-400/70">{selectedDevice.brand}</p>
            <p className="text-lg font-heading font-bold text-white">{selectedDevice.model}</p>
          </div>
          <button
            onClick={() => {
              selectBrand('');
              setBrandSearch('');
              setDeviceSearch('');
            }}
            className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-ui text-slate-400 bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  if (selectedBrand) {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-ui font-semibold text-white">{selectedBrand}</p>
          <button
            onClick={() => selectBrand('')}
            className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-ui text-slate-400 bg-white/[0.04] border border-white/10"
          >
            ← Marcas
          </button>
        </div>
        <input
          type="text"
          placeholder="Buscar modelo..."
          value={deviceSearch}
          onChange={(e) => setDeviceSearch(e.target.value)}
          className="w-full h-10 px-3 rounded-lg text-sm bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-red-500/30"
        />
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-600">Cargando...</div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredDevices.map((d) => (
              <button
                key={d.id}
                onClick={() => selectDevice({
                  id: d.id,
                  brand: d.brand,
                  model: d.model,
                  slug: d.slug,
                  tier: d.tier,
                  screenHz: d.screenHz,
                  ramGb: d.ramGb,
                  screenSize: d.screenSize,
                  panelType: d.panelType,
                })}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-body text-slate-300 hover:bg-white/[0.04] transition-colors min-h-[44px]"
              >
                {d.model}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <p className="text-xs font-heading uppercase tracking-[0.15em] text-slate-500">Selecciona tu dispositivo</p>
      <input
        type="text"
        placeholder="Buscar marca..."
        value={brandSearch}
        onChange={(e) => setBrandSearch(e.target.value)}
        className="w-full h-10 px-3 rounded-lg text-sm bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-red-500/30"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
        {filteredBrands.map((b) => (
          <button
            key={b.slug}
            onClick={() => selectBrand(b.name)}
            className="min-h-[44px] px-3 py-2 rounded-lg text-sm font-ui text-slate-300 bg-white/[0.03] border border-white/5 hover:border-red-500/20 transition-colors"
          >
            {b.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// Diff indicator component for finger-adjusted values
function FingerDiffLabel({ current, base, fingers }: { current: number; base: number; fingers: FingerCount }) {
  if (fingers === 3) return null;
  const diff = current - base;
  if (diff === 0) return null;
  const isUp = diff > 0;
  return (
    <span className={`text-[10px] font-mono font-bold ${isUp ? 'text-green-400' : 'text-orange-400'}`}>
      ({isUp ? '↑' : '↓'}{Math.abs(diff)} vs 3 dedos)
    </span>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export default function HeadshotPage() {
  const { selectedDevice, userRam, setUserRam, userHz, setUserHz } = useGeneratorStore();
  const { track } = useTrackEvent();
  const [fingers, setFingers] = useState<FingerCount>(3);
  const [dpiEnabled, setDpiEnabled] = useState(false);
  const [data, setData] = useState<HeadshotApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcula DPI del dispositivo para mostrar en el toggle
  const deviceDpiValue: number | null = useMemo(() => {
    if (!selectedDevice) return null;
    const specs: DeviceSpecs = {
      screenHz: selectedDevice.screenHz,
      screenSize: selectedDevice.screenSize ?? 6.5,
      ramGb: selectedDevice.ramGb,
      panelType: selectedDevice.panelType ?? 'LCD',
      tier: selectedDevice.tier,
    };
    return calculateDpi(specs);
  }, [selectedDevice]);

  const fetchHeadshot = useCallback(async () => {
    if (!selectedDevice) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate/headshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          ...(userRam && userRam !== selectedDevice.ramGb ? { userRam } : {}),
          ...(userHz && userHz !== selectedDevice.screenHz ? { userHz } : {}),
          fingers,
        }),
      });

      const json = await res.json() as HeadshotApiResponse;

      if (json.success && json.data) {
        setData(json.data);
        track('HEADSHOT_MODE_USED', {
          deviceBrand: selectedDevice.brand,
          deviceModel: selectedDevice.model,
          fingers,
        });
      } else {
        setError(json.error?.message ?? 'Error al generar');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  }, [selectedDevice, userRam, userHz, fingers]);

  // Re-fetch cuando cambia RAM o Hz (solo si ya hay data)
  useEffect(() => {
    if (data && selectedDevice) {
      void fetchHeadshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRam, userHz]);

  // Aplica reducción DPI a la sensibilidad base (resta DPI_OFFSET, freeView intacto)
  const dpiAdjustedSensitivity: SensitivityOutput | null = useMemo(() => {
    if (!data) return null;
    const sens = data.sensitivity;
    if (!dpiEnabled) return sens;
    const c = (v: number) => Math.round(Math.max(SENSITIVITY_MIN, Math.min(SENSITIVITY_MAX, v - DPI_OFFSET)));
    return {
      general: c(sens.general),
      redPoint: c(sens.redPoint),
      scope2x: c(sens.scope2x),
      scope4x: c(sens.scope4x),
      sniperScope: c(sens.sniperScope),
      freeView: sens.freeView, // Free Look independiente del DPI
    };
  }, [data, dpiEnabled]);

  // Finger-adjusted sensitivity (client-side calculation)
  const fingerResult: HeadshotFingerResult | null = useMemo(() => {
    if (!dpiAdjustedSensitivity || !data) return null;
    return calculateHeadshotFingerMode(
      dpiAdjustedSensitivity,
      fingers,
      data.device.screenHz,
      data.device.screenSize,
    );
  }, [dpiAdjustedSensitivity, data, fingers]);

  // 3-finger baseline for comparison diffs
  const threeFingerBaseline: HeadshotFingerResult | null = useMemo(() => {
    if (!dpiAdjustedSensitivity || !data) return null;
    return calculateHeadshotFingerMode(
      dpiAdjustedSensitivity,
      3,
      data.device.screenHz,
      data.device.screenSize,
    );
  }, [dpiAdjustedSensitivity, data]);

  // Gyroscope values mapped to GyroscopeOutput format for the panel
  const fingerGyroscope: GyroscopeOutput | null = useMemo(() => {
    if (!fingerResult) return null;
    const gyro = fingerResult.sensitivity.gyroscope;
    if (!gyro) {
      // Gyroscope disabled for this finger count (e.g. 2 dedos) — use base values
      return data?.gyroscope ?? null;
    }
    return {
      gyroGeneral: gyro.general,
      gyroRedPoint: gyro.redPoint,
      gyroScope2x: gyro.scope2x,
      gyroScope4x: gyro.scope4x,
      gyroSniper: gyro.sniperScope,
      gyroFreeView: Math.max(0, gyro.sniperScope - 10),
    };
  }, [fingerResult, data]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 pb-24 space-y-8">
      {/* SECTION 1 — HERO */}
      <HeadshotHero />

      {/* SECTION 2 — DEVICE SELECTOR + RAM + FINGERS */}
      <section className="space-y-4">
        <DeviceSelector onGenerate={fetchHeadshot} />

        {selectedDevice && (
          <>
            <div className="glass-card p-4">
              <RamSelector
                value={userRam}
                onChange={setUserRam}
                suggestedRam={selectedDevice.ramGb}
              />
            </div>
            <div className="glass-card p-4">
              <HzSelector
                value={userHz}
                onChange={setUserHz}
                suggestedHz={selectedDevice.screenHz}
              />
            </div>
            <div className="glass-card p-4">
              <DpiToggle
                enabled={dpiEnabled}
                onChange={setDpiEnabled}
                dpiValue={dpiEnabled ? deviceDpiValue : null}
              />
            </div>
            <div className="glass-card p-4">
              <FingerSelector value={fingers} onChange={setFingers} />
            </div>
          </>
        )}
      </section>

      {/* Loading */}
      {loading && (
        <div className="py-12 text-center">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
          <p className="text-sm text-slate-500 mt-3 font-body">Generando sensibilidad headshot...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-red-500/20">
          <p className="text-sm text-red-400 font-body">{error}</p>
        </div>
      )}

      {/* Results — All sections animate in */}
      <AnimatePresence>
        {data && !loading && fingerResult && threeFingerBaseline && (
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Finger adjustment label */}
            {fingers !== 3 && (
              <motion.div custom={0} variants={sectionVariants}>
                <div className="px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10 text-center">
                  <p className="text-xs text-red-400/80 font-ui font-semibold">
                    Ajustado para {fingers} dedos
                    {fingers === 2 && ' (Casual)'}
                    {fingers === 4 && ' (Garra Pro)'}
                  </p>
                </div>
              </motion.div>
            )}

            {fingers === 3 && (
              <motion.div custom={0} variants={sectionVariants}>
                <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <p className="text-[11px] text-slate-500 font-body">
                    Estos son tus valores base (3 dedos = estándar competitivo)
                  </p>
                </div>
              </motion.div>
            )}

            {/* SECTION 3 — HEADSHOT SCORE */}
            <motion.div custom={1} variants={sectionVariants}>
              <HeadshotScoreGauge score={data.headshotScore} />
            </motion.div>

            {/* SECCIONES 4-12 — PREMIUM (todo bloqueado para usuarios gratis) */}
            <PremiumBlur
              source="headshot"
              device={selectedDevice ? `${selectedDevice.brand} ${selectedDevice.model}` : undefined}
              fingerCount={fingers}
              intensity={16}
              ctaTop
            >
              {/* SECTION 4 — SENSIBILIDAD HEADSHOT (with finger diffs) */}
              <motion.div custom={2} variants={sectionVariants}>
                <HeadshotSensitivityPanel
                  sensitivity={fingerResult.sensitivity}
                  gyroscope={fingerGyroscope ?? data.gyroscope}
                  normalSensitivity={data.normalSensitivity}
                  normalGyroscope={data.normalGyroscope}
                />

                {/* Finger diff overlay */}
                {fingers !== 3 && (
                  <div className="mt-3 glass-card p-4">
                    <p className="text-xs font-heading uppercase tracking-[0.15em] text-red-400/70 mb-3">
                      Diferencia vs 3 dedos (estándar)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {([
                        { key: 'general' as const, label: 'General' },
                        { key: 'redPoint' as const, label: 'P.Rojo' },
                        { key: 'scope2x' as const, label: '2x' },
                        { key: 'scope4x' as const, label: '4x' },
                        { key: 'sniperScope' as const, label: 'AWM' },
                        { key: 'freeView' as const, label: 'Vista Libre' },
                      ]).map(({ key, label }) => {
                        const current = fingerResult.sensitivity[key];
                        const base = threeFingerBaseline.sensitivity[key];
                        return (
                          <div key={key} className="px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[10px] text-slate-600 font-body">{label}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-mono font-bold text-slate-300">{current}</span>
                              <FingerDiffLabel current={current} base={base} fingers={fingers} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* SECTION 4.5 — WEAPON ADJUSTMENT TABLE */}
              <motion.div custom={3} variants={sectionVariants}>
                <WeaponAdjustmentPanel adjustments={fingerResult.weaponAdjustments} />
              </motion.div>

              {/* SECTION 4.6 — GYROSCOPE RECOMMENDATION */}
              <motion.div custom={4} variants={sectionVariants}>
                <GyroscopeRecommendation
                  gyroscope={fingerResult.sensitivity.gyroscope}
                  fingerProfile={fingerResult.fingerProfile}
                />
              </motion.div>

              {/* SECTION 5 — FIRE BUTTON */}
              <motion.div custom={5} variants={sectionVariants}>
                <FireButtonRecommendation
                  fireButton={fingerResult.fireButton}
                  fingers={fingers}
                  screenSize={data.device.screenSize}
                />
              </motion.div>

              {/* SECTION 6 — HUD PERSONALIZADO */}
              <motion.section custom={6} variants={sectionVariants}>
                <HudRecommendation fingers={fingers} />
              </motion.section>

              {/* SECTION 6.5 — TÉCNICAS DE HEADSHOT */}
              <motion.section custom={7} variants={sectionVariants}>
                <HeadshotTechniques fingers={fingers} />
              </motion.section>

              {/* SECTION 7 — ARMAS RECOMENDADAS POR TIER */}
              <motion.section custom={8} variants={sectionVariants}>
                <WeaponTierDisplay fingers={fingers} />
              </motion.section>

              {/* SECTION 8 — PLAN DE ENTRENAMIENTO 7 DÍAS */}
              <motion.section custom={9} variants={sectionVariants}>
                <FingerTrainingPlan fingers={fingers} />
              </motion.section>

              {/* SECTION 8.5 — PRO BADGE */}
              <motion.section custom={10} variants={sectionVariants}>
                <ProBadge fingers={fingers} />
              </motion.section>

              {/* SECTION 9 — COPIAR CONFIGURACIÓN */}
              <motion.section custom={11} variants={sectionVariants}>
                <CopyAllButton
                  sensitivity={fingerResult.sensitivity}
                  gyroscope={fingerResult.sensitivity.gyroscope ?? null}
                  fingers={fingers}
                  fireButton={fingerResult.fireButton}
                  deviceName={`${data.device.brand} ${data.device.model}`}
                />
              </motion.section>

              {/* SECTION 10 — ARSENAL HEADSHOT */}
              <motion.div custom={12} variants={sectionVariants}>
                <WeaponGrid
                  weapons={data.weapons}
                  baseSensitivity={data.sensitivity}
                />
              </motion.div>

              {/* SECTION 11 — CROSSHAIR PLACEMENT */}
              <motion.div custom={13} variants={sectionVariants}>
                <CrosshairGuide tips={data.tips} />
              </motion.div>

              {/* SECTION 12 — TRAINING DRILLS */}
              <motion.div custom={14} variants={sectionVariants}>
                <TrainingPlan drills={data.drills} />
              </motion.div>
            </PremiumBlur>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
