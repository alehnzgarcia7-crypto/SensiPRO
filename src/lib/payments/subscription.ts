import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { UserTier, PaymentProvider, PaymentStatus, CodeType } from '@prisma/client';

// ══════════════════════════════════════════════════════════
// Subscription Management Service
// Expiración automática, estado de suscripción, historial
// ══════════════════════════════════════════════════════════

/**
 * Datos de un pago reciente para mostrar en el historial
 */
interface RecentPayment {
  id: string;
  provider: PaymentProvider;
  amount: number;
  status: PaymentStatus;
  codeType: CodeType | null;
  createdAt: Date;
}

/**
 * Estado de suscripción de un usuario
 */
export interface SubscriptionStatus {
  tier: UserTier;
  expiresAt: Date | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean;
  isExpired: boolean;
  recentPayments: RecentPayment[];
  activeSubscription: {
    id: string;
    tier: UserTier;
    startDate: Date;
    endDate: Date;
  } | null;
}

/**
 * Resultado de la expiración masiva de suscripciones
 */
interface ExpireResult {
  expired: number;
  users: Array<{
    id: string;
    username: string;
    tier: UserTier;
    tierExpiresAt: Date | null;
  }>;
}

// Mapeo de CodeType a label legible
const CODE_TYPE_LABELS: Record<CodeType, string> = {
  PREMIUM_30: 'Premium 1 mes',
  PREMIUM_90: 'Premium 3 meses',
  PREMIUM_365: 'Premium 12 meses',
  VIP_30: 'VIP 1 mes',
  VIP_90: 'VIP 3 meses',
  VIP_365: 'VIP 12 meses',
};

/**
 * Obtiene el label legible para un codeType
 */
export function getCodeTypeLabel(codeType: CodeType | null): string {
  if (!codeType) return 'Pago directo';
  return CODE_TYPE_LABELS[codeType] ?? codeType;
}

/**
 * Verifica y expira suscripciones que ya pasaron su fecha de vencimiento.
 * Ejecutar como cron job diario.
 */
export async function expireSubscriptions(): Promise<ExpireResult> {
  const now = new Date();

  // Buscar usuarios con tier != FREE cuyo tierExpiresAt ya pasó
  const expired = await prisma.user.findMany({
    where: {
      tier: { not: 'FREE' },
      tierExpiresAt: { lt: now },
    },
    select: { id: true, username: true, tier: true, tierExpiresAt: true },
  });

  if (expired.length === 0) {
    return { expired: 0, users: [] };
  }

  const expiredIds = expired.map((u) => u.id);

  // Transacción: bajar usuarios a FREE + desactivar subscriptions
  await prisma.$transaction([
    prisma.user.updateMany({
      where: { id: { in: expiredIds } },
      data: {
        tier: 'FREE',
        tierExpiresAt: null,
      },
    }),
    prisma.subscription.updateMany({
      where: {
        userId: { in: expiredIds },
        isActive: true,
        endDate: { lt: now },
      },
      data: { isActive: false },
    }),
  ]);

  logger.info('Subscriptions expired', {
    count: expired.length,
    userIds: expiredIds,
  });

  // Crear notificaciones para usuarios expirados
  const notifications = expired.map((u) => ({
    userId: u.id,
    type: 'subscription',
    title: 'Tu suscripción ha expirado',
    message: `Tu plan ${u.tier} ha expirado. Renueva para seguir disfrutando de todas las funciones.`,
    link: '/profile/subscription',
  }));

  await prisma.notification.createMany({ data: notifications });

  return { expired: expired.length, users: expired };
}

/**
 * Obtiene el estado de suscripción completo de un usuario
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      tierExpiresAt: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          provider: true,
          amount: true,
          status: true,
          codeType: true,
          createdAt: true,
        },
      },
      subscriptions: {
        where: { isActive: true },
        orderBy: { endDate: 'desc' },
        take: 1,
        select: {
          id: true,
          tier: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  if (!user) return null;

  const daysRemaining = user.tierExpiresAt
    ? Math.max(0, Math.ceil((user.tierExpiresAt.getTime() - Date.now()) / 86400000))
    : null;

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining === 0 && user.tier !== 'FREE';

  return {
    tier: user.tier,
    expiresAt: user.tierExpiresAt,
    daysRemaining,
    isExpiringSoon,
    isExpired,
    recentPayments: user.payments,
    activeSubscription: user.subscriptions[0] ?? null,
  };
}

/**
 * Cancela la suscripción activa de un usuario (baja a FREE al expirar)
 * No hace downgrade inmediato — el usuario conserva su tier hasta la fecha de expiración
 */
export async function cancelSubscription(userId: string): Promise<{ success: boolean; expiresAt: Date | null }> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, isActive: true },
    orderBy: { endDate: 'desc' },
  });

  if (!subscription) {
    return { success: false, expiresAt: null };
  }

  // Marcar suscripción como inactiva (no se renovará)
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { isActive: false },
  });

  logger.info('Subscription cancelled', {
    userId,
    subscriptionId: subscription.id,
    expiresAt: subscription.endDate,
  });

  // El usuario conserva su tier hasta subscription.endDate (tierExpiresAt en User)
  return { success: true, expiresAt: subscription.endDate };
}

/**
 * Renueva una suscripción existente extendiendo la fecha de expiración
 */
export async function renewSubscription(
  userId: string,
  tier: UserTier,
  days: number,
  paymentId?: string,
  codeId?: string,
): Promise<{ expiresAt: Date; subscriptionId: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, tierExpiresAt: true },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const now = new Date();

  // Si el usuario ya tiene tier activo, extender desde la fecha de expiración actual
  // Si no, empezar desde ahora
  const startDate = user.tierExpiresAt && user.tierExpiresAt > now
    ? user.tierExpiresAt
    : now;

  const endDate = new Date(startDate.getTime() + days * 86400000);

  // Transacción: actualizar user + crear subscription
  const [, subscription] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        tier,
        tierExpiresAt: endDate,
      },
    }),
    prisma.subscription.create({
      data: {
        userId,
        tier,
        startDate: now,
        endDate,
        isActive: true,
        paymentId: paymentId ?? undefined,
        codeId: codeId ?? undefined,
      },
    }),
  ]);

  logger.info('Subscription renewed', {
    userId,
    tier,
    days,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    subscriptionId: subscription.id,
  });

  return { expiresAt: endDate, subscriptionId: subscription.id };
}

/**
 * Obtiene los usuarios cuyas suscripciones expiran pronto (para enviar avisos)
 */
export async function getExpiringSubscriptions(withinDays: number = 3): Promise<Array<{
  id: string;
  username: string;
  email: string;
  tier: UserTier;
  tierExpiresAt: Date | null;
}>> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  return prisma.user.findMany({
    where: {
      tier: { not: 'FREE' },
      tierExpiresAt: {
        gt: new Date(),
        lte: cutoff,
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      tier: true,
      tierExpiresAt: true,
    },
  });
}
