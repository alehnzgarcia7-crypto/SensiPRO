import type { DeviceTier } from '@ares/database';
import { prisma } from '@ares/database';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

interface PopularDevice {
  id: string;
  brand: string;
  model: string;
  slug: string;
  tier: DeviceTier;
  screenHz: number;
  ramGb: number;
}

async function getPopularDevices(): Promise<PopularDevice[]> {
  return prisma.device.findMany({
    where: { isPopular: true },
    take: 8,
    orderBy: { brand: 'asc' },
    select: {
      id: true,
      brand: true,
      model: true,
      slug: true,
      tier: true,
      screenHz: true,
      ramGb: true,
    },
  });
}

function tierBadgeVariant(tier: DeviceTier): 'vip' | 'premium' | 'free' {
  if (tier === 'GAMING') return 'vip';
  if (tier === 'HIGH' || tier === 'ULTRA') return 'premium';
  return 'free';
}

export async function DevicePreviewSection() {
  const devices = await getPopularDevices();

  return (
    <section className="py-20 px-4 border-y border-white/5">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white">
          Dispositivos populares
        </h2>
        <p className="mt-3 text-center text-slate-400">
          Algunos de los 500+ dispositivos que soportamos
        </p>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {devices.map((device) => (
            <Link
              key={device.id}
              href={`/devices/${device.slug}`}
              className="glass-hover p-4 text-center group"
            >
              <p className="text-xs text-slate-500 font-ui">{device.brand}</p>
              <p className="mt-1 font-display font-bold text-white group-hover:text-fire-400 transition-colors text-sm">
                {device.model}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Badge variant={tierBadgeVariant(device.tier)} size="sm">
                  {device.tier}
                </Badge>
                <span className="text-[10px] text-slate-600">{device.screenHz}Hz</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/generator"
            className="text-sm text-fire-500 hover:text-fire-400 font-medium transition-colors"
          >
            Ver todos los dispositivos →
          </Link>
        </div>
      </div>
    </section>
  );
}
