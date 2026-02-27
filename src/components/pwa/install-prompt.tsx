'use client';

import { Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const ENGAGEMENT_DELAY_MS = 30000;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISS_KEY);
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Mostrar banner después de 30 segundos de engagement
      setTimeout(() => setShowBanner(true), ENGAGEMENT_DELAY_MS);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  if (!showBanner || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-sm animate-slide-up">
      <div className="glass border border-fire-500/20 rounded-2xl p-4 shadow-glow-fire">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-fire-500/10 flex items-center justify-center">
            <Download size={20} className="text-fire-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">Instalar SensiPRO</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Acceso rápido desde tu pantalla. Sin descargar de la tienda.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="primary" size="sm" onClick={handleInstall}>
                Instalar
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Ahora no
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-600 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
