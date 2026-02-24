'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fire-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ice-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-fire-500/10 border border-fire-500/20 px-4 py-1.5 mb-8"
        >
          <Zap size={14} className="text-fire-500" />
          <span className="text-xs font-ui font-semibold text-fire-400 tracking-wider uppercase">
            Generador #1 para Free Fire
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-display font-black leading-tight"
        >
          <span className="text-white">Sensibilidades</span>
          <br />
          <span className="text-gradient-fire-ice">basadas en tu hardware</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
        >
          No más sensibilidades genéricas. Nuestro algoritmo analiza las specs reales
          de tu celular — Hz, RAM, panel, chipset — y genera la configuración perfecta
          para <strong className="text-white">tu</strong> dispositivo.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/generator">
            <Button variant="primary" size="lg" rightIcon={<ChevronRight size={18} />}>
              Generar Gratis
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="ghost" size="lg">
              ¿Cómo funciona?
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500"
        >
          <span>500+ dispositivos</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>3 estilos de juego</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>100% gratis</span>
        </motion.div>
      </div>
    </section>
  );
}
