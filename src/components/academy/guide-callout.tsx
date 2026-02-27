// ═══════════════════════════════════════════════════════════════
// Callout boxes para guías — PRO TIP, ERROR COMÚN, DATO CLAVE, IMPORTANTE
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, Info, Lightbulb, ShieldAlert } from 'lucide-react';

import type { CalloutVariant } from '@/lib/academy/guide-content';
import { cn } from '@/lib/cn';

interface GuideCalloutProps {
  variant: CalloutVariant;
  content: string;
}

const CALLOUT_CONFIG: Record<
  CalloutVariant,
  {
    label: string;
    icon: typeof Lightbulb;
    borderColor: string;
    bgColor: string;
    textColor: string;
    iconColor: string;
    glowColor: string;
  }
> = {
  'pro-tip': {
    label: 'PRO TIP',
    icon: Lightbulb,
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/[0.07]',
    textColor: 'text-cyan-300',
    iconColor: 'text-cyan-400',
    glowColor: 'shadow-[0_0_16px_rgba(6,182,212,0.1)]',
  },
  error: {
    label: 'ERROR COMÚN',
    icon: AlertTriangle,
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-500/[0.07]',
    textColor: 'text-red-300',
    iconColor: 'text-red-400',
    glowColor: 'shadow-[0_0_16px_rgba(239,68,68,0.1)]',
  },
  'dato-clave': {
    label: 'DATO CLAVE',
    icon: Info,
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/[0.07]',
    textColor: 'text-amber-300',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-[0_0_16px_rgba(245,158,11,0.1)]',
  },
  importante: {
    label: 'IMPORTANTE',
    icon: ShieldAlert,
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/[0.07]',
    textColor: 'text-purple-300',
    iconColor: 'text-purple-400',
    glowColor: 'shadow-[0_0_16px_rgba(168,85,247,0.1)]',
  },
};

export function GuideCallout({ variant, content }: GuideCalloutProps) {
  const config = CALLOUT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 my-4',
        config.borderColor,
        config.bgColor,
        config.glowColor,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              'inline-block text-[10px] font-[family-name:var(--font-rajdhani)] font-bold uppercase tracking-wider mb-1',
              config.textColor,
            )}
          >
            {config.label}
          </span>
          <p className="text-sm text-slate-300 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
