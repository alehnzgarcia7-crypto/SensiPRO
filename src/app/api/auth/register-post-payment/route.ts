/**
 * POST /api/auth/register-post-payment
 *
 * Registro simplificado para usuarios que acaban de pagar pero
 * no tenían cuenta. Crea la cuenta y vincula automáticamente
 * cualquier PremiumLicense existente para ese email.
 *
 * Body: { email, username, password }
 * Returns: { success, userId, hasLicense }
 *
 * NOTA: Este endpoint NO hace auto-signin (eso lo maneja el
 * cliente llamando signIn después). Solo crea la cuenta.
 */

import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import { generateReferralCode } from '@ares/utils';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, username, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar email único
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este email ya está registrado. Inicia sesión en vez de registrarte.' },
        { status: 409 },
      );
    }

    // Verificar username único
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Este nombre de usuario ya está en uso' },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username,
        password: hashedPassword,
        displayName: username,
        referralCode: generateReferralCode(),
        isActive: true,
      },
    });

    // Verificar si existe una PremiumLicense para este email
    const license = await prisma.premiumLicense.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, isActive: true },
    });

    logger.info('User registered post-payment', {
      userId: user.id,
      email: normalizedEmail,
      hasLicense: !!license,
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      hasLicense: !!license && license.isActive,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    logger.error('Register post-payment error', { error: message });
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 });
  }
}
