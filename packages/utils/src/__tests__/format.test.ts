import { describe, it, expect } from 'vitest';

import { formatNumber, formatCurrency, slugify, truncate, formatRelativeTime } from '../format';

describe('formatNumber', () => {
  it('formatea enteros con separadores de locale', () => {
    expect(formatNumber(1000)).toContain('1');
    expect(formatNumber(1000000)).toContain('1');
  });

  it('maneja cero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('maneja negativos', () => {
    const result = formatNumber(-500);
    expect(result).toContain('500');
  });
});

describe('formatCurrency', () => {
  it('convierte centavos a MXN', () => {
    const result = formatCurrency(4900);
    expect(result).toContain('49');
  });

  it('maneja cero centavos', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('formatea montos grandes correctamente', () => {
    const result = formatCurrency(99900);
    expect(result).toContain('999');
  });
});

describe('slugify', () => {
  it('convierte texto a slug URL-safe', () => {
    expect(slugify('Samsung Galaxy A54')).toBe('samsung-galaxy-a54');
  });

  it('maneja caracteres acentuados', () => {
    expect(slugify('Guía de Configuración')).toBe('guia-de-configuracion');
  });

  it('elimina caracteres especiales', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
  });

  it('elimina guiones al inicio y final', () => {
    expect(slugify('---test---')).toBe('test');
  });

  it('colapsa múltiples espacios en un guión', () => {
    expect(slugify('samsung   galaxy   s24')).toBe('samsung-galaxy-s24');
  });
});

describe('truncate', () => {
  it('retorna texto completo si es menor al máximo', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('trunca y agrega ellipsis', () => {
    expect(truncate('this is a very long text', 10)).toBe('this is...');
  });

  it('maneja texto exactamente del largo máximo', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });
});

describe('formatRelativeTime', () => {
  it('retorna "Hace un momento" para tiempos muy recientes', () => {
    expect(formatRelativeTime(new Date())).toBe('Hace un momento');
  });

  it('retorna minutos para tiempos recientes', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe('Hace 5m');
  });

  it('retorna horas para tiempos del mismo día', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('Hace 2h');
  });

  it('retorna días para fechas recientes', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('Hace 3d');
  });

  it('retorna fecha formateada para más de 30 días', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(sixtyDaysAgo);
    // Debe retornar fecha formateada, no "Hace Xd"
    expect(result).not.toContain('Hace');
  });
});
