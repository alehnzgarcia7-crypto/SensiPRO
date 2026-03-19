'use client';

import { motion } from 'framer-motion';
import { Search, Sliders, Zap } from 'lucide-react';

import { LANDING_DATA } from '@/lib/landing-data';

// ═══════════════════════════════════════════════════════════════
// HowItWorksSection — Sección 3: Hacer que la solución
// se vea fácil, rápida y real. Sin revelar valores.
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  {
    number: '01',
    icon: Search,
    iconBg: '#06b6d4',
    title: '📱 Busca tu celular',
    description: `Samsung, Xiaomi, Motorola, iPhone... ${LANDING_DATA.deviceCount}+ modelos. El tuyo está aquí.`,
  },
  {
    number: '02',
    icon: Sliders,
    iconBg: '#3b82f6',
    title: '⚙️ Ajusta tu estilo',
    description: '¿Rush agresivo? ¿Sniper? ¿Balanceado? + tu RAM, Hz y DPI.',
  },
  {
    number: '03',
    icon: Zap,
    iconBg: '#22c55e',
    title: '🎯 Recibe TU sensibilidad',
    description: '6 valores calibrados por el algoritmo ARES para tu hardware exacto.',
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Cómo funciona
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 text-sm md:text-base"
        >
          Tres pasos. Menos de un minuto. Tu sensibilidad calibrada.
        </motion.p>

        {/* Steps */}
        <div className="mt-14 grid md:grid-cols-3 gap-6 relative">
          {/* Connection line (desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-[2px] origin-left"
            style={{
              background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #22c55e)',
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.3)',
            }}
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-7 hover:border-cyan-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Watermark number */}
                <span className="absolute top-3 right-4 font-heading text-[72px] font-black leading-none text-white/[0.04] select-none pointer-events-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className="relative z-10 inline-flex items-center justify-center w-11 h-11 rounded-xl"
                  style={{ backgroundColor: `${step.iconBg}15`, border: `1px solid ${step.iconBg}30` }}
                >
                  <Icon size={20} style={{ color: step.iconBg }} />
                </div>

                {/* Content */}
                <h3 className="mt-4 text-lg font-display font-bold text-white relative z-10">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed relative z-10">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
