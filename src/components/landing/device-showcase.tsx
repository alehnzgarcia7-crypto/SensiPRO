'use client';

import Link from 'next/link';

import { cn } from '@/lib/cn';
import { POPULAR_DEVICES, LANDING_DATA, TIER_COLORS, type PopularDevice } from '@/lib/landing-data';

import { ScrollReveal } from './scroll-reveal';

const DEFAULT_TIER = { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };

function DeviceCard({ device, index }: { device: PopularDevice; index: number }) {
  const tier = TIER_COLORS[device.tier] ?? DEFAULT_TIER;

  return (
    <ScrollReveal delay={index * 60}>
      <Link
        href={`/devices/${device.slug}`}
        className="glass-card p-4 text-center block group"
      >
        {/* Brand */}
        <p className="text-[10px] text-slate-500 font-ui uppercase tracking-[0.15em]">
          {device.brand}
        </p>

        {/* Model */}
        <p className="mt-1 font-ui font-bold text-white text-base group-hover:text-fire-400 transition-colors leading-tight">
          {device.model}
        </p>

        {/* Pills: tier + Hz */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <span
            className={cn(
              'inline-flex px-2 py-0.5 rounded text-[9px] font-ui font-bold uppercase tracking-wider border',
              tier.bg,
              tier.text,
              tier.border,
            )}
          >
            {device.tier}
          </span>
          <span className="text-[10px] text-slate-600 font-mono">
            {device.refreshRate}Hz
          </span>
        </div>
      </Link>
    </ScrollReveal>
  );
}

export function DeviceShowcase() {
  return (
    <section className="py-20 px-4 border-y border-white/5">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-white">
            Dispositivos populares
          </h2>
          <p className="mt-3 text-center text-slate-400 font-ui">
            Algunos de los {LANDING_DATA.deviceCount}+ dispositivos que soportamos
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {POPULAR_DEVICES.map((device, i) => (
            <DeviceCard key={device.slug} device={device} index={i} />
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-10 text-center">
            <Link
              href="/devices"
              className="text-sm text-fire-500 hover:text-fire-400 font-ui font-medium transition-colors link-underline"
            >
              Ver todos los dispositivos →
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
