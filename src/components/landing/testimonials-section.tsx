'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

import {
  TESTIMONIALS,
  LANDING_DATA,
  RANK_COLORS,
  FEATURE_ICONS,
  type Testimonial,
} from '@/lib/landing-data';

// ═══════════════════════════════════════════════════════════════
// TestimonialsSection — Horizontal carousel with scroll-snap,
// drag/swipe, rank glow borders, rating stars fill animation,
// dot indicators. No auto-scroll.
// ═══════════════════════════════════════════════════════════════

const DEFAULT_RANK_COLOR = '#94a3b8';

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  const rankColor = RANK_COLORS[t.rank] ?? DEFAULT_RANK_COLOR;
  const featureIcon = FEATURE_ICONS[t.feature] ?? '⚡';

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="shrink-0 w-[320px] sm:w-[350px] snap-start"
    >
      <div
        className="rounded-[20px] p-6 flex flex-col min-h-[280px] group transition-all duration-300 hover:-translate-y-1"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${rankColor}40`;
          e.currentTarget.style.boxShadow = `0 8px 30px ${rankColor}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Header: avatar + name + time */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${rankColor}, ${rankColor}80)`,
              border: `2px solid ${rankColor}50`,
            }}
          >
            {t.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{t.username}</p>
            <span className="text-xs text-slate-400">{t.device}</span>
          </div>
          <span className="text-[11px] text-slate-600 shrink-0">{t.date}</span>
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
        <p className="text-sm text-slate-300 leading-relaxed flex-1">
          {t.text}
        </p>

        {/* Footer: feature + rank badges */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400">
            {featureIcon} {t.feature}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
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
      </div>
    </motion.div>
  );
}

function RatingStars() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={22}
          className="transition-all duration-300"
          style={{
            color: visible ? '#fbbf24' : '#334155',
            fill: visible ? '#fbbf24' : 'none',
            transitionDelay: visible ? `${i * 200}ms` : '0ms',
          }}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = 350 + 16; // card width + gap
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveDot(Math.min(idx, TESTIMONIALS.length - 1));
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-20 md:py-28 px-4 border-y border-white/5">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Lo que dicen nuestros jugadores
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 text-sm"
        >
          Reviews reales de la comunidad
        </motion.p>

        {/* Rating summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3">
            <RatingStars />
            <span className="text-4xl md:text-5xl font-heading font-black text-white">
              {LANDING_DATA.deviceCount}+
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Dispositivos calibrados con precisión
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-10">
          {/* Edge fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.id} t={t} index={i} />
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = scrollRef.current;
                  if (el) {
                    el.scrollTo({ left: i * (350 + 16), behavior: 'smooth' });
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeDot
                    ? 'bg-cyan-400 w-6'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
