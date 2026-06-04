import { notFound } from 'next/navigation';

import { AresV6LabShell } from '@/components/ares-v6-lab';
import {
  assertCanViewAresV6InternalUi,
  maybeGetAresV6InternalUiOperatorContext,
} from '@/lib/ares-v6/internal-ui-access';
import { getAresV6InternalDashboardData } from '@/lib/ares-v6/internal-ui-service';

import { previewAresV6GenerationAction } from './actions';

// ═══════════════════════════════════════════════════════════════
// /internal/ares-v6 — Hidden internal read-only lab (Fase 3E)
//
// Server Component. Gated by ARES_V6_INTERNAL_UI_ENABLED (+ production protection
// ack). 404s when off. Never cached (force-dynamic) so the flag is read per
// request. noindex/nofollow. No public nav, no sitemap entry. READ-ONLY.
// ═══════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic';

// Untyped object (repo convention, e.g. command-center) so the `next` root types
// — which would make NODE_ENV required in this isolated tsconfig — are not pulled in.
export const metadata = {
  title: 'ARES v6 · Command Lab',
  robots: { index: false, follow: false },
};

export default async function AresV6InternalLabPage() {
  // Server-side gate. Renders the 404 when the UI flag is off / prod unprotected.
  assertCanViewAresV6InternalUi();

  const operator = maybeGetAresV6InternalUiOperatorContext();
  if (!operator) {
    // Unreachable after the assert, but keeps the type non-null and fails closed.
    notFound();
  }

  const data = await getAresV6InternalDashboardData();

  return <AresV6LabShell data={data} operator={operator} previewAction={previewAresV6GenerationAction} />;
}
