import { NextResponse } from 'next/server';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

export async function GET() {
  try {
    const brands = await prisma.device.groupBy({
      by: ['brand'],
      where: { isActive: true },
      _count: { brand: true },
      orderBy: { _count: { brand: 'desc' } },
    });

    const data = brands.map((b) => ({
      name: b.brand,
      slug: b.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      count: b._count.brand,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('GET /api/devices/brands failed', { error: String(error) });
    return handleApiError(error);
  }
}
