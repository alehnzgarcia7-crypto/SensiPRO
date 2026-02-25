'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — GeneratorFlow — Flujo principal con staggered animations
// Orchestrated page load, animated progress, premium header
// ═══════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import { useGeneratorStore } from '@/stores/generator.store';
import { GlowProgressBar } from '@/components/effects/glow-progress-bar';

import { BrandStep } from './steps/brand-step';
import { DeviceStep } from './steps/device-step';
import { StyleStep } from './steps/style-step';
import { ResultPanel } from './result-panel';

const stepTransition = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export function GeneratorFlow() {
  const { step, result, allCalibrations, goBack, reset } = useGeneratorStore();

  if (allCalibrations || result) {
    return <ResultPanel onReset={reset} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-4 mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
        <AnimatePresence>
          {step > 1 && (
            <motion.button
              onClick={goBack}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-white/[0.05] hover:border-white/10"
            >
              <ArrowLeft size={20} className="text-slate-400" />
            </motion.button>
          )}
        </AnimatePresence>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-heading font-black text-white uppercase tracking-[0.1em]">
            Generador
          </h1>
          <p className="text-xs font-ui text-slate-500 mt-0.5">Paso {step} de 3</p>
        </div>
      </motion.div>

      {/* Progress bar con glow */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <GlowProgressBar value={step} max={3} />
      </motion.div>

      {/* Steps con animación de transición */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          {...stepTransition}
        >
          {step === 1 && <BrandStep />}
          {step === 2 && <DeviceStep />}
          {step === 3 && <StyleStep />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
