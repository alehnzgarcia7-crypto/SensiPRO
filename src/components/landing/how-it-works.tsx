'use client';

import { motion } from 'framer-motion';
import { Smartphone, Sliders, Copy, type LucideIcon } from 'lucide-react';

import { LANDING_DATA } from '@/lib/landing-data';

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  glow: string;
}

const steps: Step[] = [
  {
    number: '1',
    icon: Smartphone,
    title: 'Elige tu dispositivo',
    description: `Busca tu celular entre ${LANDING_DATA.deviceCount}+ dispositivos de ${LANDING_DATA.brandCount} marcas. Samsung, Xiaomi, Redmi, Apple, POCO, Motorola, y más.`,
    color: 'text-fire-500',
    glow: 'shadow-glow-fire',
  },
  {
    number: '2',
    icon: Sliders,
    title: 'Personaliza tu estilo',
    description:
      'Elige entre 9 estilos de calibración: desde Clásico Básico hasta Rush Master. Ajusta con DPI para control total. O prueba el Headshot Mode para tiro a la cabeza.',
    color: 'text-ice-500',
    glow: 'shadow-glow-ice',
  },
  {
    number: '3',
    icon: Copy,
    title: 'Copia y domina',
    description:
      'Copia los 6 valores de sensibilidad + giroscopio + código HUD directo a Free Fire. También exporta como imagen para tu squad.',
    color: 'text-neon-green',
    glow: 'shadow-glow-success',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          ¿Cómo funciona?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 max-w-lg mx-auto font-body"
        >
          Tres pasos para la sensibilidad perfecta
        </motion.p>

        <div className="mt-16 grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-fire-500/40 via-ice-500/40 to-neon-green/40" />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass p-8 text-center relative"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-background-elevated border border-white/10 text-sm font-display font-black text-gradient-fire-ice">
                    {step.number}
                  </span>
                </div>

                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background-elevated ${step.glow} mb-6 mt-2`}
                >
                  <Icon size={28} className={step.color} />
                </div>
                <h3 className="text-lg font-display font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed font-body">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
