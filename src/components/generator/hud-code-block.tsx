'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Check } from 'lucide-react';

import { cn } from '@/lib/cn';

interface HudCodeBlockProps {
  fingers: 2 | 3 | 4;
  deviceId: string;
}

const FINGER_PREFIX: Record<2 | 3 | 4, string> = {
  2: 'FF2D',
  3: 'FF3D',
  4: 'FF4D',
};

/**
 * Genera un código HUD pseudo-determinístico basado en deviceId y fingers.
 * Mismo device + fingers = mismo código siempre.
 */
function generateHudCode(deviceId: string, fingers: 2 | 3 | 4): string {
  const prefix = FINGER_PREFIX[fingers];

  // Hash simple del deviceId para generar segmentos determinísticos
  let hash = 0;
  const seed = `${deviceId}-${fingers}`;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }

  // Caracteres seguros (sin 0/O/1/I para evitar confusión)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function segmentFromHash(h: number): string {
    let result = '';
    let val = Math.abs(h);
    for (let i = 0; i < 4; i++) {
      result += chars[val % chars.length];
      val = Math.floor(val / chars.length) + (i + 1) * 7;
    }
    return result;
  }

  const seg1 = segmentFromHash(hash);
  const seg2 = segmentFromHash(hash * 31 + 17);

  return `${prefix}-${seg1}-${seg2}`;
}

export function HudCodeBlock({ fingers, deviceId }: HudCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const code = generateHudCode(deviceId, fingers);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback para navegadores sin Clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-slate-500 font-ui uppercase tracking-wider">
        Código de importación
      </p>
      <div
        className={cn(
          'flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5',
          'bg-[#0a0e1a] border-white/10',
        )}
      >
        <code className="font-mono text-sm md:text-base font-bold tracking-widest text-ice-300 select-all">
          {code}
        </code>
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md transition-colors',
            copied
              ? 'bg-success/20 text-success'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10',
          )}
          aria-label="Copiar código"
        >
          {copied ? <Check size={16} /> : <Clipboard size={16} />}
        </motion.button>
        {copied && (
          <span className="text-xs font-medium text-emerald-400 shrink-0 animate-pulse">
            ¡Copiado!
          </span>
        )}
      </div>
    </div>
  );
}
