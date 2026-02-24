import { prisma } from '@ares/database';

import { CountUp } from '@/components/effects/count-up';

interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

async function getStats(): Promise<{ deviceCount: number; brandCount: number }> {
  const [deviceCount, brandCount] = await Promise.all([
    prisma.device.count(),
    prisma.device.groupBy({ by: ['brand'] }).then((b: { brand: string }[]) => b.length),
  ]);
  return { deviceCount, brandCount };
}

export async function StatsSection() {
  const stats = await getStats();

  const items: StatItem[] = [
    { value: stats.deviceCount, suffix: '+', label: 'Dispositivos' },
    { value: stats.brandCount, label: 'Marcas' },
    { value: 3, label: 'Estilos de juego' },
    { value: 6, label: 'Valores de sensibilidad' },
  ];

  return (
    <section className="py-16 border-y border-white/5">
      <div className="mx-auto max-w-5xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-3xl md:text-4xl font-display font-black text-gradient-fire-ice">
              <CountUp end={item.value} suffix={item.suffix} />
            </div>
            <div className="mt-1 text-sm text-slate-500 font-ui">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
