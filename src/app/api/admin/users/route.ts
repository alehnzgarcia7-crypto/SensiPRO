import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@ares/database';
import { handleApiError } from '@ares/errors';
import { logger } from '@ares/logger';

import { requireRole } from '@/lib/auth/auth.middleware';

// ══════════════════════════════════════════════════════════
// GET /api/admin/users — Listar usuarios con busqueda, filtros y paginacion
// ══════════════════════════════════════════════════════════

const ListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  tier: z.enum(['FREE', 'PREMIUM', 'VIP']).optional(),
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
  active: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN');

    const { searchParams } = new URL(request.url);
    const parsed = ListSchema.safeParse({
      page: searchParams.get('page') ?? 1,
      limit: searchParams.get('limit') ?? 20,
      search: searchParams.get('search') ?? undefined,
      tier: searchParams.get('tier') ?? undefined,
      role: searchParams.get('role') ?? undefined,
      active: searchParams.get('active') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Datos invalidos',
            statusCode: 400,
          },
        },
        { status: 400 },
      );
    }

    const { page, limit, search, tier, role, active } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where['OR'] = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tier) where['tier'] = tier;
    if (role) where['role'] = role;
    if (active !== undefined) where['isActive'] = active;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          tier: true,
          role: true,
          isActive: true,
          totalSearches: true,
          totalFavorites: true,
          totalShares: true,
          referralCount: true,
          tierExpiresAt: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    logger.info('Admin listed users', { page, limit, search, tier, total });

    return NextResponse.json({
      success: true,
      data: users,
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
