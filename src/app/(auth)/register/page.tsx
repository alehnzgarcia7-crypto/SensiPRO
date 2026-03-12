'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

import { registerUser } from '@/lib/auth/auth.actions';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      await registerUser(formData);
      router.push('/generator');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-gradient-fire-ice">
          Crear Cuenta
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Unete a la comunidad #1 de Free Fire
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-gaming bg-danger/10 border border-danger/20 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-ui font-medium text-slate-300 mb-1.5">
            Nombre de usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="tu_username"
          />
        </div>

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
            defaultValue={prefillEmail}
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
            autoComplete="new-password"
            minLength={6}
            className="w-full rounded-gaming bg-background-card border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-fire-500/50 focus:outline-none focus:ring-1 focus:ring-fire-500/30 min-h-[44px]"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-slate-500">Minimo 6 caracteres</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gaming w-full bg-gradient-fire-ice text-white font-bold disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Creando cuenta...
            </span>
          ) : (
            'Crear Cuenta Gratis'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="text-ice-500 hover:text-ice-400 font-medium">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="glass p-8 text-center">
        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
