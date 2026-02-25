'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { SensitivityOutput, GyroscopeOutput, FireButtonResult } from '@ares/algorithms';
import type { DeviceTier, PanelType } from '@prisma/client';

import { useGeneratorStore } from '@/stores/generator.store';
import { HeadshotHero } from '@/components/headshot/headshot-hero';
import { HeadshotScoreGauge } from '@/components/headshot/headshot-score-gauge';
import { HeadshotSensitivityPanel } from '@/components/headshot/headshot-sensitivity-panel';
import { FireButtonDisplay } from '@/components/headshot/fire-button-display';
import { FingerSelector } from '@/components/headshot/finger-selector';
import { DragTechniqueCard } from '@/components/headshot/drag-technique-card';
import { WeaponGrid } from '@/components/headshot/weapon-grid';
import { CrosshairGuide } from '@/components/headshot/crosshair-guide';
import { TrainingPlan } from '@/components/headshot/training-plan';
import { RamSelector } from '@/components/generator/ram-selector';

// ═══════════════════════════════════════════════════════════════
// ARES — Headshot Mode — Página completa con 9 secciones
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

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

export default function HeadshotPage() {
  const { selectedDevice, userRam, setUserRam } = useGeneratorStore();
  const [fingers, setFingers] = useState<2 | 3 | 4>(3);
  const [data, setData] = useState<HeadshotApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          fingers,
        }),
      });

      const json = await res.json() as HeadshotApiResponse;

      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error?.message ?? 'Error al generar');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  }, [selectedDevice, userRam, fingers]);

  // Re-fetch cuando cambia RAM o dedos (solo si ya hay data)
  useEffect(() => {
    if (data && selectedDevice) {
      void fetchHeadshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRam, fingers]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 pb-24 space-y-8">
      {/* SECTION 1 — HERO */}
      <HeadshotHero />

      {/* SECTION 2 — DEVICE SELECTOR */}
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
        {data && !loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* SECTION 3 — HEADSHOT SCORE */}
            <motion.div custom={0} variants={sectionVariants}>
              <HeadshotScoreGauge score={data.headshotScore} />
            </motion.div>

            {/* SECTION 4 — SENSIBILIDAD HEADSHOT */}
            <motion.div custom={1} variants={sectionVariants}>
              <HeadshotSensitivityPanel
                sensitivity={data.sensitivity}
                gyroscope={data.gyroscope}
                normalSensitivity={data.normalSensitivity}
                normalGyroscope={data.normalGyroscope}
              />
            </motion.div>

            {/* SECTION 5 — FIRE BUTTON SIZE */}
            <motion.div custom={2} variants={sectionVariants}>
              <FireButtonDisplay
                fireButton={data.fireButton}
                screenSize={data.device.screenSize}
              />
            </motion.div>

            {/* SECTION 6 — TÉCNICAS DE DRAG */}
            <motion.section custom={3} variants={sectionVariants}>
              <h3 className="font-heading font-bold text-white text-xl md:text-2xl mb-1">
                TÉCNICAS DE DRAG HEADSHOT
              </h3>
              <p className="text-sm text-slate-500 font-body mb-5">
                Domina estas 5 técnicas y serás imparable
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.techniques.map((tech, i) => (
                  <DragTechniqueCard key={tech.id} technique={tech} index={i} />
                ))}
              </div>
            </motion.section>

            {/* SECTION 7 — ARSENAL HEADSHOT */}
            <motion.div custom={4} variants={sectionVariants}>
              <WeaponGrid
                weapons={data.weapons}
                baseSensitivity={data.sensitivity}
              />
            </motion.div>

            {/* SECTION 8 — CROSSHAIR PLACEMENT */}
            <motion.div custom={5} variants={sectionVariants}>
              <CrosshairGuide tips={data.tips} />
            </motion.div>

            {/* SECTION 9 — TRAINING PLAN */}
            <motion.div custom={6} variants={sectionVariants}>
              <TrainingPlan drills={data.drills} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
