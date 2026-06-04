import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import {
  clampPercent,
  toneBarClass,
  toneBadgeClass,
  toneDotClass,
  toneTextClass,
  type AresV6Tone,
} from './presenters';

// ═══════════════════════════════════════════════════════════════
// ARES v6 lab — Presentational primitives (Fase 3E)
//
// Pure, SSR-renderable building blocks. No 'use client', no hooks, no server
// imports — safe to render from both Server Components and the client console.
// ═══════════════════════════════════════════════════════════════

export interface AresV6SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** A premium glass section with a titled header. The visual unit of the lab. */
export function AresV6SectionCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  className,
  children,
}: AresV6SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-gaming border border-white/5 bg-[#0a0f1e]/80 shadow-card backdrop-blur-sm',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#00c8ff]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          ) : null}
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-100">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}
          </div>
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export interface AresV6EmptyStateProps {
  title: string;
  message?: string;
  icon?: LucideIcon;
}

/** Safe empty state — used when a panel has no data to show. */
export function AresV6EmptyState({ title, message, icon: Icon = Inbox }: AresV6EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 px-6 py-8 text-center">
      <Icon className="h-6 w-6 text-slate-500" aria-hidden />
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {message ? <p className="max-w-md text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}

export interface AresV6ToneBadgeProps {
  tone: AresV6Tone;
  children: ReactNode;
  className?: string;
}

/** Generic tone pill used by the GO/NO-GO and risk badges. */
export function AresV6Badge({ tone, children, className }: AresV6ToneBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wider',
        toneBadgeClass(tone),
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', toneDotClass(tone))} aria-hidden />
      {children}
    </span>
  );
}

export interface AresV6StatPillProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: AresV6Tone;
}

/** A compact metric pill: label on top, big mono value below. */
export function AresV6StatPill({ label, value, hint, tone = 'neutral' }: AresV6StatPillProps) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn('mt-1 font-mono text-lg font-semibold', toneTextOrSlate(tone))}>{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

function toneTextOrSlate(tone: AresV6Tone): string {
  return tone === 'neutral' ? 'text-slate-100' : toneTextClass(tone);
}

export interface AresV6BarProps {
  label: string;
  value: ReactNode;
  barPercent: number;
  tone?: AresV6Tone;
}

/** A labeled horizontal bar (sensitivity values, rates, etc.). */
export function AresV6Bar({ label, value, barPercent, tone = 'info' }: AresV6BarProps) {
  const pct = clampPercent(barPercent);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-slate-300">{label}</span>
        <span className="font-mono text-sm font-semibold text-slate-100">{value}</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/5"
        role="meter"
        aria-label={label}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn('h-full rounded-full', toneBarClass(tone))} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export interface AresV6KeyValueProps {
  label: string;
  value: ReactNode;
}

export function AresV6KeyValue({ label, value }: AresV6KeyValueProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono text-slate-100">{value}</span>
    </div>
  );
}
