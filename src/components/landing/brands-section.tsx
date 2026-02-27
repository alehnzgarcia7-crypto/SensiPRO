'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// BrandsSection — 26 brands cloud with stagger entrance,
// popular brands highlighted, mobile horizontal scroll
// Brands verified from devices.seed.ts (503 devices, 26 brands)
// ═══════════════════════════════════════════════════════════════

const BRANDS = [
  'Samsung', 'Apple', 'Xiaomi', 'Redmi', 'POCO',
  'Motorola', 'Realme', 'OPPO', 'Vivo', 'OnePlus',
  'Infinix', 'Tecno', 'Honor', 'Nothing', 'Google',
  'Huawei', 'Nokia', 'ZTE', 'TCL', 'Lenovo',
  'BLU', 'ASUS', 'LG', 'Sony', 'Lava', 'Alcatel',
] as const;

const POPULAR = new Set(['Samsung', 'Apple', 'Xiaomi', 'Redmi', 'POCO']);

function BrandPill({ brand, index }: { brand: string; index: number }) {
  const isPopular = POPULAR.has(brand);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold
        bg-white/[0.03] border hover:-translate-y-0.5 transition-all duration-300 cursor-default select-none
        hover:bg-cyan-500/5 hover:border-cyan-500/20 hover:text-white
        ${isPopular
          ? 'border-white/10 text-slate-300'
          : 'border-white/[0.06] text-slate-500'
        }`}
    >
      {brand}
    </motion.span>
  );
}

export function BrandsSection() {
  return (
    <section className="py-16 md:py-24 px-4 border-y border-white/5">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          26 marcas soportadas
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-center text-slate-400 text-sm"
        >
          Tu celular está aquí
        </motion.p>

        {/* Desktop: flex wrap centered */}
        <div className="hidden sm:flex flex-wrap justify-center gap-3 mt-10">
          {BRANDS.map((brand, i) => (
            <BrandPill key={brand} brand={brand} index={i} />
          ))}
        </div>

        {/* Mobile: horizontal scroll with edge fade */}
        <div className="sm:hidden mt-8 relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4">
            <div className="flex gap-2.5 w-max">
              {BRANDS.map((brand, i) => (
                <motion.span
                  key={brand}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap
                    bg-white/[0.03] border transition-colors duration-200
                    ${POPULAR.has(brand)
                      ? 'border-white/10 text-slate-300'
                      : 'border-white/[0.06] text-slate-500'
                    }`}
                >
                  {brand}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-slate-500"
        >
          ¿No encuentras tu celular?{' '}
          <Link href="/community" className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2">
            Escríbenos y lo agregamos en 48 horas
          </Link>
        </motion.p>
      </div>
    </section>
  );
}
