'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// DeviceShowcase — Horizontal scroll carousel with snap points,
// 10 popular devices, Hz info, edge fade masks,
// CTA card at end, stagger entrance from left
// Device data verified against devices.seed.ts
// ═══════════════════════════════════════════════════════════════

interface PopularDevice {
  brand: string;
  model: string;
  tier: 'GAMING' | 'HIGH' | 'MID' | 'LOW';
  hz: number;
  slug: string;
}

// All data verified against packages/database/prisma/seeds/devices.ts
const POPULAR_DEVICES: PopularDevice[] = [
  { brand: 'Apple', model: 'iPhone 16 Pro Max', tier: 'GAMING', hz: 120, slug: 'apple-iphone-16-pro-max' },
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', tier: 'GAMING', hz: 120, slug: 'samsung-galaxy-s24-ultra' },
  { brand: 'Apple', model: 'iPhone 15', tier: 'HIGH', hz: 60, slug: 'apple-iphone-15' },
  { brand: 'Samsung', model: 'Galaxy A54', tier: 'HIGH', hz: 120, slug: 'samsung-galaxy-a54' },
  { brand: 'POCO', model: 'X5 Pro', tier: 'HIGH', hz: 120, slug: 'poco-x5-pro' },
  { brand: 'Redmi', model: 'Note 12', tier: 'MID', hz: 120, slug: 'redmi-note-12' },
  { brand: 'Motorola', model: 'Moto G84', tier: 'MID', hz: 120, slug: 'motorola-moto-g84' },
  { brand: 'Infinix', model: 'Hot 40 Pro', tier: 'MID', hz: 120, slug: 'infinix-hot-40-pro' },
  { brand: 'Samsung', model: 'Galaxy A14', tier: 'LOW', hz: 90, slug: 'samsung-galaxy-a14' },
  { brand: 'Redmi', model: '13C', tier: 'LOW', hz: 90, slug: 'redmi-13c' },
];

const DEFAULT_TIER_STYLE = { bg: 'bg-slate-600', text: 'text-slate-200', glow: 'rgba(100, 116, 139, 0.1)' };

const TIER_STYLE: Record<string, { bg: string; text: string; glow: string }> = {
  GAMING: {
    bg: 'bg-gradient-to-r from-red-500 to-orange-500',
    text: 'text-white',
    glow: 'rgba(239, 68, 68, 0.15)',
  },
  HIGH: {
    bg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    text: 'text-white',
    glow: 'rgba(6, 182, 212, 0.15)',
  },
  MID: {
    bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    text: 'text-white',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
  LOW: {
    bg: 'bg-slate-600',
    text: 'text-slate-200',
    glow: 'rgba(100, 116, 139, 0.1)',
  },
};

function DeviceCard({ device, index }: { device: PopularDevice; index: number }) {
  const tier = TIER_STYLE[device.tier] ?? DEFAULT_TIER_STYLE;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="shrink-0 w-[200px] snap-start"
    >
      <Link
        href={`/devices/${device.slug}`}
        className="block rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-1"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.boxShadow = `0 8px 30px ${tier.glow}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Brand */}
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-semibold">
          {device.brand}
        </p>

        {/* Model */}
        <p className="mt-1.5 text-base font-bold text-white leading-tight group-hover:text-cyan-400 transition-colors min-h-[44px] flex items-center">
          {device.model}
        </p>

        {/* Hz spec */}
        <div className="mt-3">
          <span className="text-[11px] text-slate-400 font-mono">
            {device.hz}Hz
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function CtaCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.8 }}
      className="shrink-0 w-[200px] snap-start"
    >
      <Link
        href="/devices"
        className="flex flex-col items-center justify-center h-full min-h-[160px] rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-1"
        style={{
          background: 'rgba(6, 182, 212, 0.04)',
          border: '1px solid rgba(6, 182, 212, 0.15)',
        }}
      >
        <span className="text-3xl font-bold text-cyan-400 font-heading">613+</span>
        <span className="mt-2 text-sm text-slate-300 text-center leading-snug">
          Ver todos los dispositivos
        </span>
        <ChevronRight size={18} className="mt-2 text-cyan-400 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

export function DeviceShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);

  // Hide scroll hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Also hide on any scroll interaction
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => setShowHint(false);
    el.addEventListener('scroll', handleScroll, { once: true, passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

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
          Dispositivos populares
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 text-sm"
        >
          Algunos de los 613+ celulares que soportamos
        </motion.p>

        {/* Carousel container */}
        <div className="relative mt-10">
          {/* Edge fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {POPULAR_DEVICES.map((device, i) => (
              <DeviceCard key={device.slug} device={device} index={i} />
            ))}
            <CtaCard />
          </div>

          {/* Scroll hint — mobile only, disappears after 3s */}
          {showHint && (
            <div className="sm:hidden absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
              <span className="text-[10px] text-slate-600 animate-pulse">
                ← desliza →
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
