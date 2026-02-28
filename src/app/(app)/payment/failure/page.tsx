'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const FAILURE_MESSAGES: Record<string, { title: string; desc: string }> = {
  cancelled: {
    title: 'Pago Cancelado',
    desc: 'Cancelaste el proceso de pago. Tu sensibilidad sigue esperándote.',
  },
  failed: {
    title: 'Error en el Pago',
    desc: 'Hubo un problema procesando tu pago. Intenta con otro método.',
  },
  expired: {
    title: 'Sesión Expirada',
    desc: 'Tu sesión de pago expiró. Regresa al generador para intentar de nuevo.',
  },
};

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'failed';
  const msg = FAILURE_MESSAGES[reason] ?? FAILURE_MESSAGES['failed']!;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full text-center p-8 rounded-2xl border border-red-500/15 bg-red-500/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />

        <h1 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron),sans-serif]">
          {msg.title}
        </h1>

        <p className="text-slate-400 mb-6 text-sm">{msg.desc}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/generator"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Intentar de nuevo
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Soporte
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-400/50 mx-auto" />
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}
