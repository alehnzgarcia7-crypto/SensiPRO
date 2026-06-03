import type { ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// Internal ARES v6 lab layout (Fase 3E)
//
// noindex/nofollow at the layout level (cascades to all children). The wrapper is
// deliberately NEUTRAL: the "internal/read-only" reveal lives in the dashboard
// shell, so a stealth 404 (rendered inside this layout) never advertises the lab.
// No public navigation is rendered or linked.
// ═══════════════════════════════════════════════════════════════

// Untyped object (repo convention) — avoids importing the `next` root types into
// the isolated ares-v6 tsconfig program. noindex/nofollow cascades to children.
export const metadata = {
  title: {
    default: 'ARES v6 · Command Lab',
    template: '%s · ARES v6 Lab',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AresV6InternalLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#050810] text-slate-200">{children}</div>;
}
