'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LANDING_DATA, AVATAR_STACK } from '@/lib/landing-data';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Perspective grid background */}
      <div className="absolute inset-0 -z-10">
        {/* Radial glow top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-fire-500/8 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ice-500/6 rounded-full blur-[140px]" />

        {/* Perspective grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 70%)',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge animado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-fire-500/10 backdrop-blur-sm border border-fire-500/20 px-5 py-2 mb-8"
        >
          <Zap size={14} className="text-fire-500 animate-pulse" />
          <span className="text-xs font-ui font-bold text-fire-400 tracking-wider uppercase">
            La plataforma #1 de Free Fire
          </span>
        </motion.div>

        {/* Headline — 3 líneas con gradiente */}
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1]"
          >
            <span className="text-white">Tu sensibilidad</span>
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1]"
          >
            <span className="text-gradient-fire-ice">perfecta</span>
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1]"
          >
            <span className="text-white">en 10 segundos</span>
          </motion.h1>
        </div>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-body leading-relaxed"
        >
          Nuestro algoritmo analiza el hardware REAL de tu celular — procesador, RAM,
          pantalla, panel táctil — y genera la sensibilidad perfecta para FREE FIRE.
          No más copiar configs genéricas de YouTube.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/generator">
            <Button variant="primary" size="lg" rightIcon={<ChevronRight size={18} />}>
              Generar mi sensibilidad
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="ghost" size="lg">
              ¿Cómo funciona?
            </Button>
          </Link>
        </motion.div>

        {/* Social proof — avatares + contador */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <div className="flex items-center">
            {/* Avatar stack */}
            <div className="flex -space-x-2.5">
              {AVATAR_STACK.map((av) => (
                <div
                  key={av.initial}
                  className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: av.bg }}
                >
                  {av.initial}
                </div>
              ))}
            </div>
            <span className="ml-3 text-sm text-slate-400">
              +{LANDING_DATA.playerCount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {LANDING_DATA.playerCount.toLocaleString()} jugadores ya optimizaron su sensibilidad
          </p>
        </motion.div>

        {/* Stats bar — 4 números clave */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.05 }}
          className="mt-10 flex items-center justify-center flex-wrap gap-x-6 gap-y-3"
        >
          <StatPill value={`${LANDING_DATA.deviceCount}+`} label="Dispositivos" />
          <Dot />
          <StatPill value={`${LANDING_DATA.brandCount}`} label="Marcas" />
          <Dot />
          <StatPill value={`${LANDING_DATA.styleCount}`} label="Estilos" />
          <Dot />
          <StatPill value="Gratis" label="Para empezar" />
        </motion.div>
      </div>
    </section>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="text-lg md:text-xl font-display font-black text-gradient-fire-ice">
        {value}
      </span>
      <span className="block text-[11px] text-slate-500 font-ui">{label}</span>
    </div>
  );
}

function Dot() {
  return <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />;
}
