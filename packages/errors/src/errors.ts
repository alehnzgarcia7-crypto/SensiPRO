import { AresError } from './base.error';

export class NotFoundError extends AresError {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} not found: ${id}` : `${resource} not found`,
      404,
    );
    this.name = 'NotFoundError';
  }
}

export class AuthError extends AresError {
  constructor(code: string, message: string) {
    super(code, message, 401);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends AresError {
  constructor(message = 'No tienes permisos para esta acción') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class BusinessError extends AresError {
  constructor(code: string, message: string) {
    super(code, message, 422);
    this.name = 'BusinessError';
  }
}

export class RateLimitError extends AresError {
  constructor(code: string, message: string) {
    super(code, message, 429);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends AresError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}
