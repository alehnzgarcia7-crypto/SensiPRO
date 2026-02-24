'use client';

import { useState, useEffect } from 'react';
import type { DeviceTier } from '@prisma/client';

import { useGeneratorStore } from '@/stores/generator.store';
import { Input } from '@/components/ui/input';
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

function tierBadgeVariant(tier: DeviceTier): 'vip' | 'premium' | 'free' {
  if (tier === 'GAMING' || tier === 'ULTRA') return 'vip';
  if (tier === 'HIGH') return 'premium';
  return 'free';
}

export function DeviceStep() {
  const { selectedBrand, selectDevice } = useGeneratorStore();
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedBrand) return;
    fetch(`/api/devices?brand=${encodeURIComponent(selectedBrand)}&limit=100`)
      .then((r) => r.json())
      .then((data: { data?: DeviceItem[] }) => setDevices(data.data ?? []))
      .finally(() => setLoading(false));
  }, [selectedBrand]);

  const filtered = search
    ? devices.filter((d) => d.model.toLowerCase().includes(search.toLowerCase()))
    : devices;

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        Elige tu {selectedBrand}
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Selecciona tu modelo exacto
      </p>

      <Input
        placeholder={`Buscar modelo ${selectedBrand ?? ''}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`device-skeleton-${String(i)}`} variant="rect" className="h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((device) => (
            <button
              key={device.id}
              onClick={() => selectDevice({
                id: device.id,
                brand: device.brand,
                model: device.model,
                slug: device.slug,
                tier: device.tier,
                screenHz: device.screenHz,
                ramGb: device.ramGb,
              })}
              className={cn(
                'w-full glass-hover p-4 flex items-center justify-between min-h-[44px]',
              )}
            >
              <div className="text-left">
                <p className="font-display font-bold text-white text-sm">{device.model}</p>
                <p className="text-xs text-slate-500">{device.screenHz}Hz &bull; {device.ramGb}GB RAM</p>
              </div>
              <div className="flex items-center gap-2">
                {device.isPopular && (
                  <span className="text-[10px] text-fire-400 font-ui">Popular</span>
                )}
                <Badge variant={tierBadgeVariant(device.tier)} size="sm">
                  {device.tier}
                </Badge>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-8">
              No se encontraron modelos para &quot;{search}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
