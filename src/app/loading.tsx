export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-fire-500/30 border-t-fire-500 animate-spin" />
        <p className="text-sm text-slate-500 font-ui">Cargando...</p>
      </div>
    </main>
  );
}
