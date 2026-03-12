/**
 * PremiumBlur — El velo que cubre los resultados
 *
 * Envuelve cualquier contenido premium.
 * Si NO es premium: blur + overlay + lock animado
 * Si ES premium: contenido normal sin blur
 */

'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles, Crown, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
}: PremiumBlurProps) {
  const { isPremium, isLoading, showPaywall } = usePremiumContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

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
        className="absolute inset-0 flex flex-col items-center justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          background: `
            radial-gradient(ellipse at center,
              rgba(0,0,0,0.3) 0%,
              rgba(0,0,0,0.6) 50%,
              rgba(0,0,0,0.8) 100%
            )
          `,
        }}
      >
        {/* Partículas flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
              style={{
                left: `${20 + (i * 10) % 60}%`,
                top: `${20 + (i * 13) % 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Icono de candado con glow */}
        <motion.div
          className="relative mb-4"
          animate={isHovering ? { scale: 1.1 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="absolute inset-0 -m-4 bg-cyan-500/20 rounded-full blur-xl" />

          <motion.div
            className="absolute -inset-3 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(0,255,255,0.3), transparent)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative w-14 h-14 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>
        </motion.div>

        {/* Texto principal */}
        <motion.h3
          className="text-lg sm:text-xl font-bold text-white text-center mb-1 font-[family-name:var(--font-orbitron),sans-serif] tracking-wide"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          TU CONFIGURACIÓN ESTÁ LISTA
        </motion.h3>

        <motion.p
          className="text-sm text-slate-400 text-center mb-5 max-w-xs px-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Los 5 valores restantes están calculados y esperando por ti. Desbloquea para ver tu configuración completa.
        </motion.p>

        {/* Valor General revelado (si aplica) */}
        {revealFirst && revealedGeneral && (
          <motion.div
            className="mb-4 px-4 py-2 rounded-lg bg-white/5 border border-cyan-500/20 backdrop-blur-sm"
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
          className="group relative px-6 py-3 rounded-xl overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Borde gradiente animado */}
          <div
            className="absolute inset-0 rounded-xl p-[1px]"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #06b6d4)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite',
            }}
          >
            <div className="w-full h-full rounded-xl bg-black/80 backdrop-blur-sm" />
          </div>

          {/* Shimmer */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <motion.div
              className="absolute inset-0 -translate-x-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              }}
              animate={{ translateX: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
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
          className="mt-3 flex items-center gap-2 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-slate-500 line-through">$349</span>
          <span className="text-cyan-400 font-bold">$199 MXN</span>
          <span className="text-slate-500">{'\u2022'} Pago único</span>
        </motion.div>

        {/* Restaurar acceso para usuarios que ya compraron */}
        <motion.button
          onClick={() => {
            const userEmail = prompt('Ingresa el email con el que compraste:');
            if (userEmail && userEmail.includes('@')) {
              fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
              })
                .then(r => r.json())
                .then(data => {
                  if (data.isPremium) {
                    document.cookie = `sensipro_premium=${encodeURIComponent(userEmail)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
                    localStorage.setItem('sensipro_premium_email', userEmail);
                    window.location.reload();
                  } else {
                    alert('No encontramos una licencia premium con ese email.');
                  }
                })
                .catch(() => alert('Error verificando. Intenta de nuevo.'));
            }
          }}
          className="mt-2 text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          ¿Ya compraste? Restaurar acceso
        </motion.button>
      </motion.div>

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
