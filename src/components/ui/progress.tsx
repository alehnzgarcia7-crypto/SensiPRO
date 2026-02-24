import { cn } from '@/lib/cn';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'fire' | 'ice' | 'gradient' | 'success';
  className?: string;
}

const colorClasses = {
  fire: 'bg-fire-500',
  ice: 'bg-ice-500',
  gradient: 'bg-gradient-fire-ice',
  success: 'bg-success',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-5',
};

export function Progress({ value, max = 100, size = 'md', showLabel, color = 'gradient', className }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs font-ui text-slate-400">
          <span>{Math.round(percentage)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-white/5 overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
