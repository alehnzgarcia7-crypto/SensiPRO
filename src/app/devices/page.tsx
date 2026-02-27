import { prisma } from '@ares/database';
import type { Metadata } from 'next';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Todos los Dispositivos',
  description: 'Explora 500+ dispositivos con sensibilidades calibradas para Free Fire.',
};

interface DeviceSummary {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: 'LOW' | 'MID' | 'HIGH' | 'ULTRA' | 'GAMING';
  screenHz: number;
  isPopular: boolean;
}

function getTierBadgeVariant(tier: DeviceSummary['tier']): 'vip' | 'premium' | 'free' {
  if (tier === 'GAMING') return 'vip';
  if (tier === 'ULTRA' || tier === 'HIGH') return 'premium';
  return 'free';
}

async function getDevicesByBrand(): Promise<Record<string, DeviceSummary[]>> {
  const devices = await prisma.device.findMany({
    orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    select: { id: true, brand: true, model: true, slug: true, tier: true, screenHz: true, isPopular: true },
  });

  const grouped: Record<string, DeviceSummary[]> = {};
  for (const d of devices) {
    const existing = grouped[d.brand];
    if (existing) {
      existing.push(d);
    } else {
      grouped[d.brand] = [d];
    }
  }
  return grouped;
}

export default async function DevicesPage() {
  const grouped = await getDevicesByBrand();
  const totalDevices = Object.values(grouped).reduce((sum, d) => sum + d.length, 0);
  const totalBrands = Object.keys(grouped).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-2">Dispositivos</h1>
      <p className="text-slate-400 mb-8">
        {totalDevices}+ dispositivos de {totalBrands} marcas
      </p>

      {Object.entries(grouped).map(([brand, devices]) => (
        <section key={brand} className="mb-10">
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            {brand}
            <span className="text-sm font-normal text-slate-500">({devices.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {devices.map((d) => (
              <Link
                key={d.id}
                href={`/devices/${d.slug}`}
                className="glass-hover p-3 text-center group min-h-[44px]"
              >
                <p className="text-sm font-display font-bold text-white group-hover:text-fire-400 transition-colors truncate">
                  {d.model}
                </p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <Badge variant={getTierBadgeVariant(d.tier)} size="sm">
                    {d.tier}
                  </Badge>
                  <span className="text-[10px] text-slate-600">{d.screenHz}Hz</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
