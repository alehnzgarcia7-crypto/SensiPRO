'use client';

import type { DeviceTier } from '@prisma/client';
import { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { trackEvent, INTERNAL_EVENTS, ttSearch } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { useGeneratorStore } from '@/stores/generator.store';

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

export function DeviceStep() {
  const { selectedBrand, selectDevice: rawSelectDevice } = useGeneratorStore();
  const selectDevice = (device: Parameters<typeof rawSelectDevice>[0]) => {
    trackEvent({ event: INTERNAL_EVENTS.MODEL_SELECTED, properties: { brand: device.brand, model: device.model } });
    ttSearch(`${device.brand} ${device.model}`);
    rawSelectDevice(device);
  };
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

  const popularDevices = filtered.filter((d) => d.isPopular);
  const otherDevices = filtered.filter((d) => !d.isPopular);

  const renderDeviceButton = (device: DeviceItem) => (
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
      </div>
      {device.isPopular && (
        <span className="text-[10px] text-fire-400 font-ui">Popular</span>
      )}
    </button>
  );

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        Selecciona tu modelo
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        {selectedBrand} &mdash; {filtered.length} modelos disponibles
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
          {/* Modelos más buscados */}
          {popularDevices.length > 0 && (
            <>
              <p className="text-xs font-heading uppercase tracking-[0.15em] text-fire-400/70 mb-2 mt-1">
                Más buscados
              </p>
              {popularDevices.map(renderDeviceButton)}
              {otherDevices.length > 0 && (
                <div className="divider-gradient my-4" />
              )}
            </>
          )}

          {/* Resto de modelos */}
          {otherDevices.map(renderDeviceButton)}

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
