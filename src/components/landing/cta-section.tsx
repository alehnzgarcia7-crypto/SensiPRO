'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { LANDING_DATA, AVATAR_STACK } from '@/lib/landing-data';

// ═══════════════════════════════════════════════════════════════
// CtaSection — Final CTA que lleva al generador (flujo correcto)
// ═══════════════════════════════════════════════════════════════

export function CtaSection() {

  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      {/* Gradient mesh — mirrors hero */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.07]"
          style={{ background: '#06b6d4', animation: 'meshFloat1 15s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-[100px] opacity-[0.05]"
          style={{ background: '#3b82f6', animation: 'meshFloat2 18s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.04]"
          style={{ background: '#8b5cf6', animation: 'meshFloat3 12s ease-in-out infinite' }}
        />
      </div>

      <div className="mx-auto max-w-[600px] text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-display font-black leading-tight"
        >
          <span className="text-white">Deja de perder por</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            mala configuración
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-base md:text-lg text-slate-400"
        >
          Genera la sensibilidad calibrada para tu celular en 10 segundos.
        </motion.p>

        {/* CTA — rotating gradient border (matches hero) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 w-full md:inline-block"
        >
          <div className="relative rounded-2xl p-[2px] overflow-hidden group">
            {/* Rotating border */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'conic-gradient(from 0deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)',
                animation: 'borderRotate 4s linear infinite',
              }}
            />
            <Link
              href="/generator"
              className="relative flex items-center justify-center gap-3 w-full md:w-auto px-8 md:px-12 py-5 rounded-[14px] text-white font-bold text-base md:text-lg uppercase tracking-wider transition-all duration-300 group-hover:scale-[1.03] min-h-[56px]"
              style={{ background: 'rgba(10, 15, 30, 0.9)' }}
            >
              GENERA TU SENSIBILIDAD GRATIS
              <span className="text-xl">{'\u2192'}</span>
            </Link>
          </div>
        </motion.div>

        {/* Social proof — 3 overlapping avatars + count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <div className="flex -space-x-2">
            {AVATAR_STACK.slice(0, 3).map((av) => (
              <div
                key={av.initial}
                className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[11px] font-bold text-white"
                style={{ backgroundColor: av.bg }}
              >
                {av.initial}
              </div>
            ))}
          </div>
          <span className="text-sm text-slate-400">
            {LANDING_DATA.playerCount.toLocaleString()} jugadores ya lo usan
          </span>
        </motion.div>
      </div>

      {/* Gradient line separator */}
      <div className="mt-20 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </section>
  );
}
