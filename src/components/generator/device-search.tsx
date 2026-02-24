'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { DeviceTier } from '@prisma/client';

import { useDeviceSearch } from '@/hooks/use-device-search';
import { useGeneratorStore } from '@/stores/generator.store';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

interface DeviceItem {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  screenHz: number;
  ramGb: number;
  isPopular: boolean;
}

function getTierBadgeVariant(tier: DeviceTier): 'vip' | 'premium' | 'free' {
  if (tier === 'GAMING') return 'vip';
  if (tier === 'HIGH' || tier === 'ULTRA') return 'premium';
  return 'free';
}

export function DeviceSearch() {
  const { query, setQuery, results, isSearching, popular, popularLoading } = useDeviceSearch();
  const { selectBrand, selectDevice } = useGeneratorStore();
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const showResults = isFocused && query.length >= 2;
  const items: DeviceItem[] = showResults ? results : [];

  const handleSelect = (device: DeviceItem) => {
    selectBrand(device.brand);
    selectDevice({
      id: device.id,
      brand: device.brand,
      model: device.model,
      slug: device.slug,
      tier: device.tier,
      screenHz: device.screenHz,
      ramGb: device.ramGb,
    });
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0 && items[highlightIndex]) {
      e.preventDefault();
      handleSelect(items[highlightIndex]);
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  // Reset highlight cuando cambian los resultados
  useEffect(() => setHighlightIndex(-1), [results]);

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar cualquier dispositivo..."
          className="w-full rounded-gaming bg-background-card border border-white/10 pl-10 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[48px]"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown de autocomplete */}
      {showResults && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-2 glass max-h-80 overflow-y-auto"
        >
          {isSearching ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rect" className="h-14" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 text-center">
              No se encontraron dispositivos para &ldquo;{query}&rdquo;
            </p>
          ) : (
            items.map((device, i) => (
              <button
                key={device.id}
                onMouseDown={() => handleSelect(device)}
                className={cn(
                  'w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors min-h-[44px]',
                  i === highlightIndex && 'bg-white/5',
                  i < items.length - 1 && 'border-b border-white/5',
                )}
              >
                <div>
                  <p className="text-sm font-display font-bold text-white">
                    {device.brand} {device.model}
                  </p>
                  <p className="text-xs text-slate-500">{device.screenHz}Hz &bull; {device.ramGb}GB</p>
                </div>
                <Badge
                  variant={getTierBadgeVariant(device.tier)}
                  size="sm"
                >
                  {device.tier}
                </Badge>
              </button>
            ))
          )}
        </div>
      )}

      {/* Dispositivos populares (cuando no está buscando) */}
      {!showResults && (
        <div className="mt-6">
          <p className="text-xs font-ui font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Populares
          </p>
          {popularLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rect" className="h-14" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {popular.map((device) => (
                <button
                  key={device.id}
                  onClick={() => handleSelect(device)}
                  className="glass-hover p-3 text-left min-h-[44px]"
                >
                  <p className="text-xs text-slate-500">{device.brand}</p>
                  <p className="text-sm font-display font-bold text-white truncate">{device.model}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
