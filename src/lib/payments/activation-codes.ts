import crypto from 'crypto';

import { CODE_PREFIX, TIER_DURATIONS } from '@ares/config';
import { prisma } from '@ares/database';
import { BusinessError, NotFoundError } from '@ares/errors';
import { logger } from '@ares/logger';
import type { CodeType, CodeStatus, UserTier } from '@prisma/client';

// ══════════════════════════════════════════════════════════
// Activation Codes — Generacion, validacion y canje
// Formato: ARES-XXXX-XXXX-XXXX (sin I/O/0/1 para evitar confusion)
// ══════════════════════════════════════════════════════════

// Caracteres permitidos: sin I/O/0/1
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// CodeType → tier + duracion en dias
const CODE_TYPE_MAP: Record<CodeType, { tier: UserTier; days: number }> = {
  PREMIUM_30: { tier: 'PREMIUM', days: 30 },
  PREMIUM_90: { tier: 'PREMIUM', days: 90 },
  PREMIUM_365: { tier: 'PREMIUM', days: 365 },
  VIP_30: { tier: 'VIP', days: 30 },
  VIP_90: { tier: 'VIP', days: 90 },
  VIP_365: { tier: 'VIP', days: 365 },
};

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface CodeValidation {
  valid: true;
  codeType: CodeType;
  tier: UserTier;
  days: number;
}

export interface RedeemResult {
  tier: UserTier;
  expiresAt: Date;
  codeType: CodeType;
}

export interface GeneratedCode {
  id: string;
  code: string;
  type: CodeType;
  status: CodeStatus;
  expiresAt: Date | null;
  createdAt: Date;
}

// ──────────────────────────────────────────────────────────
// Generar string de codigo unico
// ──────────────────────────────────────────────────────────

function generateSegment(): string {
  return Array.from({ length: 4 }, () =>
    CODE_CHARS[crypto.randomInt(CODE_CHARS.length)],
  ).join('');
}

function generateCodeString(): string {
  return `${CODE_PREFIX}-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}

// ──────────────────────────────────────────────────────────
// Generar un codigo de activacion
// ──────────────────────────────────────────────────────────

export async function generateActivationCode(
  codeType: CodeType,
  createdById: string,
  expiresAt?: Date,
): Promise<GeneratedCode> {
  let code: string = '';
  let attempts = 0;
  const maxAttempts = 10;

  // Intentar generar un codigo unico
  while (attempts < maxAttempts) {
    code = generateCodeString();
    const existing = await prisma.activationCode.findUnique({
      where: { code },
    });
    if (!existing) break;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new BusinessError(
      'CODE_GENERATION_FAILED',
      'No se pudo generar un codigo unico. Intenta de nuevo.',
    );
  }

  const activationCode = await prisma.activationCode.create({
    data: {
      code,
      type: codeType,
      status: 'AVAILABLE',
      createdById,
      expiresAt: expiresAt ?? null,
    },
  });

  logger.info('Activation code generated', {
    code: activationCode.code,
    type: codeType,
    createdById,
  });

  return {
    id: activationCode.id,
    code: activationCode.code,
    type: activationCode.type,
    status: activationCode.status,
    expiresAt: activationCode.expiresAt,
    createdAt: activationCode.createdAt,
  };
}

// ──────────────────────────────────────────────────────────
// Generar codigos en lote
// ──────────────────────────────────────────────────────────

export async function bulkGenerateCodes(
  codeType: CodeType,
  count: number,
  createdById: string,
  expiresAt?: Date,
): Promise<GeneratedCode[]> {
  if (count < 1 || count > 100) {
    throw new BusinessError(
      'INVALID_COUNT',
      'La cantidad debe ser entre 1 y 100',
    );
  }

  const codes: GeneratedCode[] = [];

  for (let i = 0; i < count; i++) {
    const code = await generateActivationCode(codeType, createdById, expiresAt);
    codes.push(code);
  }

  logger.info('Bulk codes generated', {
    count: codes.length,
    type: codeType,
    createdById,
  });

  return codes;
}

// ──────────────────────────────────────────────────────────
// Validar un codigo (sin canjearlo)
// ──────────────────────────────────────────────────────────

export async function validateCode(code: string): Promise<CodeValidation> {
  const normalized = code.toUpperCase().trim();

  const activationCode = await prisma.activationCode.findUnique({
    where: { code: normalized },
  });

  if (!activationCode) {
    throw new NotFoundError('Codigo de activacion', normalized);
  }

  if (activationCode.status === 'USED') {
    throw new BusinessError('CODE_ALREADY_USED', 'Este codigo ya fue utilizado');
  }

  if (activationCode.status === 'EXPIRED') {
    throw new BusinessError('CODE_EXPIRED', 'Este codigo ha expirado');
  }

  if (activationCode.expiresAt && activationCode.expiresAt < new Date()) {
    // Auto-marcar como expirado
    await prisma.activationCode.update({
      where: { id: activationCode.id },
      data: { status: 'EXPIRED' },
    });
    throw new BusinessError('CODE_EXPIRED', 'Este codigo ha expirado');
  }

  const mapping = CODE_TYPE_MAP[activationCode.type];

  return {
    valid: true,
    codeType: activationCode.type,
    tier: mapping.tier,
    days: mapping.days,
  };
}

// ──────────────────────────────────────────────────────────
// Canjear un codigo (upgrade al usuario)
// ──────────────────────────────────────────────────────────

export async function redeemCode(
  code: string,
  userId: string,
): Promise<RedeemResult> {
  const normalized = code.toUpperCase().trim();

  // Validar primero
  const validation = await validateCode(normalized);

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + validation.days);

  // Transaccion atomica: marcar codigo como usado + upgrade usuario + crear pago + crear suscripcion
  const result = await prisma.$transaction(async (tx) => {
    // 1. Marcar el codigo como usado
    const updatedCode = await tx.activationCode.update({
      where: { code: normalized },
      data: {
        status: 'USED',
        usedById: userId,
        usedAt: now,
      },
    });

    // 2. Actualizar tier del usuario
    await tx.user.update({
      where: { id: userId },
      data: {
        tier: validation.tier,
        tierExpiresAt: expiresAt,
      },
    });

    // 3. Crear registro de pago
    const payment = await tx.payment.create({
      data: {
        userId,
        provider: 'CODE',
        externalId: normalized,
        amount: 0,
        currency: 'MXN',
        status: 'COMPLETED',
        codeType: validation.codeType,
      },
    });

    // 4. Crear suscripcion
    await tx.subscription.create({
      data: {
        userId,
        tier: validation.tier,
        startDate: now,
        endDate: expiresAt,
        isActive: true,
        paymentId: payment.id,
        codeId: updatedCode.id,
      },
    });

    return { tier: validation.tier, expiresAt, codeType: validation.codeType };
  });

  logger.info('Activation code redeemed', {
    code: normalized,
    userId,
    tier: result.tier,
    expiresAt: result.expiresAt.toISOString(),
  });

  return result;
}

// ──────────────────────────────────────────────────────────
// Helper: extraer tier y dias de un CodeType
// ──────────────────────────────────────────────────────────

export function getCodeTypeInfo(codeType: CodeType): {
  tier: UserTier;
  days: number;
  label: string;
} {
  const mapping = CODE_TYPE_MAP[codeType];
  const daysFromConfig = TIER_DURATIONS[codeType] ?? mapping.days;

  return {
    tier: mapping.tier,
    days: daysFromConfig,
    label: `${mapping.tier} ${daysFromConfig} dias`,
  };
}
