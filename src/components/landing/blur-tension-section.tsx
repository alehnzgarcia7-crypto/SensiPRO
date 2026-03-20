'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { GlowProgressBar } from '@/components/effects/glow-progress-bar';

// ═══════════════════════════════════════════════════════════════
// BlurTensionSection — Teaser visual del generador estilo REAL
// Usa GlowProgressBar con gradientes dinámicos, glow y shimmer.
// Primera barra visible, resto blurreadas. Sin valores numéricos.
// ═══════════════════════════════════════════════════════════════

const DEMO_BARS = [
  { label: 'General', icon: '\uD83C\uDFAF', value: 180, delay: 0 },
  { label: 'Punto Rojo', icon: '\uD83D\uDD34', value: 170, delay: 0.08 },
  { label: 'Mira 2x', icon: '\uD83D\uDD2D', value: 160, delay: 0.16 },
  { label: 'Mira 4x', icon: '\uD83D\uDD2D', value: 140, delay: 0.24 },
  { label: 'AWM', icon: '\uD83C\uDFAF', value: 110, delay: 0.32 },
  { label: 'Vista Libre', icon: '\uD83D\uDC41\uFE0F', value: 124, delay: 0.40 },
] as const;

export function BlurTensionSection() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Titulo */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-center text-white"
        >
          Tu sensibilidad personalizada en segundos
        </motion.h2>

        {/* Texto */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-center text-slate-400 text-sm md:text-base leading-relaxed"
        >
          Busca tu celular, elige tu estilo de juego y obt{'\u00e9'}n una configuraci{'\u00f3'}n
          calibrada para tu dispositivo exacto.
        </motion.p>

        {/* Card estilo generador real */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 relative"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-5 md:p-7 shadow-[0_0_40px_rgba(6,182,212,0.04)]">
            {/* Header del card */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Sensibilidades</span>
              </div>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Preview</span>
            </div>

            {/* Primera barra — visible */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{DEMO_BARS[0].icon}</span>
                  <span className="text-xs font-medium text-slate-300">{DEMO_BARS[0].label}</span>
                </div>
                <span className="text-xs font-bold text-slate-600 tabular-nums">???</span>
              </div>
              <GlowProgressBar value={DEMO_BARS[0].value} max={200} delay={0.3} />
            </div>

            {/* Barras 2-6 — blur */}
            <div className="relative">
              <div className="blur-[6px] select-none pointer-events-none space-y-3.5">
                {DEMO_BARS.slice(1).map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{bar.icon}</span>
                        <span className="text-xs font-medium text-slate-300">{bar.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 tabular-nums">???</span>
                    </div>
                    <GlowProgressBar value={bar.value} max={200} delay={bar.delay + 0.3} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Glow sutil detrás del card */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-cyan-500/[0.03] via-transparent to-transparent blur-2xl" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
          >
            Genera tu sensibilidad
            <span>{'\u2192'}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
