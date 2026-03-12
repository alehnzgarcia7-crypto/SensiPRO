'use client';

import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// AresCoachShowcase — Sección secundaria, pequeña, casi al final
// "Próximamente: ARES AI Coach"
// ═══════════════════════════════════════════════════════════════

export function AresCoachShowcase() {
  return (
    <section className="py-12 md:py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-xl text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 mx-auto">
          <Bot size={22} className="text-purple-400" />
        </div>

        <h3 className="mt-4 text-lg font-display font-bold text-white">
          Próximamente: ARES AI Coach
        </h3>

        <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Tu coach personal de Free Fire con recomendaciones basadas en tu dispositivo,
          tu configuración y tu estilo de juego.
        </p>
      </motion.div>
    </section>
  );
}
