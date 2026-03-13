/**
 * InAppBrowserBanner — Banner que aparece cuando el usuario está en un
 * navegador in-app (TikTok, Instagram, etc.)
 *
 * Sugiere abrir en el navegador real del sistema para evitar problemas
 * con el checkout de Stripe/MercadoPago.
 *
 * Usa <a> tag con target="_blank" en vez de window.open() porque
 * window.open() está bloqueado en WebViews de TikTok/Instagram.
 * Si el <a> tag no funciona, copia la URL al clipboard automáticamente.
 */

'use client';

import { ExternalLink, X } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { trackEvent, INTERNAL_EVENTS } from '@/lib/analytics';
import { detectInAppBrowser } from '@/lib/browser-detect';

export function InAppBrowserBanner() {
  const [visible, setVisible] = useState(false);
  const [browserName, setBrowserName] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

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

  const handleOpenAttempt = useCallback(() => {
    trackEvent({
      event: INTERNAL_EVENTS.INAPP_BROWSER_REDIRECT,
      properties: { browser: browserName },
    });

    // Después de 1.2s, si sigue aquí, copiar URL automáticamente como fallback
    setTimeout(async () => {
      try {
        const { copyToClipboard } = await import('@/lib/browser-detect');
        const success = await copyToClipboard(window.location.href);
        if (success) setUrlCopied(true);
      } catch { /* ignore */ }
    }, 1200);
  }, [browserName]);

  if (!visible || dismissed) return null;

  const appName = browserName === 'tiktok' ? 'TikTok'
    : browserName === 'instagram' ? 'Instagram'
    : browserName === 'facebook' ? 'Facebook'
    : browserName === 'twitter' ? 'Twitter'
    : 'esta app';

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://sensipro.pro';

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-cyan-900/95 to-purple-900/95 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3 safe-area-top">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/90 font-medium leading-tight">
            Estás en el navegador de {appName}
          </p>
          <p className="text-[10px] text-white/60 mt-0.5 leading-tight">
            {urlCopied ? 'URL copiada ✓ — Pégala en Safari/Chrome' : 'Abre en tu navegador para la mejor experiencia'}
          </p>
        </div>
        {/* <a> tag con target="_blank" — los WebViews que lo respetan abrirán en navegador externo */}
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenAttempt}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
            urlCopied
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {urlCopied ? 'Copiada ✓' : 'Abrir'}
        </a>
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
