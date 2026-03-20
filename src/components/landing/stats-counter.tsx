'use client';

import { useEffect, useState, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// StatsCounter — 4 real metrics, count-up on viewport entry,
// Orbitron font, gradient numbers, glow separator
// ═══════════════════════════════════════════════════════════════

interface StatDef {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  icon: string;
}

const STATS: StatDef[] = [
  { value: 612, suffix: '+', label: 'Dispositivos calibrados', icon: '📱' },
  { value: 21, suffix: '', label: 'Marcas soportadas', icon: '🏷️' },
  { value: 22, suffix: ',000+', label: 'Valores calibrados', icon: '🎯' },
];

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatItem({ stat }: { stat: StatDef }) {
  const { count, ref } = useCountUp(stat.value);

  return (
    <div ref={ref} className="text-center py-4">
      <div className="text-2xl mb-2 opacity-60">{stat.icon}</div>
      <div className="font-heading font-bold text-4xl md:text-5xl bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
        {stat.prefix ?? ''}{count.toLocaleString()}{stat.suffix ?? ''}
      </div>
      <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
    </div>
  );
}

export function StatsCounter() {
  return (
    <section className="py-16 md:py-20 relative">
      {/* Sutil spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-3 gap-6 md:gap-0 relative">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="relative">
              <StatItem stat={stat} />
              {/* Separador vertical (solo desktop, no en el último) */}
              {i < STATS.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-[1px]">
                  <div className="h-full w-full bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Glow line debajo */}
      <div className="mt-16 mx-auto max-w-md h-[1px]" style={{
        background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent)',
      }} />
    </section>
  );
}
