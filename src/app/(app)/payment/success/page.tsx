'use client';

import { CheckCircle, Gamepad2, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { usePremium } from '@/hooks/use-premium';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const provider = searchParams.get('provider');
  const status = searchParams.get('status');
  const { setPremiumEmail } = usePremium();
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const isOxxoPending = status === 'pending';

  useEffect(() => {
    async function verifyPayment() {
      try {
        // Si es Stripe, verificar la sesión y activar licencia
        if (sessionId) {
          const res = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
          const data = await res.json();
          if (data.success && data.email) {
            setEmail(data.email);
            setPremiumEmail(data.email);
            setVerified(true);
            return;
          }
          // Fallback al endpoint antiguo
          const fallback = await fetch(`/api/payments/stripe/status?session_id=${sessionId}`);
          const fbData = await fallback.json();
          if (fbData.success && fbData.data?.email) {
            setEmail(fbData.data.email);
            setPremiumEmail(fbData.data.email);
            setVerified(true);
            return;
          }
        }

        // Si es MP, leer email de localStorage
        if (provider === 'mercadopago') {
          const savedEmail = localStorage.getItem('sensipro_checkout_email');
          if (savedEmail) {
            setPremiumEmail(savedEmail);
            setEmail(savedEmail);
            localStorage.removeItem('sensipro_checkout_email');
          }
          setVerified(true);
          return;
        }

        setVerified(true);
      } catch {
        setVerified(true);
      }
    }

    verifyPayment();
  }, [sessionId, provider, setPremiumEmail]);

  if (isOxxoPending) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-6">
          <Clock size={40} className="text-amber-400" />
        </div>

        <h1 className="text-3xl font-bold text-white font-display">
          Pago en proceso
        </h1>

        <p className="mt-3 text-slate-400 leading-relaxed">
          Tu pago OXXO se procesará en <strong className="text-amber-400">24-72 horas</strong>.
          Recibirás acceso automáticamente cuando se confirme el pago.
        </p>

        {email && (
          <p className="mt-2 text-sm text-slate-500">
            Email registrado: <span className="text-slate-300">{email}</span>
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/generator">
            <Button variant="primary" className="w-full" leftIcon={<Gamepad2 size={18} />}>
              Volver al Generador
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {/* Icono de éxito */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6 relative">
        <CheckCircle size={40} className="text-emerald-400" />
        <Sparkles size={20} className="text-amber-400 absolute -top-1 -right-1 animate-pulse" />
      </div>

      {/* Titulo */}
      <h1 className="text-3xl font-bold text-white font-display">
        Pago exitoso!
      </h1>

      {/* Descripcion */}
      <p className="mt-3 text-slate-400 leading-relaxed">
        Ya tienes <strong className="text-emerald-400">acceso de por vida</strong> a todo SensiPRO Premium:
        sensibilidad calibrada, Headshot Mode, HUD Codes, y Academia completa.
      </p>

      {email && (
        <p className="mt-2 text-sm text-slate-500">
          Licencia activada para: <span className="text-slate-300">{email}</span>
        </p>
      )}

      {/* Premium badge */}
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
        <Sparkles size={16} className="text-amber-400" />
        <span className="text-sm font-semibold text-amber-300">PREMIUM DE POR VIDA</span>
      </div>

      {/* Acciones */}
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/generator">
          <Button variant="primary" className="w-full" leftIcon={<Gamepad2 size={18} />}>
            Ir a mi sensibilidad
          </Button>
        </Link>
      </div>

      {!verified && (
        <p className="mt-4 text-xs text-slate-600 animate-pulse">
          Verificando pago...
        </p>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6 animate-pulse">
          <CheckCircle size={40} className="text-emerald-400/50" />
        </div>
        <p className="text-slate-400">Verificando pago...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
