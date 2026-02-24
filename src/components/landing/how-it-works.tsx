'use client';

import { motion } from 'framer-motion';
import { Smartphone, Cpu, Gauge, type LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  glow: string;
}

const steps: Step[] = [
  {
    icon: Smartphone,
    title: '1. Elige tu dispositivo',
    description:
      'Busca tu celular entre 500+ dispositivos. Tenemos Samsung, Xiaomi, Redmi, POCO, Motorola, Apple, y más.',
    color: 'text-fire-500',
    glow: 'shadow-glow-fire',
  },
  {
    icon: Cpu,
    title: '2. Selecciona tu estilo',
    description:
      'Agresivo para rushear, Balanceado para todo, o Francotirador para largo alcance. Cada uno optimiza diferentes valores.',
    color: 'text-ice-500',
    glow: 'shadow-glow-ice',
  },
  {
    icon: Gauge,
    title: '3. Obtén tu config',
    description:
      'Nuestro algoritmo analiza Hz, RAM, panel y chipset de tu device para calcular los 6 valores de sensibilidad perfectos.',
    color: 'text-success',
    glow: 'shadow-glow-success',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          ¿Cómo funciona?
        </h2>
        <p className="mt-3 text-center text-slate-400 max-w-lg mx-auto">
          Tres pasos simples para obtener la sensibilidad perfecta para tu dispositivo
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass p-8 text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background-elevated ${step.glow} mb-6`}
                >
                  <Icon size={28} className={step.color} />
                </div>
                <h3 className="text-lg font-display font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
