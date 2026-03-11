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
    const [topDevicesRaw, styleDistributionRaw, recentEvents] = await Promise.all([
      // Top 30 dispositivos mas buscados
      prisma.searchHistory.groupBy({
        by: ['deviceId'],
        _count: { deviceId: true },
        orderBy: { _count: { deviceId: 'desc' } },
        take: 30,
      }),

      // Distribucion de estilos
      prisma.searchHistory.groupBy({
        by: ['style'],
        _count: { style: true },
      }),

      // Ultimos 50 eventos de analytics
      prisma.analyticsEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          eventType: true,
          userId: true,
          sessionId: true,
          metadata: true,
          path: true,
          createdAt: true,
        },
      }),
    ]);

    // Obtener info de dispositivos para los top devices
    const deviceIds = topDevicesRaw.map(d => d.deviceId);
    const devices = await prisma.device.findMany({
      where: { id: { in: deviceIds } },
      select: { id: true, brand: true, model: true },
    });

    const deviceMap = new Map(devices.map(d => [d.id, d]));

    const topDevices = topDevicesRaw.map(entry => {
      const device = deviceMap.get(entry.deviceId);
      return {
        deviceId: entry.deviceId,
        count: entry._count.deviceId,
        brand: device?.brand ?? 'Desconocido',
        model: device?.model ?? 'Desconocido',
      };
    });

    // Agrupar por marca
    const brandCounts = new Map<string, number>();
    for (const device of topDevices) {
      const current = brandCounts.get(device.brand) ?? 0;
      brandCounts.set(device.brand, current + device.count);
    }

    const topBrands = Array.from(brandCounts.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);

    const styleDistribution = styleDistributionRaw.map(entry => ({
      style: entry.style,
      count: entry._count.style,
    }));

    logger.info('Command center analytics fetched', { email });

    return NextResponse.json({
      success: true,
      data: {
        topDevices,
        topBrands,
        styleDistribution,
        recentEvents,
      },
    });
  } catch (err) {
    logger.error('Failed to fetch analytics', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener analytics' } },
      { status: 500 },
    );
  }
}
