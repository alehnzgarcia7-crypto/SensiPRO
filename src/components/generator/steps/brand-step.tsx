'use client';

import { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { useGeneratorStore } from '@/stores/generator.store';

interface Brand {
  name: string;
  slug: string;
  count: number;
}

export function BrandStep() {
  const { selectBrand } = useGeneratorStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/devices/brands')
      .then((r) => r.json())
      .then((data: { data?: Brand[] }) => setBrands(data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const POPULAR_BRAND_NAMES = ['Samsung', 'Apple', 'Xiaomi', 'Redmi', 'Motorola', 'POCO', 'Tecno', 'Infinix'];

  const popularBrands = brands.filter((b) =>
    POPULAR_BRAND_NAMES.some((p) => b.name.toLowerCase() === p.toLowerCase()),
  );

  const filtered = search
    ? brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : brands;

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        ¿Cuál es tu marca?
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Selecciona la marca de tu celular
      </p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={`brand-skeleton-${String(i)}`} variant="card" className="h-20" />
          ))}
        </div>
      ) : (
        <>
          {/* Marcas más populares — acceso rápido */}
          {!search && popularBrands.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-heading uppercase tracking-[0.15em] text-fire-400/70 mb-3">
                Más populares
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {popularBrands.map((brand) => (
                  <button
                    key={`popular-${brand.slug}`}
                    onClick={() => selectBrand(brand.name)}
                    className={cn(
                      'glass-hover p-4 text-center transition-all min-h-[56px]',
                      'hover:border-fire-500/30 border border-fire-500/10',
                    )}
                  >
                    <p className="font-display font-bold text-white text-sm">{brand.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{brand.count} modelos</p>
                  </button>
                ))}
              </div>
              {/* Separador sutil */}
              <div className="divider-gradient my-5" />
            </div>
          )}

          {/* Buscador */}
          <Input
            placeholder="Buscar marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-5"
          />

          {/* Grid completo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((brand) => (
              <button
                key={brand.slug}
                onClick={() => selectBrand(brand.name)}
                className={cn(
                  'glass-hover p-4 text-center transition-all min-h-[44px]',
                  'hover:border-fire-500/30',
                )}
              >
                <p className="font-display font-bold text-white">{brand.name}</p>
                <p className="text-xs text-slate-500 mt-1">{brand.count} dispositivos</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-sm text-slate-500 py-8">
                No se encontraron marcas para &quot;{search}&quot;
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
