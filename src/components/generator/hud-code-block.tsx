'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — HUD Code Block — Muestra un código HUD REAL de Free Fire
// con estilo terminal/consola verde Matrix, botón copiar con feedback,
// badge de pro player si aplica, e instrucciones de importación.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Check, Star } from 'lucide-react';

import { cn } from '@/lib/cn';

interface HudCodeBlockProps {
  code: string;
  label: string;
  playerName?: string | null;
}

export function HudCodeBlock({ code, label, playerName }: HudCodeBlockProps) {
  const [copied, setCopied] = useState(false);

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
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500 font-ui uppercase tracking-wider">
          Código HUD • Free Fire
        </p>
        {playerName && (
          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-ui font-semibold">
            <Star size={10} className="fill-amber-400" />
            Pro Player: {playerName}
          </span>
        )}
      </div>
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
          className="flex-1 font-mono text-[11px] md:text-sm font-bold tracking-[0.08em] select-all break-all"
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
      <p className="text-[9px] text-slate-600 leading-relaxed">
        📲 Ajustes → En Partida → Usar código compartido → Pegar → Aplicar
      </p>
    </div>
  );
}
