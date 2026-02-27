'use client';

import { Copy, Check, Share2 } from 'lucide-react';
import { useState } from 'react';

import { useToast } from '@/components/ui/toast';

interface CopyReferralCodeProps {
  code: string;
}

export function CopyReferralCode({ code }: CopyReferralCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${code}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast('success', '¡Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('error', 'No se pudo copiar');
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Sensibilidades PRO — Invitación',
          text: `¡Únete a Sensibilidades PRO con mi código ${code} y obtén 7 días Premium gratis!`,
          url: shareUrl,
        });
      } catch {
        // Usuario canceló el share dialog
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-background-base rounded-gaming p-3 font-mono text-lg text-fire-400 tracking-wider text-center select-all">
          {code}
        </div>
        <button
          onClick={handleCopy}
          className="min-h-[44px] min-w-[44px] p-3 rounded-gaming bg-fire-500/10 hover:bg-fire-500/20 text-fire-500 transition-colors"
          aria-label="Copiar link de referido"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 min-h-[44px] w-full rounded-gaming bg-gradient-to-r from-fire-500 to-fire-600 text-white font-ui font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        <Share2 size={16} />
        Compartir invitación
      </button>
    </div>
  );
}
