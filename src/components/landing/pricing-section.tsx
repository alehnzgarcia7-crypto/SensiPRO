'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// PricingSection — 2 plans (Gratis + Pro) side by side,
// animated rotating border on Pro card, shimmer effect,
// monthly/annual toggle, guarantee badges, POPULAR badge
// ═══════════════════════════════════════════════════════════════

interface PlanFeature {
  text: string;
  included: boolean;
  proExclusive?: boolean;
}

const FREE_FEATURES: PlanFeature[] = [
  { text: 'Algoritmo DPI-first básico', included: true },
  { text: '5 búsquedas por día', included: true },
  { text: '3 configuraciones guardadas', included: true },
  { text: 'Headshot Mode básico (sensibilidad + Vertical Drag)', included: true },
  { text: 'Academia básica (8 guías gratis)', included: true },
  { text: '1 código HUD (2 dedos)', included: true },
  { text: '9 estilos de calibración', included: true },
  { text: 'Giroscopio calibrado', included: true },
  { text: 'Exportar imagen', included: true },
  { text: 'Soporte 60/90/120 Hz', included: true },
  { text: 'Headshot Mode COMPLETO', included: false },
  { text: 'TODOS los códigos HUD (17)', included: false },
  { text: 'ARES AI Coach', included: false },
  { text: 'Comparador side-by-side', included: false },
];

const PRO_FEATURES: PlanFeature[] = [
  { text: 'Todo lo del plan Gratis', included: true },
  { text: 'Calibración forense completa + DPI custom', included: true, proExclusive: true },
  { text: 'Búsquedas ILIMITADAS', included: true, proExclusive: true },
  { text: 'Configuraciones guardadas ilimitadas', included: true, proExclusive: true },
  { text: 'Headshot Mode COMPLETO (24 features, 32 armas, 5 técnicas, training 7 días)', included: true, proExclusive: true },
  { text: 'TODOS los códigos HUD (17 códigos, 2-5 dedos, con screenshots)', included: true, proExclusive: true },
  { text: 'Academia premium completa', included: true, proExclusive: true },
  { text: 'ARES AI Coach (cuando salga)', included: true, proExclusive: true },
  { text: 'Comparador de devices side-by-side', included: true, proExclusive: true },
  { text: 'Sin publicidad', included: true, proExclusive: true },
  { text: 'Actualizaciones prioritarias', included: true, proExclusive: true },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const monthlyPrice = '$4.99';
  const annualPrice = '$2.99';
  const currentPrice = isAnnual ? annualPrice : monthlyPrice;

  return (
    <section id="pricing" className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Planes simples, sin sorpresas
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 text-sm"
        >
          Empieza gratis. Mejora cuando quieras.
        </motion.p>

        {/* Monthly/Annual toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex justify-center"
        >
          <div className="inline-flex items-center rounded-xl p-1" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[40px] ${
                !isAnnual
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[40px] ${
                isAnnual
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Anual
            </button>
          </div>
        </motion.div>

        {/* Cards — Pro first on mobile (order-2 md:order-1 for Gratis) */}
        <div className="mt-12 grid md:grid-cols-2 gap-6 items-start">
          {/* ── Card Gratis ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 md:order-1"
          >
            <div
              className="rounded-[20px] p-8 flex flex-col h-full"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <h3 className="text-xl font-bold text-white">Gratis</h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-heading font-black text-white">$0</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">siempre</p>

              <div className="my-6 h-px bg-white/5" />

              <ul className="space-y-3 flex-1">
                {FREE_FEATURES.map((feat) => (
                  <li key={feat.text} className="flex items-start gap-3 text-sm">
                    {feat.included ? (
                      <Check size={15} className="text-slate-500 shrink-0 mt-0.5" />
                    ) : (
                      <X size={15} className="text-slate-700 shrink-0 mt-0.5" />
                    )}
                    <span className={feat.included ? 'text-slate-300' : 'text-slate-600 line-through'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link
                  href="/register"
                  className="flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-white border border-white/20 hover:bg-white/5 transition-all duration-300 min-h-[48px]"
                >
                  EMPEZAR GRATIS
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Card Pro ── (first on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-1 md:order-2"
          >
            {/* Animated border wrapper */}
            <div className="relative rounded-[20px] p-[2px] overflow-hidden">
              {/* Rotating conic gradient border */}
              <div
                className="absolute inset-0 rounded-[20px]"
                style={{
                  background: 'conic-gradient(from 0deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)',
                  animation: 'borderRotate 4s linear infinite',
                }}
              />

              {/* Card content */}
              <div
                className="relative rounded-[19px] p-8 flex flex-col overflow-hidden"
                style={{
                  background: 'rgba(6, 182, 212, 0.03)',
                  backgroundColor: 'rgba(10, 15, 30, 0.95)',
                  boxShadow: '0 0 40px rgba(6, 182, 212, 0.1), 0 0 80px rgba(6, 182, 212, 0.05)',
                }}
              >
                {/* POPULAR badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                  className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                >
                  <span
                    className="inline-flex items-center px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                    }}
                  >
                    ⭐ POPULAR
                  </span>
                </motion.div>

                {/* Shimmer effect */}
                <div
                  className="absolute top-0 left-[-100%] w-[50%] h-full pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)',
                    animation: 'shimmerSweep 4s ease-in-out infinite',
                  }}
                />

                <h3 className="text-xl font-bold mt-2">
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Pro
                  </span>
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                  {isAnnual && (
                    <span className="text-2xl text-slate-600 line-through font-heading mr-2">$4.99</span>
                  )}
                  <span className="text-5xl md:text-6xl font-heading font-black text-white transition-all duration-300">
                    {currentPrice}
                  </span>
                  <span className="text-lg text-slate-400">/mes</span>
                </div>

                {isAnnual ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 inline-flex items-center gap-2"
                  >
                    <span className="text-sm text-cyan-400">facturado anual</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      AHORRA 40%
                    </span>
                  </motion.div>
                ) : (
                  <p className="mt-2 text-sm text-cyan-400">
                    $2.99/mes si pagas anual
                  </p>
                )}

                <div className="my-6 h-px bg-white/5" />

                <ul className="space-y-3 flex-1">
                  {PRO_FEATURES.map((feat) => (
                    <li key={feat.text} className="flex items-start gap-3 text-sm">
                      <Check size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span className={feat.proExclusive ? 'text-white font-semibold' : 'text-slate-300'}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/pricing"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-all duration-300 hover:scale-[1.03] min-h-[48px]"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)',
                    }}
                  >
                    COMENZAR PRO →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Guarantee badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-2"
        >
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <span className="text-sm text-slate-500">🔒 Cancela cuando quieras. Sin contratos.</span>
            <span className="text-sm text-slate-500">💳 Pago seguro con Stripe</span>
            <span className="text-sm text-slate-500">↩️ 7 días de garantía de devolución</span>
          </div>
          <Link href="/pricing" className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            Ver comparación completa con precios en tu moneda →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
