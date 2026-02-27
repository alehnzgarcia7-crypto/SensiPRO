'use server';


import { prisma } from '@ares/database';
import { BusinessError, AuthError, ValidationError } from '@ares/errors';
import { logger } from '@ares/logger';
import { generateReferralCode } from '@ares/utils';
import { hash } from 'bcryptjs';
import { z } from 'zod';

import { signIn } from './index';

const registerSchema = z.object({
  email: z.string().email('Email invalido'),
  username: z
    .string()
    .min(3, 'Minimo 3 caracteres')
    .max(30, 'Maximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, numeros y guion bajo'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Password requerido'),
});

export async function registerUser(formData: FormData): Promise<{ success: boolean; userId: string }> {
  const raw = {
    email: formData.get('email'),
    username: formData.get('username'),
    password: formData.get('password'),
    referralCode: formData.get('referralCode') || undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos invalidos';
    throw new ValidationError(firstError);
  }

  const { email, username, password, referralCode } = parsed.data;

  // Verificar email unico
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new BusinessError('EMAIL_TAKEN', 'Este email ya esta registrado');
  }

  // Verificar username unico
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    throw new BusinessError('USERNAME_TAKEN', 'Este nombre de usuario ya esta en uso');
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Manejar referido
  let referredByCode: string | undefined;
  let referrerId: string | undefined;
  if (referralCode) {
    const referrer = await prisma.user.findFirst({
      where: { referralCode, isActive: true },
    });
    if (referrer) {
      referredByCode = referralCode;
      referrerId = referrer.id;
    }
  }

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      displayName: username,
      referralCode: generateReferralCode(),
      referredBy: referredByCode,
      isActive: true,
    },
  });

  // Si fue referido, recompensar al referente
  if (referrerId) {
    await prisma.user.update({
      where: { id: referrerId },
      data: { referralCount: { increment: 1 } },
    });
    logger.info('Referral rewarded', { referrerId, newUserId: user.id });
  }

  logger.info('User registered', { userId: user.id, email: user.email });

  // Auto sign in
  await signIn('credentials', {
    email,
    password,
    redirect: false,
  });

  return { success: true, userId: user.id };
}

export async function loginUser(formData: FormData): Promise<{ success: boolean }> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError('Email y contrasena son requeridos');
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch {
    throw new AuthError('INVALID_CREDENTIALS', 'Email o contrasena incorrectos');
  }
}
