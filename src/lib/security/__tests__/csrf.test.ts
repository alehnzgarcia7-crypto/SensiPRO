import { describe, it, expect } from 'vitest';

import { generateCsrfToken, verifyCsrfToken } from '../csrf';

describe('CSRF tokens', () => {
  it('generates valid tokens', () => {
    const token = generateCsrfToken();
    expect(token).toContain('.');
    expect(token.split('.').length).toBe(2);
  });

  it('verifies valid tokens', () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token)).toBe(true);
  });

  it('rejects tampered tokens', () => {
    const token = generateCsrfToken();
    const tampered = token.slice(0, -1) + 'x';
    expect(verifyCsrfToken(tampered)).toBe(false);
  });

  it('rejects invalid format', () => {
    expect(verifyCsrfToken('no-dot-here')).toBe(false);
    expect(verifyCsrfToken('')).toBe(false);
    expect(verifyCsrfToken('...')).toBe(false);
  });

  it('generates unique tokens each time', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(token1).not.toBe(token2);
  });
});
