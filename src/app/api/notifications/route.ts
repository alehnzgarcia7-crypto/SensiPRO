import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';

import { getRequiredSession } from '@/lib/auth/auth.middleware';

// GET /api/notifications — lista las últimas 30 notificaciones + unreadCount
export async function GET() {
  try {
    const session = await getRequiredSession();
    const userId = session.user.id as string;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/notifications — marca todas como leídas
export async function PATCH() {
  try {
    const session = await getRequiredSession();
    const userId = session.user.id as string;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, data: { markedAllRead: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
