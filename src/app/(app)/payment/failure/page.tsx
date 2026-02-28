'use client';

import { XCircle, CreditCard, MessageCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  cancelled: {
    title: 'Pago cancelado',
    description: 'Cancelaste el proceso de pago. No se realizó ningún cargo. Puedes intentar de nuevo cuando quieras.',
  },
  failed: {
    title: 'Pago no completado',
    description: 'El pago no se pudo procesar. Verifica los datos de tu tarjeta o intenta con otro método de pago.',
  },
  expired: {
    title: 'Sesión expirada',
    description: 'La sesión de pago expiró. Por seguridad, las sesiones duran máximo 30 minutos. Inténtalo de nuevo.',
  },
};

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get('reason') || 'failed';
  const errorInfo = ERROR_MESSAGES[reason] ?? ERROR_MESSAGES['failed'] ?? { title: 'Error', description: 'Ocurrió un error con el pago.' };

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {/* Icono de error */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
        <XCircle size={40} className="text-red-400" />
      </div>

      {/* Titulo */}
      <h1 className="text-3xl font-bold text-white font-display">
        {errorInfo.title}
      </h1>

      {/* Descripcion */}
      <p className="mt-3 text-slate-400 leading-relaxed">
        {errorInfo.description}
      </p>

      {/* Acciones */}
      <div className="mt-8 flex flex-col gap-3">
        <Button
          variant="primary"
          className="w-full"
          leftIcon={<CreditCard size={18} />}
          onClick={() => router.back()}
        >
          Intentar de nuevo
        </Button>
        <Link href="/contact">
          <Button variant="ghost" className="w-full" leftIcon={<MessageCircle size={18} />}>
            Contactar soporte
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="w-full" leftIcon={<Home size={18} />}>
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
          <XCircle size={40} className="text-red-400/50" />
        </div>
        <p className="text-slate-400">Cargando...</p>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}
