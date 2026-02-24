'use client';

import { useState, useEffect } from 'react';

import { useGeneratorStore } from '@/stores/generator.store';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

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

  const filtered = search
    ? brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : brands;

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        ¿Cual es tu marca?
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Selecciona la marca de tu celular
      </p>

      <Input
        placeholder="Buscar marca..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={`brand-skeleton-${String(i)}`} variant="card" className="h-20" />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}
