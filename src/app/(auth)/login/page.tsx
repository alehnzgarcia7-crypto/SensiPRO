'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ttIdentifyUser } from '@/lib/analytics';
import { loginUser } from '@/lib/auth/auth.actions';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await loginUser(formData);
      // TikTok: Advanced Matching — identifica al usuario por email
      const email = formData.get('email') as string;
      ttIdentifyUser({ email });
      router.push('/generator');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-gradient-fire-ice">
          Iniciar Sesion
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Accede a tu cuenta de Sensibilidades PRO
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-gaming bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Contrasena
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gaming w-full bg-gradient-fire-ice text-white font-bold disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Entrando...
            </span>
          ) : (
            'Iniciar Sesion'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        No tienes cuenta?{' '}
        <Link href="/register" className="text-fire-500 hover:text-fire-400 font-medium">
          Registrate gratis
        </Link>
      </p>

      <div className="mt-4 pt-4 border-t border-white/5 text-center">
        <Link
          href="/recovery"
          className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
        >
          ¿Ya pagaste? Recupera tu acceso
        </Link>
      </div>
    </div>
  );
}
