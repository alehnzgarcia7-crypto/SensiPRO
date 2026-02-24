'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Hand } from 'lucide-react';

import type { HudRecommendation } from '@ares/algorithms';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/card';

interface HudRecommendationPanelProps {
  data: HudRecommendation;
}

const FINGER_EMOJI: Record<number, string> = {
  2: '✌️',
  3: '🤟',
  4: '🖐️',
};

export function HudRecommendationPanel({ data }: HudRecommendationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Header colapsable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 min-h-[44px] hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Hand size={18} className="text-fire-400" />
          <div className="text-left">
            <p className="text-sm font-ui font-semibold text-white">Custom HUD</p>
            <p className="text-xs text-slate-500">
              Recomendado: <span className="text-fire-400 font-semibold">{data.recommended} dedos</span>
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-slate-500" />
        </motion.div>
      </button>

      {/* Contenido expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {data.options.map((option) => (
                <div
                  key={option.fingers}
                  className={cn(
                    'p-3 rounded-xl border transition-all',
                    option.isRecommended
                      ? 'border-ice-500/30 bg-ice-500/5'
                      : 'border-white/5 bg-white/[0.02]',
                  )}
                >
                  {/* Encabezado de la opción */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{FINGER_EMOJI[option.fingers]}</span>
                    <span className="text-sm font-display font-bold text-white">
                      {option.fingers} Dedos
                    </span>
                    {option.isRecommended && (
                      <span className="flex items-center gap-1 text-[10px] font-ui font-semibold text-ice-400 bg-ice-500/10 px-2 py-0.5 rounded-full">
                        <Check size={10} />
                        Recomendado
                      </span>
                    )}
                  </div>

                  {/* Descripción */}
                  <p className="text-xs text-slate-400 mb-2">{option.description}</p>

                  {/* Pros y Cons */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      {option.pros.map((pro) => (
                        <p key={pro} className="text-[10px] text-emerald-400 flex items-start gap-1">
                          <span className="shrink-0 mt-0.5">+</span>
                          <span>{pro}</span>
                        </p>
                      ))}
                    </div>
                    <div className="space-y-1">
                      {option.cons.map((con) => (
                        <p key={con} className="text-[10px] text-red-400 flex items-start gap-1">
                          <span className="shrink-0 mt-0.5">−</span>
                          <span>{con}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
