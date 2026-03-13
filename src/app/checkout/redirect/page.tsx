/**
 * Página intermedia de checkout para navegadores in-app
 *
 * Cuando un usuario está en TikTok/Instagram WebView y quiere pagar,
 * no puede abrir checkout.stripe.com directamente. Esta página le
 * ofrece opciones para abrir el checkout en su navegador real.
 *
 * URL: /checkout/redirect?url=ENCODED_CHECKOUT_URL&method=card|oxxo|mercadopago
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, ExternalLink, Copy, Check, ArrowRight, Lock, Smartphone } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState, useCallback, Suspense } from 'react';

import { trackEvent } from '@/lib/analytics';
import { openInSystemBrowser, copyToClipboard } from '@/lib/browser-detect';

function CheckoutRedirectContent() {
  const searchParams = useSearchParams();
  const checkoutUrl = searchParams.get('url') || '';
  const method = searchParams.get('method') || 'card';

  const [copied, setCopied] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const handleOpenBrowser = useCallback(() => {
    trackEvent({
      event: 'inapp_browser_redirect',
      properties: { context: 'checkout', method },
    });

    setAttempted(true);
    openInSystemBrowser(checkoutUrl);
  }, [checkoutUrl, method]);

  const handleCopyLink = useCallback(async () => {
    trackEvent({
      event: 'inapp_browser_copy_link',
      properties: { context: 'checkout', method },
    });

    const success = await copyToClipboard(checkoutUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }, [checkoutUrl, method]);

  const methodLabel = method === 'mercadopago' ? 'Mercado Pago'
    : method === 'oxxo' ? 'OXXO'
    : 'Stripe';

  if (!checkoutUrl) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-400">No se encontró la URL de checkout.</p>
          <a href="/generator" className="text-cyan-400 underline mt-2 inline-block text-sm">
            Volver al generador
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Card principal */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_80px_rgba(0,255,255,0.06)] overflow-hidden">
          {/* Header con icono */}
          <div className="px-6 pt-8 pb-6 text-center">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-5"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            >
              <Smartphone className="w-10 h-10 text-cyan-400" />
            </motion.div>

            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif] tracking-wide mb-3">
              Abre en tu navegador
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Los navegadores de TikTok e Instagram no permiten pagos directos.
              Toca el botón para continuar de forma segura.
            </p>
          </div>

          {/* Separador */}
          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Botones de acción */}
          <div className="px-6 py-6 space-y-3">
            {/* Botón principal: Abrir en navegador */}
            <motion.button
              onClick={handleOpenBrowser}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-cyan-500 transition-all active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-5 h-5" />
              ABRIR EN MI NAVEGADOR
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {/* Si ya intentó y no funcionó, mostrar opciones extra */}
            {attempted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-500 text-center pt-1">
                  ¿No se abrió? Copia el enlace y pégalo en Safari o Chrome:
                </p>

                {/* URL con botón copiar */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-500 truncate font-mono">
                      {checkoutUrl}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-medium transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-slate-600">
                    1. Copia el enlace → 2. Abre Safari/Chrome → 3. Pega y ve al checkout
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer de confianza */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
              <span>Pago seguro con {methodLabel}</span>
              <Lock className="w-3 h-3 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Link de vuelta */}
        <div className="text-center mt-4">
          <a
            href="/generator"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            ← Volver al generador
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutRedirectContent />
    </Suspense>
  );
}
