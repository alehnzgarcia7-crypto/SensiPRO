import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-8xl font-display font-bold text-gradient-fire-ice">404</h1>
      <p className="mt-4 text-lg text-slate-400">Esta página no existe</p>
      <Link
        href="/"
        className="mt-6 btn-gaming bg-gradient-fire-ice text-white"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
