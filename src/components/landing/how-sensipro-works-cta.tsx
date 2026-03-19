'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// HowSensiproWorksCta — Banner magnético que interrumpe el scroll
// Lleva al usuario a /academy/como-funciona (100% free)
// ═══════════════════════════════════════════════════════════════

export function HowSensiproWorksCta() {
  return (
    <section className="py-10 md:py-14 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl"
      >
        <div className="relative rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/30 via-[#0a0f1a]/60 to-purple-950/20 p-7 md:p-8 text-center backdrop-blur-sm overflow-hidden">
          {/* Glow sutil en esquinas */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

          {/* Línea neón superior */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-[1px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
            }}
          />

          <div className="relative z-10">
            <span className="text-4xl mb-3 block select-none" aria-hidden="true">
              🔬
            </span>

            <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-black text-white leading-tight">
              ¿Quieres saber cómo funciona{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
              >
                el motor ARES?
              </span>
            </h2>

            <p className="mt-3 text-slate-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              644+ dispositivos analizados. PPI, RAM, Hz, tipo de panel — descubre
              la ciencia detrás de tu sensibilidad perfecta.
            </p>

            <Link href="/academy/como-funciona">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-base md:text-lg text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-shadow min-h-[44px] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                }}
              >
                VER CÓMO FUNCIONA
                <span aria-hidden="true">{'\u2192'}</span>
              </motion.span>
            </Link>

            <p className="text-slate-500 text-xs mt-3">
              100% gratis · Sin registro · 3 min de lectura
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
