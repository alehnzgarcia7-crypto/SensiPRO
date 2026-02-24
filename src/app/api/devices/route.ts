import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { sanitizeSearchQuery } from '@/lib/security';

const QuerySchema = z.object({
  search: z.string().max(100).optional().default(''),
  brand: z.string().max(50).optional().default(''),
  tier: z.enum(['LOW', 'MID', 'HIGH', 'ULTRA', 'GAMING']).optional(),
  popular: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      search: searchParams.get('search') ?? undefined,
      brand: searchParams.get('brand') ?? undefined,
      tier: searchParams.get('tier') ?? undefined,
      popular: searchParams.get('popular') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Parámetros inválidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { search, brand, tier, popular, page, limit } = parsed.data;

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      const sanitized = sanitizeSearchQuery(search);
      where.OR = [
        { brand: { contains: sanitized, mode: 'insensitive' } },
        { model: { contains: sanitized, mode: 'insensitive' } },
        { chipset: { contains: sanitized, mode: 'insensitive' } },
      ];
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (tier) {
      where.tier = tier;
    }

    if (popular === 'true') {
      where.isPopular = true;
    }

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        orderBy: [{ isPopular: 'desc' }, { brand: 'asc' }, { model: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          brand: true,
          model: true,
          slug: true,
          screenHz: true,
          screenSize: true,
          ramGb: true,
          panelType: true,
          tier: true,
          chipset: true,
          releaseYear: true,
          imageUrl: true,
          isPopular: true,
        },
      }),
      prisma.device.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: devices,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('GET /api/devices failed', { error: String(error) });
    return handleApiError(error);
  }
}
