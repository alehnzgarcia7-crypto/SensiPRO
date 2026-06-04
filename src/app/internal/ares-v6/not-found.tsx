import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// Internal ARES v6 lab — stealth 404 (Fase 3E)
//
// Deliberately GENERIC. When the UI flag is off (or production is unprotected)
// the guard calls notFound() and this page renders — it must look like any other
// missing page and never reveal that an ARES v6 lab exists at this path.
// ═══════════════════════════════════════════════════════════════

export default function AresV6InternalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-6xl font-bold text-slate-700">404</p>
      <h1 className="text-lg font-semibold text-slate-200">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-slate-500">
        La página que buscas no existe o no está disponible.
      </p>
      <Link
        href="/"
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
