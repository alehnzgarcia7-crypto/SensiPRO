import { cn } from '@/lib/cn';

type BadgeVariant = 'free' | 'premium' | 'vip' | 'aggressive' | 'balanced' | 'sniper' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  free: 'badge-free',
  premium: 'badge-premium shadow-glow-premium',
  vip: 'badge-vip shadow-glow-vip',
  aggressive: 'badge-aggressive',
  balanced: 'badge-balanced',
  sniper: 'badge-sniper',
  default: 'bg-white/5 text-slate-400 border border-white/10',
};

export function Badge({ variant = 'default', size = 'sm', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-ui font-semibold uppercase tracking-wider',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
