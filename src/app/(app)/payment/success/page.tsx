/**
 * /payment/success — Página de éxito post-pago
 *
 * Maneja TODOS los escenarios posibles:
 *
 * ESCENARIO 1: Usuario logueado + pago exitoso → unlock inmediato
 * ESCENARIO 2: Sin cuenta + pago exitoso → formulario de registro inline
 * ESCENARIO 3: Tiene cuenta pero no logueado → formulario de login inline
 * ESCENARIO 4: OXXO pendiente → instrucciones de pago
 * ESCENARIO 5: Mercado Pago → verificar y desbloquear
 */

'use client';

import { motion } from 'framer-motion';
import {
  Crown, Sparkles, ArrowRight, Clock, Loader2,
  AlertCircle, User, Lock, Eye, EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, Suspense } from 'react';

import { usePremiumContext } from '@/providers/premium-provider';

// ═══════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════

type PageState =
  | 'verifying'
  | 'success_logged_in'
  | 'needs_register'
  | 'needs_login'
  | 'oxxo_pending'
  | 'error';

interface VerifyResult {
  success: boolean;
  email: string;
  isPremium: boolean;
  hasAccount: boolean;
  username?: string;
  status?: string;
}

// ═══════════════════════════════════════════════════════
// CONFETTI PARTICLES
// ═══════════════════════════════════════════════════════

function ConfettiParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#06b6d4', '#8b5cf6', '#fbbf24', '#10b981', '#f43f5e'][i % 5],
            left: `${(i * 3.3) % 100}%`,
            top: '-5%',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, ((i % 7) - 3) * 30],
            rotate: [0, (i % 4) * 180],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: (i % 10) * 0.3,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// FORMULARIO DE REGISTRO POST-PAGO
// ═══════════════════════════════════════════════════════

function PostPaymentRegister({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = useCallback(async () => {
    if (!username.trim() || !password) {
      setError('Completa todos los campos');
      return;
    }
    if (username.trim().length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Paso 1: Crear la cuenta
      const registerRes = await fetch('/api/auth/register-post-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          username: username.trim(),
          password,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Error al crear la cuenta');
      }

      // Paso 2: Auto-signin
      const signInResult = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('Cuenta creada pero hubo un error al iniciar sesión. Intenta iniciar sesión manualmente.');
      }

      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear la cuenta';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [email, username, password, onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
          <Crown className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif]">
          Pago Confirmado
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Crea tu cuenta para acceder a tu sensibilidad
        </p>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Email de tu licencia</label>
        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
          {email}
        </div>
      </div>

      {/* Username */}
      <div>
        <label htmlFor="reg-username" className="text-xs text-slate-400 mb-1 block">
          Nombre de usuario
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            placeholder="tu_username"
            autoComplete="username"
            minLength={3}
            maxLength={30}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="reg-password" className="text-xs text-slate-400 mb-1 block">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            minLength={6}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}

      <motion.button
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          <>
            CREAR CUENTA Y ACCEDER
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// FORMULARIO DE LOGIN POST-PAGO
// ═══════════════════════════════════════════════════════

function PostPaymentLogin({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async () => {
    if (!password) {
      setError('Ingresa tu contraseña');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Contraseña incorrecta');
      }

      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [email, password, onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
          <Crown className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif]">
          Pago Confirmado
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Ya tienes cuenta. Inicia sesión para acceder.
        </p>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="text-xs text-slate-400 mb-1 block">Tu cuenta</label>
        <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
          {email}
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="login-password" className="text-xs text-slate-400 mb-1 block">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            autoFocus
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}

      <motion.button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          <>
            INICIAR SESIÓN Y ACCEDER
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// CONTENIDO PRINCIPAL
// ═══════════════════════════════════════════════════════

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const provider = searchParams.get('provider');
  const status = searchParams.get('status');
  const router = useRouter();

  const { unlock, verifyPremium } = usePremiumContext();
  const { data: session, update: updateSession } = useSession();

  const [pageState, setPageState] = useState<PageState>('verifying');
  const [email, setEmail] = useState<string | null>(null);

  // ─── Verificación inicial ──────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        // ── STRIPE ──
        if (sessionId) {
          const res = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
          const data: VerifyResult = await res.json();

          if (cancelled) return;

          if (data.success && data.email) {
            setEmail(data.email);


            // Si el usuario ya está logueado con el mismo email (o cualquier email)
            if (session?.user?.email) {
              unlock(data.email);
              setPageState('success_logged_in');
            } else if (data.hasAccount) {
              setPageState('needs_login');
            } else {
              setPageState('needs_register');
            }
          } else if (data.status === 'unpaid') {
            // OXXO pendiente
            setEmail(data.email ?? null);
            setPageState('oxxo_pending');
          } else {
            setPageState('error');
          }
          return;
        }

        // ── MERCADO PAGO ──
        if (provider === 'mercadopago') {
          if (status === 'pending') {
            setPageState('oxxo_pending');
            return;
          }

          // MP aprobado — el webhook ya activó la licencia
          const capturedEmail = sessionStorage.getItem('sensipro_captured_email');
          if (capturedEmail) {
            const isPremium = await verifyPremium(capturedEmail);
            if (cancelled) return;

            if (isPremium) {
              setEmail(capturedEmail);

              if (session?.user?.email) {
                unlock(capturedEmail);
                setPageState('success_logged_in');
              } else {
                // Verificar si tiene cuenta
                const checkRes = await fetch('/api/auth/check-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: capturedEmail }),
                });
                const checkData = await checkRes.json();
                if (cancelled) return;


                if (session?.user?.email) {
                  unlock(capturedEmail);
                  setPageState('success_logged_in');
                } else if (checkData.exists) {
                  setPageState('needs_login');
                } else {
                  setPageState('needs_register');
                }
              }
            } else {
              // MP puede tardar — mostrar como pendiente
              setEmail(capturedEmail);
              setPageState('oxxo_pending');
            }
          } else {
            setPageState('error');
          }
          return;
        }

        // Sin session_id ni provider
        setPageState('error');
      } catch {
        if (!cancelled) {
          setPageState('error');
        }
      }
    }

    verify();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, provider, status]);

  // ─── Callback después de login/register exitoso ────
  const handleAuthSuccess = useCallback(async () => {
    if (email) {
      unlock(email);
    }
    // Refrescar sesión de NextAuth para que el middleware reconozca al usuario
    await updateSession();
    // Redirigir al generador
    router.push('/generator');
    router.refresh();
  }, [email, unlock, updateSession, router]);

  // ═══════════════════════════════════════════════════
  // RENDER — VERIFICANDO
  // ═══════════════════════════════════════════════════

  if (pageState === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-400">Verificando tu pago...</p>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // RENDER — OXXO PENDIENTE
  // ═══════════════════════════════════════════════════

  if (pageState === 'oxxo_pending') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center p-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron),sans-serif]">
            Pago en Proceso
          </h1>
          <p className="text-slate-400 mb-4">
            Tu pago se procesará en <span className="text-yellow-400 font-bold">24-72 horas</span>.
          </p>
          {email && (
            <p className="text-sm text-slate-500 mb-6">
              Te enviaremos una confirmación a <span className="text-white">{email}</span> cuando se procese.
            </p>
          )}
          <p className="text-xs text-slate-600 mb-6">
            Cuando tu pago se confirme, tu acceso se activará automáticamente.
            Regresa a esta página o inicia sesión para verificar.
          </p>
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            Volver al generador
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // RENDER — ERROR
  // ═══════════════════════════════════════════════════

  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center p-8 rounded-2xl border border-red-500/15 bg-red-500/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron),sans-serif]">
            No pudimos confirmar tu pago
          </h1>
          <p className="text-slate-400 mb-6 text-sm">
            Si ya pagaste, tu acceso se activará cuando el webhook confirme el pago.
            Intenta recargar esta página en unos minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all cursor-pointer"
            >
              Reintentar verificación
            </button>
            <Link
              href="/generator"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
            >
              Volver al generador
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // RENDER — ÉXITO (logueado) — El camino feliz
  // ═══════════════════════════════════════════════════

  if (pageState === 'success_logged_in') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <ConfettiParticles />

        <motion.div
          className="relative max-w-md w-full text-center p-8 rounded-2xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-sm shadow-[0_0_60px_rgba(6,182,212,0.1)]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 0.3 }}
          >
            <Crown className="w-14 h-14 text-yellow-400 mx-auto mb-4" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron),sans-serif] flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            PREMIUM ACTIVADO
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>

          <p className="text-slate-400 mb-6">
            Tu sensibilidad profesional está desbloqueada <span className="text-cyan-400 font-bold">de por vida</span>.
          </p>

          {email && (
            <p className="text-xs text-slate-500 mb-6">
              Licencia registrada en: <span className="text-white">{email}</span>
            </p>
          )}

          <Link
            href="/generator"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            VER MI SENSIBILIDAD
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-xs text-slate-600 mt-4">
            Headshot Mode + Academia + HUD Codes desbloqueados
          </p>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // RENDER — NECESITA REGISTRO o LOGIN
  // ═══════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <ConfettiParticles />

      <motion.div
        className="relative max-w-md w-full p-6 sm:p-8 rounded-2xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-sm shadow-[0_0_60px_rgba(6,182,212,0.1)]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

        {pageState === 'needs_register' && email && (
          <PostPaymentRegister
            email={email}
            onSuccess={handleAuthSuccess}
          />
        )}

        {pageState === 'needs_login' && email && (
          <>
            <PostPaymentLogin
              email={email}
              onSuccess={handleAuthSuccess}
            />

            {/* Opción de cambiar a registro si "ya tiene cuenta" fue un falso positivo */}
            <p className="text-xs text-slate-500 text-center mt-4">
              ¿No recuerdas tu contraseña?{' '}
              <button
                onClick={() => setPageState('needs_register')}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
              >
                Crear nueva cuenta
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGE EXPORT
// ═══════════════════════════════════════════════════════

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-slate-400">Verificando pago...</p>
        </motion.div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
