'use client';

import { motion } from 'framer-motion';
import { Gauge, Monitor, Sliders } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DifferentialSection — Sección 4: Responder "¿por qué esto
// no es otra sensi genérica?"
// ═══════════════════════════════════════════════════════════════

const BENEFITS = [
  {
    icon: Gauge,
    text: '🔬 DPI calculado por tu pantalla — Un Galaxy A06 (270 PPI) necesita sensi diferente que un iPhone 16 Pro (460 PPI)',
    color: '#06b6d4',
  },
  {
    icon: Monitor,
    text: '📡 Ajuste por Hz real — 60Hz se siente 15% más lento que 120Hz. ARES compensa automáticamente',
    color: '#3b82f6',
  },
  {
    icon: Sliders,
    text: '🎮 3 estilos × 3 calibraciones = 9 perfiles — Rush (+40), Balanceado (+0), Sniper (-20)',
    color: '#8b5cf6',
  },
] as const;

export function DifferentialSection() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-center text-white leading-tight"
        >
          No son números al aire.{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
          >
            Es ciencia de tu dispositivo.
          </span>
        </motion.h2>

        {/* Texto */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-center text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
        >
          SensiPRO no te da una sensibilidad copiada de otro jugador.
          Calcula una configuración basada en tu dispositivo, tus ajustes
          y la forma en la que realmente responde tu pantalla.
        </motion.p>

        {/* Beneficios */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mx-auto"
                  style={{ backgroundColor: `${benefit.color}15` }}
                >
                  <Icon size={22} style={{ color: benefit.color }} />
                </div>
                <p className="mt-3 text-sm text-slate-300 font-medium">{benefit.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
