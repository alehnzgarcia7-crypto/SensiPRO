import type { SensitivityStyle } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════
// Share Links — Generador de enlaces para compartir en redes
// WhatsApp, Twitter/X, Facebook, Telegram + copy-to-clipboard
// ═══════════════════════════════════════════════════════════════

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com';

export interface ShareData {
  deviceBrand: string;
  deviceModel: string;
  deviceSlug: string;
  style: SensitivityStyle;
}

export interface ShareLinks {
  whatsapp: string;
  twitter: string;
  facebook: string;
  telegram: string;
  copyText: string;
  url: string;
}

const STYLE_EMOJI: Record<SensitivityStyle, string> = {
  AGGRESSIVE: '\u2694\uFE0F',
  BALANCED: '\uD83C\uDFAF',
  SNIPER: '\uD83D\uDD2D',
};

const STYLE_LABELS: Record<SensitivityStyle, string> = {
  AGGRESSIVE: 'Agresivo',
  BALANCED: 'Balanceado',
  SNIPER: 'Francotirador',
};

function getShareUrl(data: ShareData): string {
  return `${SITE_URL}/devices/${data.deviceSlug}?style=${data.style.toLowerCase()}`;
}

function getShareText(data: ShareData): string {
  return `${STYLE_EMOJI[data.style]} Sensibilidades ${STYLE_LABELS[data.style]} para ${data.deviceBrand} ${data.deviceModel} en Free Fire \u2014 \u00A1generadas en SensiPRO! \uD83D\uDD25`;
}

export function getWhatsAppLink(data: ShareData): string {
  const text = encodeURIComponent(`${getShareText(data)}\n\n${getShareUrl(data)}`);
  return `https://wa.me/?text=${text}`;
}

export function getTwitterLink(data: ShareData): string {
  const text = encodeURIComponent(getShareText(data));
  const url = encodeURIComponent(getShareUrl(data));
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
}

export function getFacebookLink(data: ShareData): string {
  const url = encodeURIComponent(getShareUrl(data));
  return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
}

export function getTelegramLink(data: ShareData): string {
  const text = encodeURIComponent(getShareText(data));
  const url = encodeURIComponent(getShareUrl(data));
  return `https://t.me/share/url?url=${url}&text=${text}`;
}

export function getCopyText(data: ShareData): string {
  return `${getShareText(data)}\n${getShareUrl(data)}`;
}

export function getAllShareLinks(data: ShareData): ShareLinks {
  return {
    whatsapp: getWhatsAppLink(data),
    twitter: getTwitterLink(data),
    facebook: getFacebookLink(data),
    telegram: getTelegramLink(data),
    copyText: getCopyText(data),
    url: getShareUrl(data),
  };
}
