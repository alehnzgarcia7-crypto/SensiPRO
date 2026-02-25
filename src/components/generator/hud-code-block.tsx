'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — HUD Code Block — Estilo terminal/consola con scanlines,
// código monospace verde Matrix, y botón copiar con feedback.
// ═══════════════════════════════════════════════════════════════

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
    <div className="space-y-1.5">
      <p className="text-[10px] text-slate-500 font-ui uppercase tracking-wider">
        Código de importación
      </p>
      <div
        className={cn(
          'relative flex items-center justify-between gap-2 rounded-lg border px-3 py-3',
          'bg-[#020804] border-emerald-900/30 overflow-hidden',
        )}
      >
        {/* Scanlines overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)',
          }}
        />

        {/* Prompt indicator */}
        <span
          className="shrink-0 font-mono text-xs select-none"
          style={{ color: '#00ff41', opacity: 0.4 }}
        >
          &gt;
        </span>

        {/* Código */}
        <code
          className="flex-1 font-mono text-sm md:text-base font-bold tracking-[0.2em] select-all"
          style={{ color: '#00ff41', textShadow: '0 0 8px rgba(0, 255, 65, 0.3)' }}
        >
          {code}
        </code>

        {/* Botón copiar */}
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'relative z-10 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center gap-1.5',
            'rounded-md border font-ui text-xs font-semibold tracking-wider uppercase transition-all duration-200',
            copied
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-white/[0.03] border-ice-500/20 text-ice-400 hover:border-ice-400/40 hover:bg-ice-500/10 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]',
          )}
          aria-label="Copiar código"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span className="hidden sm:inline">Copiado</span>
            </>
          ) : (
            <>
              <Clipboard size={14} />
              <span className="hidden sm:inline">Copiar</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
