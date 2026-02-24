'use client';

import { motion } from 'framer-motion';
import { Zap, BarChart3, Gamepad2, Shield, Share2, Trophy, type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: 'Basado en Hardware Real',
    description:
      'Analizamos Hz, RAM, panel y chipset de tu dispositivo. No sensibilidades genéricas.',
    color: 'text-fire-500',
  },
  {
    icon: BarChart3,
    title: '3 Estilos de Juego',
    description:
      'Agresivo, Balanceado y Francotirador. Cada uno optimiza diferentes aspectos del combate.',
    color: 'text-ice-500',
  },
  {
    icon: Gamepad2,
    title: 'Giroscopio Pro',
    description:
      'Valores de giroscopio calibrados por tipo de panel y tier de dispositivo.',
    color: 'text-neon-green',
  },
  {
    icon: Shield,
    title: 'Comparador de Devices',
    description:
      'Compara 2 dispositivos side-by-side: specs, sensibilidades, y veredicto.',
    color: 'text-neon-purple',
  },
  {
    icon: Share2,
    title: 'Comparte tu Config',
    description:
      'Exporta como imagen para Instagram/Stories o comparte por WhatsApp y Telegram.',
    color: 'text-warning',
  },
  {
    icon: Trophy,
    title: 'Comunidad y Torneos',
    description:
      'Rankings, torneos con premios, y configs compartidas por otros jugadores.',
    color: 'text-tier-vip',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Todo lo que necesitas
        </h2>
        <p className="mt-3 text-center text-slate-400">
          Más que un generador — una plataforma gaming completa
        </p>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-hover p-6"
              >
                <Icon size={24} className={feat.color} />
                <h3 className="mt-4 font-display font-bold text-white">{feat.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
