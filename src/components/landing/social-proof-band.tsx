'use client';

import { SOCIAL_PROOF_ITEMS } from '@/lib/landing-data';

export function SocialProofBand() {
  // Duplicar items para loop infinito
  const items = [...SOCIAL_PROOF_ITEMS, ...SOCIAL_PROOF_ITEMS];

  return (
    <section className="py-3 bg-white/[0.02] border-y border-white/5 overflow-hidden">
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Marquee track */}
        <div className="flex animate-marquee whitespace-nowrap">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-block mx-6 text-sm text-slate-500 font-body"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
