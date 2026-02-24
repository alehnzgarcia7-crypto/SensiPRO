import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-fire-500" />
              <span className="font-display font-bold text-gradient-fire-ice">SensiPRO</span>
            </div>
            <p className="text-xs text-slate-500 max-w-[200px]">
              Generador de sensibilidades #1 para Free Fire. Basado en hardware real.
            </p>
          </div>
          <div>
            <h4 className="font-ui font-semibold text-sm text-white mb-3">Producto</h4>
            <div className="flex flex-col gap-2">
              <Link href="/generator" className="text-xs text-slate-500 hover:text-white transition-colors">Generador</Link>
              <Link href="/academy" className="text-xs text-slate-500 hover:text-white transition-colors">Academia</Link>
              <Link href="/pricing" className="text-xs text-slate-500 hover:text-white transition-colors">Precios</Link>
            </div>
          </div>
          <div>
            <h4 className="font-ui font-semibold text-sm text-white mb-3">Comunidad</h4>
            <div className="flex flex-col gap-2">
              <Link href="/leaderboard" className="text-xs text-slate-500 hover:text-white transition-colors">Rankings</Link>
              <Link href="/tournaments" className="text-xs text-slate-500 hover:text-white transition-colors">Torneos</Link>
              <Link href="/shared" className="text-xs text-slate-500 hover:text-white transition-colors">Configs</Link>
            </div>
          </div>
          <div>
            <h4 className="font-ui font-semibold text-sm text-white mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors">Privacidad</Link>
              <Link href="/terms" className="text-xs text-slate-500 hover:text-white transition-colors">T&eacute;rminos</Link>
              <Link href="/contact" className="text-xs text-slate-500 hover:text-white transition-colors">Contacto</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Sensibilidades PRO. Hecho en Canc&uacute;n, M&eacute;xico.
        </div>
      </div>
    </footer>
  );
}
