import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { UserTier } from '@prisma/client';

// ══════════════════════════════════════════════════════════
// Referral System — ARES-405
// 7 días Premium gratis para referido y referente
// ══════════════════════════════════════════════════════════

const REFERRAL_BONUS_DAYS = 7;
const MS_PER_DAY = 86_400_000;

interface ProcessReferralResult {
  referrerId: string;
  bonusDays: number;
}

interface ReferredUser {
  id: string;
  username: string;
  createdAt: Date;
}

export interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  referredUsers: ReferredUser[];
  bonusDaysPerReferral: number;
  totalBonusDaysEarned: number;
}

/**
 * Procesa un referido: da 7 días Premium al nuevo usuario y extiende 7 días al referente.
 * Debe llamarse después de crear el usuario con referredBy ya asignado.
 */
export async function processReferral(
  newUserId: string,
  referralCode: string,
): Promise<ProcessReferralResult | null> {
  // Buscar al referente por su código
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true, tier: true, tierExpiresAt: true },
  });

  if (!referrer || referrer.id === newUserId) return null;

  const now = new Date();
  const bonusExpiry = new Date(now.getTime() + REFERRAL_BONUS_DAYS * MS_PER_DAY);

  // Bonus para el nuevo usuario: 7 días Premium
  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { tierExpiresAt: true, tier: true },
  });

  if (!newUser) return null;

  // Si ya tiene tier activo, extender; si no, dar desde ahora
  const newUserExpiry = newUser.tierExpiresAt && newUser.tierExpiresAt > now
    ? new Date(newUser.tierExpiresAt.getTime() + REFERRAL_BONUS_DAYS * MS_PER_DAY)
    : bonusExpiry;

  // Bonus para el referente: extender 7 días
  const referrerExpiry = referrer.tierExpiresAt && referrer.tierExpiresAt > now
    ? new Date(referrer.tierExpiresAt.getTime() + REFERRAL_BONUS_DAYS * MS_PER_DAY)
    : bonusExpiry;

  const referrerNewTier: UserTier = referrer.tier === 'FREE' ? 'PREMIUM' : referrer.tier;

  // Transacción: actualizar ambos usuarios + crear notificaciones
  await prisma.$transaction([
    // Dar Premium al nuevo usuario
    prisma.user.update({
      where: { id: newUserId },
      data: {
        tier: newUser.tier === 'VIP' ? 'VIP' : 'PREMIUM',
        tierExpiresAt: newUser.tier === 'VIP' ? newUser.tierExpiresAt : newUserExpiry,
      },
    }),
    // Extender tier al referente + incrementar contador
    prisma.user.update({
      where: { id: referrer.id },
      data: {
        tier: referrerNewTier,
        tierExpiresAt: referrerExpiry,
        referralCount: { increment: 1 },
      },
    }),
    // Notificación al referente
    prisma.notification.create({
      data: {
        userId: referrer.id,
        type: 'referral',
        title: 'Nuevo referido registrado',
        message: `Un usuario se registró con tu código. ¡Ganaste ${REFERRAL_BONUS_DAYS} días Premium!`,
        link: '/profile/referrals',
      },
    }),
    // Notificación al nuevo usuario
    prisma.notification.create({
      data: {
        userId: newUserId,
        type: 'referral',
        title: '¡Bienvenido! Tienes Premium gratis',
        message: `Por usar un código de referido, tienes ${REFERRAL_BONUS_DAYS} días de Premium gratis.`,
        link: '/generator',
      },
    }),
  ]);

  logger.info('Referral processed', {
    referrerId: referrer.id,
    newUserId,
    bonusDays: REFERRAL_BONUS_DAYS,
    referrerNewTier,
    referrerExpiry: referrerExpiry.toISOString(),
    newUserExpiry: newUserExpiry.toISOString(),
  });

  return { referrerId: referrer.id, bonusDays: REFERRAL_BONUS_DAYS };
}

/**
 * Obtiene estadísticas de referidos para un usuario
 */
export async function getReferralStats(userId: string): Promise<ReferralStats | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, referralCount: true },
  });

  if (!user) return null;

  const referred = await prisma.user.findMany({
    where: { referredBy: user.referralCode },
    select: { id: true, username: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return {
    referralCode: user.referralCode,
    totalReferrals: user.referralCount,
    referredUsers: referred,
    bonusDaysPerReferral: REFERRAL_BONUS_DAYS,
    totalBonusDaysEarned: user.referralCount * REFERRAL_BONUS_DAYS,
  };
}
