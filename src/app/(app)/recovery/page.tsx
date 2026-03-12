/**
 * /recovery — Página de recuperación de acceso premium
 *
 * Para usuarios que ya pagaron pero no pueden acceder.
 * Busca su PremiumLicense por email y les indica qué hacer.
 */

'use client';

import { motion } from 'framer-motion';
import { Search, Crown, AlertCircle, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback } from 'react';

import { usePremiumContext } from '@/providers/premium-provider';

type RecoveryState = 'input' | 'checking' | 'found_no_account' | 'found_has_account' | 'not_found';

export default function RecoveryPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<RecoveryState>('input');
  const [error, setError] = useState<string | null>(null);
  const { unlock } = usePremiumContext();

  const handleSearch = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Ingresa un email válido');
      return;
    }

    setError(null);
    setState('checking');

    try {
      // Verificar si tiene licencia premium
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.isPremium) {
        setState('not_found');
        return;
      }

      // Tiene licencia — verificar si tiene cuenta
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        // Tiene cuenta — restaurar acceso via cookie y dirigir a login
        unlock(trimmed);
        setState('found_has_account');
      } else {
        // Tiene licencia pero no cuenta — dirigir a registro
        unlock(trimmed);
        setState('found_no_account');
      }
    } catch {
      setError('Error verificando. Intenta de nuevo.');
      setState('input');
    }
  }, [email, unlock]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-md w-full p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <KeyRound className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif]">
            Recuperar Acceso
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ingresa el email con el que pagaste
          </p>
        </div>

        {/* INPUT STATE */}
        {state === 'input' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="tu@email.com"
                autoComplete="email"
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}

            <motion.button
              onClick={handleSearch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Buscar mi licencia
            </motion.button>
          </div>
        )}

        {/* CHECKING */}
        {state === 'checking' && (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 text-cyan-400 mx-auto animate-spin mb-3" />
            <p className="text-sm text-slate-400">Buscando tu licencia...</p>
          </div>
        )}

        {/* FOUND — HAS ACCOUNT */}
        {state === 'found_has_account' && (
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Crown className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Licencia encontrada</h2>
            <p className="text-sm text-slate-400">
              Tu cuenta con <span className="text-white">{email}</span> ya tiene acceso premium.
              Inicia sesión para acceder.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all"
            >
              Iniciar sesión
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* FOUND — NO ACCOUNT */}
        {state === 'found_no_account' && (
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Crown className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Licencia encontrada</h2>
            <p className="text-sm text-slate-400">
              Encontramos tu licencia para <span className="text-white">{email}</span>.
              Crea tu cuenta con este email para acceder.
            </p>
            <Link
              href={`/register?email=${encodeURIComponent(email)}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all"
            >
              Crear cuenta
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* NOT FOUND */}
        {state === 'not_found' && (
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-yellow-400" />
            </div>
            <h2 className="text-lg font-bold text-white">No encontramos licencia</h2>
            <p className="text-sm text-slate-400">
              No hay una licencia premium asociada a <span className="text-white">{email}</span>.
              ¿Usaste otro email para pagar?
            </p>
            <button
              onClick={() => { setState('input'); setEmail(''); }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all cursor-pointer"
            >
              Intentar con otro email
            </button>
          </motion.div>
        )}

        {/* Volver */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Volver al login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
