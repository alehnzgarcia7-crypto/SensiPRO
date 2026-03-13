/**
 * Página intermedia de checkout para navegadores in-app
 *
 * Cuando un usuario está en TikTok/Instagram WebView y quiere pagar,
 * no puede abrir el checkout directamente. Esta página lee la URL
 * de sessionStorage (NUNCA de query params) para evitar que TikTok
 * escanee y bloquee URLs de checkout en la barra de navegación.
 *
 * URL: /checkout/redirect (sin parámetros)
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, ExternalLink, Copy, Check, ArrowRight, Lock } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';

import { trackEvent } from '@/lib/analytics';
import { openInSystemBrowser, copyToClipboard } from '@/lib/browser-detect';

export default function CheckoutRedirectPage() {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [method, setMethod] = useState('card');
  const [copied, setCopied] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Leer URL de sessionStorage al montar — NUNCA de query params
  useEffect(() => {
    try {
      const url = sessionStorage.getItem('sensipro_checkout_url');
      const storedMethod = sessionStorage.getItem('sensipro_checkout_method');
      if (url) {
        setCheckoutUrl(url);
        if (storedMethod) setMethod(storedMethod);
      }
    } catch {
      // sessionStorage no disponible
    }
    setLoaded(true);
  }, []);

  const handleOpenBrowser = useCallback(() => {
    if (!checkoutUrl) return;

    trackEvent({
      event: 'inapp_browser_redirect',
      properties: { context: 'checkout', method },
    });

    setAttempted(true);
    openInSystemBrowser(checkoutUrl);

    // Después de 1.5s, si sigue aquí, mostrar opción de copiar
    // (el openInSystemBrowser ya intenta varias estrategias)
  }, [checkoutUrl, method]);

  const handleCopyLink = useCallback(async () => {
    if (!checkoutUrl) return;

    trackEvent({
      event: 'inapp_browser_copy_link',
      properties: { context: 'checkout', method },
    });

    const success = await copyToClipboard(checkoutUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    }
  }, [checkoutUrl, method]);

  const methodLabel = method === 'mercadopago' ? 'Mercado Pago'
    : method === 'oxxo' ? 'OXXO'
    : 'Stripe';

  // Loading state
  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  // No hay URL — redirigir al generador
  if (!checkoutUrl) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-400 text-sm">No se encontró una sesión de pago activa.</p>
          <a href="/generator" className="text-cyan-400 underline mt-3 inline-block text-sm">
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
          {/* Header con icono de escudo */}
          <div className="px-6 pt-8 pb-6 text-center">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-5"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            >
              <Shield className="w-10 h-10 text-cyan-400" />
            </motion.div>

            <h1 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif] tracking-wide mb-3">
              Completa tu pago de forma segura
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Los navegadores de redes sociales no permiten pagos directos.
              Abre el enlace en tu navegador para continuar.
            </p>
          </div>

          {/* Separador */}
          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Botones de acción */}
          <div className="px-6 py-6 space-y-3">
            {/* Botón principal: Abrir en navegador */}
            <motion.button
              onClick={handleOpenBrowser}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-cyan-500 transition-all active:scale-[0.98] cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-5 h-5" />
              ABRIR EN MI NAVEGADOR
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {/* Botón secundario: Copiar enlace — siempre visible */}
            <motion.button
              onClick={handleCopyLink}
              className={`w-full py-3.5 rounded-xl border font-medium text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer ${
                copied
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:border-white/20'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  ENLACE COPIADO ✓
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  COPIAR ENLACE DE PAGO
                </>
              )}
            </motion.button>

            {/* Instrucción — mostrar siempre, resaltar si ya intentó */}
            <motion.p
              className={`text-xs text-center pt-1 transition-colors ${
                attempted ? 'text-slate-300' : 'text-slate-500'
              }`}
              animate={attempted ? { opacity: [0.5, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {attempted
                ? 'Pega el enlace en Safari o Chrome para continuar'
                : 'Pega el enlace en Safari o Chrome si el botón no funciona'
              }
            </motion.p>
          </div>

          {/* Badge de seguridad */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
              <span className="text-[11px] text-slate-400">
                Pago seguro con {methodLabel}
              </span>
              <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
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
