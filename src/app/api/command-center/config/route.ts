import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_EMAIL = 'alehnzgarcia7@gmail.com';

const DEFAULT_CONFIG: Record<string, string> = {
  premiumPrice: '19900',
  originalPrice: '34900',
  paywallEnabled: 'true',
  maintenanceMode: 'false',
  announcementBanner: '',
  showDemo: 'false',
  offerEndDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
  offerActive: 'true',
};

async function verifyAccess(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || token.email !== ADMIN_EMAIL) {
    return null;
  }
  return token.email;
}

export async function GET(req: NextRequest) {
  const email = await verifyAccess(req);
  if (!email) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 403 });
  }

  try {
    const configs = await prisma.appConfig.findMany();
    const result: Record<string, string> = { ...DEFAULT_CONFIG };
    for (const c of configs) {
      result[c.key] = c.value;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    logger.error('Failed to fetch config', { error: err instanceof Error ? err.message : 'Unknown' });
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const adminEmail = await verifyAccess(req);
  if (!adminEmail) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Grant premium action
    if (body.action === 'grant-premium' && body.email) {
      const targetEmail = String(body.email).trim().toLowerCase();
      const existing = await prisma.premiumLicense.findUnique({ where: { email: targetEmail } });
      if (existing) {
        await prisma.premiumLicense.update({
          where: { email: targetEmail },
          data: { isActive: true },
        });
      } else {
        await prisma.premiumLicense.create({
          data: {
            email: targetEmail,
            isActive: true,
            paymentProvider: 'admin_grant',
            paymentId: `admin-grant-${Date.now()}`,
            paymentMethod: 'admin_grant',
            amountPaid: 0,
            currency: 'MXN',
          },
        });
      }

      await prisma.commandCenterLog.create({
        data: {
          email: adminEmail,
          action: 'GRANT_PREMIUM',
          path: targetEmail,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        },
      });

      logger.info('Premium granted via command center', { adminEmail, targetEmail });
      return NextResponse.json({ success: true, data: { granted: targetEmail } });
    }

    // Revoke premium action
    if (body.action === 'revoke-premium' && body.email) {
      const targetEmail = String(body.email).trim().toLowerCase();
      await prisma.premiumLicense.updateMany({
        where: { email: targetEmail },
        data: { isActive: false },
      });

      await prisma.commandCenterLog.create({
        data: {
          email: adminEmail,
          action: 'REVOKE_PREMIUM',
          path: targetEmail,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        },
      });

      logger.info('Premium revoked via command center', { adminEmail, targetEmail });
      return NextResponse.json({ success: true, data: { revoked: targetEmail } });
    }

    // Standard config update
    if (body.key && typeof body.value === 'string') {
      const key = String(body.key);
      const value = String(body.value);

      await prisma.appConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value, description: `Config: ${key}` },
      });

      await prisma.commandCenterLog.create({
        data: {
          email: adminEmail,
          action: 'UPDATE_CONFIG',
          path: key,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        },
      });

      logger.info('Config updated via command center', { adminEmail, key, value });
      return NextResponse.json({ success: true, data: { key, value } });
    }

    return NextResponse.json({ success: false, error: 'invalid_request' }, { status: 400 });
  } catch (err) {
    logger.error('Failed to update config', { error: err instanceof Error ? err.message : 'Unknown' });
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}
