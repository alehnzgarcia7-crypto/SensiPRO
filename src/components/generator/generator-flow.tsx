'use client';

import { ArrowLeft } from 'lucide-react';

import { useGeneratorStore } from '@/stores/generator.store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

import { BrandStep } from './steps/brand-step';
import { DeviceStep } from './steps/device-step';
import { StyleStep } from './steps/style-step';
import { ResultPanel } from './result-panel';

export function GeneratorFlow() {
  const { step, result, allCalibrations, goBack, reset } = useGeneratorStore();

  if (allCalibrations || result) {
    return <ResultPanel onReset={reset} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {step > 1 && (
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-white">Generador</h1>
          <p className="text-sm text-slate-500">Paso {step} de 3</p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={step} max={3} size="sm" color="gradient" className="mb-8" />

      {/* Steps */}
      {step === 1 && <BrandStep />}
      {step === 2 && <DeviceStep />}
      {step === 3 && <StyleStep />}
    </div>
  );
}
