'use client';

import { motion } from 'framer-motion';
import { Crown, Sparkles, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

import { usePremiumContext } from '@/providers/premium-provider';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const provider = searchParams.get('provider');
  const status = searchParams.get('status');
  const { unlock, verifyPremium } = usePremiumContext();

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        if (sessionId) {
          // Stripe — verificar sesión
          const res = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
          const data = await res.json();

          if (data.success && data.email) {
            setEmail(data.email);
            setVerified(true);
            unlock(data.email);
          } else if (data.status === 'unpaid') {
            // OXXO pendiente
            setEmail(data.email);
            setIsPending(true);
          }
        } else if (provider === 'mercadopago') {
          if (status === 'pending') {
            setIsPending(true);
          } else {
            // MP aprobado — el webhook ya activó la licencia
            const capturedEmail = sessionStorage.getItem('sensipro_captured_email');
            if (capturedEmail) {
              const isP = await verifyPremium(capturedEmail);
              if (isP) {
                setEmail(capturedEmail);
                setVerified(true);
                unlock(capturedEmail);
              }
            }
          }
        }
      } catch {
        // Error silencioso — no crashear la success page
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [sessionId, provider, status, unlock, verifyPremium]);

  // Loading
  if (verifying) {
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

  // OXXO Pendiente
  if (isPending) {
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
            Tu pago en OXXO se procesará en <span className="text-yellow-400 font-bold">24-72 horas</span>.
          </p>
          {email && (
            <p className="text-sm text-slate-500 mb-6">
              Te enviaremos una confirmación a <span className="text-white">{email}</span> cuando tu pago se procese.
            </p>
          )}
          <p className="text-xs text-slate-600 mb-6">
            Guarda tu voucher de OXXO. Si no recibes confirmación en 72 horas, contáctanos.
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

  // Pago Exitoso
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none">
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

      <motion.div
        className="relative max-w-md w-full text-center p-8 rounded-2xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-sm shadow-[0_0_60px_rgba(6,182,212,0.1)]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Glow */}
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
          Ver mi sensibilidad
          <ArrowRight className="w-5 h-5" />
        </Link>

        {!verified && !isPending && (
          <p className="text-xs text-slate-600 mt-4">
            También tienes acceso a Headshot Mode + Academia + HUD Codes
          </p>
        )}
      </motion.div>
    </div>
  );
}

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
