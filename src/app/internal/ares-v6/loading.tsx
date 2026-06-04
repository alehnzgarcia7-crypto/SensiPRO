// ═══════════════════════════════════════════════════════════════
// Internal ARES v6 lab — loading skeleton (Fase 3E)
// ═══════════════════════════════════════════════════════════════

export default function AresV6InternalLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 md:px-6" aria-busy aria-label="Cargando laboratorio ARES v6">
      <div className="h-32 animate-pulse rounded-gaming border border-white/5 bg-[#0a0f1e]/80" />
      <div className="h-48 animate-pulse rounded-gaming border border-white/5 bg-[#0a0f1e]/80" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-gaming border border-white/5 bg-[#0a0f1e]/80" />
        <div className="h-64 animate-pulse rounded-gaming border border-white/5 bg-[#0a0f1e]/80" />
      </div>
      <div className="h-40 animate-pulse rounded-gaming border border-white/5 bg-[#0a0f1e]/80" />
    </div>
  );
}
