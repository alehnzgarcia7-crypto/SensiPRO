import { describe, it, expect } from 'vitest';

import {
  getConfigUrl,
  getConfigShareText,
  getWhatsAppLink,
  getTwitterLink,
  getFacebookLink,
  getTelegramLink,
  getAllSocialLinks,
} from '@/lib/share/social-links';
import type { SocialShareData } from '@/lib/share/social-links';

// ═══════════════════════════════════════════════════════════════
// Tests para ARES-507 — Social Integration
// Links de compartir para configs de comunidad
// ═══════════════════════════════════════════════════════════════

const mockData: SocialShareData = {
  configId: 'cltest123abc',
  title: 'Mi config pro',
  deviceBrand: 'Samsung',
  deviceModel: 'Galaxy S24 Ultra',
  style: 'AGGRESSIVE',
  username: 'ProPlayer',
  votes: 42,
};

const mockBalanced: SocialShareData = {
  ...mockData,
  style: 'BALANCED',
  title: 'Config balanceada',
};

const mockSniper: SocialShareData = {
  ...mockData,
  style: 'SNIPER',
  title: 'Config sniper',
};

// ─── getConfigUrl ──────────────────────────────

describe('getConfigUrl', () => {
  it('genera URL con el configId', () => {
    const url = getConfigUrl('cltest123abc');
    expect(url).toContain('/community/cltest123abc');
  });

  it('incluye dominio del sitio', () => {
    const url = getConfigUrl('cltest123abc');
    expect(url).toContain('sensibilidadespro.com');
  });
});

// ─── getConfigShareText ──────────────────────────────

describe('getConfigShareText', () => {
  it('incluye titulo de la config', () => {
    const text = getConfigShareText(mockData);
    expect(text).toContain('Mi config pro');
  });

  it('incluye nombre del dispositivo', () => {
    const text = getConfigShareText(mockData);
    expect(text).toContain('Samsung Galaxy S24 Ultra');
  });

  it('incluye mencion de SensiPRO', () => {
    const text = getConfigShareText(mockData);
    expect(text).toContain('SensiPRO');
  });

  it('incluye votos', () => {
    const text = getConfigShareText(mockData);
    expect(text).toContain('42 votos');
  });

  it('AGGRESSIVE muestra "Agresivo"', () => {
    const text = getConfigShareText(mockData);
    expect(text).toContain('Agresivo');
  });

  it('BALANCED muestra "Balanceado"', () => {
    const text = getConfigShareText(mockBalanced);
    expect(text).toContain('Balanceado');
  });

  it('SNIPER muestra "Francotirador"', () => {
    const text = getConfigShareText(mockSniper);
    expect(text).toContain('Francotirador');
  });
});

// ─── getWhatsAppLink ──────────────────────────────

describe('getWhatsAppLink', () => {
  it('genera enlace valido de WhatsApp', () => {
    const link = getWhatsAppLink(mockData);
    expect(link.startsWith('https://wa.me/?text=')).toBe(true);
  });

  it('incluye URL de la config en el texto', () => {
    const link = getWhatsAppLink(mockData);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('/community/cltest123abc');
  });

  it('incluye titulo de la config', () => {
    const link = getWhatsAppLink(mockData);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('Mi config pro');
  });
});

// ─── getTwitterLink ──────────────────────────────

describe('getTwitterLink', () => {
  it('genera enlace valido de Twitter', () => {
    const link = getTwitterLink(mockData);
    expect(link.startsWith('https://twitter.com/intent/tweet?')).toBe(true);
  });

  it('incluye parametro text', () => {
    const link = getTwitterLink(mockData);
    expect(link).toContain('text=');
  });

  it('incluye parametro url', () => {
    const link = getTwitterLink(mockData);
    expect(link).toContain('&url=');
  });
});

// ─── getFacebookLink ──────────────────────────────

describe('getFacebookLink', () => {
  it('genera enlace valido de Facebook', () => {
    const link = getFacebookLink(mockData);
    expect(link.startsWith('https://www.facebook.com/sharer/sharer.php?u=')).toBe(true);
  });

  it('incluye URL de la config', () => {
    const link = getFacebookLink(mockData);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('/community/cltest123abc');
  });
});

// ─── getTelegramLink ──────────────────────────────

describe('getTelegramLink', () => {
  it('genera enlace valido de Telegram', () => {
    const link = getTelegramLink(mockData);
    expect(link.startsWith('https://t.me/share/url?')).toBe(true);
  });

  it('incluye parametro url', () => {
    const link = getTelegramLink(mockData);
    expect(link).toContain('url=');
  });

  it('incluye parametro text', () => {
    const link = getTelegramLink(mockData);
    expect(link).toContain('&text=');
  });
});

// ─── getAllSocialLinks ──────────────────────────────

describe('getAllSocialLinks', () => {
  it('retorna objeto con todas las propiedades', () => {
    const links = getAllSocialLinks(mockData);
    expect(links).toHaveProperty('whatsapp');
    expect(links).toHaveProperty('twitter');
    expect(links).toHaveProperty('facebook');
    expect(links).toHaveProperty('telegram');
    expect(links).toHaveProperty('url');
    expect(links).toHaveProperty('copyText');
  });

  it('url contiene el configId', () => {
    const links = getAllSocialLinks(mockData);
    expect(links.url).toContain('cltest123abc');
  });

  it('copyText incluye texto y URL', () => {
    const links = getAllSocialLinks(mockData);
    expect(links.copyText).toContain('Mi config pro');
    expect(links.copyText).toContain('/community/cltest123abc');
  });

  it('copyText no esta vacio', () => {
    const links = getAllSocialLinks(mockData);
    expect(links.copyText.length).toBeGreaterThan(0);
  });

  it('cada estilo genera links diferentes', () => {
    const aggressive = getAllSocialLinks(mockData);
    const balanced = getAllSocialLinks(mockBalanced);
    const sniper = getAllSocialLinks(mockSniper);
    expect(aggressive.copyText).not.toBe(balanced.copyText);
    expect(balanced.copyText).not.toBe(sniper.copyText);
  });
});
