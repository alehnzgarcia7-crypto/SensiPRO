import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'rect';
}

const variantDefaults = {
  text: 'h-4 w-full rounded',
  card: 'h-40 w-full rounded-gaming',
  avatar: 'h-10 w-10 rounded-full',
  rect: 'h-20 w-full rounded-gaming',
};

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer bg-white/5',
        variantDefaults[variant],
        className,
      )}
    />
  );
}
