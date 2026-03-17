'use client';

import { motion } from 'framer-motion';

export function HeadshotHero() {
  return (
    <section className="relative py-12 md:py-16 text-center">
      {/* Overlay rojo sutil */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(239, 68, 68, 0.04), transparent 70%)' }}
      />

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-heading font-black text-4xl md:text-5xl headshot-text-gradient"
      >
        HEADSHOT MODE
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-ui text-lg text-slate-400 mt-3"
      >
        Sensibilidad calibrada para tiro a la cabeza
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-4 flex items-center justify-center gap-4"
      >
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-ui font-semibold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20"
          style={{ animation: 'headshotPulse 2s ease-in-out infinite' }}
        >
          EXCLUSIVO ARES SENSIPRO
        </span>
      </motion.div>

      {/* Social proof removido — sin datos verificables aún */}
    </section>
  );
}
