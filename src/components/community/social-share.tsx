'use client';

import { Share2, Copy, Check, MessageCircle, Send as SendIcon } from 'lucide-react';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

// ═══════════════════════════════════════════════════════════════
// SocialShare — Botones de compartir para configs de comunidad
// WhatsApp, Twitter/X, Facebook, Telegram, Copiar, Native Share
// Diseñado para SharedConfig en el feed de comunidad
// ═══════════════════════════════════════════════════════════════

interface SocialShareProps {
  title: string;
  url: string;
  text: string;
}

// Icono SVG inline para Twitter/X
function TwitterIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Icono SVG inline para Facebook
function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://sensibilidadespro.com';

export function SocialShare({ title, url, text }: SocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(fullUrl);

  const links = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${fullUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${fullUrl}`);
      setCopied(true);
      toast('success', '\u00A1Copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('error', 'No se pudo copiar');
    }
  }, [text, fullUrl, toast]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text, url: fullUrl });
      } catch {
        // Usuario cancelo el share nativo
      }
    }
  }, [title, text, fullUrl]);

  return (
    <div className="flex flex-wrap gap-2">
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button variant="ghost" size="sm" onClick={handleNativeShare} leftIcon={<Share2 size={14} />}>
          Compartir
        </Button>
      )}

      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" leftIcon={<MessageCircle size={14} />}>
          WhatsApp
        </Button>
      </a>

      <a href={links.twitter} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" leftIcon={<TwitterIcon size={14} />}>
          Twitter
        </Button>
      </a>

      <a href={links.facebook} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" leftIcon={<FacebookIcon size={14} />}>
          Facebook
        </Button>
      </a>

      <a href={links.telegram} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="sm" leftIcon={<SendIcon size={14} />}>
          Telegram
        </Button>
      </a>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        leftIcon={copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      >
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
    </div>
  );
}
