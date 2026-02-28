'use client';

import { motion } from 'framer-motion';

import { useTilt } from '@/hooks/use-tilt';

// ═══════════════════════════════════════════════════════════════
// FeaturesSection — 10 real features with 3D tilt, glow borders,
// holographic shine on hover, NUEVO badges, verified stats
// ═══════════════════════════════════════════════════════════════

interface FeatureDef {
  icon: string;
  title: string;
  description: string;
  badge: string | null;
  stat: string;
  color: string; // hex color for glow
}

const FEATURES: FeatureDef[] = [
  {
    icon: '🔬',
    title: 'Calibración por DPI',
    description: 'Algoritmo basado en el DPI real de tu pantalla. No configs genéricas — sensibilidad calculada para TU celular.',
    badge: null,
    stat: '±5 pts de precisión',
    color: '#06b6d4',
  },
  {
    icon: '🎯',
    title: 'Headshot Mode',
    description: 'Sensibilidad para tiro a la cabeza con ajuste por dedos, técnicas de drag, tier list de armas, y training plan de 7 días.',
    badge: 'NUEVO',
    stat: '24 features',
    color: '#ef4444',
  },
  {
    icon: '🎛️',
    title: '9 Estilos de Calibración',
    description: 'Desde Clásico Básico hasta Rush Master. Cada estilo ajusta los valores para tu forma de jugar.',
    badge: null,
    stat: '9 estilos',
    color: '#3b82f6',
  },
  {
    icon: '📐',
    title: 'Códigos HUD Reales',
    description: '17 códigos HUD para 2, 3, 4 y 5 dedos. Copia y pega directo en Free Fire. Con screenshots reales del juego.',
    badge: 'NUEVO',
    stat: '17 códigos',
    color: '#a855f7',
  },
  {
    icon: '📡',
    title: 'Giroscopio Calibrado',
    description: 'Valores de giroscopio calibrados por DPI y tipo de panel. Independiente de la sensibilidad táctil.',
    badge: null,
    stat: '6 valores',
    color: '#22c55e',
  },
  {
    icon: '📚',
    title: 'Academia Completa',
    description: '8 guías de sensibilidad, HUD, headshots, armas y más. 12 tips aplicables hoy. Meta actual y tier list.',
    badge: 'NUEVO',
    stat: '8 guías + 12 tips',
    color: '#f59e0b',
  },
  {
    icon: '📱',
    title: '90 Hz para Gama Media',
    description: 'Soporte para 60, 90 y 120 Hz. Porque la mayoría de jugadores de FF en LATAM tienen gama media con 90 Hz.',
    badge: 'NUEVO',
    stat: '3 opciones de Hz',
    color: '#14b8a6',
  },
  {
    icon: '📸',
    title: 'Screenshots Reales',
    description: 'Fotos reales de Free Fire con los códigos HUD aplicados. Ve exactamente cómo queda tu pantalla antes de aplicar.',
    badge: 'NUEVO',
    stat: 'Del juego real',
    color: '#ec4899',
  },
  {
    icon: '📤',
    title: 'Exportar y Compartir',
    description: 'Exporta tu config como imagen para Instagram Stories o comparte por WhatsApp con tu squad.',
    badge: null,
    stat: 'Imagen lista para redes',
    color: '#f97316',
  },
  {
    icon: '🤖',
    title: 'ARES AI Coach',
    description: 'Tu coach personal de Free Fire con IA. Conoce tu dispositivo y te da consejos específicos para subir de nivel.',
    badge: 'PRÓXIMAMENTE',
    stat: 'Coaching personalizado',
    color: '#8b5cf6',
  },
];

function FeatureCard({ feature, index }: { feature: FeatureDef; index: number }) {
  const { ref } = useTilt({ maxTilt: 5, scale: 1.02 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <div
        ref={ref}
        className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 min-h-[200px] group overflow-hidden"
        style={{
          // CSS custom property for glow color
          ['--card-glow' as string]: feature.color,
        }}
      >
        {/* Badge */}
        {feature.badge && (
          <div className="absolute top-3 right-3 z-10">
            {feature.badge === 'NUEVO' ? (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 text-white animate-[badgePulse_2s_ease-in-out_infinite]">
                {feature.badge}
              </span>
            ) : (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {feature.badge}
              </span>
            )}
          </div>
        )}

        {/* Icon */}
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-4 transition-shadow duration-300"
          style={{
            backgroundColor: `${feature.color}15`,
            border: `1px solid ${feature.color}25`,
          }}
        >
          {feature.icon}
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-white text-base">{feature.title}</h3>

        {/* Description — line-clamp-3 */}
        <p className="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-3">{feature.description}</p>

        {/* Stat */}
        <div className="mt-4">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              backgroundColor: `${feature.color}12`,
              color: feature.color,
              border: `1px solid ${feature.color}20`,
            }}
          >
            {feature.stat}
          </span>
        </div>

        {/* Glow border on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${feature.color}30, 0 0 30px ${feature.color}10`,
          }}
        />

        {/* Holographic shine sweep on hover */}
        <div
          className="absolute top-0 left-[-100%] w-[50%] h-full pointer-events-none transition-[left] duration-[600ms] ease-out group-hover:left-[150%]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)',
          }}
        />
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Todo lo que trae SensiPRO
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 font-body"
        >
          No solo generas sensibilidad — tienes toda la plataforma
        </motion.p>

        {/* Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={feat.title} feature={feat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
