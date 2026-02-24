import { prisma } from '@ares/database';

type NotificationType = 'ACHIEVEMENT' | 'SUBSCRIPTION' | 'TOURNAMENT' | 'SYSTEM' | 'REFERRAL';

interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function sendNotification(input: SendNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    },
  });
}

export async function sendAchievementNotification(
  userId: string,
  achievementName: string,
  icon: string,
) {
  return sendNotification({
    userId,
    type: 'ACHIEVEMENT',
    title: `${icon} ¡Nuevo logro!`,
    message: `Desbloqueaste "${achievementName}"`,
    link: '/achievements',
  });
}

export async function sendSubscriptionNotification(userId: string, tier: string) {
  return sendNotification({
    userId,
    type: 'SUBSCRIPTION',
    title: '⭐ ¡Plan actualizado!',
    message: `Tu cuenta ahora es ${tier}. Disfruta todas las funciones.`,
    link: '/profile/subscription',
  });
}

export async function sendExpirationWarning(userId: string, daysLeft: number) {
  return sendNotification({
    userId,
    type: 'SUBSCRIPTION',
    title: '⚠️ Tu suscripción expira pronto',
    message: `Te quedan ${daysLeft} días. Renueva para no perder acceso.`,
    link: '/pricing',
  });
}

export async function sendTournamentNotification(
  userId: string,
  tournamentTitle: string,
  action: 'started' | 'ended' | 'joined',
) {
  const messages: Record<string, string> = {
    started: `El torneo "${tournamentTitle}" ha comenzado. ¡Participa ahora!`,
    ended: `El torneo "${tournamentTitle}" ha finalizado. Revisa los resultados.`,
    joined: `Te inscribiste al torneo "${tournamentTitle}". ¡Buena suerte!`,
  };

  return sendNotification({
    userId,
    type: 'TOURNAMENT',
    title: '🏆 Torneo',
    message: messages[action] ?? `Actualización del torneo "${tournamentTitle}"`,
    link: '/tournaments',
  });
}

export async function sendReferralNotification(userId: string, referredUsername: string) {
  return sendNotification({
    userId,
    type: 'REFERRAL',
    title: '🎁 ¡Referido exitoso!',
    message: `${referredUsername} se registró con tu código. ¡Gracias por compartir!`,
    link: '/profile',
  });
}

export async function sendSystemNotification(userId: string, title: string, message: string) {
  return sendNotification({
    userId,
    type: 'SYSTEM',
    title,
    message,
  });
}
