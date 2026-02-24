import { describe, it, expect } from 'vitest';

import {
  getWhatsAppLink,
  getTwitterLink,
  getFacebookLink,
  getTelegramLink,
  getCopyText,
  getAllShareLinks,
} from '@/lib/share/share-links';
import type { ShareData } from '@/lib/share/share-links';

// ═══════════════════════════════════════════════════════════════
// Tests para ARES-107 — Share System
// ═══════════════════════════════════════════════════════════════

const mockData: ShareData = {
  deviceBrand: 'Samsung',
  deviceModel: 'Galaxy S24 Ultra',
  deviceSlug: 'samsung-galaxy-s24-ultra',
  style: 'AGGRESSIVE',
};

const mockBalanced: ShareData = {
  ...mockData,
  style: 'BALANCED',
};

const mockSniper: ShareData = {
  ...mockData,
  style: 'SNIPER',
};

// ─── getWhatsAppLink ──────────────────────────────

describe('getWhatsAppLink', () => {
  it('genera enlace válido de WhatsApp', () => {
    const link = getWhatsAppLink(mockData);
    expect(link.startsWith('https://wa.me/?text=')).toBe(true);
  });

  it('incluye texto del dispositivo codificado', () => {
    const link = getWhatsAppLink(mockData);
    const decoded = decodeURIComponent(link.replace('https://wa.me/?text=', ''));
    expect(decoded).toContain('Samsung Galaxy S24 Ultra');
  });

  it('incluye URL del sitio', () => {
    const link = getWhatsAppLink(mockData);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('sensibilidadespro.com');
  });

  it('incluye estilo en la URL', () => {
    const link = getWhatsAppLink(mockData);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('style=aggressive');
  });

  it('incluye slug del dispositivo en la URL', () => {
    const link = getWhatsAppLink(mockData);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('/devices/samsung-galaxy-s24-ultra');
  });
});

// ─── getTwitterLink ──────────────────────────────

describe('getTwitterLink', () => {
  it('genera enlace válido de Twitter', () => {
    const link = getTwitterLink(mockData);
    expect(link.startsWith('https://twitter.com/intent/tweet?')).toBe(true);
  });

  it('incluye parámetro text', () => {
    const link = getTwitterLink(mockData);
    expect(link).toContain('text=');
  });

  it('incluye parámetro url', () => {
    const link = getTwitterLink(mockData);
    expect(link).toContain('&url=');
  });

  it('tiene mención de SensiPRO en el texto', () => {
    const link = getTwitterLink(mockData);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('SensiPRO');
  });
});

// ─── getFacebookLink ──────────────────────────────

describe('getFacebookLink', () => {
  it('genera enlace válido de Facebook', () => {
    const link = getFacebookLink(mockData);
    expect(link.startsWith('https://www.facebook.com/sharer/sharer.php?u=')).toBe(true);
  });

  it('incluye URL del dispositivo', () => {
    const link = getFacebookLink(mockData);
    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('/devices/samsung-galaxy-s24-ultra');
  });
});

// ─── getTelegramLink ──────────────────────────────

describe('getTelegramLink', () => {
  it('genera enlace válido de Telegram', () => {
    const link = getTelegramLink(mockData);
    expect(link.startsWith('https://t.me/share/url?')).toBe(true);
  });

  it('incluye parámetro url', () => {
    const link = getTelegramLink(mockData);
    expect(link).toContain('url=');
  });

  it('incluye parámetro text', () => {
    const link = getTelegramLink(mockData);
    expect(link).toContain('&text=');
  });
});

// ─── getCopyText ──────────────────────────────

describe('getCopyText', () => {
  it('contiene nombre del dispositivo', () => {
    const text = getCopyText(mockData);
    expect(text).toContain('Samsung Galaxy S24 Ultra');
  });

  it('contiene URL del sitio', () => {
    const text = getCopyText(mockData);
    expect(text).toContain('sensibilidadespro.com');
  });

  it('contiene mención de Free Fire', () => {
    const text = getCopyText(mockData);
    expect(text).toContain('Free Fire');
  });

  it('contiene mención de SensiPRO', () => {
    const text = getCopyText(mockData);
    expect(text).toContain('SensiPRO');
  });

  it('incluye slug en la URL', () => {
    const text = getCopyText(mockData);
    expect(text).toContain('/devices/samsung-galaxy-s24-ultra');
  });
});

// ─── Estilos ──────────────────────────────

describe('estilos en share text', () => {
  it('AGGRESSIVE muestra "Agresivo"', () => {
    const text = getCopyText(mockData);
    expect(text).toContain('Agresivo');
  });

  it('BALANCED muestra "Balanceado"', () => {
    const text = getCopyText(mockBalanced);
    expect(text).toContain('Balanceado');
  });

  it('SNIPER muestra "Francotirador"', () => {
    const text = getCopyText(mockSniper);
    expect(text).toContain('Francotirador');
  });

  it('AGGRESSIVE usa estilo lowercase en URL', () => {
    const text = getCopyText(mockData);
    expect(text).toContain('style=aggressive');
  });

  it('BALANCED usa estilo lowercase en URL', () => {
    const text = getCopyText(mockBalanced);
    expect(text).toContain('style=balanced');
  });

  it('SNIPER usa estilo lowercase en URL', () => {
    const text = getCopyText(mockSniper);
    expect(text).toContain('style=sniper');
  });
});

// ─── getAllShareLinks ──────────────────────────────

describe('getAllShareLinks', () => {
  it('retorna objeto con todas las propiedades', () => {
    const links = getAllShareLinks(mockData);
    expect(links).toHaveProperty('whatsapp');
    expect(links).toHaveProperty('twitter');
    expect(links).toHaveProperty('facebook');
    expect(links).toHaveProperty('telegram');
    expect(links).toHaveProperty('copyText');
    expect(links).toHaveProperty('url');
  });

  it('whatsapp link empieza con wa.me', () => {
    const links = getAllShareLinks(mockData);
    expect(links.whatsapp.startsWith('https://wa.me/')).toBe(true);
  });

  it('twitter link empieza con twitter.com', () => {
    const links = getAllShareLinks(mockData);
    expect(links.twitter.startsWith('https://twitter.com/intent/tweet')).toBe(true);
  });

  it('facebook link empieza con facebook.com', () => {
    const links = getAllShareLinks(mockData);
    expect(links.facebook.startsWith('https://www.facebook.com/sharer')).toBe(true);
  });

  it('telegram link empieza con t.me', () => {
    const links = getAllShareLinks(mockData);
    expect(links.telegram.startsWith('https://t.me/share/url')).toBe(true);
  });

  it('url contiene el slug del dispositivo', () => {
    const links = getAllShareLinks(mockData);
    expect(links.url).toContain('samsung-galaxy-s24-ultra');
  });

  it('copyText no está vacío', () => {
    const links = getAllShareLinks(mockData);
    expect(links.copyText.length).toBeGreaterThan(0);
  });

  it('url y copyText usan el mismo slug', () => {
    const links = getAllShareLinks(mockData);
    expect(links.url).toContain(mockData.deviceSlug);
    expect(links.copyText).toContain(mockData.deviceSlug);
  });
});
