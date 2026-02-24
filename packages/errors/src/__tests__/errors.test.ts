import { describe, it, expect } from 'vitest';

import {
  AresError,
  NotFoundError,
  AuthError,
  BusinessError,
  RateLimitError,
  ForbiddenError,
  ValidationError,
  handleApiError,
  formatErrorResponse,
} from '../index';

// ═══════════════════════════════════════════════════════════
// ARES-804 — Tests de Errores Comprensivos
// Cubre: todas las clases de error, handleApiError,
//        formatErrorResponse, herencia, serialización
// ═══════════════════════════════════════════════════════════

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

  it('tiene stack trace', () => {
    const error = new AresError('ERR', 'msg', 500);
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });

  it('soporta cualquier status code HTTP', () => {
    const err400 = new AresError('BAD', 'bad', 400);
    const err500 = new AresError('INTERNAL', 'internal', 500);
    const err503 = new AresError('UNAVAILABLE', 'service down', 503);
    expect(err400.statusCode).toBe(400);
    expect(err500.statusCode).toBe(500);
    expect(err503.statusCode).toBe(503);
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

  it('tiene name NotFoundError', () => {
    const error = new NotFoundError('Guide');
    expect(error.name).toBe('NotFoundError');
  });

  it('serializa correctamente con toJSON', () => {
    const error = new NotFoundError('Device', 'clx123');
    const json = error.toJSON();
    expect(json.code).toBe('NOT_FOUND');
    expect(json.statusCode).toBe(404);
    expect(json.message).toContain('clx123');
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

  it('tiene name AuthError', () => {
    const error = new AuthError('TEST', 'test');
    expect(error.name).toBe('AuthError');
  });

  it('es instanceof AresError', () => {
    const error = new AuthError('TEST', 'test');
    expect(error).toBeInstanceOf(AresError);
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

  it('tiene name ForbiddenError', () => {
    const error = new ForbiddenError();
    expect(error.name).toBe('ForbiddenError');
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

  it('maneja código CODE_ALREADY_USED', () => {
    const error = new BusinessError('CODE_ALREADY_USED', 'Este código ya fue utilizado');
    expect(error.code).toBe('CODE_ALREADY_USED');
    expect(error.message).toBe('Este código ya fue utilizado');
  });

  it('tiene name BusinessError', () => {
    const error = new BusinessError('TEST', 'test');
    expect(error.name).toBe('BusinessError');
  });

  it('es instanceof AresError', () => {
    const error = new BusinessError('TEST', 'test');
    expect(error).toBeInstanceOf(AresError);
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

  it('tiene name RateLimitError', () => {
    const error = new RateLimitError('TEST', 'test');
    expect(error.name).toBe('RateLimitError');
  });

  it('es instanceof AresError', () => {
    const error = new RateLimitError('TEST', 'test');
    expect(error).toBeInstanceOf(AresError);
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

  it('tiene name ValidationError', () => {
    const error = new ValidationError('test');
    expect(error.name).toBe('ValidationError');
  });

  it('es instanceof AresError', () => {
    const error = new ValidationError('test');
    expect(error).toBeInstanceOf(AresError);
  });
});

describe('handleApiError', () => {
  it('retorna status correcto para BusinessError', () => {
    const error = new BusinessError('TEST', 'msg');
    const response = handleApiError(error);
    expect(response.status).toBe(422);
  });

  it('retorna status 404 para NotFoundError', () => {
    const error = new NotFoundError('Device', 'abc');
    const response = handleApiError(error);
    expect(response.status).toBe(404);
  });

  it('retorna status 429 para RateLimitError', () => {
    const error = new RateLimitError('LIMIT', 'Límite');
    const response = handleApiError(error);
    expect(response.status).toBe(429);
  });

  it('retorna status 500 para errores desconocidos', () => {
    const response = handleApiError(new Error('unexpected'));
    expect(response.status).toBe(500);
  });

  it('retorna status 500 para valores no-error', () => {
    const response = handleApiError('string error');
    expect(response.status).toBe(500);
  });

  it('retorna status 401 para AuthError', () => {
    const error = new AuthError('EXPIRED', 'Expirado');
    const response = handleApiError(error);
    expect(response.status).toBe(401);
  });

  it('retorna status 403 para ForbiddenError', () => {
    const error = new ForbiddenError();
    const response = handleApiError(error);
    expect(response.status).toBe(403);
  });
});

describe('formatErrorResponse', () => {
  it('retorna estructura estándar con success: false', () => {
    const response = formatErrorResponse('TEST_CODE', 'Test message', 400);
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('TEST_CODE');
    expect(response.error.message).toBe('Test message');
    expect(response.error.statusCode).toBe(400);
  });

  it('incluye todos los campos requeridos', () => {
    const response = formatErrorResponse('ERR', 'msg', 500);
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code');
    expect(response.error).toHaveProperty('message');
    expect(response.error).toHaveProperty('statusCode');
  });

  it('success siempre es false', () => {
    const response = formatErrorResponse('OK', 'not ok', 200);
    expect(response.success).toBe(false);
  });
});
