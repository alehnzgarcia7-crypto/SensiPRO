'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  variant: 'free' | 'premium' | 'vip';
  features: PlanFeature[];
  cta: string;
  href: string;
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'siempre',
    variant: 'free',
    features: [
      { text: 'Estilo Balanceado', included: true },
      { text: '5 búsquedas por día', included: true },
      { text: '3 favoritos', included: true },
      { text: '10 historial', included: true },
      { text: 'Todos los estilos', included: false },
      { text: 'Giroscopio', included: false },
      { text: 'Comparador', included: false },
      { text: 'Exportar imagen', included: false },
    ],
    cta: 'Empezar Gratis',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$49',
    period: 'MXN/mes',
    variant: 'premium',
    features: [
      { text: '3 estilos de juego', included: true },
      { text: 'Búsquedas ilimitadas', included: true },
      { text: 'Favoritos ilimitados', included: true },
      { text: 'Historial completo', included: true },
      { text: 'Giroscopio', included: true },
      { text: 'Comparador', included: true },
      { text: 'Exportar imagen', included: true },
      { text: 'Sin anuncios', included: false },
    ],
    cta: 'Obtener Premium',
    href: '/pricing',
    highlighted: true,
  },
  {
    name: 'VIP',
    price: '$99',
    period: 'MXN/mes',
    variant: 'vip',
    features: [
      { text: 'Todo de Premium', included: true },
      { text: 'Sin anuncios', included: true },
      { text: 'Torneos VIP', included: true },
      { text: 'Temas exclusivos', included: true },
      { text: 'Badge VIP', included: true },
      { text: 'Academia completa', included: true },
      { text: 'Soporte prioritario', included: true },
      { text: 'Early access', included: true },
    ],
    cta: 'Ser VIP',
    href: '/pricing',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Planes simples, sin sorpresas
        </h2>
        <p className="mt-3 text-center text-slate-400">
          Empieza gratis. Mejora cuando quieras.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`glass p-8 relative ${plan.highlighted ? 'border-fire-500/30 shadow-glow-fire' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-fire-ice text-white text-xs font-ui font-bold px-4 py-1 rounded-full">
                  Más Popular
                </div>
              )}

              <h3 className="font-display font-bold text-xl text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-display font-black text-white">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat.text} className="flex items-center gap-3 text-sm">
                    {feat.included ? (
                      <Check size={16} className="text-success shrink-0" />
                    ) : (
                      <X size={16} className="text-slate-600 shrink-0" />
                    )}
                    <span className={feat.included ? 'text-slate-300' : 'text-slate-600'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href={plan.href}>
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
