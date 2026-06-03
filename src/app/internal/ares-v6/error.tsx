'use client';

import { RotateCcw } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Internal ARES v6 lab — error boundary (Fase 3E)
//
// Safe by design: it NEVER renders the error message or stack (which could leak
// internals). Only the non-sensitive Next error digest is shown as a reference.
// ═══════════════════════════════════════════════════════════════

export default function AresV6InternalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-lg font-semibold text-slate-200">No se pudo cargar el laboratorio</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Ocurrió un error al construir la vista. El detalle no se muestra por seguridad.
      </p>
      <p className="font-mono text-[11px] text-slate-600">Referencia: {error.digest ?? '—'}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Reintentar
      </button>
    </div>
  );
}
