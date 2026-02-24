import { describe, it, expect } from 'vitest';

import { sanitizeInput, sanitizeSearchQuery, sanitizeUsername, stripHtml, escapeHtml } from '../sanitize';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
    expect(stripHtml('<b>bold</b>')).toBe('bold');
  });

  it('leaves plain text unchanged', () => {
    expect(stripHtml('hello world')).toBe('hello world');
  });
});

describe('sanitizeInput', () => {
  it('strips HTML and trims', () => {
    expect(sanitizeInput('  <b>test</b>  ')).toBe('test');
  });

  it('limits length', () => {
    const long = 'a'.repeat(1000);
    expect(sanitizeInput(long, 100).length).toBe(100);
  });
});

describe('sanitizeSearchQuery', () => {
  it('allows letters and numbers', () => {
    expect(sanitizeSearchQuery('Samsung Galaxy A54')).toBe('Samsung Galaxy A54');
  });

  it('removes special characters', () => {
    expect(sanitizeSearchQuery('Samsung<script>')).toBe('Samsungscript');
    expect(sanitizeSearchQuery('test@#$%')).toBe('test');
  });

  it('limits to 100 chars', () => {
    const long = 'a'.repeat(200);
    expect(sanitizeSearchQuery(long).length).toBe(100);
  });
});

describe('sanitizeUsername', () => {
  it('allows alphanumeric and underscores', () => {
    expect(sanitizeUsername('pro_gamer_123')).toBe('pro_gamer_123');
  });

  it('strips invalid characters', () => {
    expect(sanitizeUsername('user@name!')).toBe('username');
  });
});

describe('escapeHtml', () => {
  it('escapes special characters', () => {
    expect(escapeHtml('<script>"alert"</script>')).toBe('&lt;script&gt;&quot;alert&quot;&lt;/script&gt;');
  });
});
