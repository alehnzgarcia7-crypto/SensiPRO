'use client';

import { motion } from 'framer-motion';
import { Crosshair, Gamepad2, BookOpen } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// PremiumModulesSection — Sección 6: Subir valor percibido
// 3 módulos premium como valor agregado
// ═══════════════════════════════════════════════════════════════

const MODULES = [
  {
    icon: Crosshair,
    title: 'Headshot Mode',
    description:
      '9 técnicas de drag, 18 combos de personajes, 11 armas con daño de headshot real. La cereza del pastel.',
    color: '#ef4444',
    gradient: 'from-red-500/10 to-red-600/5',
  },
  {
    icon: Gamepad2,
    title: '17 Códigos HUD Reales',
    description:
      'Para 2, 3, 4 y 5 dedos. Con capturas del juego. Copia y pega directo.',
    color: '#22c55e',
    gradient: 'from-green-500/10 to-green-600/5',
  },
  {
    icon: BookOpen,
    title: 'Academia PRO',
    description:
      '11 guías + 24 tips escritos con datos REALES del algoritmo. No texto genérico de Google.',
    color: '#3b82f6',
    gradient: 'from-blue-500/10 to-blue-600/5',
  },
] as const;

export function PremiumModulesSection() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-center text-white"
        >
          No solo números.{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
          >
            Todo lo que necesitas para dar capa.
          </span>
        </motion.h2>

        {/* Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${mod.gradient} border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${mod.color}20` }}
                >
                  <Icon size={24} style={{ color: mod.color }} />
                </div>
                <h3 className="mt-4 text-lg font-display font-bold text-white">
                  {mod.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {mod.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
