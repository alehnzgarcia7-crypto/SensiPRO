'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — AnimatedBorder — Borde con gradiente rotatorio (signature)
// Conic gradient que rota: naranja → cyan → púrpura → naranja
// ═══════════════════════════════════════════════════════════════

import { cn } from '@/lib/cn';

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
}

const speedMap = {
  slow: '6s',
  normal: '4s',
  fast: '2s',
};

export function AnimatedBorder({ children, className, active = true, speed = 'normal' }: AnimatedBorderProps) {
  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('animated-border-wrapper', className)}>
      {/* Gradiente rotatorio — conic gradient */}
      <div
        className="animated-border-gradient"
        style={{ animationDuration: speedMap[speed] }}
      />
      {/* Contenido interior con background sólido */}
      <div className="animated-border-content">
        {children}
      </div>
    </div>
  );
}
