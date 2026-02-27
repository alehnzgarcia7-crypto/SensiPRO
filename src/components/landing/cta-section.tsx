'use client';

import Link from 'next/link';

import { LANDING_DATA, AVATAR_STACK } from '@/lib/landing-data';

import { ScrollReveal } from './scroll-reveal';

export function CtaSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-fire-500/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-ice-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          {/* Título emocional en 2 líneas */}
          <h2 className="text-3xl md:text-5xl font-heading font-black leading-tight">
            <span className="text-white">Deja de perder por</span>
            <br />
            <span className="headshot-text-gradient">mala configuración</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p className="mt-5 text-lg md:text-xl text-slate-400 font-ui">
            Genera la sensibilidad perfecta para tu dispositivo en 10 segundos. Gratis.
          </p>
        </ScrollReveal>

        {/* CTA ENORME */}
        <ScrollReveal delay={200}>
          <div className="mt-10">
            <Link
              href="/generator"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-fire-500 to-ice-500 text-white font-ui font-bold text-xl transition-all duration-300 hover:scale-105 cta-pulse-glow min-h-[60px]"
            >
              GENERAR MI SENSIBILIDAD
              <span className="text-2xl">→</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Social proof mini */}
        <ScrollReveal delay={350}>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {AVATAR_STACK.slice(0, 3).map((av) => (
                <div
                  key={av.initial}
                  className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: av.bg }}
                >
                  {av.initial}
                </div>
              ))}
            </div>
            <span className="text-sm text-slate-500">
              Únete a {LANDING_DATA.playerCount.toLocaleString()} jugadores
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
