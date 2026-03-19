'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// PricingSection — Sección 8: Un solo pago. Acceso de por vida.
// Simplificado, limpio, sin "todo lo del plan básico"
// ═══════════════════════════════════════════════════════════════

const PRO_FEATURES = [
  'Resultados desbloqueados (sin blur)',
  'Configuraciones guardadas ilimitadas',
  'Headshot Mode completo',
  'Todos los códigos HUD',
  'Academia premium',
  'Sin publicidad',
  'Actualizaciones prioritarias',
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Un solo pago. Acceso de por vida.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 text-sm"
        >
          Desbloquea SensiPRO completo con un pago único.
        </motion.p>

        {/* Card */}
        <div className="mt-12 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Animated border wrapper */}
            <div className="relative rounded-[20px] p-[2px] overflow-hidden">
              {/* Rotating conic gradient border */}
              <div
                className="absolute inset-0 rounded-[20px]"
                style={{
                  background: 'conic-gradient(from 0deg, #06b6d4, #3b82f6, #8b5cf6, #06b6d4)',
                  animation: 'borderRotate 4s linear infinite',
                }}
              />

              {/* Card content */}
              <div
                className="relative rounded-[19px] p-8 flex flex-col overflow-hidden"
                style={{
                  background: 'rgba(6, 182, 212, 0.03)',
                  backgroundColor: 'rgba(10, 15, 30, 0.95)',
                  boxShadow: '0 0 40px rgba(6, 182, 212, 0.1), 0 0 80px rgba(6, 182, 212, 0.05)',
                }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                  className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                >
                  <span
                    className="inline-flex items-center px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                    }}
                  >
                    PAGO ÚNICO
                  </span>
                </motion.div>

                {/* Shimmer */}
                <div
                  className="absolute top-0 left-[-100%] w-[50%] h-full pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)',
                    animation: 'shimmerSweep 4s ease-in-out infinite',
                  }}
                />

                {/* Price */}
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl text-slate-600 line-through font-heading">$349</span>
                  <span className="text-5xl md:text-6xl font-heading font-black text-white">
                    $199
                  </span>
                  <span className="text-lg text-slate-400">MXN</span>
                </div>

                <p className="mt-2 text-sm text-cyan-400">
                  Pago único de por vida
                </p>

                <div className="my-6 h-px bg-white/5" />

                {/* Features */}
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">Incluye:</p>
                <ul className="space-y-3 flex-1">
                  {PRO_FEATURES.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <Check size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span className="text-white font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    href="/generator"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-all duration-300 hover:scale-[1.02] min-h-[48px]"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)',
                    }}
                  >
                    GENERA TU SENSIBILIDAD
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-2"
        >
          <span className="text-sm text-slate-500">
            Un solo pago. Acceso de por vida. Sin cargos recurrentes.
          </span>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-1">
            <span className="text-sm text-slate-500">Pago seguro con Stripe</span>
            <span className="text-sm text-slate-500">7 días de garantía de devolución</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
