// ═══════════════════════════════════════════════════════════════
// Social Links — Generador de enlaces para compartir configs
// de comunidad en redes sociales (WhatsApp, Twitter, FB, TG)
// ═══════════════════════════════════════════════════════════════

import type { SensitivityStyle } from '@prisma/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sensibilidadespro.com';

interface SocialShareData {
  configId: string;
  title: string;
  deviceBrand: string;
  deviceModel: string;
  style: SensitivityStyle;
  username: string;
  votes: number;
}

interface SocialLinks {
  whatsapp: string;
  twitter: string;
  facebook: string;
  telegram: string;
  url: string;
  copyText: string;
}

const STYLE_LABELS: Record<SensitivityStyle, string> = {
  AGGRESSIVE: 'Agresivo',
  BALANCED: 'Balanceado',
  SNIPER: 'Francotirador',
};

const STYLE_EMOJI: Record<SensitivityStyle, string> = {
  AGGRESSIVE: '\u2694\uFE0F',
  BALANCED: '\uD83C\uDFAF',
  SNIPER: '\uD83D\uDD2D',
};

export function getConfigUrl(configId: string): string {
  return `${SITE_URL}/community/${configId}`;
}

export function getConfigShareText(data: SocialShareData): string {
  const emoji = STYLE_EMOJI[data.style];
  const label = STYLE_LABELS[data.style];
  return `${emoji} ${data.title} \u2014 Config ${label} para ${data.deviceBrand} ${data.deviceModel} en SensiPRO | ${data.votes} votos`;
}

export function getWhatsAppLink(data: SocialShareData): string {
  const url = getConfigUrl(data.configId);
  const text = getConfigShareText(data);
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
}

export function getTwitterLink(data: SocialShareData): string {
  const url = getConfigUrl(data.configId);
  const text = getConfigShareText(data);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function getFacebookLink(data: SocialShareData): string {
  const url = getConfigUrl(data.configId);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function getTelegramLink(data: SocialShareData): string {
  const url = getConfigUrl(data.configId);
  const text = getConfigShareText(data);
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function getAllSocialLinks(data: SocialShareData): SocialLinks {
  const url = getConfigUrl(data.configId);
  return {
    whatsapp: getWhatsAppLink(data),
    twitter: getTwitterLink(data),
    facebook: getFacebookLink(data),
    telegram: getTelegramLink(data),
    url,
    copyText: `${getConfigShareText(data)}\n${url}`,
  };
}

export type { SocialShareData, SocialLinks };
