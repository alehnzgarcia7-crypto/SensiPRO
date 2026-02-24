'use client';

import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';

interface Testimonial {
  name: string;
  tier: 'free' | 'premium' | 'vip';
  device: string;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Carlos M.',
    tier: 'premium',
    device: 'Redmi Note 13 Pro',
    text: 'Probé mil configs de YouTube y ninguna funcionaba para mi cel. Aquí generé la mía en 10 segundos y la diferencia es brutal.',
  },
  {
    name: 'Valentina R.',
    tier: 'vip',
    device: 'Samsung Galaxy A54',
    text: 'El giroscopio de este generador es otro nivel. Mis headshots subieron un 40% desde que uso esta config.',
  },
  {
    name: 'Diego L.',
    tier: 'free',
    device: 'POCO X5 Pro',
    text: 'Lo mejor es que es gratis y funciona. Ni siquiera necesité pagar para notar la mejora en mi gameplay.',
  },
  {
    name: 'Sofía G.',
    tier: 'premium',
    device: 'iPhone 15 Pro',
    text: 'El comparador me ayudó a decidir entre el 15 Pro y el S24. Compré el iPhone y la config ya estaba lista.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 border-y border-white/5">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Lo que dicen los jugadores
        </h2>

        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass p-6"
            >
              <p className="text-sm text-slate-300 leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-ui font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.device}</p>
                </div>
                <Badge variant={t.tier} size="sm">
                  {t.tier.toUpperCase()}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
