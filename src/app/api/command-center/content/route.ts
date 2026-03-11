import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_EMAIL = 'alehnzgarcia7@gmail.com';

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
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Acceso denegado' } }, { status: 401 });
  }

  try {
    const [
      totalPageViews,
      generatorUses,
      headshotUses,
      academyViews,
      paywallShown,
      paywallClicked,
      totalGuides,
      totalDevices,
    ] = await Promise.all([
      prisma.analyticsEvent.count({ where: { eventType: 'PAGE_VIEW' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'SENSI_GENERATED' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'HEADSHOT_MODE_USED' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'ACADEMY_VIEWED' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'PAYWALL_SHOWN' } }),
      prisma.analyticsEvent.count({ where: { eventType: 'PAYWALL_CLICKED' } }),
      prisma.guide.count({ where: { isPublished: true } }),
      prisma.device.count({ where: { isActive: true } }),
    ]);

    const paywallConversion = paywallShown > 0 ? (paywallClicked / paywallShown) * 100 : 0;

    const topPages = await prisma.analyticsEvent.groupBy({
      by: ['path'],
      where: { eventType: 'PAGE_VIEW', path: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 15,
    });

    logger.info('Command center content metrics fetched', { email });

    return NextResponse.json({
      success: true,
      data: {
        totalPageViews,
        generatorUses,
        headshotUses,
        academyViews,
        paywallShown,
        paywallClicked,
        paywallConversion,
        totalGuides,
        totalDevices,
        topPages: topPages.map((p) => ({ path: p.path || '/', views: p._count.id })),
      },
    });
  } catch (err) {
    logger.error('Failed to fetch content metrics', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener métricas de contenido' } },
      { status: 500 },
    );
  }
}
