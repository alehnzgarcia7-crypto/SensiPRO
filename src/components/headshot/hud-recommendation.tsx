'use client';

import {
  getHudLayout,
  FINGER_PROFILES,
  type FingerCount,
} from '@ares/algorithms';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

import { cn } from '@/lib/cn';

import { HeadshotHudCodes } from './headshot-hud-codes';

interface HudRecommendationProps {
  fingers: FingerCount;
}

const FINGER_OPTIONS: FingerCount[] = [2, 3, 4];

export function HudRecommendation({ fingers }: HudRecommendationProps) {
  const layout = getHudLayout(fingers);
  const [showCompare, setShowCompare] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyHud = useCallback(() => {
    const lines = [
      `🎮 SensiPRO — HUD Recomendado (${fingers} Dedos)`,
      '',
    ];

    for (const role of layout.fingerRoles) {
      lines.push(`${role.fingerEs}: ${role.actionsEs.join(', ')}`);
    }

    lines.push('');
    if (layout.proTipsEs.length > 0) {
      lines.push(`Tips: ${layout.proTipsEs[0]}`);
    }
    lines.push('sensibilidadespro.com');

    void navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [fingers, layout]);

  return (
    <div>
      {/* Section header */}
      <h3 className="font-heading font-bold text-white text-xl md:text-2xl mb-1">
        TU HUD PERSONALIZADO PARA {fingers} DEDOS
      </h3>
      <p className="text-sm text-slate-500 font-body mb-5">
        {layout.descriptionEs}
      </p>

      {/* HUD Codes — Códigos reales para copiar y pegar */}
      <div className="mb-4">
        <HeadshotHudCodes fingers={fingers} />
      </div>

      {/* Pro Tips + Mistakes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Pro Tips */}
        <div className="glass-card p-4">
          <p className="text-xs font-heading uppercase tracking-[0.12em] text-green-400/80 mb-2">
            Pro Tips
          </p>
          <div className="space-y-1.5">
            {layout.proTipsEs.map((tip, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[10px] text-green-500 shrink-0 mt-px">✅</span>
                <p className="text-[11px] text-slate-400 font-body leading-snug">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="glass-card p-4">
          <p className="text-xs font-heading uppercase tracking-[0.12em] text-red-400/80 mb-2">
            Errores Comunes
          </p>
          <div className="space-y-1.5">
            {layout.mistakesEs.map((mistake, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[10px] text-red-500 shrink-0 mt-px">❌</span>
                <p className="text-[11px] text-slate-400 font-body leading-snug">{mistake}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transition Guide */}
      {layout.transitionEs && (
        <div className="glass-card p-4 mb-4 border-blue-500/10">
          <div className="flex items-start gap-2">
            <span className="text-sm shrink-0">🔄</span>
            <div>
              <p className="text-xs font-heading uppercase tracking-[0.12em] text-blue-400/80 mb-1">
                Guía de Transición
              </p>
              <p className="text-xs text-slate-400 font-body">{layout.transitionEs}</p>
            </div>
          </div>
        </div>
      )}

      {/* Adaptation time */}
      <div className="glass-card p-3 mb-4 text-center">
        <p className="text-xs text-slate-400 font-body">
          ⏱️ Tiempo de adaptación: <span className="font-ui font-bold text-white">~{layout.adaptationDays} días</span>
        </p>
      </div>

      {/* Compare Layouts toggle */}
      <button
        onClick={() => setShowCompare(!showCompare)}
        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-ui font-semibold text-slate-400 bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-all mb-4"
      >
        {showCompare ? '▼ Ocultar Comparación' : '▶ Comparar Layouts (2 vs 3 vs 4)'}
      </button>

      <AnimatePresence>
        {showCompare && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-4"
          >
            <div className="grid grid-cols-3 gap-2">
              {FINGER_OPTIONS.map((f) => {
                const l = getHudLayout(f);
                const profile = FINGER_PROFILES[f];
                const isActive = f === fingers;

                return (
                  <div
                    key={f}
                    className={cn(
                      'rounded-xl p-2 border transition-all',
                      isActive
                        ? 'bg-red-500/5 border-red-500/25 shadow-[0_0_15px_rgba(239,68,68,0.08)]'
                        : 'bg-white/[0.02] border-white/[0.05] opacity-60',
                    )}
                  >
                    {/* Stats */}
                    <p className="text-[10px] font-heading font-bold text-center text-white mb-1">
                      {f} Dedos
                    </p>
                    <div className="space-y-0.5 text-center">
                      <p className="text-[9px] text-slate-500 font-body">
                        {profile.capabilities.simultaneousActions} acciones
                      </p>
                      <p className="text-[9px] text-slate-500 font-body">
                        {profile.competitiveLabelEs}
                      </p>
                      <p className="text-[9px] text-slate-600 font-body">
                        ~{l.adaptationDays}d adaptación
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy HUD button */}
      <button
        onClick={handleCopyHud}
        className={cn(
          'w-full min-h-[44px] px-4 py-3 rounded-xl text-sm font-ui font-bold transition-all',
          copied
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.06] hover:border-white/15',
        )}
      >
        {copied ? '✅ Copiado al portapapeles' : '📋 Copiar Configuración HUD'}
      </button>
    </div>
  );
}
