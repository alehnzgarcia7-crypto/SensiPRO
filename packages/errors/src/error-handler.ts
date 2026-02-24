import { NextResponse } from 'next/server';

import { AresError } from './base.error';

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AresError) {
    return NextResponse.json(
      {
        success: false,
        error: error.toJSON(),
      },
      { status: error.statusCode },
    );
  }

  // Error desconocido
  const message = error instanceof Error ? error.message : 'Error interno del servidor';
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? message : 'Error interno del servidor',
        statusCode: 500,
      },
    },
    { status: 500 },
  );
}

export function formatErrorResponse(code: string, message: string, statusCode: number) {
  return {
    success: false as const,
    error: { code, message, statusCode },
  };
}
