'use client';

import { Sword, Target, Crosshair } from 'lucide-react';
import type { SensitivityStyle } from '@prisma/client';

import { useGeneratorStore } from '@/stores/generator.store';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/cn';

interface StyleOption {
  key: SensitivityStyle;
  name: string;
  icon: typeof Sword;
  description: string;
  color: string;
  border: string;
}

const STYLES: StyleOption[] = [
  {
    key: 'AGGRESSIVE',
    name: 'Agresivo',
    icon: Sword,
    description: 'Giros rapidos, aim agresivo. Para rushers.',
    color: 'text-style-aggressive',
    border: 'border-style-aggressive/30',
  },
  {
    key: 'BALANCED',
    name: 'Balanceado',
    icon: Target,
    description: 'Equilibrio perfecto. Para todos.',
    color: 'text-style-balanced',
    border: 'border-style-balanced/30',
  },
  {
    key: 'SNIPER',
    name: 'Francotirador',
    icon: Crosshair,
    description: 'Maxima precision en scopes.',
    color: 'text-style-sniper',
    border: 'border-style-sniper/30',
  },
];

export function StyleStep() {
  const {
    selectedDevice,
    selectedStyle,
    selectStyle,
    includeGyro,
    setIncludeGyro,
    isLoading,
    error,
    setLoading,
    setResult,
    setError,
  } = useGeneratorStore();

  const handleGenerate = async () => {
    if (!selectedDevice) return;
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDevice.id,
          style: selectedStyle,
          includeGyro,
        }),
      });

      const data: { success: boolean; data?: Parameters<typeof setResult>[0]; error?: { message: string } } = await res.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error?.message ?? 'Error al generar');
      }
    } catch {
      setError('Error de conexion. Intenta de nuevo.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        Elige tu estilo
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        {selectedDevice?.brand} {selectedDevice?.model} — {selectedDevice?.tier}
      </p>

      {/* Estilos de juego */}
      <div className="space-y-3 mb-8">
        {STYLES.map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyle === style.key;
          return (
            <button
              key={style.key}
              onClick={() => selectStyle(style.key)}
              className={cn(
                'w-full glass p-5 flex items-center gap-4 transition-all min-h-[44px]',
                isSelected ? `${style.border} border shadow-lg` : 'hover:border-white/10',
              )}
            >
              <Icon size={24} className={style.color} />
              <div className="text-left flex-1">
                <p className={cn('font-display font-bold', isSelected ? 'text-white' : 'text-slate-300')}>
                  {style.name}
                </p>
                <p className="text-xs text-slate-500">{style.description}</p>
              </div>
              {isSelected && (
                <div className={cn('w-3 h-3 rounded-full', style.color.replace('text-', 'bg-'))} />
              )}
            </button>
          );
        })}
      </div>

      {/* Gyro toggle */}
      <div className="glass p-4 mb-8 flex items-center justify-between">
        <div>
          <p className="font-ui font-medium text-white text-sm">Giroscopio</p>
          <p className="text-xs text-slate-500">Incluir valores de giroscopio (Premium)</p>
        </div>
        <Toggle checked={includeGyro} onChange={setIncludeGyro} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-gaming bg-danger/10 border border-danger/30 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Generate button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => void handleGenerate()}
        isLoading={isLoading}
      >
        Generar Sensibilidad
      </Button>
    </div>
  );
}
