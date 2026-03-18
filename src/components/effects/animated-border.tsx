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

export function AnimatedBorder({ children, className, active = true }: AnimatedBorderProps) {
  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('animated-border-wrapper', className)}>
      {/* Gradiente estático — conic gradient sin rotación */}
      <div className="animated-border-gradient" style={{ animation: 'none' }} />
      {/* Contenido interior con background sólido */}
      <div className="animated-border-content">
        {children}
      </div>
    </div>
  );
}
