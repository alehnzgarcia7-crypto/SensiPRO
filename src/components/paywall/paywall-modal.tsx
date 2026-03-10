/**
 * PaywallModal — El modal de compra premium
 *
 * Flujo:
 * 1. Email capture (si no lo hemos capturado antes)
 * 2. Beneficios + social proof + countdown
 * 3. Selector de método de pago
 * 4. Redirige a Stripe/MP para completar
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Lock, CreditCard, Banknote, Smartphone,
  Check, Shield, Clock, Zap, Crown,
  ChevronRight, AlertCircle, Loader2,
  Target, Crosshair, Gamepad2, BookOpen,
} from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { usePremiumContext } from '@/providers/premium-provider';

// ═══════════════════════════════════════════════════════
// COUNTDOWN HOOK — Timer de 48 horas
// ═══════════════════════════════════════════════════════

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let expiresAt: number;

    try {
      const saved = localStorage.getItem('sensipro_offer_expires');
      if (saved) {
        expiresAt = parseInt(saved, 10);
        if (expiresAt < Date.now()) {
          expiresAt = Date.now() + 48 * 60 * 60 * 1000;
          localStorage.setItem('sensipro_offer_expires', String(expiresAt));
        }
      } else {
        expiresAt = Date.now() + 48 * 60 * 60 * 1000;
        localStorage.setItem('sensipro_offer_expires', String(expiresAt));
      }
    } catch {
      expiresAt = Date.now() + 48 * 60 * 60 * 1000;
    }

    const update = () => {
      const diff = Math.max(0, expiresAt - Date.now());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

// ═══════════════════════════════════════════════════════
// FEATURES QUE SE DESBLOQUEAN
// ═══════════════════════════════════════════════════════

const PREMIUM_FEATURES = [
  { icon: Target, text: '6 valores de sensibilidad calibrada por DPI', color: 'text-cyan-400' },
  { icon: Crosshair, text: 'Headshot Mode con 24 features exclusivos', color: 'text-red-400' },
  { icon: Gamepad2, text: '17 códigos HUD reales con capturas de FF', color: 'text-green-400' },
  { icon: Zap, text: 'Giroscopio calibrado al rango pro (32-39)', color: 'text-yellow-400' },
  { icon: BookOpen, text: 'Academia completa: 8 guías + 12 tips', color: 'text-purple-400' },
  { icon: Crown, text: 'Actualizaciones de por vida + soporte', color: 'text-amber-400' },
];

// ═══════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════

type PaymentStep = 'email' | 'payment' | 'processing' | 'error';

export function PaywallModal() {
  const { isPaywallOpen, hidePaywall, paywallContext, capturedEmail, setCapturedEmail, unlock } = usePremiumContext();
  const countdown = useCountdown();

  const [step, setStep] = useState<PaymentStep>('email');
  const [email, setEmail] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'oxxo' | 'mercadopago' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Si ya tenemos email capturado, ir directo a payment
  useEffect(() => {
    if (isPaywallOpen) {
      if (capturedEmail) {
        setEmail(capturedEmail);
        setStep('payment');
      } else {
        setStep('email');
        setError(null);
        setSelectedMethod(null);
      }
    }
  }, [isPaywallOpen, capturedEmail]);

  // Focus en el input de email al abrir
  useEffect(() => {
    if (isPaywallOpen && step === 'email') {
      setTimeout(() => emailInputRef.current?.focus(), 300);
    }
  }, [isPaywallOpen, step]);

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

  // ─── Email Submit ────────────────────────────────
  const handleEmailSubmit = useCallback(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Ingresa un email válido');
      return;
    }
    setError(null);
    setCapturedEmail(trimmed);
    setStep('payment');
  }, [email, setCapturedEmail]);

  // ─── Iniciar Pago ────────────────────────────────
  const handlePayment = useCallback(async () => {
    if (!selectedMethod || !email) return;

    setIsSubmitting(true);
    setError(null);
    setStep('processing');

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          method: selectedMethod,
          device: paywallContext?.device,
          fingerCount: paywallContext?.fingerCount,
          style: paywallContext?.style,
          source: paywallContext?.source || 'generator',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isPremium) {
          unlock(email);
          return;
        }
        throw new Error(data.error || 'Error procesando el pago');
      }

      // Redirigir al checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Para OXXO con Stripe Elements (clientSecret)
      if (data.clientSecret && selectedMethod === 'oxxo') {
        window.location.href = `/payment/oxxo?secret=${data.clientSecret}&email=${encodeURIComponent(email)}`;
        return;
      }

      throw new Error('No se recibió URL de checkout');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Hubo un error. Intenta de nuevo.';
      setError(message);
      setStep('error');
      setIsSubmitting(false);
    }
  }, [selectedMethod, email, paywallContext, unlock]);

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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => !isSubmitting && hidePaywall()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card principal */}
          <motion.div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-[0_0_80px_rgba(0,255,255,0.08)]"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente */}
            <div className="relative px-6 pt-6 pb-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

              {!isSubmitting && (
                <button
                  onClick={hidePaywall}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Badge de descuento */}
              <motion.div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 text-xs text-cyan-400 mb-3"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-3 h-3" />
                <span className="font-semibold">43% OFF — LANZAMIENTO</span>
              </motion.div>

              {/* Título */}
              <h2 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif] tracking-wide">
                Desbloquea <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">SensiPRO</span>
              </h2>

              {/* Precio */}
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif]">
                  $199
                </span>
                <span className="text-sm text-slate-400">MXN</span>
                <span className="text-lg text-slate-500 line-through">$349</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  -43%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Pago único. Acceso de por vida. Sin suscripción.</p>
            </div>

            {/* Countdown */}
            <div className="mx-6 mb-4 px-4 py-2.5 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">Oferta termina en:</span>
                </div>
                <div className="flex items-center gap-1 font-[family-name:var(--font-orbitron),sans-serif] text-sm text-white">
                  <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold min-w-[28px] text-center">
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <span className="text-red-400/50">:</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold min-w-[28px] text-center">
                    {String(countdown.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-red-400/50">:</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-bold min-w-[28px] text-center">
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Social proof */}
            <div className="mx-6 mb-4 flex items-center gap-2">
              <div className="flex -space-x-2">
                {['🎮', '🎯', '🔫', '💎'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-slate-950 flex items-center justify-center text-xs"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                <span className="text-cyan-400 font-bold">1,860</span> jugadores ya calibraron su sensibilidad
              </p>
            </div>

            {/* Separador */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

            {/* Contenido según step */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">

                {/* STEP: EMAIL */}
                {step === 'email' && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm text-slate-300 mb-3">
                      Ingresa tu email para guardar tu configuración y recibir tu acceso:
                    </p>

                    <div className="relative mb-3">
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                        autoComplete="email"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 mb-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </p>
                    )}

                    <motion.button
                      onClick={handleEmailSubmit}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-cyan-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>

                    <p className="text-[10px] text-slate-600 mt-2 text-center">
                      No spam. Solo tu acceso premium.
                    </p>
                  </motion.div>
                )}

                {/* STEP: PAYMENT */}
                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Features */}
                    <div className="mb-4 space-y-2">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">
                        Lo que desbloqueas:
                      </p>
                      {PREMIUM_FEATURES.map((feat, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-2.5 text-xs"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-slate-300">{feat.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="h-px bg-white/5 my-4" />

                    {/* Selector de método de pago */}
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">
                      Método de pago:
                    </p>

                    <div className="space-y-2 mb-4">
                      {/* Tarjeta */}
                      <button
                        onClick={() => setSelectedMethod('card')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
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

                      {/* OXXO */}
                      <button
                        onClick={() => setSelectedMethod('oxxo')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
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

                      {/* Mercado Pago */}
                      <button
                        onClick={() => setSelectedMethod('mercadopago')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
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
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 mb-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </p>
                    )}

                    {/* Botón PAGAR */}
                    <motion.button
                      onClick={handlePayment}
                      disabled={!selectedMethod || isSubmitting}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
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

                    {/* Garantía */}
                    <div className="mt-4 flex items-start gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-emerald-400 font-medium">Garantía de 7 días</p>
                        <p className="text-[10px] text-slate-500">Si no mejoras tu aim en 7 días, te devolvemos tu dinero. Sin preguntas.</p>
                      </div>
                    </div>

                    {/* Seguridad */}
                    <p className="text-[10px] text-slate-600 mt-3 text-center flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Pago seguro encriptado con SSL
                    </p>
                  </motion.div>
                )}

                {/* STEP: PROCESSING */}
                {step === 'processing' && (
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

                {/* STEP: ERROR */}
                {step === 'error' && (
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
                      onClick={() => { setStep('payment'); setError(null); }}
                      className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Intentar de nuevo
                    </button>
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
