import Link from 'next/link';
import { XCircle, CreditCard, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Pago no completado — Sensibilidades PRO',
  description: 'El pago no se pudo procesar. Puedes intentar de nuevo.',
};

export default function PaymentFailurePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {/* Icono de error */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
        <XCircle size={40} className="text-red-400" />
      </div>

      {/* Titulo */}
      <h1 className="text-3xl font-bold text-white">
        Pago no completado
      </h1>

      {/* Descripcion */}
      <p className="mt-3 text-slate-400 leading-relaxed">
        El pago no se pudo procesar. No se realizo ningun cargo a tu cuenta.
        Puedes intentar de nuevo cuando quieras.
      </p>

      {/* Acciones */}
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/pricing">
          <Button variant="primary" className="w-full" leftIcon={<CreditCard size={18} />}>
            Intentar de nuevo
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
