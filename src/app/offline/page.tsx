'use client';

import { WifiOff, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-6">
          <WifiOff size={36} className="text-warning" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Sin Conexión</h1>
        <p className="text-sm text-slate-400 mb-6">
          No hay conexión a internet. Tus sensibilidades guardadas siguen disponibles.
        </p>
        <div className="space-y-3">
          <a href="/generator">
            <Button variant="primary" className="w-full">Ver Sensibilidades Guardadas</Button>
          </a>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => window.location.reload()}
            leftIcon={<RotateCcw size={16} />}
          >
            Reintentar Conexión
          </Button>
        </div>
      </div>
    </div>
  );
}
