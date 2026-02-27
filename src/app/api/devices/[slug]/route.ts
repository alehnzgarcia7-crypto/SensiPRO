
import { prisma } from '@ares/database';
import { NotFoundError, handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const device = await prisma.device.findUnique({
      where: { slug },
    });

    if (!device) {
      throw new NotFoundError('Device', slug);
    }

    return NextResponse.json({ success: true, data: device });
  } catch (error) {
    logger.error('GET /api/devices/[slug] failed', { slug, error: String(error) });
    return handleApiError(error);
  }
}
