import Link from 'next/link';
import { CheckCircle, Gamepad2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Pago exitoso — Sensibilidades PRO',
  description: 'Tu pago fue procesado correctamente. Ya puedes disfrutar de todas las funciones.',
};

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {/* Icono de exito */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6">
        <CheckCircle size={40} className="text-emerald-400" />
      </div>

      {/* Titulo */}
      <h1 className="text-3xl font-bold text-white">
        Pago exitoso!
      </h1>

      {/* Descripcion */}
      <p className="mt-3 text-slate-400 leading-relaxed">
        Tu cuenta ha sido actualizada. Ya puedes disfrutar de todas las
        funciones premium: giroscopio, todos los estilos, comparador y mas.
      </p>

      {/* Acciones */}
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/generator">
          <Button variant="primary" className="w-full" leftIcon={<Gamepad2 size={18} />}>
            Ir al Generador
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" className="w-full" leftIcon={<User size={18} />}>
            Ver mi cuenta
          </Button>
        </Link>
      </div>
    </div>
  );
}
