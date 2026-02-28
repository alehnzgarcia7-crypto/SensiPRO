/**
 * UnlockAnimation — El momento épico de desbloqueo
 *
 * Se muestra sobre toda la pantalla cuando el pago es exitoso.
 * Lock → Unlock → Celebrate → Auto-dismiss (~2.5s)
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, Crown, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface UnlockAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function UnlockAnimation({ show, onComplete }: UnlockAnimationProps) {
  const [phase, setPhase] = useState<'lock' | 'unlock' | 'celebrate' | 'done'>('lock');

  useEffect(() => {
    if (!show) {
      setPhase('lock');
      return;
    }

    setPhase('lock');
    const t1 = setTimeout(() => setPhase('unlock'), 400);
    const t2 = setTimeout(() => setPhase('celebrate'), 1000);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
            animate={{
              backgroundColor: phase === 'celebrate'
                ? 'rgba(0,0,0,0.3)'
                : 'rgba(0,0,0,0.9)',
            }}
            transition={{ duration: 0.8 }}
          />

          {/* Partículas explosivas */}
          {phase === 'celebrate' && (
            <>
              {[...Array(20)].map((_, i) => {
                const angle = (i / 20) * 360;
                const rad = (angle * Math.PI) / 180;
                const distance = 100 + (i * 7) % 150;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#8b5cf6' : '#fbbf24',
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{
                      x: Math.cos(rad) * distance,
                      y: Math.sin(rad) * distance,
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 1.2,
                      ease: 'easeOut',
                      delay: (i % 6) * 0.05,
                    }}
                  />
                );
              })}
            </>
          )}

          {/* Icono central */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.2 }}
          >
            {/* Glow */}
            <motion.div
              className="absolute -inset-8 rounded-full"
              animate={{
                boxShadow: phase === 'celebrate'
                  ? '0 0 120px 40px rgba(6,182,212,0.4), 0 0 60px 20px rgba(139,92,246,0.3)'
                  : '0 0 40px 10px rgba(6,182,212,0.1)',
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Icono */}
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/40 flex items-center justify-center backdrop-blur-sm"
              animate={{
                borderColor: phase === 'celebrate' ? 'rgba(6,182,212,0.8)' : 'rgba(6,182,212,0.4)',
                scale: phase === 'unlock' ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.4 }}
            >
              <AnimatePresence mode="wait">
                {phase === 'lock' && (
                  <motion.div key="lock" exit={{ scale: 0, rotate: -45 }}>
                    <Crown className="w-8 h-8 text-slate-400" />
                  </motion.div>
                )}
                {(phase === 'unlock' || phase === 'celebrate') && (
                  <motion.div
                    key="unlock"
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <Unlock className="w-8 h-8 text-cyan-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Texto */}
            <AnimatePresence>
              {phase === 'celebrate' && (
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-orbitron),sans-serif] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    DESBLOQUEADO
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </h3>
                  <p className="text-sm text-cyan-400 mt-1">
                    Tu sensibilidad premium está lista
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
