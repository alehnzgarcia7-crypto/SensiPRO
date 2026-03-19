'use client';

import { motion } from 'framer-motion';
import { Monitor, Copy, Crosshair } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// ProblemSection — Sección 2: Activar dolor
// "No es tu aim. Es tu configuración."
// ═══════════════════════════════════════════════════════════════

const PROBLEMS = [
  {
    icon: Monitor,
    title: 'Tu Samsung A15 NO es un iPhone 16 Pro. Diferente PPI, diferente RAM, diferente panel. La misma sensi se siente distinta.',
    color: '#06b6d4',
  },
  {
    icon: Copy,
    title: '¿Copiaste la sensi de un YouTuber? Él juega en un cel de $20,000 o en emulador. Su config NO funciona en tu hardware.',
    color: '#3b82f6',
  },
  {
    icon: Crosshair,
    title: 'Cada fight que pierdes por sobre-arrastrar o no llegar al headshot es culpa de una sensi que no calza con tu cel.',
    color: '#8b5cf6',
  },
] as const;

export function ProblemSection() {
  return (
    <section id="problema" className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-black text-center text-white"
        >
          ¿Sigues costurando? No eres tú. Es tu configuración.
        </motion.h2>

        {/* Texto */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-center text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
        >
          La mayoría de jugadores ajusta su sensibilidad copiando configs ajenas
          o moviendo barras al azar. Pero cada celular responde distinto.
          Pantalla, Hz, DPI y panel cambian cómo se siente tu aim.
        </motion.p>

        {/* Cards */}
        <div className="mt-12 grid gap-4">
          {PROBLEMS.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors duration-300"
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${problem.color}15` }}
                >
                  <Icon size={20} style={{ color: problem.color }} />
                </div>
                <p className="text-sm md:text-base text-slate-300 font-medium">{problem.title}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
