import { prisma } from '@ares/database';
import { logger } from '@ares/logger';
import type { Prisma } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';

const ADMIN_EMAIL = 'alehnzgarcia7@gmail.com';

async function verifyAccess(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email || token.email !== ADMIN_EMAIL) {
    return null;
  }
  return token.email;
}

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  filter: z.enum(['all', 'premium', 'free', 'today', 'active']).default('all'),
  search: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const email = await verifyAccess(req);
  if (!email) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Acceso denegado' } }, { status: 401 });
  }

  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = QuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Validation error' } },
        { status: 400 },
      );
    }

    const { page, limit, filter, search } = parsed.data;
    const skip = (page - 1) * limit;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const where: Prisma.UserWhereInput = {};

    // Filtros
    switch (filter) {
      case 'premium': {
        // Usuarios con licencia premium activa
        const premiumEmails = await prisma.premiumLicense.findMany({
          where: { isActive: true },
          select: { email: true },
        });
        where.email = { in: premiumEmails.map(l => l.email) };
        break;
      }
      case 'free': {
        const premiumEmailsFree = await prisma.premiumLicense.findMany({
          where: { isActive: true },
          select: { email: true },
        });
        where.email = { notIn: premiumEmailsFree.map(l => l.email) };
        break;
      }
      case 'today':
        where.createdAt = { gte: todayStart };
        break;
      case 'active':
        where.lastLoginAt = { gte: oneDayAgo };
        break;
    }

    // Busqueda por email o username
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total, premiumLicenses] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          tier: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          totalSearches: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.premiumLicense.findMany({
        where: { isActive: true },
        select: { email: true },
      }),
    ]);

    const premiumEmails = new Set(premiumLicenses.map(l => l.email));
    const usersWithPremium = users.map(u => ({
      ...u,
      hasPremiumLicense: premiumEmails.has(u.email),
    }));

    logger.info('Command center users listed', { email, filter, page, total });

    return NextResponse.json({
      success: true,
      data: usersWithPremium,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error('Failed to fetch users', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener usuarios' } },
      { status: 500 },
    );
  }
}
