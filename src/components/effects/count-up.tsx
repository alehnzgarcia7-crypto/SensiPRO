'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — CountUp — Animación numérica con re-trigger al cambiar
// Soporta CountUp y CountDown suave con easeOutCubic
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function CountUp({ end, duration = 600, className, suffix }: CountUpProps) {
  const [count, setCount] = useState(end);
  const prevEnd = useRef(end);
  const animFrame = useRef<number>(0);

  useEffect(() => {
    const from = prevEnd.current;
    prevEnd.current = end;

    if (from === end) return;

    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (end - from) * eased));
      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate);
      }
    };
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [end, duration]);

  return (
    <span className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}
