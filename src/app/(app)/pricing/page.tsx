'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Shield,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';
import { usePremiumContext } from '@/providers/premium-provider';

/* ═══════════════════════════════════════════════════════════
   PRO FEATURES — Todo lo que incluye el plan
   ═══════════════════════════════════════════════════════════ */

const PRO_FEATURES = [
  '6 valores de sensibilidad calibrada por DPI real',
  'Headshot Mode completo (24 features, 32 armas, 5 técnicas)',
  '17 códigos HUD reales con capturas de Free Fire',
  'Giroscopio calibrado al rango pro (32-39)',
  'Academia completa: 8 guías + 12 tips pro',
  '503+ dispositivos soportados de 26 marcas',
  'Training Plans de 7 días para mejorar aim',
  'Armas Tier S/A/B con análisis completo',
  'Comparador de devices side-by-side',
  'Búsquedas y configuraciones ilimitadas',
  'Sin publicidad — experiencia limpia',
  'Actualizaciones de por vida + soporte prioritario',
];

/* ═══════════════════════════════════════════════════════════
   FAQ DATA
   ═══════════════════════════════════════════════════════════ */

const faqs = [
  {
    q: '¿Es realmente pago único?',
    a: 'Sí, un solo pago y acceso de por vida. Sin cargos recurrentes, sin renovaciones automáticas, sin sorpresas.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Tarjeta de crédito/débito (Visa, Mastercard, Amex), OXXO (efectivo en México), y Mercado Pago (tarjetas locales, transferencia, efectivo).',
  },
  {
    q: '¿Ofrecen reembolsos?',
    a: 'Sí, 7 días de garantía. Si no estás satisfecho, te devolvemos tu dinero sin preguntas.',
  },
  {
    q: '¿Funciona en cualquier celular?',
    a: 'Sí, tenemos 503+ dispositivos de 26 marcas incluyendo Samsung, iPhone, Xiaomi, Redmi, POCO, Motorola, Infinix, y más.',
  },
  {
    q: '¿Qué incluye el Headshot Mode?',
    a: 'Sensibilidad optimizada para tiros a la cabeza, ajuste por cantidad de dedos (2-5), técnicas de drag headshot, tier list de armas, y un training plan de 7 días.',
  },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENTES
   ═══════════════════════════════════════════════════════════ */

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left min-h-[52px] hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-ui font-semibold text-sm text-white pr-4">{q}</span>
        <ChevronDown
          size={16}
          className={cn(
            'text-slate-500 shrink-0 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-slate-400 font-body leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function PricingPage() {
  const { isPremium, showPaywall } = usePremiumContext();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-heading font-black">
          <span className="bg-gradient-to-r from-ice-500 to-fire-500 bg-clip-text text-transparent">
            Desbloquea SensiPRO
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-400 font-ui max-w-lg mx-auto">
          Un solo pago, acceso de por vida. Sin suscripciones.
        </p>
      </motion.div>

      {/* ── PRO Card ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="animated-border-wrapper">
          <div className="animated-border-gradient" />
          <div className="animated-border-content">
            <div className="glass-card p-7 md:p-10 relative">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center px-5 py-1.5 rounded-full text-white text-xs font-ui font-bold whitespace-nowrap animate-pulse bg-gradient-to-r from-ice-500 to-fire-500">
                  PAGO ÚNICO DE POR VIDA
                </span>
              </div>

              {/* Plan name */}
              <div className="flex items-center gap-2 mt-2">
                <Zap size={22} className="text-ice-400" />
                <h2 className="font-heading font-bold text-2xl text-white">PRO</h2>
              </div>

              {/* Precio */}
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-2xl text-slate-600 line-through font-mono">$349</span>
                <span className="text-5xl md:text-6xl font-heading font-black text-white">$199</span>
                <span className="text-lg text-slate-400">MXN</span>
              </div>
              <p className="text-sm text-cyan-400 mt-1 font-ui">Pago único de por vida</p>

              <div className="my-6 h-px bg-white/5" />

              {/* Features */}
              <ul className="space-y-3.5">
                {PRO_FEATURES.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-emerald-400" />
                    </div>
                    <span className="text-sm text-slate-200 font-body leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="my-6 h-px bg-white/5" />

              {/* CTA */}
              {isPremium ? (
                <div className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-ui font-bold text-sm tracking-wider uppercase bg-success/10 border border-success/20 text-success min-h-[52px]">
                  <Check size={18} />
                  Ya tienes acceso PRO
                </div>
              ) : (
                <motion.button
                  onClick={() => showPaywall({ source: 'pricing' })}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-ui font-bold text-sm tracking-wider uppercase transition-all duration-300 min-h-[52px] cursor-pointer bg-gradient-to-r from-ice-500 to-blue-600 text-white shadow-glow-ice hover:scale-[1.02] hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  DESBLOQUEAR AHORA
                  <span className="ml-1">{'\u2192'}</span>
                </motion.button>
              )}

              {/* Sub-CTA text */}
              <div className="mt-5 flex flex-col items-center gap-2 text-center">
                <p className="text-sm text-slate-500">
                  Un solo pago. Acceso de por vida. Sin cargos recurrentes.
                </p>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-1">
                  <span className="text-sm text-slate-500">💳 Pago seguro con Stripe</span>
                  <span className="text-sm text-slate-500">↩️ 7 días de garantía de devolución</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Garantía ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 md:p-8 border border-emerald-500/20 mb-16"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Shield size={28} className="text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-white">
              7 días de garantía
            </h3>
            <p className="text-sm text-slate-400 font-body mt-1">
              Si no mejoras tu gameplay, te devolvemos tu dinero. Sin preguntas, sin letras chiquitas.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── FAQ ────────────────────────────────────────── */}
      <div className="mb-20 max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-heading font-bold text-white text-center mb-8"
        >
          Preguntas Frecuentes
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
