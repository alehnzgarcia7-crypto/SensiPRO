import { describe, it, expect } from 'vitest';

import { isValidEmail, isValidUsername, isValidPassword, isValidActivationCode } from '../validation';

describe('isValidEmail', () => {
  it('acepta emails válidos', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.com')).toBe(true);
  });

  it('rechaza emails inválidos', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('no-at-sign')).toBe(false);
    expect(isValidEmail('@no-local.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });
});

describe('isValidUsername', () => {
  it('acepta usernames válidos', () => {
    expect(isValidUsername('alex123')).toBe(true);
    expect(isValidUsername('pro_gamer')).toBe(true);
    expect(isValidUsername('XxX')).toBe(true);
  });

  it('rechaza usernames muy cortos', () => {
    expect(isValidUsername('ab')).toBe(false);
  });

  it('rechaza caracteres especiales', () => {
    expect(isValidUsername('user@name')).toBe(false);
    expect(isValidUsername('user name')).toBe(false);
    expect(isValidUsername('user-name')).toBe(false);
  });

  it('rechaza usernames muy largos (>30 chars)', () => {
    expect(isValidUsername('a'.repeat(31))).toBe(false);
  });

  it('acepta exactamente 30 caracteres', () => {
    expect(isValidUsername('a'.repeat(30))).toBe(true);
  });
});

describe('isValidPassword', () => {
  it('acepta 6+ caracteres', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('strongpassword')).toBe(true);
  });

  it('rechaza menos de 6 caracteres', () => {
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });

  it('acepta exactamente 6 caracteres', () => {
    expect(isValidPassword('abcdef')).toBe(true);
  });
});

describe('isValidActivationCode', () => {
  it('acepta códigos ARES válidos', () => {
    expect(isValidActivationCode('ARES-ABCD-EFGH-JKLM')).toBe(true);
    expect(isValidActivationCode('ARES-2345-6789-WXYZ')).toBe(true);
  });

  it('rechaza formatos inválidos', () => {
    expect(isValidActivationCode('ARES-ABC-DEF-GHI')).toBe(false);
    expect(isValidActivationCode('ATLAS-ABCD-EFGH-JKLM')).toBe(false);
    expect(isValidActivationCode('ARES-abcd-efgh-jklm')).toBe(false);
    expect(isValidActivationCode('random-text')).toBe(false);
    expect(isValidActivationCode('')).toBe(false);
  });

  it('rechaza dígitos excluidos (0 y 1)', () => {
    // La regex [A-Z2-9] excluye 0 y 1 pero acepta I y O como letras
    expect(isValidActivationCode('ARES-0000-AAAA-BBBB')).toBe(false);
    expect(isValidActivationCode('ARES-1111-AAAA-BBBB')).toBe(false);
  });
});
