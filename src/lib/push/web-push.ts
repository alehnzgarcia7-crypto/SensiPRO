import { logger } from '@ares/logger';
import webpush from 'web-push';


const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:soporte@sensibilidadespro.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

interface PushSendResult {
  success: boolean;
  expired: boolean;
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload,
): Promise<PushSendResult> {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon ?? '/icons/icon-192x192.png',
        badge: payload.badge ?? '/icons/icon-72x72.png',
        data: { url: payload.url ?? '/' },
        tag: payload.tag ?? 'sensipro',
      }),
    );
    return { success: true, expired: false };
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      // Suscripción expirada/inválida — debe eliminarse
      return { success: false, expired: true };
    }
    logger.error('Push notification failed', { error: String(error) });
    return { success: false, expired: false };
  }
}

export interface BroadcastResult {
  total: number;
  sent: number;
  expired: number;
}

export async function broadcastPush(
  subscriptions: webpush.PushSubscription[],
  payload: PushPayload,
): Promise<BroadcastResult> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, payload)),
  );

  let sent = 0;
  let expired = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.success) sent++;
      if (result.value.expired) expired++;
    }
  }

  logger.info('Push broadcast completed', {
    total: subscriptions.length,
    sent,
    expired,
  });

  return { total: subscriptions.length, sent, expired };
}
