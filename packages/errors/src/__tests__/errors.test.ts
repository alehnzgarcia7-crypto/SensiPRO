import { describe, it, expect } from 'vitest';

import {
  AresError,
  NotFoundError,
  AuthError,
  BusinessError,
  RateLimitError,
  ForbiddenError,
  ValidationError,
} from '../index';

describe('AresError base', () => {
  it('tiene propiedades correctas', () => {
    const error = new AresError('TEST_ERROR', 'Test message', 400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AresError');
  });

  it('serializa a JSON correctamente', () => {
    const error = new AresError('ERR', 'msg', 500);
    const json = error.toJSON();
    expect(json).toEqual({ code: 'ERR', message: 'msg', statusCode: 500 });
  });

  it('es instanceof Error', () => {
    const error = new AresError('ERR', 'msg', 500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AresError);
  });
});

describe('NotFoundError', () => {
  it('tiene status 404', () => {
    const error = new NotFoundError('Device');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Device not found');
  });

  it('incluye id cuando se proporciona', () => {
    const error = new NotFoundError('Device', 'abc-123');
    expect(error.message).toBe('Device not found: abc-123');
  });

  it('es instanceof AresError', () => {
    const error = new NotFoundError('User');
    expect(error).toBeInstanceOf(AresError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('AuthError', () => {
  it('tiene status 401', () => {
    const error = new AuthError('INVALID_TOKEN', 'Token inválido');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('INVALID_TOKEN');
  });

  it('acepta código y mensaje custom', () => {
    const error = new AuthError('SESSION_EXPIRED', 'Tu sesión ha expirado');
    expect(error.code).toBe('SESSION_EXPIRED');
    expect(error.message).toBe('Tu sesión ha expirado');
  });
});

describe('ForbiddenError', () => {
  it('tiene status 403 con mensaje default', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('No tienes permisos para esta acción');
  });

  it('acepta mensaje custom', () => {
    const error = new ForbiddenError('Solo VIP');
    expect(error.message).toBe('Solo VIP');
  });

  it('tiene código FORBIDDEN', () => {
    const error = new ForbiddenError();
    expect(error.code).toBe('FORBIDDEN');
  });
});

describe('BusinessError', () => {
  it('tiene status 422', () => {
    const error = new BusinessError('EMAIL_TAKEN', 'Email ya registrado');
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe('EMAIL_TAKEN');
    expect(error.message).toBe('Email ya registrado');
  });

  it('maneja código PREMIUM_REQUIRED', () => {
    const error = new BusinessError('PREMIUM_REQUIRED', 'El giroscopio requiere Premium');
    expect(error.code).toBe('PREMIUM_REQUIRED');
    expect(error.statusCode).toBe(422);
  });
});

describe('RateLimitError', () => {
  it('tiene status 429', () => {
    const error = new RateLimitError('RATE_LIMIT', 'Límite excedido');
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT');
  });

  it('serializa correctamente', () => {
    const error = new RateLimitError('FREE_LIMIT', 'Has alcanzado el límite');
    const json = error.toJSON();
    expect(json.statusCode).toBe(429);
    expect(json.code).toBe('FREE_LIMIT');
  });
});

describe('ValidationError', () => {
  it('tiene status 400', () => {
    const error = new ValidationError('Campo requerido');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('maneja mensajes descriptivos', () => {
    const error = new ValidationError('El email no es válido');
    expect(error.message).toBe('El email no es válido');
  });
});
