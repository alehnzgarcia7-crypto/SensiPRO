/**
 * InAppBrowserBanner — Banner que aparece cuando el usuario está en un
 * navegador in-app (TikTok, Instagram, etc.)
 *
 * Sugiere abrir en el navegador real del sistema para evitar problemas
 * con el checkout de Stripe/MercadoPago.
 */

'use client';

import { ExternalLink, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { trackEvent, INTERNAL_EVENTS } from '@/lib/analytics';
import { detectInAppBrowser, openInSystemBrowser } from '@/lib/browser-detect';

export function InAppBrowserBanner() {
  const [visible, setVisible] = useState(false);
  const [browserName, setBrowserName] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const info = detectInAppBrowser();
    if (info.isInAppBrowser) {
      setVisible(true);
      setBrowserName(info.browserName);

      trackEvent({
        event: INTERNAL_EVENTS.INAPP_BROWSER_DETECTED,
        properties: { browser: info.browserName },
      });
    }
  }, []);

  if (!visible || dismissed) return null;

  const handleOpenBrowser = () => {
    trackEvent({
      event: INTERNAL_EVENTS.INAPP_BROWSER_REDIRECT,
      properties: { browser: browserName },
    });

    const currentUrl = window.location.href;
    openInSystemBrowser(currentUrl);
  };

  const appName = browserName === 'tiktok' ? 'TikTok'
    : browserName === 'instagram' ? 'Instagram'
    : browserName === 'facebook' ? 'Facebook'
    : browserName === 'twitter' ? 'Twitter'
    : 'esta app';

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-cyan-900/95 to-purple-900/95 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3 safe-area-top">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/90 font-medium leading-tight">
            Estás en el navegador de {appName}
          </p>
          <p className="text-[10px] text-white/60 mt-0.5 leading-tight">
            Abre en tu navegador para la mejor experiencia
          </p>
        </div>
        <button
          onClick={handleOpenBrowser}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all active:scale-95"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white/80 transition-all"
          aria-label="Cerrar banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
