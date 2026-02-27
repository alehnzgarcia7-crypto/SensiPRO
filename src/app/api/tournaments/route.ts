import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';


// Validación de query params
const querySchema = z.object({
  status: z
    .enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({
      status: searchParams.get('status') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      page: searchParams.get('page') ?? undefined,
    });

    const { status, limit, page } = parsed;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' } : {};

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          maxParticipants: true,
          prizeDescription: true,
          entryTier: true,
          createdAt: true,
          _count: { select: { entries: true } },
        },
      }),
      prisma.tournament.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tournaments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
