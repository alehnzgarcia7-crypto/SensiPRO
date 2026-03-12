/**
 * POST /api/auth/check-email
 *
 * Verifica si un email tiene una cuenta de usuario registrada.
 * Usado por la success page post-pago para decidir si mostrar
 * formulario de login o registro.
 */

import { prisma } from '@ares/database';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { username: true },
    });

    return NextResponse.json({
      exists: !!user,
      username: user?.username ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
