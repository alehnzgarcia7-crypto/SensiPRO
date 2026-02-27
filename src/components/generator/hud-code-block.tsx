'use client';

// ═══════════════════════════════════════════════════════════════
// ARES — HUD Code Block — Muestra un código HUD REAL de Free Fire
// con estilo terminal/consola verde Matrix, botón copiar con feedback,
// badge de pro player si aplica, e instrucciones de importación.
// ═══════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { Clipboard, Check, Star } from 'lucide-react';
import { useState, useCallback } from 'react';

import { cn } from '@/lib/cn';

interface HudCodeBlockProps {
  code: string;
  label: string;
  playerName?: string | null;
}

export function HudCodeBlock({ code, label: _label, playerName }: HudCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
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
        <p className="text-[10px] text-slate-500 font-heading uppercase tracking-[0.12em]">
          Codigo HUD
        </p>
        {playerName && (
          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-ui font-semibold">
            <Star size={10} className="fill-amber-400" />
            Pro: {playerName}
          </span>
        )}
      </div>
      <div
        className={cn(
          'group/hud relative flex items-center justify-between gap-2 rounded-xl border px-3 py-3',
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

        {/* Scanline sweep on hover */}
        <div
          className="pointer-events-none absolute left-0 right-0 h-[2px] opacity-0 group-hover/hud:opacity-100"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.15), transparent)',
            animation: 'scanline 2s linear infinite',
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

        {/* Boton copiar — con morph icon y flash */}
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            'relative z-10 shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center gap-1.5',
            'rounded-lg border font-ui text-xs font-bold tracking-wider uppercase transition-all duration-200',
            copied
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(0,255,65,0.2)]'
              : 'bg-white/[0.03] border-emerald-900/40 text-emerald-400/70 hover:border-emerald-500/40 hover:bg-emerald-500/10',
          )}
          aria-label="Copiar codigo"
        >
          <motion.div
            key={copied ? 'check' : 'copy'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
          </motion.div>
          <span className="hidden sm:inline">
            {copied ? 'Copiado' : 'Copiar'}
          </span>
        </motion.button>
      </div>
      <p className="text-[9px] text-slate-600 leading-relaxed">
        Ajustes &rarr; En Partida &rarr; Usar codigo compartido &rarr; Pegar &rarr; Aplicar
      </p>
    </div>
  );
}
