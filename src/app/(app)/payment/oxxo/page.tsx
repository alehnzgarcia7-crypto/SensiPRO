'use client';

import { motion } from 'framer-motion';
import { Banknote, Clock, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OxxoContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full p-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Banknote className="w-12 h-12 text-yellow-400 mx-auto mb-4" />

        <h1 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron),sans-serif] text-center">
          Paga en OXXO
        </h1>

        <div className="space-y-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-yellow-400">1</div>
            <p className="text-sm text-slate-300">Acude a cualquier tienda <span className="text-yellow-400 font-bold">OXXO</span> en México</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-yellow-400">2</div>
            <p className="text-sm text-slate-300">Dile al cajero que quieres hacer un <span className="text-white font-medium">pago de servicio con código de barras</span></p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-yellow-400">3</div>
            <p className="text-sm text-slate-300">Muestra el voucher que recibiste por email o en tu pantalla</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-yellow-400">4</div>
            <p className="text-sm text-slate-300">Paga <span className="text-yellow-400 font-bold">$199 MXN</span> en efectivo</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-emerald-400">{'\u2713'}</div>
            <p className="text-sm text-slate-300">Recibirás tu acceso premium en <span className="text-white font-medium">24-72 horas</span></p>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>El voucher expira en <span className="text-white">72 horas</span></span>
          </div>
          {email && (
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Confirmación a: <span className="text-white">{decodeURIComponent(email)}</span></span>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al generador
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OxxoInstructionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Banknote className="w-12 h-12 text-yellow-400/50 mx-auto" />
      </div>
    }>
      <OxxoContent />
    </Suspense>
  );
}
