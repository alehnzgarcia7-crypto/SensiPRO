const brands: string[] = [
  'Samsung',
  'Apple',
  'Xiaomi',
  'Redmi',
  'POCO',
  'Motorola',
  'Realme',
  'OPPO',
  'Vivo',
  'OnePlus',
  'Infinix',
  'Tecno',
  'Honor',
  'Nothing',
  'Google',
  'Huawei',
];

export function BrandsSection() {
  return (
    <section className="py-16 border-y border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-center text-sm text-slate-500 font-ui uppercase tracking-wider mb-8">
          16+ marcas soportadas
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-lg font-display font-semibold text-slate-600 hover:text-white transition-colors cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
