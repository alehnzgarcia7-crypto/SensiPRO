'use client';

import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// HeadshotShowcase — Split layout, 24 features in 4 tabbed
// categories, red/orange theme, phone frame mockup
// ═══════════════════════════════════════════════════════════════

interface TabData {
  label: string;
  icon: string;
  features: string[];
}

const TABS: TabData[] = [
  {
    label: 'Sensibilidad',
    icon: '🎯',
    features: [
      'Ajuste por 2, 3 y 4 dedos',
      'Multiplicadores por tipo de agarre',
      'DPI toggle independiente',
      '60, 90 y 120 Hz support',
      'Giroscopio calibrado por dedos',
      'Tabla de armas con ajuste por categoría',
    ],
  },
  {
    label: 'HUD',
    icon: '📐',
    features: [
      '17 códigos HUD reales para copiar',
      'Screenshots reales de Free Fire',
      'Recomendación de HUD por dedos',
      'Tamaño de botón de disparo calculado',
      'Posición de botones por tipo de agarre',
      'Roles de cada dedo explicados',
    ],
  },
  {
    label: 'Técnicas',
    icon: '⚔️',
    features: [
      'Drag Vertical — la base',
      'J-Drag — movimiento intermedio',
      'Rotation Drag — nivel pro',
      'Direction Drag — avanzado',
      'Situp Drag — competitivo',
      'Animaciones de cada técnica',
    ],
  },
  {
    label: 'Entrenamiento',
    icon: '📋',
    features: [
      'Training Plan de 7 días',
      'Tier list de armas S/A/B',
      'Headshot Score personalizado',
      'Badge Pro Player (4 dedos)',
      'Copiar toda la config completa',
      'Tips de pro por sección',
    ],
  },
];

function FloatingBadge({ text, className }: { text: string; className: string }) {
  return (
    <div
      className={`absolute px-3 py-1.5 rounded-lg text-[11px] font-semibold z-10 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'float 3s ease-in-out infinite',
      }}
    >
      {text}
    </div>
  );
}

export function HeadshotShowcase() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      {/* Red/orange glow background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[80px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left: Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-6">
              🎯 HEADSHOT MODE
            </span>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
              Calibrado para tiro a la cabeza
            </h2>

            {/* Hook stat */}
            <p className="mt-3 text-sm text-slate-400 italic">
              El 73% de kills en ranked son headshot. Si no estás calibrado para cabeza, estás perdiendo fights.
            </p>

            {/* Tabs */}
            <div className="mt-8 flex flex-wrap gap-2">
              {TABS.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[40px] ${
                    i === activeTab
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                      : 'bg-white/[0.03] text-slate-500 border border-white/5 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Feature list */}
            <div className="mt-6 space-y-2.5 min-h-[200px]">
              {TABS[activeTab]?.features.map((feature, i) => (
                <motion.div
                  key={`${activeTab}-${feature}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" className="text-red-400">
                      <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/generator/headshot"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] min-h-[48px]"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #f97316)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                }}
              >
                <Crosshair size={18} />
                IR AL HEADSHOT MODE →
              </Link>
            </div>
          </motion.div>

          {/* ── Right: Phone mockup ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Phone frame */}
            <div
              className="relative w-[280px] md:w-[300px] rounded-[28px] p-3 overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 0 40px rgba(239, 68, 68, 0.08), 0 20px 60px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Screen content */}
              <div className="rounded-[20px] bg-[#0a0f1e] p-4 space-y-4 overflow-hidden">
                {/* Mini header */}
                <div className="flex items-center gap-2">
                  <Crosshair size={14} className="text-red-400" />
                  <span className="text-xs font-bold text-white">Headshot Mode</span>
                </div>

                {/* Finger selector */}
                <div className="flex gap-2">
                  {['2', '3', '4'].map((f, i) => (
                    <div
                      key={f}
                      className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all duration-500 ${
                        i === 1
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-white/[0.04] text-slate-500 border border-white/5'
                      }`}
                    >
                      {f} dedos
                    </div>
                  ))}
                </div>

                {/* Mini sensitivity bars */}
                {[
                  { label: 'General', w: '87%' },
                  { label: 'Punto Rojo', w: '79%' },
                  { label: 'Mira 2x', w: '72%' },
                  { label: 'AWM', w: '57%' },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1">
                    <span className="text-[9px] text-slate-500">{bar.label}</span>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                        style={{ width: bar.w }}
                      />
                    </div>
                  </div>
                ))}

                {/* HUD code preview */}
                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500">Código HUD 3 dedos</span>
                    <span className="text-[9px] text-red-400 font-mono">FF-3D-VEL...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <FloatingBadge
              text="24 features"
              className="top-4 -right-2 md:right-0 text-red-400"
            />
            <FloatingBadge
              text="17 HUD codes"
              className="bottom-20 -left-4 md:left-0 text-orange-400"
            />
            <FloatingBadge
              text="7 días training"
              className="bottom-4 -right-2 md:right-4 text-amber-400"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
