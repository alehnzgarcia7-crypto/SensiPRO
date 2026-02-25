'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

import { cn } from '@/lib/cn';
import {
  TESTIMONIALS,
  LANDING_DATA,
  TIER_COLORS,
  RANK_COLORS,
  FEATURE_ICONS,
  type Testimonial,
} from '@/lib/landing-data';

const DEFAULT_TIER_STYLE = { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  const tierStyle = TIER_COLORS[t.deviceTier] ?? DEFAULT_TIER_STYLE;
  const rankColor = RANK_COLORS[t.rank] ?? '#94a3b8';
  const featureIcon = FEATURE_ICONS[t.feature] ?? '⚡';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="glass-card p-5 md:p-6 flex flex-col"
    >
      {/* Header: avatar + username + date */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: rankColor }}
        >
          {t.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-ui font-semibold text-white text-sm truncate">{t.username}</p>
          <p className="text-[11px] text-slate-500">{t.date}</p>
        </div>
      </div>

      {/* Device pill + tier */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-slate-400 font-body">{t.device}</span>
        <span
          className={cn(
            'inline-flex px-1.5 py-0.5 rounded text-[9px] font-ui font-bold uppercase tracking-wider border',
            tierStyle.bg,
            tierStyle.text,
            tierStyle.border,
          )}
        >
          {t.deviceTier}
        </span>
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
          />
        ))}
      </div>

      {/* Review text */}
      <p className="text-sm text-slate-300 leading-relaxed font-body flex-1">
        {t.text}
      </p>

      {/* Footer: feature + rank pills */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-ui font-semibold bg-white/5 text-slate-400">
          {featureIcon} {t.feature}
        </span>
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-ui font-semibold"
          style={{
            backgroundColor: `${rankColor}15`,
            color: rankColor,
            border: `1px solid ${rankColor}25`,
          }}
        >
          {t.rank === 'Heroico' && '🔥'}
          {t.rank === 'Diamante' && '💎'}
          {t.rank === 'Platino' && '🟣'}
          {t.rank === 'Oro' && '🥇'}
          {' '}{t.rank}
        </span>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 border-y border-white/5">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Lo que dicen nuestros jugadores
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 font-body"
        >
          Reviews reales de la comunidad
        </motion.p>

        {/* Grid: mobile 1 col, tablet 2 cols, desktop 4 cols (2 rows of 4) */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.id} t={t} index={i} />
          ))}
        </div>

        {/* Rating summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-2xl font-display font-black text-white">
              {LANDING_DATA.avgRating}
            </span>
            <span className="text-lg text-slate-500 font-display">/5.0</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Basado en {LANDING_DATA.reviewCount} reviews
          </p>
        </motion.div>
      </div>
    </section>
  );
}
