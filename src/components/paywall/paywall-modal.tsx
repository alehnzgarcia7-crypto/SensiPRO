/**
 * PaywallModal — Modal de compra premium
 *
 * Flujo SIN FRICCIÓN:
 * - Si logueado: directo a métodos de pago (0 campos)
 * - Si no logueado: email + métodos de pago en MISMA vista (1 campo)
 * - Countdown REAL basado en fecha de AppConfig (no localStorage fake)
 * - Auto-renovación server-side cada 6 días
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Lock, CreditCard, Banknote, Smartphone,
  Check, Shield, Clock, Zap, ExternalLink,
  AlertCircle, Loader2, Copy, CheckCircle2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { useTrackEvent } from '@/hooks/use-track-event';
import {
  trackEvent, INTERNAL_EVENTS, ttClickButton, ttViewContent,
  CONTENT_IDS, hasEventFired, markEventFired,
} from '@/lib/analytics';
import { detectInAppBrowser, copyToClipboard, openInSystemBrowser } from '@/lib/browser-detect';
import { getPricingForCountry, getCountryList, type CountryPricing } from '@/lib/geo-pricing';
import { usePremiumContext } from '@/providers/premium-provider';

import { EmbeddedCardForm } from '../embedded-card-form';

// ═══════════════════════════════════════════════════════
// COUNTDOWN HOOK — Timer REAL desde AppConfig en DB
// ═══════════════════════════════════════════════════════

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  active: boolean;
  loaded: boolean;
}

function useOfferCountdown(): CountdownTime {
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [active, setActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0, hours: 0, minutes: 0, active: true, loaded: false,
  });

  // Fetch la fecha del servidor UNA vez
  useEffect(() => {
    let cancelled = false;

    async function fetchOffer() {
      try {
        const res = await fetch('/api/offer-countdown');
        const data = await res.json();
        if (cancelled) return;
        setEndDate(new Date(data.endDate));
        setActive(data.active);
      } catch {
        // Fallback silencioso
        setEndDate(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));
        setActive(true);
      }
    }

    fetchOffer();
    return () => { cancelled = true; };
  }, []);

  // Actualizar countdown cada minuto
  useEffect(() => {
    if (!endDate) return;

    const update = () => {
      const diff = Math.max(0, endDate.getTime() - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft({ days, hours, minutes, active, loaded: true });
    };

    update();
    const interval = setInterval(update, 60_000); // Cada minuto, no cada segundo
    return () => clearInterval(interval);
  }, [endDate, active]);

  return timeLeft;
}

// ═══════════════════════════════════════════════════════
// FEATURES QUE SE DESBLOQUEAN
// ═══════════════════════════════════════════════════════

const PREMIUM_FEATURES = [
  '6 valores de sensibilidad calibrados para TU dispositivo',
  'Headshot Mode: 9 técnicas de drag + 18 combos de personajes',
  '17 códigos HUD reales con capturas del juego',
  'Giroscopio calibrado al rango pro (32-39)',
  'Academia PRO: 11 guías + 24 tips con datos del motor ARES',
  'Actualizaciones de por vida + soporte',
];

// ═══════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════

type ModalState = 'ready' | 'processing' | 'error' | 'copy-link';

export function PaywallModal() {
  const { isPaywallOpen, hidePaywall, paywallContext, capturedEmail, setCapturedEmail, unlock } = usePremiumContext();
  const countdown = useOfferCountdown();
  const { track } = useTrackEvent();
  const { data: session } = useSession();

  const [modalState, setModalState] = useState<ModalState>('ready');
  const [email, setEmail] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'oxxo' | 'mercadopago' | null>(null);
  const [userCountry, setUserCountry] = useState<string>('MX');
  const [pricing, setPricing] = useState<CountryPricing>(getPricingForCountry('MX'));
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyLinkUrl, setCopyLinkUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [isWebView, setIsWebView] = useState(false);
  const [showEmbeddedForm, setShowEmbeddedForm] = useState(false);

  // El usuario está logueado → no necesitamos pedir email
  const isLoggedIn = !!session?.user?.email;
  const effectiveEmail = isLoggedIn ? session.user.email : email;

  // Al abrir: configurar estado inicial
  useEffect(() => {
    if (isPaywallOpen) {
      track('PAYWALL_SHOWN', { source: paywallContext?.source ?? 'unknown' });

      // Analytics: blur_shown + ViewContent para paywall
      if (!hasEventFired('blur_shown_modal')) {
        markEventFired('blur_shown_modal');
        trackEvent({ event: INTERNAL_EVENTS.BLUR_SHOWN, properties: { source: paywallContext?.source ?? 'unknown' } });
        ttViewContent({ contentId: CONTENT_IDS.PAYWALL_MODAL, contentType: 'paywall' });
      }

      setModalState('ready');
      setError(null);
      setSelectedMethod(null);
      setIsSubmitting(false);
      setShowEmbeddedForm(false);
      setShowCountrySelector(false);

      // Detectar WebView (TikTok, Instagram, etc.)
      const { isInAppBrowser } = detectInAppBrowser();
      setIsWebView(isInAppBrowser);

      // Detectar país del usuario por IP
      fetch('/api/geo')
        .then(r => r.json())
        .then(data => {
          if (data.countryCode) {
            setUserCountry(data.countryCode);
            setPricing(getPricingForCountry(data.countryCode));
          }
        })
        .catch(() => {
          setUserCountry('MX');
          setPricing(getPricingForCountry('MX'));
        });

      if (isLoggedIn && session.user.email) {
        setEmail(session.user.email);
        setCapturedEmail(session.user.email);
      } else if (capturedEmail) {
        setEmail(capturedEmail);
      }
    }
  }, [isPaywallOpen, isLoggedIn, session?.user?.email, capturedEmail, track, paywallContext?.source, setCapturedEmail]);

  // Focus en el input de email para no-logueados
  useEffect(() => {
    if (!isPaywallOpen || isLoggedIn || capturedEmail) return;
    const timer = setTimeout(() => emailInputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [isPaywallOpen, isLoggedIn, capturedEmail]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPaywallOpen && !isSubmitting) {
        hidePaywall();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isPaywallOpen, isSubmitting, hidePaywall]);

  // ─── Iniciar Pago ────────────────────────────────
  const handlePayment = useCallback(async () => {
    if (!selectedMethod) return;

    // Validar email si no está logueado
    const emailToUse = effectiveEmail?.trim().toLowerCase() || '';
    if (!isLoggedIn && (!emailToUse || !emailToUse.includes('@') || !emailToUse.includes('.'))) {
      setError('Ingresa un email válido');
      return;
    }

    // Capturar email si no lo hemos hecho
    if (!isLoggedIn && emailToUse && !capturedEmail) {
      setCapturedEmail(emailToUse);
    }

    // WebView + tarjeta → mostrar formulario embebido en vez de redirigir
    if (selectedMethod === 'card' && isWebView) {
      track('PAYWALL_CLICKED', { method: 'card', source: paywallContext?.source ?? 'unknown', embeddedWebView: true });
      trackEvent({
        event: INTERNAL_EVENTS.INAPP_BROWSER_DETECTED,
        properties: { context: 'embedded_card_form', method: 'card' },
      });
      setShowEmbeddedForm(true);
      return;
    }

    track('PAYWALL_CLICKED', { method: selectedMethod, source: paywallContext?.source ?? 'unknown' });

    // Analytics: unlock CTA + payment method selected
    trackEvent({ event: INTERNAL_EVENTS.UNLOCK_CTA_CLICKED, properties: { method: selectedMethod, source: paywallContext?.source ?? 'unknown' } });
    trackEvent({ event: INTERNAL_EVENTS.PAYMENT_METHOD_SELECTED, properties: { method: selectedMethod } });
    ttClickButton({ contentId: CONTENT_IDS.PAYWALL_MODAL, description: `payment_method:${selectedMethod}` });

    setIsSubmitting(true);
    setError(null);
    setModalState('processing');

    try {
      // Attach ttclid + sessionId for server-side attribution
      let ttclid: string | undefined;
      let sessionId: string | undefined;
      try {
        ttclid = sessionStorage.getItem('sensipro_ttclid') || undefined;
        sessionId = sessionStorage.getItem('sp_session_id') || undefined;
      } catch { /* ignore */ }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          method: selectedMethod,
          device: paywallContext?.device,
          fingerCount: paywallContext?.fingerCount,
          style: paywallContext?.style,
          source: paywallContext?.source || 'generator',
          ttclid,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isPremium) {
          unlock(emailToUse);
          return;
        }
        throw new Error(data.error || 'Error procesando el pago');
      }

      // Track checkout created
      trackEvent({
        event: INTERNAL_EVENTS.CHECKOUT_CREATED,
        properties: {
          method: selectedMethod,
          source: paywallContext?.source || 'generator',
          eventId: data.eventId,
        },
      });

      // Redirigir al checkout — interceptar navegadores in-app
      if (data.checkoutUrl) {
        const { isInAppBrowser, browserName } = detectInAppBrowser();
        if (isInAppBrowser) {
          // Navegador in-app: intentar abrir en browser del sistema, fallback a copy-link
          trackEvent({
            event: INTERNAL_EVENTS.INAPP_BROWSER_DETECTED,
            properties: { browser: browserName, context: 'checkout', method: selectedMethod },
          });
          try { sessionStorage.setItem('sensipro_checkout_url', data.checkoutUrl); } catch { /* ignore */ }

          // Intento 1: abrir en navegador del sistema
          openInSystemBrowser(data.checkoutUrl);

          // Después de 1.5s, si el usuario sigue aquí, mostrar copy-link como fallback
          setTimeout(() => {
            if (!document.hidden) {
              setCopyLinkUrl(data.checkoutUrl);
              setLinkCopied(false);
              setModalState('copy-link');
              setIsSubmitting(false);
            }
          }, 1500);
          return;
        }
        window.location.href = data.checkoutUrl;
        return;
      }

      throw new Error('No se recibió URL de checkout');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Hubo un error. Intenta de nuevo.';
      setError(message);
      setModalState('error');
      setIsSubmitting(false);
    }
  }, [selectedMethod, effectiveEmail, isLoggedIn, capturedEmail, paywallContext, unlock, track, setCapturedEmail, isWebView]);

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════

  return (
    <AnimatePresence>
      {isPaywallOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/90"
            onClick={() => !isSubmitting && hidePaywall()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card principal */}
          <motion.div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 shadow-xl"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

              {!isSubmitting && (
                <button
                  onClick={hidePaywall}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Badge de descuento */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 text-xs text-cyan-400 mb-3">
                <Zap className="w-3 h-3" />
                <span className="font-semibold">43% OFF — OFERTA ESPECIAL</span>
              </div>

              {/* Título */}
              <h2 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif] tracking-wide">
                Desbloquea <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">SensiPRO</span>
              </h2>

              {/* Precio */}
              <div className="flex items-baseline gap-3 mt-2 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif]">
                  $199
                </span>
                <span className="text-sm text-slate-400">MXN</span>
                {pricing.countryCode !== 'MX' && (
                  <span className="text-sm text-cyan-400/80">
                    (~{pricing.symbol}{pricing.approximateAmount} {pricing.currency})
                  </span>
                )}
                <span className="text-lg text-slate-500 line-through">$349</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  -43%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Pago único. Acceso de por vida. Sin suscripción.</p>

              {/* Selector de país */}
              <button
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 mt-1 cursor-pointer"
              >
                {pricing.flag} {pricing.countryName}
                <span className="text-slate-600">· Cambiar país</span>
              </button>

              {showCountrySelector && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-slate-900">
                  {getCountryList().map(country => (
                    <button
                      key={country.countryCode}
                      onClick={() => {
                        setUserCountry(country.countryCode);
                        setPricing(country);
                        setShowCountrySelector(false);
                        if (selectedMethod === 'oxxo' && !country.hasOxxo) setSelectedMethod(null);
                        if (selectedMethod === 'mercadopago' && !country.hasMercadoPago) setSelectedMethod(null);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors cursor-pointer ${
                        userCountry === country.countryCode ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      <span>{country.flag}</span>
                      <span>{country.countryName}</span>
                      <span className="ml-auto text-slate-500">{country.symbol}{country.approximateAmount}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Countdown REAL — profesional y sutil */}
            {countdown.loaded && countdown.active && (
              <div className="mx-6 mb-4 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Oferta válida por:</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-white font-medium">
                    {countdown.days > 0 && (
                      <>
                        <span className="text-slate-200">{countdown.days}<span className="text-slate-500 text-xs ml-0.5">d</span></span>
                      </>
                    )}
                    <span className="text-slate-200">{countdown.hours}<span className="text-slate-500 text-xs ml-0.5">h</span></span>
                    <span className="text-slate-200">{countdown.minutes}<span className="text-slate-500 text-xs ml-0.5">m</span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Social proof removido — sin datos verificables aún */}

            {/* Separador */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

            {/* Contenido */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">

                {/* ESTADO: READY — Todo en una sola vista */}
                {modalState === 'ready' && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Features */}
                    <div className="mb-4 space-y-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">
                        Lo que desbloqueas:
                      </p>
                      {PREMIUM_FEATURES.map((text, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-slate-300">{text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    {/* Email — SOLO si no está logueado, integrado en la misma vista */}
                    {!isLoggedIn && (
                      <div className="mb-4">
                        <label className="text-xs text-slate-500 mb-1.5 block">
                          Para recibir tu acceso
                        </label>
                        <input
                          ref={emailInputRef}
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(null); }}
                          onKeyDown={(e) => e.key === 'Enter' && selectedMethod && handlePayment()}
                          placeholder="tu@email.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                          autoComplete="email"
                        />
                      </div>
                    )}

                    {/* EMBEDDED CARD FORM — Para WebView con tarjeta */}
                    {showEmbeddedForm && selectedMethod === 'card' && isWebView && effectiveEmail ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Botón Volver */}
                        <button
                          onClick={() => setShowEmbeddedForm(false)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-4 cursor-pointer"
                        >
                          <span>←</span>
                          <span>Cambiar método de pago</span>
                        </button>

                        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                          <CreditCard className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs text-slate-300">Pago con tarjeta</span>
                        </div>

                        <EmbeddedCardForm
                          email={effectiveEmail}
                          device={paywallContext?.device}
                          fingerCount={paywallContext?.fingerCount}
                          style={paywallContext?.style}
                          source={paywallContext?.source || 'generator'}
                          onSuccess={() => {
                            trackEvent({
                              event: INTERNAL_EVENTS.CHECKOUT_CREATED,
                              properties: { method: 'card', source: paywallContext?.source || 'generator', embeddedWebView: true },
                            });
                            if (effectiveEmail) {
                              unlock(effectiveEmail);
                            }
                          }}
                        />
                      </motion.div>
                    ) : (
                      <>
                        {/* Métodos de pago */}
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">
                          Método de pago:
                        </p>

                        <div className="space-y-2 mb-4">
                          {/* Tarjeta */}
                          <button
                            onClick={() => setSelectedMethod('card')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                              selectedMethod === 'card'
                                ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,255,255,0.05)]'
                                : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              selectedMethod === 'card' ? 'bg-cyan-500/20' : 'bg-white/5'
                            }`}>
                              <CreditCard className={`w-4 h-4 ${selectedMethod === 'card' ? 'text-cyan-400' : 'text-slate-400'}`} />
                            </div>
                            <div className="text-left flex-1">
                              <p className={`text-sm font-medium ${selectedMethod === 'card' ? 'text-white' : 'text-slate-300'}`}>
                                Tarjeta de crédito / débito
                              </p>
                              <p className="text-[10px] text-slate-500">Visa, Mastercard, Amex</p>
                            </div>
                            {selectedMethod === 'card' && (
                              <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>

                          {/* OXXO — Solo México */}
                          {pricing.hasOxxo && (
                          <button
                            onClick={() => setSelectedMethod('oxxo')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                              selectedMethod === 'oxxo'
                                ? 'border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.05)]'
                                : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              selectedMethod === 'oxxo' ? 'bg-yellow-500/20' : 'bg-white/5'
                            }`}>
                              <Banknote className={`w-4 h-4 ${selectedMethod === 'oxxo' ? 'text-yellow-400' : 'text-slate-400'}`} />
                            </div>
                            <div className="text-left flex-1">
                              <p className={`text-sm font-medium ${selectedMethod === 'oxxo' ? 'text-white' : 'text-slate-300'}`}>
                                OXXO (efectivo)
                              </p>
                              <p className="text-[10px] text-slate-500">Paga en cualquier OXXO de México</p>
                            </div>
                            {selectedMethod === 'oxxo' && (
                              <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                          )}

                          {/* Mercado Pago — Solo México */}
                          {pricing.hasMercadoPago && (
                          <button
                            onClick={() => setSelectedMethod('mercadopago')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${
                              selectedMethod === 'mercadopago'
                                ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.05)]'
                                : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              selectedMethod === 'mercadopago' ? 'bg-blue-500/20' : 'bg-white/5'
                            }`}>
                              <Smartphone className={`w-4 h-4 ${selectedMethod === 'mercadopago' ? 'text-blue-400' : 'text-slate-400'}`} />
                            </div>
                            <div className="text-left flex-1">
                              <p className={`text-sm font-medium ${selectedMethod === 'mercadopago' ? 'text-white' : 'text-slate-300'}`}>
                                Mercado Pago
                              </p>
                              <p className="text-[10px] text-slate-500">Tarjetas locales, transferencia, efectivo</p>
                            </div>
                            {selectedMethod === 'mercadopago' && (
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                          )}
                        </div>

                        {error && (
                          <p className="text-xs text-red-400 mb-3 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {error}
                          </p>
                        )}

                        {/* Botón PAGAR — Flujo normal (redirect) */}
                        <motion.button
                          onClick={handlePayment}
                          disabled={!selectedMethod || isSubmitting}
                          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                            selectedMethod
                              ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan-500/20'
                              : 'bg-white/5 text-slate-500 cursor-not-allowed'
                          }`}
                          whileHover={selectedMethod ? { scale: 1.02 } : {}}
                          whileTap={selectedMethod ? { scale: 0.98 } : {}}
                        >
                          <Lock className="w-4 h-4" />
                          {selectedMethod
                            ? `PAGAR $199 MXN${selectedMethod === 'oxxo' ? ' EN OXXO' : ''}`
                            : 'Selecciona un método de pago'
                          }
                        </motion.button>

                        {/* Seguridad */}
                        <p className="text-[10px] text-slate-600 mt-3 text-center flex items-center justify-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Pago seguro encriptado con SSL
                        </p>

                        {pricing.countryCode !== 'MX' && (
                          <p className="text-[10px] text-slate-500 mt-2 text-center">
                            Precio aproximado. El monto exacto en {pricing.currency} se muestra al pagar.
                          </p>
                        )}
                      </>
                    )}
                  </motion.div>
                )}

                {/* ESTADO: PROCESSING */}
                {modalState === 'processing' && (
                  <motion.div
                    key="processing"
                    className="py-8 flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-10 h-10 text-cyan-400" />
                    </motion.div>
                    <p className="text-sm text-slate-300 mt-4">Procesando tu pago...</p>
                    <p className="text-xs text-slate-500 mt-1">No cierres esta ventana</p>
                  </motion.div>
                )}

                {/* ESTADO: ERROR */}
                {modalState === 'error' && (
                  <motion.div
                    key="error"
                    className="py-6 flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                      <AlertCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <p className="text-sm text-red-400 font-medium mb-1">Error en el pago</p>
                    <p className="text-xs text-slate-400 text-center mb-4 max-w-xs">{error || 'Hubo un problema procesando tu pago.'}</p>

                    <button
                      onClick={() => { setModalState('ready'); setError(null); }}
                      className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Intentar de nuevo
                    </button>
                  </motion.div>
                )}

                {/* ESTADO: COPY-LINK — Para navegadores in-app (TikTok, Instagram, etc.) */}
                {modalState === 'copy-link' && copyLinkUrl && (
                  <motion.div
                    key="copy-link"
                    className="py-6 flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Icono de enlace externo */}
                    <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                      <ExternalLink className="w-8 h-8 text-cyan-400" />
                    </div>

                    <h3 className="text-lg font-bold text-white text-center mb-2 font-[family-name:var(--font-orbitron),sans-serif]">
                      Ábrelo en tu navegador
                    </h3>

                    <p className="text-xs text-slate-400 text-center mb-5 max-w-xs leading-relaxed">
                      TikTok no permite pagos directos. Toca el botón para copiar el enlace y pégalo en <span className="text-white font-medium">Safari</span> o <span className="text-white font-medium">Chrome</span>.
                    </p>

                    {/* Botón principal: COPIAR ENLACE */}
                    <motion.button
                      onClick={async () => {
                        const success = await copyToClipboard(copyLinkUrl);
                        if (success) {
                          setLinkCopied(true);
                          trackEvent({
                            event: INTERNAL_EVENTS.INAPP_BROWSER_DETECTED,
                            properties: { action: 'copy_link_modal', method: selectedMethod },
                          });
                        }
                      }}
                      className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer ${
                        linkCopied
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                          : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan-500/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {linkCopied ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          {'\u2713'} ENLACE COPIADO — Pégalo en tu navegador
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          COPIAR ENLACE DE PAGO
                        </>
                      )}
                    </motion.button>

                    {/* Botón secundario: Abrir en Safari (segundo intento) */}
                    <motion.button
                      onClick={() => {
                        trackEvent({
                          event: INTERNAL_EVENTS.INAPP_BROWSER_DETECTED,
                          properties: { action: 'retry_open_browser', method: selectedMethod },
                        });
                        openInSystemBrowser(copyLinkUrl);
                      }}
                      className="w-full mt-2 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/[0.06] hover:border-white/20 transition-colors cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir en Safari
                    </motion.button>

                    {/* Instrucciones post-copia */}
                    {linkCopied && (
                      <motion.div
                        className="mt-4 w-full space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                          <span className="text-xs text-cyan-400 font-bold">1.</span>
                          <span className="text-xs text-slate-300">Abre Safari o Chrome</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                          <span className="text-xs text-cyan-400 font-bold">2.</span>
                          <span className="text-xs text-slate-300">Pega el enlace en la barra de direcciones</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                          <span className="text-xs text-cyan-400 font-bold">3.</span>
                          <span className="text-xs text-slate-300">Completa tu compra de forma segura</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Info de vigencia + seguridad */}
                    <div className="mt-5 w-full space-y-2">
                      <p className="text-[10px] text-slate-500 text-center">El enlace es válido por 24 horas</p>
                      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-slate-400">Pago seguro con Stripe</span>
                        <Shield className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
