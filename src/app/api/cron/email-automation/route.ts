
import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';

import { sendExpirationEmail, sendWinBackEmail } from '@/lib/growth/email-automation';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret', statusCode: 401 } },
        { status: 401 },
      );
    }

    // 1. Expiration warnings (3 days before)
    const threeDaysFromNow = new Date(Date.now() + 3 * 86400000);
    const tomorrow = new Date(Date.now() + 1 * 86400000);

    const expiringUsers = await prisma.user.findMany({
      where: {
        tier: { in: ['PREMIUM', 'VIP'] },
        tierExpiresAt: { gte: tomorrow, lte: threeDaysFromNow },
      },
      select: { email: true, username: true, tierExpiresAt: true },
    });

    for (const user of expiringUsers) {
      const daysLeft = Math.ceil((user.tierExpiresAt!.getTime() - Date.now()) / 86400000);
      await sendExpirationEmail(user.email, user.username, daysLeft);
    }

    // 2. Win-back (inactive 30+ days, free tier, used app at least 5 times)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const inactiveUsers = await prisma.user.findMany({
      where: {
        tier: 'FREE',
        updatedAt: { lte: thirtyDaysAgo },
        totalSearches: { gte: 5 },
      },
      select: { email: true, username: true },
      take: 50,
    });

    for (const user of inactiveUsers) {
      await sendWinBackEmail(user.email, user.username);
    }

    logger.info('Email automation cron completed', {
      expirationWarnings: expiringUsers.length,
      winBackEmails: inactiveUsers.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        expirationWarnings: expiringUsers.length,
        winBackEmails: inactiveUsers.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
