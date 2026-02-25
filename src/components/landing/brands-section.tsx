'use client';

import { ALL_BRANDS, LANDING_DATA } from '@/lib/landing-data';

export function BrandsSection() {
  return (
    <section className="py-16 border-y border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-center text-xs text-slate-500 font-display uppercase tracking-[0.2em] mb-8">
          {LANDING_DATA.brandCount}+ marcas soportadas
        </p>

        {/* Desktop: flex wrap grid  |  Mobile: horizontal scroll */}
        <div className="hidden sm:flex flex-wrap justify-center gap-x-8 gap-y-4">
          {ALL_BRANDS.map((brand) => (
            <span
              key={brand}
              className="text-lg font-display font-semibold text-slate-600 hover:text-white transition-colors duration-200 cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>

        {/* Mobile: scrollable */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide pb-2">
          <div className="flex gap-6 w-max px-2">
            {ALL_BRANDS.map((brand) => (
              <span
                key={brand}
                className="text-base font-display font-semibold text-slate-600 whitespace-nowrap"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Tu celular está aquí
        </p>
      </div>
    </section>
  );
}
