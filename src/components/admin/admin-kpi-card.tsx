import { cn } from '@/lib/cn';

interface AdminKpiCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: 'fire' | 'ice' | 'gradient';
}

export function AdminKpiCard({ label, value, sublabel, color = 'fire' }: AdminKpiCardProps) {
  return (
    <div className="glass p-5">
      <p className="text-xs font-ui text-slate-500 uppercase tracking-wider">{label}</p>
      <p
        className={cn(
          'text-3xl font-display font-black mt-1',
          color === 'gradient'
            ? 'text-gradient-fire-ice'
            : color === 'ice'
              ? 'text-ice-500'
              : 'text-white',
        )}
      >
        {value}
      </p>
      {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
    </div>
  );
}
