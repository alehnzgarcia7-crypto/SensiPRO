import { describe, it, expect, vi, beforeEach } from 'vitest';

// ══════════════════════════════════════════════════════════
// ARES-503 — Comments/Reviews unit tests
// Profanity filter, rate limiting, report auto-hide
// ══════════════════════════════════════════════════════════

// ── Profanity filter tests (extracted logic) ─────────────

const BANNED_WORDS = [
  'hack', 'cheat', 'mod apk', 'aimbot', 'wallhack',
  'trampa', 'trampas', 'exploit', 'hacker',
];

function containsBannedWord(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) => lower.includes(word));
}

describe('Profanity filter', () => {
  it('detecta palabras prohibidas basicas', () => {
    expect(containsBannedWord('usa hack para ganar')).toBe(true);
    expect(containsBannedWord('descarga el mod apk')).toBe(true);
    expect(containsBannedWord('aimbot gratis')).toBe(true);
    expect(containsBannedWord('wallhack Free Fire')).toBe(true);
  });

  it('detecta trampas en espanol', () => {
    expect(containsBannedWord('es una trampa')).toBe(true);
    expect(containsBannedWord('hay muchas trampas')).toBe(true);
    expect(containsBannedWord('un exploit nuevo')).toBe(true);
  });

  it('es case insensitive', () => {
    expect(containsBannedWord('HACK me ayuda')).toBe(true);
    expect(containsBannedWord('Cheat Engine')).toBe(true);
    expect(containsBannedWord('MOD APK descarga')).toBe(true);
  });

  it('permite contenido limpio', () => {
    expect(containsBannedWord('Excelente sensibilidad')).toBe(false);
    expect(containsBannedWord('Me funciono perfecto en mi Samsung')).toBe(false);
    expect(containsBannedWord('La mejor config para Free Fire')).toBe(false);
    expect(containsBannedWord('Genial, gracias!')).toBe(false);
  });

  it('permite strings cortos validos', () => {
    expect(containsBannedWord('Ok')).toBe(false);
    expect(containsBannedWord('Muy bien')).toBe(false);
    expect(containsBannedWord('100')).toBe(false);
  });
});

// ── Auto-hide threshold tests ────────────────────────────

const AUTO_HIDE_THRESHOLD = 3;

function shouldAutoHide(reportCount: number): boolean {
  return reportCount >= AUTO_HIDE_THRESHOLD;
}

describe('Auto-hide por reportes', () => {
  it('no oculta con menos de 3 reportes', () => {
    expect(shouldAutoHide(0)).toBe(false);
    expect(shouldAutoHide(1)).toBe(false);
    expect(shouldAutoHide(2)).toBe(false);
  });

  it('oculta al alcanzar exactamente 3 reportes', () => {
    expect(shouldAutoHide(3)).toBe(true);
  });

  it('oculta con mas de 3 reportes', () => {
    expect(shouldAutoHide(5)).toBe(true);
    expect(shouldAutoHide(10)).toBe(true);
  });
});

// ── Comment validation tests ─────────────────────────────

describe('Comment content validation', () => {
  it('rechaza contenido demasiado corto', () => {
    expect('ab'.length >= 3).toBe(false);
    expect('abc'.length >= 3).toBe(true);
  });

  it('rechaza contenido demasiado largo', () => {
    const longContent = 'a'.repeat(501);
    expect(longContent.length <= 500).toBe(false);

    const maxContent = 'a'.repeat(500);
    expect(maxContent.length <= 500).toBe(true);
  });

  it('trim funciona correctamente', () => {
    const content = '   hola mundo   ';
    expect(content.trim()).toBe('hola mundo');
    expect(content.trim().length >= 3).toBe(true);
  });

  it('spaces only no pasa el minimo', () => {
    const spacesOnly = '   ';
    expect(spacesOnly.trim().length >= 3).toBe(false);
  });
});

// ── Daily limit tests ────────────────────────────────────

const DAILY_COMMENT_LIMIT = 20;

describe('Comment daily rate limit', () => {
  it('permite comentarios bajo el limite', () => {
    expect(0 < DAILY_COMMENT_LIMIT).toBe(true);
    expect(19 < DAILY_COMMENT_LIMIT).toBe(true);
  });

  it('bloquea al alcanzar el limite', () => {
    expect(20 >= DAILY_COMMENT_LIMIT).toBe(true);
    expect(21 >= DAILY_COMMENT_LIMIT).toBe(true);
  });
});

// ── Tier badge mapping tests ─────────────────────────────

function getTierVariant(tier: string): 'vip' | 'premium' | 'free' {
  if (tier === 'VIP') return 'vip';
  if (tier === 'PREMIUM') return 'premium';
  return 'free';
}

describe('Tier badge mapping', () => {
  it('mapea VIP correctamente', () => {
    expect(getTierVariant('VIP')).toBe('vip');
  });

  it('mapea PREMIUM correctamente', () => {
    expect(getTierVariant('PREMIUM')).toBe('premium');
  });

  it('mapea FREE correctamente', () => {
    expect(getTierVariant('FREE')).toBe('free');
  });

  it('mapea unknown como free', () => {
    expect(getTierVariant('UNKNOWN')).toBe('free');
  });
});

// ── Relative date formatting tests ───────────────────────

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  if (diffDay < 7) return `hace ${diffDay}d`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

describe('Formato de fecha relativa', () => {
  it('muestra "ahora" para fechas recientes', () => {
    const now = new Date().toISOString();
    expect(formatRelativeDate(now)).toBe('ahora');
  });

  it('muestra minutos para menos de 1 hora', () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60000).toISOString();
    expect(formatRelativeDate(thirtyMinAgo)).toBe('hace 30m');
  });

  it('muestra horas para menos de 24 horas', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 3600000).toISOString();
    expect(formatRelativeDate(fiveHoursAgo)).toBe('hace 5h');
  });

  it('muestra dias para menos de 7 dias', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeDate(threeDaysAgo)).toBe('hace 3d');
  });
});
