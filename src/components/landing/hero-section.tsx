'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

import { trackEvent, INTERNAL_EVENTS, ttClickButton, CONTENT_IDS } from '@/lib/analytics';


// ═══════════════════════════════════════════════════════════════
// HeroSection — Sección 1: Detener scroll, activar dolor,
// definir promesa, empujar al generador
// ═══════════════════════════════════════════════════════════════

export function HeroSection() {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollOpacity(Math.max(0, 1 - window.scrollY / 600));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNext = useCallback(() => {
    const el = document.getElementById('problema');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-[#0a0f1e] -z-30" />

      {/* Gradient mesh blobs */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.15]"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(6,182,212,0.1) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto text-center pt-20 pb-16">
        {/* Título principal — dolor */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] font-display font-black leading-[1.1] tracking-tight"
        >
          <span className="text-white">Tu celular merece su propia</span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              filter: 'drop-shadow(0 0 40px rgba(6, 182, 212, 0.3))',
            }}
          >
            sensibilidad 🎯
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 text-sm md:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto font-body leading-relaxed"
        >
          644+ dispositivos. 26 marcas. Una sensibilidad calculada para TU celular
          exacto — no la del YouTuber que juega en iPhone.
        </motion.p>

        {/* CTA principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <Link
            href="/generator"
            className="relative group"
            onClick={() => {
              trackEvent({ event: INTERNAL_EVENTS.LANDING_CTA_GENERATE_CLICKED, properties: { section: 'hero' } });
              ttClickButton({ contentId: CONTENT_IDS.LANDING_SHORT, description: 'hero_cta_generate' });
            }}
          >
            <span
              className="absolute -inset-[2px] rounded-[14px] opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]"
              style={{
                background: 'conic-gradient(from 0deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)',
                animation: 'borderRotate 3s linear infinite',
              }}
            />
            <span
              className="relative flex items-center justify-center px-10 py-4 rounded-xl font-ui font-bold text-sm md:text-base uppercase tracking-wider text-white overflow-hidden min-h-[52px]"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)',
              }}
            >
              OBTENER MI CONFIGURACIÓN
              <span className="ml-2">{'\u2192'}</span>
              {/* Shimmer */}
              <span
                className="absolute top-0 left-[-100%] w-full h-full pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  animation: 'cta-shimmer 3s ease-in-out infinite',
                }}
              />
            </span>
          </Link>

          {/* Subtexto bajo CTA */}
          <p className="text-xs text-slate-500">
            ⚡ Resultados en 10 segundos · Sin hack · Sin ban
          </p>
        </motion.div>

        {/* Social proof removido — sin datos verificables aún */}
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-opacity duration-300 cursor-pointer"
        style={{ opacity: scrollOpacity }}
      >
        <ChevronDown
          size={20}
          className="text-slate-500 animate-[scrollBounce_1.5s_ease-in-out_infinite]"
        />
      </button>
    </section>
  );
}
