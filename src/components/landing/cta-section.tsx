import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fire-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-5xl font-display font-black text-white">
          Deja de perder por{' '}
          <span className="text-gradient-fire-ice">mala configuración</span>
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          Genera la sensibilidad perfecta para tu dispositivo en 10 segundos. Gratis.
        </p>
        <div className="mt-8">
          <Link href="/generator">
            <Button variant="primary" size="lg" rightIcon={<ChevronRight size={18} />}>
              Generar mi sensibilidad
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
