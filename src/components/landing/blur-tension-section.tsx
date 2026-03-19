'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// BlurTensionSection — Sección 5: Teaser visual del generador
// Barras animadas como elemento decorativo, sin revelar paywall
// ═══════════════════════════════════════════════════════════════

// Barras decorativas — solo visuales, sin valores
const MOCK_BARS = [
  { label: 'General', width: '82%' },
  { label: 'Punto Rojo', width: '75%' },
  { label: 'Mira 2x', width: '68%' },
  { label: 'Mira 4x', width: '60%' },
  { label: 'AWM', width: '52%' },
  { label: 'Vista Libre', width: '88%' },
] as const;

export function BlurTensionSection() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Título */}
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
          Busca tu celular, elige tu estilo de juego y obtén una configuración
          calibrada para tu dispositivo exacto.
        </motion.p>

        {/* Visual: barras decorativas con blur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 relative rounded-2xl overflow-hidden"
        >
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
            <div className="space-y-4">
              {/* Primera barra nítida */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">{MOCK_BARS[0].label}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: MOCK_BARS[0].width }}
                  />
                </div>
              </div>

              {/* Barras con blur decorativo */}
              <div className="blur-[6px] select-none pointer-events-none space-y-4">
                {MOCK_BARS.slice(1).map((bar) => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">{bar.label}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: bar.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
