'use client';

import { useState, useCallback } from 'react';
import type { SensitivityOutput, GyroscopeOutput } from '@ares/algorithms';

interface HeadshotCopyButtonProps {
  sensitivity: SensitivityOutput;
  gyroscope?: GyroscopeOutput;
  label?: string;
  className?: string;
}

export function HeadshotCopyButton({ sensitivity, gyroscope, label = 'COPIAR SENSIBILIDAD HEADSHOT', className }: HeadshotCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const lines = [
      '🎯 ARES HEADSHOT MODE',
      `General: ${sensitivity.general}`,
      `Punto Rojo: ${sensitivity.redPoint}`,
      `Mira 2x: ${sensitivity.scope2x}`,
      `Mira 4x: ${sensitivity.scope4x}`,
      `Sniper: ${sensitivity.sniperScope}`,
      `Vista Libre: ${sensitivity.freeView}`,
    ];

    if (gyroscope) {
      lines.push(
        '',
        '📐 Giroscopio:',
        `General: ${gyroscope.gyroGeneral}`,
        `Punto Rojo: ${gyroscope.gyroRedPoint}`,
        `Mira 2x: ${gyroscope.gyroScope2x}`,
        `Mira 4x: ${gyroscope.gyroScope4x}`,
        `Sniper: ${gyroscope.gyroSniper}`,
        `Vista Libre: ${gyroscope.gyroFreeView}`,
      );
    }

    lines.push('', 'sensibilidadespro.com');

    void navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sensitivity, gyroscope]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'w-full min-h-[44px] py-3 px-6 rounded-xl font-ui font-semibold text-sm text-white transition-all',
        copied
          ? 'bg-green-600'
          : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 active:scale-[0.98]',
        className,
      )}
    >
      {copied ? '✅ ¡COPIADO!' : `📋 ${label}`}
    </button>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
