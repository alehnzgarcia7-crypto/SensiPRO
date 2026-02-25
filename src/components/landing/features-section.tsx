'use client';

import { motion } from 'framer-motion';
import {
  Cpu,
  Crosshair,
  Sliders,
  Gamepad2,
  RotateCcw,
  BookOpen,
  ArrowLeftRight,
  Share2,
  Shield,
  Bot,
} from 'lucide-react';

import { FEATURES, type LandingFeature } from '@/lib/landing-data';

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Crosshair,
  Sliders,
  Gamepad2,
  RotateCcw,
  BookOpen,
  ArrowLeftRight,
  Share2,
  Shield,
  Bot,
};

function FeatureCard({ feature, index }: { feature: LandingFeature; index: number }) {
  const Icon = ICON_MAP[feature.icon] ?? Cpu;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass-card p-6 relative group"
      style={{
        borderColor: `${feature.color}10`,
      }}
    >
      {/* NEW badge */}
      {feature.isNew && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-ui font-bold uppercase tracking-wider bg-red-500 text-white animate-pulse">
            Nuevo
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
        style={{
          backgroundColor: `${feature.color}15`,
          boxShadow: `0 0 20px ${feature.color}10`,
        }}
      >
        <Icon size={22} style={{ color: feature.color }} />
      </div>

      {/* Title */}
      <h3 className="font-display font-bold text-white text-base">{feature.title}</h3>

      {/* Description */}
      <p className="mt-2 text-sm text-slate-400 leading-relaxed font-body">{feature.description}</p>

      {/* Highlight pill */}
      {feature.highlight && (
        <div className="mt-4">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-ui font-semibold"
            style={{
              backgroundColor: `${feature.color}12`,
              color: feature.color,
              border: `1px solid ${feature.color}25`,
            }}
          >
            {feature.highlight}
          </span>
        </div>
      )}

      {/* Hover border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${feature.color}30, 0 0 20px ${feature.color}10`,
          borderRadius: '16px',
        }}
      />
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Todo lo que necesitas
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 font-body"
        >
          Más que un generador — una plataforma gaming completa
        </motion.p>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={feat.title} feature={feat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
