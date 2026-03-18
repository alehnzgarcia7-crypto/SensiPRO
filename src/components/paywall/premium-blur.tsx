/**
 * PremiumBlur — El velo que cubre los resultados
 *
 * Envuelve cualquier contenido premium.
 * Si NO es premium: blur + overlay + lock animado
 * Si ES premium: contenido normal sin blur
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, Crown, Zap, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';

import {
  trackEvent, INTERNAL_EVENTS, ttViewContent, ttClickButton,
  CONTENT_IDS, hasEventFired, markEventFired,
} from '@/lib/analytics';
import { usePremiumContext } from '@/providers/premium-provider';

interface PremiumBlurProps {
  children: React.ReactNode;
  intensity?: number;
  revealFirst?: boolean;
  source?: 'generator' | 'headshot' | 'academy' | 'pricing' | 'landing';
  device?: string;
  fingerCount?: number;
  style?: string;
  revealedGeneral?: number;
  className?: string;
  /** Posiciona el CTA en la parte superior en vez de centrado (para contenido largo como headshot) */
  ctaTop?: boolean;
}

export function PremiumBlur({
  children,
  intensity = 12,
  revealFirst = false,
  source = 'generator',
  device,
  fingerCount,
  style,
  revealedGeneral,
  className = '',
  ctaTop = false,
}: PremiumBlurProps) {
  const { isPremium, isLoading, showPaywall } = usePremiumContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showRestoreInput, setShowRestoreInput] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restoreState, setRestoreState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleRestore = useCallback(async () => {
    const emailToCheck = restoreEmail.trim().toLowerCase();
    if (!emailToCheck || !emailToCheck.includes('@') || !emailToCheck.includes('.')) return;

    setRestoreState('loading');
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck }),
      });
      const data = await res.json();
      if (data.isPremium) {
        setRestoreState('success');
        document.cookie = `sensipro_premium=${encodeURIComponent(emailToCheck)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
        localStorage.setItem('sensipro_premium_email', emailToCheck);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setRestoreState('error');
      }
    } catch {
      setRestoreState('error');
    }
  }, [restoreEmail]);

  // Track blur shown once per source — must be before early returns
  useEffect(() => {
    if (!isPremium && !isLoading) {
      const blurKey = `blur_shown_${source}`;
      if (!hasEventFired(blurKey)) {
        markEventFired(blurKey);
        trackEvent({ event: INTERNAL_EVENTS.BLUR_SHOWN, properties: { source } });
        ttViewContent({ contentId: CONTENT_IDS.PAYWALL_BLUR, contentType: 'paywall', description: source });
      }
    }
  }, [isPremium, isLoading, source]);

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-white/5 rounded-lg w-3/4" />
          <div className="h-6 bg-white/5 rounded-lg w-full" />
          <div className="h-6 bg-white/5 rounded-lg w-5/6" />
          <div className="h-6 bg-white/5 rounded-lg w-full" />
          <div className="h-6 bg-white/5 rounded-lg w-4/6" />
        </div>
      </div>
    );
  }

  if (isPremium) {
    return <div className={className}>{children}</div>;
  }

  const handleUnlockClick = () => {
    trackEvent({ event: INTERNAL_EVENTS.UNLOCK_CTA_CLICKED, properties: { source } });
    ttClickButton({ contentId: CONTENT_IDS.PAYWALL_BLUR, description: `unlock:${source}` });
    showPaywall({
      source,
      device,
      fingerCount,
      style,
      revealedGeneral,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Contenido real (blurreado) */}
      <div
        className="select-none pointer-events-none"
        style={{
          filter: `blur(${intensity}px)`,
          WebkitFilter: `blur(${intensity}px)`,
          transition: 'filter 0.3s ease',
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay con gradiente premium */}
      <motion.div
        className={`absolute inset-0 flex flex-col items-center z-10 ${ctaTop ? 'justify-start pt-8 sm:pt-12' : 'justify-center'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          background: ctaTop
            ? `linear-gradient(to bottom,
                rgba(0,0,0,0.5) 0%,
                rgba(0,0,0,0.85) 30%,
                rgba(0,0,0,0.95) 60%,
                rgba(0,0,0,1) 100%
              )`
            : `radial-gradient(ellipse at center,
                rgba(0,0,0,0.3) 0%,
                rgba(0,0,0,0.6) 50%,
                rgba(0,0,0,0.8) 100%
              )`,
        }}
      >
        {/* Icono de candado con glow */}
        <motion.div
          className="relative mb-4"
          animate={isHovering ? { scale: 1.1 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="absolute inset-0 -m-4 bg-cyan-500/20 rounded-full blur-xl" />

          <div
            className="absolute -inset-3 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(0,255,255,0.3), transparent)',
            }}
          />

          <div className="relative w-14 h-14 rounded-full bg-black/70 border border-cyan-500/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>
        </motion.div>

        {/* Texto principal */}
        <motion.h3
          className="text-lg sm:text-xl font-bold text-white text-center mb-2 font-[family-name:var(--font-orbitron),sans-serif] tracking-wide"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          TU CONFIGURACIÓN ESTÁ LISTA
        </motion.h3>

        <motion.p
          className="text-sm text-slate-400 text-center mb-6 max-w-xs px-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Los 5 valores restantes están calculados y esperando por ti. Desbloquea para ver tu configuración completa.
        </motion.p>

        {/* Valor General revelado (si aplica) */}
        {revealFirst && revealedGeneral && (
          <motion.div
            className="mb-4 px-4 py-2 rounded-lg bg-white/5 border border-cyan-500/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
          >
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">General:</span>
              <span className="text-cyan-400 font-bold font-[family-name:var(--font-orbitron),sans-serif] text-lg">
                {revealedGeneral}
              </span>
              <span className="text-slate-500 text-xs">/ 200</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 text-center">
              5 valores personalizados listos
            </p>
          </motion.div>
        )}

        {/* Botón de desbloqueo */}
        <motion.button
          onClick={handleUnlockClick}
          className="group relative px-8 py-4 min-h-[52px] rounded-xl overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Borde gradiente */}
          <div
            className="absolute inset-0 rounded-xl p-[1px]"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #06b6d4)',
            }}
          >
            <div className="w-full h-full rounded-xl bg-black/80" />
          </div>

          {/* Contenido del botón */}
          <div className="relative flex items-center gap-2 text-white font-semibold text-sm">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span>VER MI CONFIGURACIÓN</span>
            <Sparkles className="w-4 h-4 text-cyan-400 group-hover:text-yellow-400 transition-colors" />
          </div>
        </motion.button>

        {/* Texto de precio */}
        <motion.div
          className="mt-4 flex items-center gap-2 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-slate-500 line-through">$349</span>
          <span className="text-cyan-400 font-bold">$199 MXN</span>
          <span className="text-slate-500">{'\u2022'} Pago único</span>
        </motion.div>

        {/* Restaurar acceso para usuarios que ya compraron */}
        <motion.div
          className="mt-3 flex flex-col items-center w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {!showRestoreInput ? (
            <button
              onClick={() => {
                setShowRestoreInput(true);
                setRestoreState('idle');
                setRestoreEmail('');
                setTimeout(() => restoreInputRef.current?.focus(), 200);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer underline underline-offset-2"
            >
              ¿Ya compraste? Restaurar acceso
            </button>
          ) : (
            <AnimatePresence mode="wait">
              {restoreState === 'success' ? (
                <motion.div
                  key="success"
                  className="flex items-center gap-2 text-xs text-emerald-400"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acceso restaurado</span>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="w-full space-y-2"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <div className="flex gap-2">
                    <input
                      ref={restoreInputRef}
                      type="email"
                      value={restoreEmail}
                      onChange={(e) => { setRestoreEmail(e.target.value); setRestoreState('idle'); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleRestore()}
                      placeholder="tu@email.com"
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50 transition-colors"
                      disabled={restoreState === 'loading'}
                    />
                    <button
                      onClick={handleRestore}
                      disabled={restoreState === 'loading' || !restoreEmail.includes('@')}
                      className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {restoreState === 'loading' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Restaurar'
                      )}
                    </button>
                  </div>
                  {restoreState === 'error' && (
                    <motion.p
                      className="flex items-center gap-1 text-[10px] text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <XCircle className="w-3 h-3" />
                      No encontramos una compra con ese email
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>

    </div>
  );
}
